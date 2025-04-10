
"""
Модуль для взаимодействия с чатом ChatGPT
"""

import logging
import asyncio
import time
from pathlib import Path
import os

from chat_config_manager import ChatConfigManager
from chat_message_handler import ChatMessageHandler
from chat_finder import ChatFinder

logger = logging.getLogger("EirosShell")

class ChatConnector:
    def __init__(self, browser_controller, debug_mode=False):
        self.browser = browser_controller
        self.debug_mode = debug_mode
        self.config_manager = ChatConfigManager()
        self.message_handler = ChatMessageHandler(browser_controller)
        self.chat_finder = ChatFinder(browser_controller, self.config_manager)
        
    async def connect_to_chat(self):
        """Подключается к нужному чату в ChatGPT"""
        try:
            logger.info("Подключение к чату ChatGPT...")
            
            # Проверяем, находимся ли мы на странице чатов
            current_url = self.browser.page.url
            if "https://chat.openai.com" not in current_url:
                await self.browser.navigate_to("https://chat.openai.com")
            
            # Даем время для загрузки интерфейса
            await asyncio.sleep(2)
            
            # Проверяем, есть ли у нас сохраненный chat_id для Эйроса
            chat_config = self.config_manager.load_chat_config()
            
            if chat_config and 'eiros_chat_id' in chat_config:
                # Пробуем найти чат по ID
                chat_id = chat_config['eiros_chat_id']
                chat_found = await self.chat_finder.open_chat_by_id(chat_id)
                
                if chat_found:
                    logger.info(f"Успешно открыт сохраненный чат (ID: {chat_id})")
                    return True
            
            # Если нет сохраненного чата или его не удалось открыть,
            # ищем чат с Эйросом по ключевым словам или создаем новый
            return await self.chat_finder.find_or_create_chat()
            
        except Exception as e:
            logger.error(f"Ошибка при подключении к чату: {str(e)}")
            return False
    
    async def send_message(self, message):
        """Отправляет сообщение в чат"""
        return await self.message_handler.send_message(message)
    
    async def wait_for_response(self, timeout=120):
        """
        Ожидает ответ от ChatGPT.
        Возвращает текст ответа или None, если ответ не получен за timeout секунд.
        """
        return await self.message_handler.wait_for_response(timeout)
    
    async def send_instructions(self):
        """
        Отправляет инструкции для интеграции с AI из файла
        """
        try:
            instruction_path = Path(__file__).parent / "ai_integration_instructions.txt"
            
            if not instruction_path.exists():
                logger.error("Файл инструкций не найден")
                return False
                
            with open(instruction_path, 'r', encoding='utf-8') as f:
                instructions = f.read()
                
            logger.info("Отправка инструкций интеграции с AI...")
            success = await self.send_message(instructions)
            
            if success:
                logger.info("Инструкции успешно отправлены")
                return True
            else:
                logger.error("Ошибка при отправке инструкций")
                return False
                
        except Exception as e:
            logger.error(f"Ошибка при отправке инструкций: {str(e)}")
            return False

