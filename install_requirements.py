
"""
Скрипт для установки необходимых зависимостей
"""

import subprocess
import sys
import os
import platform
import time

def check_python_version():
    """Check if Python version is compatible"""
    required_version = (3, 8)
    current_version = sys.version_info[:2]
    
    if current_version < required_version:
        print(f"Ошибка: EirosShell требует Python {required_version[0]}.{required_version[1]} или выше.")
        print(f"У вас установлена версия Python {current_version[0]}.{current_version[1]}.")
        return False
    
    return True

def install_requirements():
    print("Установка необходимых пакетов для EirosShell...")
    
    if not check_python_version():
        sys.exit(1)
    
    # Check if pip is available
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "--version"])
    except:
        print("Ошибка: pip не найден. Пожалуйста, установите pip.")
        sys.exit(1)
    
    # Путь к файлу requirements.txt
    requirements_file = "requirements.txt"
    if not os.path.exists(requirements_file):
        print(f"Ошибка: файл {requirements_file} не найден.")
        sys.exit(1)
    
    print("Установка зависимостей из requirements.txt...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", requirements_file])
    except subprocess.CalledProcessError:
        print("Ошибка при установке зависимостей из requirements.txt")
        sys.exit(1)
    
    # Установка браузеров для Playwright
    try:
        print("Установка браузеров для Playwright...")
        subprocess.check_call([sys.executable, "-m", "playwright", "install", "chromium"])
    except:
        print("Предупреждение: не удалось установить браузеры Playwright автоматически.")
        print("После установки playwright выполните команду: python -m playwright install chromium")
    
    print("\nУстановка зависимостей завершена успешно!")
    
    # Создание структуры директорий
    try:
        eiros_dir = os.path.expanduser("~/EirosShell")
        for subdir in ["logs", "screenshots", "patterns"]:
            directory = os.path.join(eiros_dir, subdir)
            os.makedirs(directory, exist_ok=True)
        print("Структура директорий создана в " + eiros_dir)
    except:
        print("Предупреждение: не удалось создать структуру директорий.")
    
    # Создание файла .env из шаблона, если его нет
    if os.path.exists(".env.template") and not os.path.exists(".env"):
        try:
            with open(".env.template", "r") as template, open(".env", "w") as env_file:
                env_file.write(template.read())
            print("Файл конфигурации .env создан из шаблона.")
        except:
            print("Предупреждение: не удалось создать файл .env из шаблона.")
    
    print("\nКак использовать EirosShell:")
    print("1. Запустите start_eiros_shell.py для работы оболочки")
    print("2. Для запуска в режиме отладки: start_eiros_shell.py --debug")
    print("3. Для настройки автозапуска: start_eiros_shell.py --setup-autostart")
    print("\nДополнительная информация в README.md")
    
    # Ask to run preflight checks
    try:
        response = input("\nВыполнить предварительные проверки сейчас? (y/n): ")
        if response.lower() in ["y", "yes", "да", "д"]:
            print("\nЗапуск предварительных проверок...")
            time.sleep(1)
            # Import diagnostics module and run checks
            sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
            try:
                from diagnostics import run_preflight_checks
                result = run_preflight_checks(debug_mode=True)
                print("\n" + result.get_summary())
            except ImportError:
                print("Ошибка: не удалось импортировать модуль diagnostics.")
        else:
            print("\nПредварительные проверки пропущены.")
    except:
        print("\nНе удалось запустить предварительные проверки.")

if __name__ == "__main__":
    install_requirements()
