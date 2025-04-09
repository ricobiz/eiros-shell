
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
from command_handlers import execute_command, execute_dsl_command, execute_command_chain
from command_format_adapter import is_dsl_command, is_command_chain

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
        self.debug_gui = None  # Will be set by main if available
        
    async def start_command_loop(self):
        """Запускает основной цикл обработки команд"""
        try:
            logger.info("Запуск основного цикла обработки команд...")
            
            while True:
                # Ожидаем ответ от ChatGPT
                response = await self.chat.wait_for_response(timeout=300)
                
                if response:
                    # Update debug GUI with current command if available
                    if self.debug_gui:
                        self.debug_gui.update_current_command(response[:100] + "..." if len(response) > 100 else response)
                    
                    # Обработка команд в разных форматах
                    if is_command_chain(response):
                        # Выполняем цепочку DSL-команд
                        chain_result = await execute_command_chain(self.browser, response)
                        
                        if chain_result:
                            # Update debug GUI with command result
                            if self.debug_gui:
                                self.debug_gui.log_command_result(
                                    chain_result.get("command_id", "unknown"),
                                    "chain",
                                    chain_result.get("status", "error"),
                                    chain_result.get("message", "Unknown result")
                                )
                            
                            # Отправляем результат выполнения цепочки
                            self._save_command_to_history(
                                {"type": "chain", "id": chain_result["command_id"]}, 
                                chain_result
                            )
                            await self.chat.send_message(chain_result["formatted_message"])
                    elif is_dsl_command(response):
                        # Выполняем DSL-команду
                        command_result = await execute_dsl_command(self.browser, response)
                        
                        if command_result:
                            # Update debug GUI with command result
                            if self.debug_gui:
                                self.debug_gui.log_command_result(
                                    command_result.get("command_id", "unknown"),
                                    command_result.get("type", "unknown"),
                                    command_result.get("status", "error"),
                                    command_result.get("message", "Unknown result")
                                )
                            
                            # Отправляем результат выполнения
                            self._save_command_to_history(
                                {"type": command_result["type"], "id": command_result["command_id"]}, 
                                command_result
                            )
                            await self.chat.send_message(command_result["formatted_message"])
                    else:
                        # Обрабатываем обычную команду через CommandParser
                        command = self.command_parser.parse_command(response)
                        self.command_counter = self.command_parser.get_command_counter()
                        
                        if command:
                            # Update debug GUI with current command
                            if self.debug_gui:
                                cmd_type = command.get("type", "unknown")
                                cmd_id = command.get("id", "unknown")
                                self.debug_gui.update_current_command(f"{cmd_type}#{cmd_id}")
                            
                            # Выполняем команду
                            command_result = await execute_command(self.browser, command)
                            
                            # Отправляем результат выполнения
                            if command_result:
                                # Update debug GUI with command result
                                if self.debug_gui:
                                    self.debug_gui.log_command_result(
                                        command_result.get("command_id", "unknown"),
                                        command.get("type", "unknown"),
                                        command_result.get("status", "error"),
                                        command_result.get("message", "Unknown result")
                                    )
                                
                                self._save_command_to_history(command, command_result)
                                await self._send_command_result(command, command_result)
                
                # Небольшая пауза перед следующей проверкой
                await asyncio.sleep(1)
                
        except Exception as e:
            logger.exception(f"Критическая ошибка в цикле обработки команд: {str(e)}")
            # Update debug GUI with error
            if self.debug_gui:
                self.debug_gui.update_status(False, f"Command loop error: {str(e)}")
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
