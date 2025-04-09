
"""
Модуль для поиска и создания чатов
"""

import logging
import re
import asyncio

logger = logging.getLogger("EirosShell")

class ChatFinder:
    def __init__(self, browser_controller, config_manager):
        self.browser = browser_controller
        self.config_manager = config_manager
    
    async def find_or_create_chat(self, keywords=None):
        """Ищет чат по ключевым словам или создает новый"""
        if not keywords:
            keywords = ["Эйрос", "Eiros", "EirosAI", "AI Assistant"]
            
        try:
            # Пробуем найти чат с ключевыми словами
            eiros_chat_found = await self._find_chat_by_keywords(keywords)
            
            if eiros_chat_found:
                # Сохраняем ID чата
                current_url = self.browser.page.url
                chat_id_match = re.search(r"([a-f0-9-]+)$", current_url)
                if chat_id_match:
                    chat_id = chat_id_match.group(1)
                    self.config_manager.save_chat_config({'eiros_chat_id': chat_id})
                    logger.info(f"Найден и сохранен чат с Эйросом (ID: {chat_id})")
                return True
            
            # Если чат не найден, создаем новый
            return await self._create_new_chat()
            
        except Exception as e:
            logger.error(f"Ошибка при поиске/создании чата: {str(e)}")
            return False
    
    async def open_chat_by_id(self, chat_id):
        """Открывает чат по идентификатору"""
        try:
            # Проверяем наличие боковой панели с чатами
            sidebar = await self.browser.wait_for_selector(".sidebar, nav", timeout=5000)
            if not sidebar:
                logger.error("Боковая панель с чатами не найдена")
                return False
            
            # Пробуем найти и кликнуть на чат по его ID
            chat_selector = f"[data-testid='{chat_id}'], [data-conversation-id='{chat_id}'], a[href*='{chat_id}']"
            chat_element = await self.browser.wait_for_selector(chat_selector, timeout=5000)
            
            if chat_element:
                await self.browser.click(chat_selector)
                await asyncio.sleep(2)  # Ждем загрузки чата
                return True
            else:
                logger.warning(f"Чат с ID {chat_id} не найден в боковой панели")
                return False
                
        except Exception as e:
            logger.error(f"Ошибка при открытии чата по ID: {str(e)}")
            return False
    
    async def _find_chat_by_keywords(self, keywords):
        """Ищет чат по ключевым словам в названиях"""
        try:
            # Получаем все чаты из боковой панели
            chat_elements = await self.browser.page.query_selector_all(".sidebar a, nav a, .nav-conversation")
            
            for chat in chat_elements:
                chat_name = await chat.inner_text()
                
                # Проверяем, содержит ли название чата одно из ключевых слов
                for keyword in keywords:
                    if keyword.lower() in chat_name.lower():
                        await chat.click()
                        await asyncio.sleep(2)  # Ждем загрузки чата
                        logger.info(f"Найден чат по ключевому слову '{keyword}': {chat_name}")
                        return True
            
            logger.info("Чат с ключевыми словами не найден")
            return False
            
        except Exception as e:
            logger.error(f"Ошибка при поиске чата по ключевым словам: {str(e)}")
            return False
    
    async def _create_new_chat(self):
        """Создает новый чат"""
        try:
            # Находим кнопку создания нового чата
            new_chat_button = await self.browser.wait_for_selector("button:has-text('New chat'), button:has-text('Новый чат')", timeout=5000)
            
            if not new_chat_button:
                # Альтернативный селектор для кнопки нового чата
                new_chat_button = await self.browser.wait_for_selector(".new-chat, button.new-chat", timeout=5000)
            
            if new_chat_button:
                await self.browser.click("button:has-text('New chat'), button:has-text('Новый чат'), .new-chat, button.new-chat")
                await asyncio.sleep(2)  # Ждем создания чата
                
                # Сохраняем ID чата
                current_url = self.browser.page.url
                chat_id_match = re.search(r"([a-f0-9-]+)$", current_url)
                if chat_id_match:
                    chat_id = chat_id_match.group(1)
                    self.config_manager.save_chat_config({'eiros_chat_id': chat_id})
                
                logger.info("Создан новый чат")
                return True
            else:
                logger.error("Не удалось найти кнопку создания нового чата")
                return False
                
        except Exception as e:
            logger.error(f"Ошибка при создании нового чата: {str(e)}")
            return False
