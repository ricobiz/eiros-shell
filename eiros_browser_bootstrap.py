
"""
EirosShell v0.7 - Автономная оболочка для работы с ChatGPT
Основной файл загрузки и инициализации системы
"""

import asyncio
import logging
import os
import sys
from pathlib import Path
import time

from browser_driver import BrowserController
from openai_login_handler import OpenAILoginHandler
from chat_connector import ChatConnector
from command_executor import CommandExecutor
from utils import internet_connection_available, setup_logging
from pattern_matcher import pattern_matcher  # Import the pattern matcher

# Настройка логирования
log_dir = Path(os.path.expanduser("~")) / "EirosShell" / "logs"
log_dir.mkdir(parents=True, exist_ok=True)
log_file = log_dir / f"eiros_shell_{time.strftime('%Y%m%d_%H%M%S')}.log"

# Get the debug GUI instance if available
debug_gui = None
try:
    from gui import debug_gui
except ImportError:
    pass

async def main(debug_mode=False):
    """Main entry point for EirosShell"""
    # Setup logging with appropriate level
    logger = setup_logging(log_file, level=logging.DEBUG if debug_mode else logging.INFO)
    
    try:
        logger.info(f"Запуск EirosShell v0.7 {'в режиме отладки' if debug_mode else ''}...")
        
        # Update debug GUI status if available
        if debug_gui:
            debug_gui.update_status(False, "Initializing...")
            debug_gui.update_current_command("Starting EirosShell...")
        
        # Проверка подключения к интернету
        if not internet_connection_available():
            logger.error("Отсутствует подключение к интернету. Повторная попытка через 30 секунд...")
            if debug_gui:
                debug_gui.update_status(False, "No internet connection")
            time.sleep(30)
            if not internet_connection_available():
                logger.error("Интернет недоступен. Завершение работы.")
                return
        
        logger.info("Интернет-соединение доступно.")
        
        # Initialize pattern matcher
        logger.info("Initializing pattern matcher...")
        pattern_matcher.load_patterns()
        
        # Инициализация браузера
        browser_controller = BrowserController(debug_mode=debug_mode)
        browser = await browser_controller.launch_browser()
        
        if not browser:
            logger.error("Не удалось запустить браузер. Завершение работы.")
            if debug_gui:
                debug_gui.update_status(False, "Browser launch failed")
            return
        
        # Update debug GUI status
        if debug_gui:
            debug_gui.update_status(False, "Logging in to OpenAI...")
        
        # Вход в OpenAI
        login_handler = OpenAILoginHandler(browser_controller)
        logged_in = await login_handler.login(debug_mode=debug_mode)
        
        if not logged_in:
            logger.error("Не удалось войти в OpenAI. Завершение работы.")
            if debug_gui:
                debug_gui.update_status(False, "OpenAI login failed")
            await browser_controller.close_browser()
            return
        
        # Update debug GUI status
        if debug_gui:
            debug_gui.update_status(False, "Connecting to chat...")
        
        # Подключение к чату
        chat_connector = ChatConnector(browser_controller, debug_mode=debug_mode)
        connected = await chat_connector.connect_to_chat()
        
        if not connected:
            logger.error("Не удалось подключаться к чату. Завершение работы.")
            if debug_gui:
                debug_gui.update_status(False, "Chat connection failed")
            await browser_controller.close_browser()
            return
        
        # Update debug GUI status
        if debug_gui:
            debug_gui.update_status(True, "Connected to ChatGPT")
        
        # Отправка приветственного сообщения
        boot_message = "[оболочка]: Это EirosShell v0.7. Подключение установлено. Готова к работе. #boot"
        await chat_connector.send_message(boot_message)
        logger.info("Приветственное сообщение отправлено.")
        
        # Send AI integration instructions
        try:
            logger.info("Sending AI integration instructions...")
            ai_instructions_path = Path(__file__).parent / "ai_integration_instructions.txt"
            
            if ai_instructions_path.exists():
                with open(ai_instructions_path, "r", encoding="utf-8") as f:
                    ai_instructions = f.read()
                
                await chat_connector.send_message(ai_instructions)
                logger.info("AI integration instructions sent successfully.")
            else:
                logger.warning("AI integration instructions file not found.")
        except Exception as e:
            logger.error(f"Failed to send AI integration instructions: {str(e)}")
        
        # Инициализация исполнителя команд
        command_executor = CommandExecutor(browser_controller, chat_connector)
        
        # Update debug GUI with command executor reference if available
        if debug_gui:
            command_executor.debug_gui = debug_gui
        
        # Основной цикл работы оболочки
        logger.info("Запуск основного цикла обработки команд...")
        await command_executor.start_command_loop()
        
    except Exception as e:
        logger.exception(f"Критическая ошибка: {str(e)}")
        if debug_gui:
            debug_gui.update_status(False, f"Critical error: {str(e)}")
    finally:
        logger.info("Завершение работы EirosShell...")
        if 'browser_controller' in locals():
            await browser_controller.close_browser()

if __name__ == "__main__":
    asyncio.run(main())
