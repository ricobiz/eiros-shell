
"""
Скрипт для запуска EirosShell
"""

import asyncio
import sys
import os
from utils import setup_autostart, setup_logging, get_system_info
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
        
        # Импортируем основной модуль
        from eiros_browser_bootstrap import main as bootstrap_main
        
        # Запускаем основной модуль
        await bootstrap_main()
        
    except Exception as e:
        logger.exception(f"Критическая ошибка при запуске: {str(e)}")
        print(f"Критическая ошибка: {str(e)}")

if __name__ == "__main__":
    asyncio.run(main())
