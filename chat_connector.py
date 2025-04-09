
"""
Модуль для взаимодействия с чатом ChatGPT
"""

import asyncio
import json
import logging
import os
import re
from pathlib import Path
import time

logger = logging.getLogger("EirosShell")

class ChatConnector:
    def __init__(self, browser_controller):
        self.browser = browser_controller
        self.config_dir = Path(os.path.expanduser("~")) / "EirosShell" / "config"
        self.config_dir.mkdir(parents=True, exist_ok=True)
        self.chat_config_file = self.config_dir / "chat_config.json"
        self.last_message_time = 0
        self.last_known_messages = []
        
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
            chat_config = self._load_chat_config()
            
            if chat_config and 'eiros_chat_id' in chat_config:
                # Пробуем найти чат по ID
                chat_id = chat_config['eiros_chat_id']
                chat_found = await self._open_chat_by_id(chat_id)
                
                if chat_found:
                    logger.info(f"Успешно открыт сохраненный чат (ID: {chat_id})")
                    return True
            
            # Если нет сохраненного чата или его не удалось открыть,
            # ищем чат с Эйросом по ключевым словам или создаем новый
            return await self._find_or_create_eiros_chat()
            
        except Exception as e:
            logger.error(f"Ошибка при подключении к чату: {str(e)}")
            return False
    
    async def _open_chat_by_id(self, chat_id):
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
    
    async def _find_or_create_eiros_chat(self):
        """Ищет чат с Эйросом или создает новый"""
        try:
            # Пробуем найти чат с ключевыми словами "Эйрос", "Eiros" и т.д.
            eiros_chat_found = await self._find_chat_by_keywords(["Эйрос", "Eiros", "EirosAI", "AI Assistant"])
            
            if eiros_chat_found:
                # Сохраняем ID чата
                current_url = self.browser.page.url
                chat_id_match = re.search(r"([a-f0-9-]+)$", current_url)
                if chat_id_match:
                    chat_id = chat_id_match.group(1)
                    self._save_chat_config({'eiros_chat_id': chat_id})
                    logger.info(f"Найден и сохранен чат с Эйросом (ID: {chat_id})")
                return True
            
            # Если чат не найден, создаем новый
            return await self._create_new_chat()
            
        except Exception as e:
            logger.error(f"Ошибка при поиске/создании чата: {str(e)}")
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
                    self._save_chat_config({'eiros_chat_id': chat_id})
                
                logger.info("Создан новый чат")
                return True
            else:
                logger.error("Не удалось найти кнопку создания нового чата")
                return False
                
        except Exception as e:
            logger.error(f"Ошибка при создании нового чата: {str(e)}")
            return False
    
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
        except:
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
    
    def _save_chat_config(self, config):
        """Сохраняет конфигурацию чата в файл"""
        try:
            # Загружаем существующую конфигурацию, если она есть
            existing_config = self._load_chat_config() or {}
            
            # Обновляем конфигурацию
            existing_config.update(config)
            
            # Сохраняем обновленную конфигурацию
            with open(self.chat_config_file, 'w') as f:
                json.dump(existing_config, f)
            
        except Exception as e:
            logger.error(f"Ошибка при сохранении конфигурации чата: {str(e)}")
    
    def _load_chat_config(self):
        """Загружает конфигурацию чата из файла"""
        try:
            if not self.chat_config_file.exists():
                return None
            
            with open(self.chat_config_file, 'r') as f:
                config = json.load(f)
            
            return config
            
        except Exception as e:
            logger.error(f"Ошибка при загрузке конфигурации чата: {str(e)}")
            return None
