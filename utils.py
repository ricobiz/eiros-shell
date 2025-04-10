
"""
Вспомогательные функции для EirosShell
"""

import logging
import os
import platform
import socket
import sys
import time
from pathlib import Path
import psutil

def setup_logging(log_file=None, level=logging.INFO):
    """Настраивает и возвращает логгер"""
    logger = logging.getLogger("EirosShell")
    logger.setLevel(level)
    
    # Clear any existing handlers
    if logger.handlers:
        logger.handlers = []
    
    # Добавляем форматирование
    formatter = logging.Formatter('%(asctime)s [%(levelname)s] %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
    
    # Добавляем вывод в консоль
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    console_handler.setLevel(level)
    logger.addHandler(console_handler)
    
    # Добавляем вывод в файл, если он указан
    if log_file:
        file_handler = logging.FileHandler(log_file)
        file_handler.setFormatter(formatter)
        file_handler.setLevel(level)
        logger.addHandler(file_handler)
    
    return logger

def get_system_info():
    """Собирает информацию о системе"""
    system_info = {
        "platform": platform.system(),
        "platform_version": platform.version(),
        "platform_release": platform.release(),
        "architecture": platform.machine(),
        "processor": platform.processor(),
        "hostname": socket.gethostname(),
        "python_version": sys.version,
        "memory": f"{round(psutil.virtual_memory().total / (1024**3), 2)} GB",
        "cpu_cores": psutil.cpu_count(logical=False),
        "cpu_threads": psutil.cpu_count(logical=True)
    }
    
    return system_info

def internet_connection_available():
    """Проверяет доступность интернет-соединения"""
    try:
        # Пробуем подключиться к надежному хосту
        socket.create_connection(("8.8.8.8", 53), timeout=5)
        return True
    except OSError:
        pass
    
    try:
        # Альтернативная проверка
        socket.create_connection(("1.1.1.1", 53), timeout=5)
        return True
    except OSError:
        return False

def setup_autostart():
    """Настраивает автозапуск оболочки при старте системы"""
    try:
        system = platform.system()
        
        if system == "Windows":
            import winreg
            
            # Получаем полный путь к скрипту
            script_path = os.path.abspath(sys.argv[0])
            python_exe = sys.executable
            
            # Команда для запуска
            cmd = f'"{python_exe}" "{script_path}"'
            
            # Открываем раздел реестра для автозагрузки
            key = winreg.OpenKey(
                winreg.HKEY_CURRENT_USER, 
                r"Software\Microsoft\Windows\CurrentVersion\Run", 
                0, 
                winreg.KEY_WRITE
            )
            
            # Добавляем запись
            winreg.SetValueEx(key, "EirosShell", 0, winreg.REG_SZ, cmd)
            winreg.CloseKey(key)
            return True
            
        elif system == "Linux":
            # Создаем файл автозапуска для Linux
            autostart_dir = Path(os.path.expanduser("~")) / ".config" / "autostart"
            autostart_dir.mkdir(parents=True, exist_ok=True)
            
            desktop_file = autostart_dir / "eiros-shell.desktop"
            
            script_path = os.path.abspath(sys.argv[0])
            python_exe = sys.executable
            
            with open(desktop_file, "w") as f:
                f.write(f"""[Desktop Entry]
Type=Application
Name=EirosShell
Comment=EirosShell autonomous OpenAI browser
Exec={python_exe} {script_path}
Terminal=false
Hidden=false
X-GNOME-Autostart-enabled=true
""")
            os.chmod(desktop_file, 0o755)
            return True
            
        elif system == "Darwin":  # macOS
            # Создаем файл plist для автозагрузки в macOS
            launch_agents_dir = Path(os.path.expanduser("~")) / "Library" / "LaunchAgents"
            launch_agents_dir.mkdir(parents=True, exist_ok=True)
            
            plist_file = launch_agents_dir / "com.user.eirosshell.plist"
            
            script_path = os.path.abspath(sys.argv[0])
            python_exe = sys.executable
            
            with open(plist_file, "w") as f:
                f.write(f"""<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.user.eirosshell</string>
    <key>ProgramArguments</key>
    <array>
        <string>{python_exe}</string>
        <string>{script_path}</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
</dict>
</plist>""")
            os.chmod(plist_file, 0o644)
            return True
            
        else:
            return False
            
    except Exception as e:
        logger.error(f"Ошибка при настройке автозапуска: {str(e)}")
        return False

def load_dotenv():
    """Load environment variables from .env file"""
    env_path = Path('.env')
    if env_path.exists():
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('#'):
                    continue
                    
                key, value = line.split('=', 1)
                os.environ[key.strip()] = value.strip().strip('"\'')
