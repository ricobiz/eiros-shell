
# EirosShell v0.7

Автономная оболочка для взаимодействия с ChatGPT. EirosShell автоматически запускает браузер, 
подключается к ChatGPT и обеспечивает двустороннюю коммуникацию между AI и компьютером.

## Возможности

- Автоматический запуск и авторизация в ChatGPT
- Распознавание и выполнение команд от AI
- Автоматизация действий в браузере
- Возможность автозапуска при старте системы
- Сохранение истории команд и логов

## Требования

- Python 3.8+
- Chromium, Chrome или Edge браузер
- Пакеты: playwright, pyautogui

## Установка

1. Клонируйте репозиторий или загрузите файлы
2. Установите необходимые зависимости:

```bash
python install_requirements.py
```

## Использование

### Первый запуск

```bash
python start_eiros_shell.py
```

При первом запуске вам будет предложено войти в аккаунт OpenAI вручную. 
Вы также можете сохранить учетные данные для автоматического входа.

### Настройка автозапуска

```bash
python start_eiros_shell.py --setup-autostart
```

## Структура проекта

- `start_eiros_shell.py` - Главный скрипт запуска
- `eiros_browser_bootstrap.py` - Основной модуль загрузки
- `browser_driver.py` - Управление браузером
- `openai_login_handler.py` - Обработчик авторизации
- `chat_connector.py` - Подключение к чату
- `command_executor.py` - Выполнение команд
- `utils.py` - Вспомогательные функции

## Команды для ChatGPT

EirosShell понимает следующие форматы команд:

### JSON команды
```
{"command": "navigation", "params": {"url": "https://example.com"}}
```

### Маркированные команды
```
[command: navigation] [url: https://example.com]
```

### Директивные команды
```
#navigate to https://example.com
#click on .login-button
#type hello into input[name="message"]
#wait 5
#screenshot
#analyze
```

## Конфигурация

Конфигурационные файлы и логи хранятся в директории `~/EirosShell/`.
