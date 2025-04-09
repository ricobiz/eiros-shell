
"""
Вспомогательные функции для EirosShell
"""

import logging
import socket
import urllib.request
import os
import sys
import platform
from pathlib import Path
import time

def setup_logging(log_file):
    """Настраивает логирование"""
    # Создаем папку для логов, если она не существует
    log_dir = os.path.dirname(log_file)
    os.makedirs(log_dir, exist_ok=True)
    
    # Настраиваем логирование в файл и консоль
    logger = logging.getLogger("EirosShell")
    logger.setLevel(logging.DEBUG)
    
    # Форматировщик для логов
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    
    # Обработчик для записи в файл
    file_handler = logging.FileHandler(log_file)
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(formatter)
    
    # Обработчик для вывода в консоль
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(formatter)
    
    # Добавляем обработчики к логгеру
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    
    return logger

def internet_connection_available():
    """Проверяет наличие интернет-соединения"""
    try:
        # Пытаемся подключиться к Google DNS
        socket.create_connection(("8.8.8.8", 53), timeout=3)
        return True
    except OSError:
        pass
    
    try:
        # Альтернативная проверка через запрос к Google
        urllib.request.urlopen("https://www.google.com", timeout=3)
        return True
    except:
        return False

def setup_autostart():
    """Настраивает автозапуск оболочки при старте системы"""
    try:
        system = platform.system()
        script_path = os.path.abspath(sys.argv[0])
        
        if system == "Windows":
            import winreg
            
            # Путь к ключу автозапуска
            key_path = r"Software\Microsoft\Windows\CurrentVersion\Run"
            
            # Открываем ключ реестра
            key = winreg.OpenKey(
                winreg.HKEY_CURRENT_USER,
                key_path,
                0,
                winreg.KEY_SET_VALUE
            )
            
            # Указываем pythonw.exe для запуска без консоли
            python_exe = sys.executable.replace("python.exe", "pythonw.exe")
            command = f'"{python_exe}" "{script_path}"'
            
            # Записываем значение в реестр
            winreg.SetValueEx(key, "EirosShell", 0, winreg.REG_SZ, command)
            winreg.CloseKey(key)
            
            return True
        
        elif system == "Linux":
            # Создаем директорию автозагрузки, если она не существует
            autostart_dir = Path(os.path.expanduser("~")) / ".config" / "autostart"
            autostart_dir.mkdir(parents=True, exist_ok=True)
            
            # Создаем .desktop файл
            desktop_file = autostart_dir / "eirosshell.desktop"
            
            with open(desktop_file, "w") as f:
                f.write(f"""[Desktop Entry]
Type=Application
Exec=python3 "{script_path}"
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true
Name=EirosShell
Comment=AI Shell for ChatGPT
""")
            
            # Делаем файл исполняемым
            os.chmod(desktop_file, 0o755)
            
            return True
        
        elif system == "Darwin":  # macOS
            # Путь к папке автозагрузки
            launch_agents_dir = Path(os.path.expanduser("~")) / "Library" / "LaunchAgents"
            launch_agents_dir.mkdir(parents=True, exist_ok=True)
            
            # Имя и путь к plist файлу
            plist_file = launch_agents_dir / "com.eiros.shell.plist"
            
            # Создаем plist файл
            with open(plist_file, "w") as f:
                f.write(f"""<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.eiros.shell</string>
    <key>ProgramArguments</key>
    <array>
        <string>python3</string>
        <string>{script_path}</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <false/>
</dict>
</plist>
""")
            
            return True
        
        return False
        
    except Exception as e:
        logging.error(f"Ошибка при настройке автозапуска: {str(e)}")
        return False

def remove_autostart():
    """Удаляет оболочку из автозапуска"""
    try:
        system = platform.system()
        
        if system == "Windows":
            import winreg
            
            # Путь к ключу автозапуска
            key_path = r"Software\Microsoft\Windows\CurrentVersion\Run"
            
            try:
                # Открываем ключ реестра
                key = winreg.OpenKey(
                    winreg.HKEY_CURRENT_USER,
                    key_path,
                    0,
                    winreg.KEY_SET_VALUE
                )
                
                # Удаляем значение из реестра
                winreg.DeleteValue(key, "EirosShell")
                winreg.CloseKey(key)
                
                return True
            except FileNotFoundError:
                # Значение не существует
                return True
        
        elif system == "Linux":
            # Путь к файлу автозагрузки
            desktop_file = Path(os.path.expanduser("~")) / ".config" / "autostart" / "eirosshell.desktop"
            
            if desktop_file.exists():
                os.remove(desktop_file)
            
            return True
        
        elif system == "Darwin":  # macOS
            # Путь к plist файлу
            plist_file = Path(os.path.expanduser("~")) / "Library" / "LaunchAgents" / "com.eiros.shell.plist"
            
            if plist_file.exists():
                os.remove(plist_file)
            
            return True
        
        return False
        
    except Exception as e:
        logging.error(f"Ошибка при удалении автозапуска: {str(e)}")
        return False

def get_system_info():
    """Возвращает информацию о системе"""
    try:
        system_info = {
            "system": platform.system(),
            "release": platform.release(),
            "version": platform.version(),
            "machine": platform.machine(),
            "processor": platform.processor(),
            "python_version": platform.python_version(),
            "hostname": platform.node()
        }
        
        return system_info
        
    except Exception as e:
        logging.error(f"Ошибка при получении информации о системе: {str(e)}")
        return {"error": str(e)}
