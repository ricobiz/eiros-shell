
"""
Модуль для управления браузером с помощью Playwright
"""

import asyncio
import logging
from pathlib import Path
import os
from playwright.async_api import async_playwright, Browser, Page, BrowserContext

logger = logging.getLogger("EirosShell")

class BrowserController:
    def __init__(self):
        self.playwright = None
        self.browser = None
        self.context = None
        self.page = None
        self.user_data_dir = Path(os.path.expanduser("~")) / "EirosShell" / "browser_data"
        self.user_data_dir.mkdir(parents=True, exist_ok=True)
        
    async def launch_browser(self):
        """Запускает браузер Chrome/Edge (не headless)"""
        try:
            logger.info("Запуск браузера...")
            self.playwright = await async_playwright().start()
            
            # Пробуем сначала Chrome, затем Edge
            try:
                self.browser = await self.playwright.chromium.launch_persistent_context(
                    user_data_dir=str(self.user_data_dir),
                    channel="chrome",
                    headless=False,
                    args=["--start-maximized"]
                )
                logger.info("Запущен браузер Chrome")
            except Exception as chrome_error:
                logger.warning(f"Не удалось запустить Chrome: {chrome_error}")
                try:
                    self.browser = await self.playwright.chromium.launch_persistent_context(
                        user_data_dir=str(self.user_data_dir),
                        channel="msedge",
                        headless=False,
                        args=["--start-maximized"]
                    )
                    logger.info("Запущен браузер Edge")
                except Exception as edge_error:
                    logger.warning(f"Не удалось запустить Edge: {edge_error}")
                    # Пробуем запустить дефолтный Chromium
                    self.browser = await self.playwright.chromium.launch_persistent_context(
                        user_data_dir=str(self.user_data_dir),
                        headless=False,
                        args=["--start-maximized"]
                    )
                    logger.info("Запущен браузер Chromium")
            
            # Получаем или создаем страницу
            if len(self.browser.pages) > 0:
                self.page = self.browser.pages[0]
            else:
                self.page = await self.browser.new_page()
            
            return self.browser
            
        except Exception as e:
            logger.error(f"Ошибка при запуске браузера: {str(e)}")
            if self.playwright:
                await self.playwright.stop()
            return None
    
    async def navigate_to(self, url):
        """Переходит по указанному URL"""
        try:
            logger.info(f"Переход по URL: {url}")
            if not self.page:
                logger.error("Страница не инициализирована")
                return False
            
            await self.page.goto(url, wait_until="networkidle")
            return True
            
        except Exception as e:
            logger.error(f"Ошибка при переходе на {url}: {str(e)}")
            return False
    
    async def wait_for_selector(self, selector, timeout=30000):
        """Ожидает появления элемента на странице"""
        try:
            return await self.page.wait_for_selector(selector, timeout=timeout)
        except Exception as e:
            logger.error(f"Элемент не найден: {selector}. Ошибка: {str(e)}")
            return None
    
    async def click(self, selector):
        """Кликает по элементу"""
        try:
            await self.page.click(selector)
            return True
        except Exception as e:
            logger.error(f"Не удалось кликнуть на элемент {selector}: {str(e)}")
            return False
    
    async def type_text(self, selector, text):
        """Вводит текст в поле ввода"""
        try:
            await self.page.fill(selector, text)
            return True
        except Exception as e:
            logger.error(f"Не удалось ввести текст в поле {selector}: {str(e)}")
            return False
    
    async def get_element_text(self, selector):
        """Получает текст элемента"""
        try:
            element = await self.page.query_selector(selector)
            if element:
                return await element.inner_text()
            return None
        except Exception as e:
            logger.error(f"Не удалось получить текст элемента {selector}: {str(e)}")
            return None
    
    async def take_screenshot(self, path=None):
        """Делает скриншот текущей страницы"""
        try:
            if not path:
                screenshots_dir = Path(os.path.expanduser("~")) / "EirosShell" / "screenshots"
                screenshots_dir.mkdir(parents=True, exist_ok=True)
                path = screenshots_dir / f"screenshot_{asyncio.get_event_loop().time():.0f}.png"
            
            await self.page.screenshot(path=str(path))
            logger.info(f"Скриншот сохранен: {path}")
            return str(path)
        except Exception as e:
            logger.error(f"Ошибка при создании скриншота: {str(e)}")
            return None
    
    async def close_browser(self):
        """Закрывает браузер"""
        try:
            if self.browser:
                await self.browser.close()
            if self.playwright:
                await self.playwright.stop()
            logger.info("Браузер закрыт")
        except Exception as e:
            logger.error(f"Ошибка при закрытии браузера: {str(e)}")
