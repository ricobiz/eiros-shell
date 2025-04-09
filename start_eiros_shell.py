
"""
Скрипт для запуска EirosShell
"""

import asyncio
import sys
import os
from utils import setup_autostart, setup_logging, get_system_info, internet_connection_available
from pathlib import Path
import time

# Настройка логирования
log_dir = Path(os.path.expanduser("~")) / "EirosShell" / "logs"
log_dir.mkdir(parents=True, exist_ok=True)
log_file = log_dir / f"eiros_shell_start_{time.strftime('%Y%m%d_%H%M%S')}.log"
logger = setup_logging(log_file)

async def main():
    try:
        logger.info("Запуск EirosShell...")
        
        # Check if GUI should be disabled
        headless_mode = "--nogui" in sys.argv
        
        # Initialize debug GUI if not in headless mode
        if not headless_mode:
            try:
                from debug_gui import initialize_debug_gui
                logger.info("Запуск отладочного интерфейса...")
                debug_gui = initialize_debug_gui()
                logger.info("Отладочный интерфейс запущен")
            except ImportError as e:
                logger.warning(f"Не удалось запустить отладочный интерфейс: {str(e)}")
                logger.warning("Установите PyQt5: pip install PyQt5")
        
        # Получаем информацию о системе
        system_info = get_system_info()
        logger.info(f"Информация о системе: {system_info}")
        
        # Проверяем, нужно ли установить автозапуск
        if "--setup-autostart" in sys.argv:
            if setup_autostart():
                logger.info("Автозапуск настроен успешно")
                print("Автозапуск EirosShell настроен успешно!")
            else:
                logger.error("Не удалось настроить автозапуск")
                print("Ошибка при настройке автозапуска!")
            return
            
        # Проверка подключения к интернету
        if not internet_connection_available():
            logger.warning("Отсутствует подключение к интернету. Повторная попытка через 30 секунд...")
            await asyncio.sleep(30)
            if not internet_connection_available():
                logger.error("Интернет недоступен. Завершение работы.")
                print("Ошибка: Отсутствует подключение к интернету. Работа невозможна.")
                return
        
        # Импортируем основной модуль
        from eiros_browser_bootstrap import main as bootstrap_main
        
        print("EirosShell v0.7 запущена. Лог доступен в:", log_file)
        
        # Запускаем основной модуль
        await bootstrap_main()
        
    except ImportError as ie:
        logger.exception(f"Ошибка импорта модуля: {str(ie)}")
        print(f"Ошибка: Отсутствуют необходимые модули: {str(ie)}")
        print("Установите зависимости: python install_requirements.py")
    except Exception as e:
        logger.exception(f"Критическая ошибка при запуске: {str(e)}")
        print(f"Критическая ошибка: {str(e)}")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nEirosShell остановлена пользователем.")
    except Exception as e:
        print(f"\nКритическая ошибка: {str(e)}")
