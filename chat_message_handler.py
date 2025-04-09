
"""
Модуль для обработки сообщений чата
"""

import logging
import time
import re
import asyncio

logger = logging.getLogger("EirosShell")

class ChatMessageHandler:
    def __init__(self, browser_controller):
        self.browser = browser_controller
        self.last_message_time = 0
        self.last_known_messages = []
    
    async def send_message(self, message):
        """Отправляет сообщение в чат"""
        try:
            # Находим поле ввода
            input_field = await self.browser.wait_for_selector("textarea[placeholder], .input-area textarea", timeout=10000)
            
            if not input_field:
                logger.error("Поле ввода сообщения не найдено")
                return False
            
            # Вводим текст
            await self.browser.type_text("textarea[placeholder], .input-area textarea", message)
            
            # Небольшая пауза перед отправкой
            await asyncio.sleep(0.5)
            
            # Нажимаем Enter или кнопку отправки
            await self.browser.page.press("textarea", "Enter")
            
            # Запоминаем время отправки
            self.last_message_time = time.time()
            
            logger.info(f"Сообщение отправлено: {message[:50]}...")
            return True
            
        except Exception as e:
            logger.error(f"Ошибка при отправке сообщения: {str(e)}")
            return False
    
    async def wait_for_response(self, timeout=120):
        """
        Ожидает ответ от ChatGPT.
        Возвращает текст ответа или None, если ответ не получен за timeout секунд.
        """
        try:
            logger.info(f"Ожидание ответа от ChatGPT (таймаут: {timeout} сек)...")
            
            # Запоминаем текущие сообщения, чтобы определить новые
            current_messages = await self._get_all_messages()
            self.last_known_messages = current_messages
            
            start_time = time.time()
            
            while time.time() - start_time < timeout:
                # Проверяем индикатор загрузки/ответа
                is_responding = await self._is_ai_responding()
                
                if not is_responding:
                    # Если индикатор загрузки исчез, проверяем новые сообщения
                    new_messages = await self._get_all_messages()
                    
                    # Если количество сообщений изменилось, возвращаем последнее
                    if len(new_messages) > len(self.last_known_messages):
                        new_message = new_messages[-1]
                        self.last_known_messages = new_messages
                        logger.info("Получен ответ от ChatGPT")
                        return new_message
                
                await asyncio.sleep(1)
            
            logger.warning(f"Превышено время ожидания ответа ({timeout} сек)")
            return None
            
        except Exception as e:
            logger.error(f"Ошибка при ожидании ответа: {str(e)}")
            return None
    
    async def _is_ai_responding(self):
        """Проверяет, отвечает ли сейчас AI (анимация загрузки)"""
        try:
            # Проверяем наличие индикаторов загрузки
            loading_indicator = await self.browser.page.query_selector(".loading, .typing-indicator, .result-streaming")
            return loading_indicator is not None
        except Exception as e:
            logger.error(f"Ошибка при проверке статуса ответа AI: {str(e)}")
            return False
    
    async def _get_all_messages(self):
        """Получает все сообщения из чата"""
        try:
            message_elements = await self.browser.page.query_selector_all(".message, .chat-message, .prose, .markdown")
            messages = []
            
            for element in message_elements:
                text = await element.inner_text()
                messages.append(text)
            
            return messages
        except Exception as e:
            logger.error(f"Ошибка при получении сообщений: {str(e)}")
            return []
