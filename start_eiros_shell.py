"""
Скрипт для запуска EirosShell
"""

import asyncio
import sys
import os
import argparse
from utils import setup_autostart, setup_logging, get_system_info, internet_connection_available
from pathlib import Path
import time
import logging
from diagnostics import run_preflight_checks

def parse_arguments():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(description="EirosShell - Автономная оболочка для взаимодействия с ChatGPT")
    parser.add_argument("--setup-autostart", action="store_true", help="Настроить автозапуск при старте системы")
    parser.add_argument("--debug", action="store_true", help="Запустить в режиме отладки (подробное логирование)")
    parser.add_argument("--nogui", action="store_true", help="Запустить без графического интерфейса")
    parser.add_argument("--skip-preflight", action="store_true", help="Пропустить предварительные проверки")
    return parser.parse_args()

async def main():
    try:
        args = parse_arguments()
        debug_mode = args.debug

        # Настройка логирования
        log_dir = Path(os.path.expanduser("~")) / "EirosShell" / "logs"
        log_dir.mkdir(parents=True, exist_ok=True)
        log_file = log_dir / f"eiros_shell_start_{time.strftime('%Y%m%d_%H%M%S')}.log"
        log_level = logging.DEBUG if debug_mode else logging.INFO
        logger = setup_logging(log_file, level=log_level)
        
        logger.info(f"Запуск EirosShell в {'отладочном' if debug_mode else 'обычном'} режиме...")
        
        # Проверяем, нужно ли установить автозапуск
        if args.setup_autostart:
            if setup_autostart():
                logger.info("Автозапуск настроен успешно")
                print("Автозапуск EirosShell настроен успешно!")
            else:
                logger.error("Не удалось настроить автозапуск")
                print("Ошибка при настройке автозапуска!")
            return
        
        # Запуск предварительных проверок если не указан флаг пропуска
        if not args.skip_preflight:
            logger.info("Запуск предварительных проверок...")
            preflight_results = run_preflight_checks(debug_mode)
            
            if not preflight_results.passed:
                logger.error("Предварительные проверки не пройдены")
                print("\n" + preflight_results.get_summary())
                print("\nИсправьте указанные проблемы и повторите запуск.")
                print("Для пропуска проверок используйте флаг --skip-preflight (не рекомендуется)")
                return
            else:
                logger.info("Предварительные проверки пройдены успешно")
                if debug_mode:
                    print("\n" + preflight_results.get_summary() + "\n")
            
        # Получаем информацию о системе
        system_info = get_system_info()
        logger.info(f"Информация о системе: {system_info}")
            
        # Check if GUI should be disabled
        headless_mode = args.nogui
        
        # Initialize debug GUI if not in headless mode
        if not headless_mode:
            try:
                from gui import initialize_debug_gui
                logger.info("Запуск отладочного интерфейса...")
                debug_gui = initialize_debug_gui()
                logger.info("Отладочный интерфейс запущен")
            except ImportError as e:
                logger.warning(f"Не удалось запустить отладочный интерфейс: {str(e)}")
                logger.warning("Установите PyQt5: pip install PyQt5")
        
        # Проверка подключения к интернету
        if not internet_connection_available():
            logger.warning("Отсутствует подключение к интернету. Повторная попытка через 30 секунд...")
            await asyncio.sleep(30)
            if not internet_connection_available():
                logger.error("Интернет недоступен. Завершение работы.")
                print("Ошибка: Отсутствует подключение к интернету. Работа невозможна.")
                return
        
        logger.info("Интернет-соединение доступно.")
        
        # Импортируем основной модуль
        from eiros_browser_bootstrap import main as bootstrap_main
        
        print(f"EirosShell v0.7 запущена {'в режиме отладки ' if debug_mode else ''}. Лог доступен в: {log_file}")
        
        # Запускаем основной модуль
        await bootstrap_main(debug_mode)
        
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
