
"""
Скрипт для установки EirosShell как службы Windows
"""

import os
import sys
import subprocess
import ctypes
import win32serviceutil
import win32service
import win32event
import servicemanager
import socket
import asyncio

# Проверка наличия прав администратора
def is_admin():
    try:
        return ctypes.windll.shell32.IsUserAnAdmin()
    except:
        return False

# Код для службы Windows
class EirosShellService(win32serviceutil.ServiceFramework):
    _svc_name_ = "EirosShellService"
    _svc_display_name_ = "EirosShell Service"
    _svc_description_ = "Автономная оболочка для взаимодействия с ChatGPT"

    def __init__(self, args):
        win32serviceutil.ServiceFramework.__init__(self, args)
        self.hWaitStop = win32event.CreateEvent(None, 0, 0, None)
        socket.setdefaulttimeout(60)
        self.is_running = False

    def SvcStop(self):
        self.ReportServiceStatus(win32service.SERVICE_STOP_PENDING)
        win32event.SetEvent(self.hWaitStop)
        self.is_running = False

    def SvcDoRun(self):
        servicemanager.LogMsg(servicemanager.EVENTLOG_INFORMATION_TYPE,
                              servicemanager.PYS_SERVICE_STARTED,
                              (self._svc_name_, ''))
        self.is_running = True
        self.main()

    def main(self):
        script_dir = os.path.dirname(os.path.abspath(__file__))
        script_path = os.path.join(script_dir, "eiros_browser_bootstrap.py")
        
        while self.is_running:
            # Запускаем EirosShell в отдельном процессе
            subprocess.Popen([sys.executable, script_path])
            
            # Ждем сигнал остановки
            win32event.WaitForSingleObject(self.hWaitStop, win32event.INFINITE)

# Функция установки службы
def install_service():
    if not is_admin():
        # Перезапускаем скрипт с правами администратора
        ctypes.windll.shell32.ShellExecuteW(None, "runas", sys.executable, __file__, None, 1)
        return
    
    try:
        # Полный путь к скрипту
        script_path = os.path.abspath(__file__)
        
        # Устанавливаем службу
        subprocess.call([sys.executable, script_path, "install"])
        
        print("Служба EirosShell успешно установлена!")
        print("Вы можете запустить службу через Службы Windows или выполнить:")
        print(f"python {script_path} start")
        
    except Exception as e:
        print(f"Ошибка при установке службы: {str(e)}")

if __name__ == "__main__":
    if len(sys.argv) == 1:
        install_service()
    else:
        win32serviceutil.HandleCommandLine(EirosShellService)
