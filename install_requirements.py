
"""
Скрипт для установки необходимых зависимостей
"""

import subprocess
import sys
import os

def install_requirements():
    print("Установка необходимых пакетов для EirosShell...")
    
    # Список необходимых пакетов
    requirements = [
        "playwright",
        "pyautogui"
    ]
    
    # Устанавливаем пакеты через pip
    for package in requirements:
        print(f"Установка {package}...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])
    
    # Установка браузеров для Playwright
    print("Установка браузеров для Playwright...")
    subprocess.check_call([sys.executable, "-m", "playwright", "install", "chromium"])
    
    print("\nВсе зависимости установлены успешно!")
    print("\nКак использовать EirosShell:")
    print("1. Запустите start_eiros_shell.py для работы оболочки")
    print("2. Для настройки автозапуска: start_eiros_shell.py --setup-autostart")
    print("\nДополнительная информация в README.md")

if __name__ == "__main__":
    install_requirements()
