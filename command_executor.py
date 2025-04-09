
"""
Модуль для распознавания и выполнения команд от ChatGPT
"""

import asyncio
import logging
import os
from pathlib import Path
import time
from typing import Dict, Any, Optional

from command_parser import CommandParser
from command_types import CommandType
from command_handlers import execute_command, analyze_page_elements

logger = logging.getLogger("EirosShell")

class CommandExecutor:
    def __init__(self, browser_controller, chat_connector):
        self.browser = browser_controller
        self.chat = chat_connector
        self.command_history = []
        self.command_counter = 0
        self.log_dir = Path(os.path.expanduser("~")) / "EirosShell" / "logs"
        self.log_dir.mkdir(parents=True, exist_ok=True)
        self.compressed_logs_file = Path(os.path.expanduser("~")) / "EirosShell" / "compressed_logs.json"
        self._load_command_counter()
        self.command_parser = CommandParser(self.command_counter)
        
    async def start_command_loop(self):
        """Запускает основной цикл обработки команд"""
        try:
            logger.info("Запуск основного цикла обработки команд...")
            
            while True:
                # Ожидаем ответ от ChatGPT
                response = await self.chat.wait_for_response(timeout=300)
                
                if response:
                    # Проверяем, содержит ли ответ команду
                    command = self.command_parser.parse_command(response)
                    self.command_counter = self.command_parser.get_command_counter()
                    
                    if command:
                        # Выполняем команду
                        command_result = await execute_command(self.browser, command)
                        
                        # Отправляем результат выполнения
                        if command_result:
                            self._save_command_to_history(command, command_result)
                            await self._send_command_result(command, command_result)
                
                # Небольшая пауза перед следующей проверкой
                await asyncio.sleep(1)
                
        except Exception as e:
            logger.exception(f"Критическая ошибка в цикле обработки команд: {str(e)}")
            # Отправляем сообщение о критической ошибке в чат
            await self.chat.send_message(f"[оболочка]: Критическая ошибка: {str(e)}. Перезапустите оболочку.")
    
    async def _send_command_result(self, command: Dict[str, Any], result: Dict[str, Any]):
        """Отправляет результат выполнения команды обратно в чат"""
        # Формируем краткое сообщение о результате с учетом требуемого формата
        status_text = "OK" if result["status"] == "success" else "ОШИБКА"
        command_type = command["type"]
        command_id = command["id"]
        log_id = f"log_{self.command_counter}"
        
        # Формируем описание для различных типов команд
        description = ""
        if command_type == CommandType.NAVIGATION:
            description = f"→ '{command['params'].get('url', '')}'"
        elif command_type == CommandType.CLICK:
            description = f"→ '{command['params'].get('selector', '')}'"
        elif command_type == CommandType.TYPE:
            description = f"→ '{command['params'].get('selector', '')}'"
        elif command_type == CommandType.WAIT:
            description = f"→ {command['params'].get('duration', 2)} сек"
        elif command_type == CommandType.SCREENSHOT or command_type == CommandType.ANALYZE:
            description = ""
            
        # Формируем сообщение для отправки по новому формату
        response_message = f"[оболочка]: Команда #{command_id}: {command_type} {description} — {status_text}. #{log_id}"
        
        # Отправляем сообщение обратно в чат
        await self.chat.send_message(response_message)
        
        # Логируем отправку сообщения
        logger.info(f"Отправлен результат в чат: {response_message}")
    
    def _save_command_to_history(self, command: Dict[str, Any], result: Dict[str, Any]):
        """Сохраняет команду и результат в историю"""
        try:
            history_entry = {
                "timestamp": time.time(),
                "command": command,
                "result": result
            }
            
            self.command_history.append(history_entry)
            
            # Сохраняем сжатый лог для долгосрочного хранения
            compressed_log = {
                "id": command["id"],
                "type": command["type"],
                "status": result["status"],
                "timestamp": time.time(),
                "message": result["message"]
            }
            
            # Сохраняем счетчик команд
            self._save_command_counter()
            
        except Exception as e:
            logger.error(f"Ошибка при сохранении команды в историю: {str(e)}")
    
    def _save_command_counter(self):
        """Сохраняет счетчик команд"""
        try:
            counter_file = self.log_dir / "command_counter.json"
            with open(counter_file, 'w') as f:
                import json
                json.dump({"counter": self.command_counter}, f)
        except Exception as e:
            logger.error(f"Ошибка при сохранении счетчика команд: {str(e)}")
    
    def _load_command_counter(self):
        """Загружает счетчик команд"""
        try:
            counter_file = self.log_dir / "command_counter.json"
            if os.path.exists(counter_file):
                with open(counter_file, 'r') as f:
                    import json
                    data = json.load(f)
                    self.command_counter = data.get("counter", 0)
        except Exception as e:
            logger.error(f"Ошибка при загрузке счетчика команд: {str(e)}")
