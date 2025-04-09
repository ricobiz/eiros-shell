
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
    def __init__(self, browser_controller):
        self.browser = browser_controller
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
