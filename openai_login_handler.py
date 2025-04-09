
"""
Модуль для авторизации в OpenAI
"""

import asyncio
import json
import logging
import os
from pathlib import Path

logger = logging.getLogger("EirosShell")

class OpenAILoginHandler:
    def __init__(self, browser_controller):
        self.browser = browser_controller
        self.config_dir = Path(os.path.expanduser("~")) / "EirosShell" / "config"
        self.config_dir.mkdir(parents=True, exist_ok=True)
        self.credentials_file = self.config_dir / "credentials.json"
        
    async def login(self):
        """Входит в аккаунт OpenAI"""
        try:
            logger.info("Попытка входа в OpenAI...")
            
            # Переходим на страницу ChatGPT
            await self.browser.navigate_to("https://chat.openai.com")
            
            # Проверяем, авторизованы ли мы уже
            await asyncio.sleep(2)  # Даем странице загрузиться
            
            # Проверяем, видим ли мы чат или страницу логина
            chat_input = await self.browser.wait_for_selector("textarea[placeholder], .login-button, .signin-button, button:has-text('Log in')", timeout=5000)
            
            if chat_input:
                # Проверяем, нужно ли логиниться
                page_content = await self.browser.page.content()
                if "Log in" in page_content or "Sign in" in page_content or "Login" in page_content:
                    # Нужно войти в аккаунт
                    return await self._perform_login()
                else:
                    # Мы уже авторизованы
                    logger.info("Пользователь уже авторизован в OpenAI")
                    return True
            else:
                logger.error("Не удалось определить состояние авторизации")
                return False
                
        except Exception as e:
            logger.error(f"Ошибка при попытке входа: {str(e)}")
            return False
    
    async def _perform_login(self):
        """Выполняет процесс входа в OpenAI"""
        try:
            # Попробуем найти кнопку логина и нажать на нее
            login_button = await self.browser.wait_for_selector("button:has-text('Log in'), .login-button, .signin-button", timeout=5000)
            
            if login_button:
                await self.browser.click("button:has-text('Log in'), .login-button, .signin-button")
                logger.info("Нажата кнопка логина")
            
            # Проверяем наличие файла с учетными данными
            if self.credentials_file.exists():
                credentials = self._load_credentials()
                if credentials and 'email' in credentials and 'password' in credentials:
                    return await self._login_with_credentials(credentials['email'], credentials['password'])
            
            # Если не удалось войти автоматически, запрашиваем учетные данные у пользователя
            logger.info("Учетные данные не найдены или неверны. Запрашиваем ввод вручную.")
            return await self._request_manual_login()
            
        except Exception as e:
            logger.error(f"Ошибка при выполнении входа: {str(e)}")
            return False
    
    async def _login_with_credentials(self, email, password):
        """Входит используя email и пароль"""
        try:
            # Ждем появления поля для email
            email_field = await self.browser.wait_for_selector("input[type='email'], input[name='email'], input[placeholder*='email']", timeout=10000)
            
            if not email_field:
                logger.error("Поле для email не найдено")
                return False
            
            # Вводим email
            await self.browser.type_text("input[type='email'], input[name='email'], input[placeholder*='email']", email)
            
            # Нажимаем "Продолжить" или подобную кнопку
            await self.browser.click("button[type='submit'], button:has-text('Continue'), button:has-text('Next')")
            
            # Ждем поля для пароля
            password_field = await self.browser.wait_for_selector("input[type='password'], input[name='password']", timeout=10000)
            
            if not password_field:
                logger.error("Поле для пароля не найдено")
                return False
            
            # Вводим пароль
            await self.browser.type_text("input[type='password'], input[name='password']", password)
            
            # Нажимаем кнопку входа
            await self.browser.click("button[type='submit'], button:has-text('Log in'), button:has-text('Sign in'), button:has-text('Continue')")
            
            # Проверяем успешность входа (наличие чата)
            chat_area = await self.browser.wait_for_selector("textarea[placeholder]", timeout=20000)
            
            if chat_area:
                logger.info("Успешный вход в OpenAI")
                return True
            else:
                logger.error("Не удалось подтвердить успешный вход")
                return False
            
        except Exception as e:
            logger.error(f"Ошибка при входе с учетными данными: {str(e)}")
            return False
    
    async def _request_manual_login(self):
        """Запрашивает ручной вход пользователя"""
        # В реальности, здесь мы можем отобразить диалоговое окно или уведомление
        # Но для простоты примера, мы просто попросим пользователя войти вручную через консоль
        
        print("\n========== ТРЕБУЕТСЯ ВХОД ==========")
        print("Пожалуйста, войдите в аккаунт OpenAI в открывшемся браузере")
        print("После входа в систему, нажмите Enter в этой консоли")
        input("Нажмите Enter после успешного входа: ")
        
        # Проверяем, вошел ли пользователь
        try:
            chat_area = await self.browser.wait_for_selector("textarea[placeholder]", timeout=5000)
            
            if chat_area:
                logger.info("Ручной вход успешен")
                
                # Спрашиваем, хочет ли пользователь сохранить учетные данные
                save = input("Сохранить учетные данные для будущих входов? (y/n): ")
                
                if save.lower() == 'y':
                    email = input("Введите ваш email: ")
                    password = input("Введите ваш пароль: ")
                    self._save_credentials(email, password)
                
                return True
            else:
                logger.error("Не удалось подтвердить ручной вход")
                return False
                
        except Exception as e:
            logger.error(f"Ошибка при проверке ручного входа: {str(e)}")
            return False
    
    def _save_credentials(self, email, password):
        """Сохраняет учетные данные в файл"""
        try:
            credentials = {
                'email': email,
                'password': password
            }
            
            with open(self.credentials_file, 'w') as f:
                json.dump(credentials, f)
            
            logger.info("Учетные данные сохранены")
            
        except Exception as e:
            logger.error(f"Ошибка при сохранении учетных данных: {str(e)}")
    
    def _load_credentials(self):
        """Загружает учетные данные из файла"""
        try:
            if not self.credentials_file.exists():
                return None
            
            with open(self.credentials_file, 'r') as f:
                credentials = json.load(f)
            
            return credentials
            
        except Exception as e:
            logger.error(f"Ошибка при загрузке учетных данных: {str(e)}")
            return None
