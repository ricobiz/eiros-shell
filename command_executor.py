
"""
Модуль для распознавания и выполнения команд от ChatGPT
"""

import asyncio
import json
import logging
import os
import re
from pathlib import Path
import time
from typing import Dict, Any, List, Optional

logger = logging.getLogger("EirosShell")

# Определение типов команд
class CommandType:
    NAVIGATION = "navigation"
    CLICK = "click"
    TYPE = "type"
    WAIT = "wait"
    SCREENSHOT = "screenshot"
    ANALYZE = "analyze"
    UNKNOWN = "unknown"

class CommandExecutor:
    def __init__(self, browser_controller, chat_connector):
        self.browser = browser_controller
        self.chat = chat_connector
        self.command_history = []
        self.command_counter = 0
        self.log_dir = Path(os.path.expanduser("~")) / "EirosShell" / "logs"
        self.log_dir.mkdir(parents=True, exist_ok=True)
        self.compressed_logs_file = Path(os.path.expanduser("~")) / "EirosShell" / "compressed_logs.json"
        self._load_command_counter()
        
    async def start_command_loop(self):
        """Запускает основной цикл обработки команд"""
        try:
            logger.info("Запуск основного цикла обработки команд...")
            
            while True:
                # Ожидаем ответ от ChatGPT
                response = await self.chat.wait_for_response(timeout=300)
                
                if response:
                    # Проверяем, содержит ли ответ команду
                    command = self._parse_command(response)
                    
                    if command:
                        # Выполняем команду
                        command_result = await self._execute_command(command)
                        
                        # Отправляем результат выполнения
                        if command_result:
                            self._save_command_to_history(command, command_result)
                            await self._send_command_result(command, command_result)
                
                # Небольшая пауза перед следующей проверкой
                await asyncio.sleep(1)
                
        except Exception as e:
            logger.exception(f"Критическая ошибка в цикле обработки команд: {str(e)}")
            # Отправляем сообщение о критической ошибке в чат
            await self.chat.send_message(f"[оболочка]: Критическая ошибка: {str(e)}. Перезапустите оболочку.")
    
    def _parse_command(self, message: str) -> Optional[Dict[str, Any]]:
        """
        Парсит сообщение от ChatGPT и извлекает команды.
        
        Поддерживаемые форматы команд:
        1. JSON: {"command": "navigation", "params": {"url": "https://example.com"}}
        2. Маркированный текст: [command: navigation] [url: https://example.com]
        3. Директивный текст: #navigate to https://example.com
        4. Неявные команды в тексте
        """
        try:
            # Увеличиваем счетчик команд
            self.command_counter += 1
            
            # Пробуем найти JSON-команду
            json_pattern = r'\{[\s\S]*?"command"\s*?:\s*?"(\w+)"[\s\S]*?\}'
            json_match = re.search(json_pattern, message)
            
            if json_match:
                try:
                    # Извлекаем весь JSON
                    json_str = message[json_match.start():json_match.end()]
                    command_json = json.loads(json_str)
                    
                    # Проверяем наличие обязательных полей
                    if "command" in command_json:
                        command_type = command_json["command"].lower()
                        params = command_json.get("params", {})
                        
                        logger.info(f"Обнаружена JSON-команда: {command_type}")
                        
                        return {
                            "id": f"cmd_{self.command_counter}",
                            "type": command_type,
                            "params": params,
                            "source": "json",
                            "raw": json_str
                        }
                except Exception as json_error:
                    logger.error(f"Ошибка парсинга JSON-команды: {str(json_error)}")
            
            # Пробуем найти маркированную команду
            marked_pattern = r'\[command\s*:\s*(\w+)\](.*?)(?=\[command|$)'
            marked_matches = re.findall(marked_pattern, message, re.IGNORECASE | re.DOTALL)
            
            if marked_matches:
                command_type = marked_matches[0][0].lower()
                command_text = marked_matches[0][1]
                
                # Извлекаем параметры из маркированного текста
                params = {}
                param_pattern = r'\[(\w+)\s*:\s*(.*?)\]'
                param_matches = re.findall(param_pattern, command_text, re.IGNORECASE | re.DOTALL)
                
                for param_name, param_value in param_matches:
                    params[param_name.lower()] = param_value.strip()
                
                logger.info(f"Обнаружена маркированная команда: {command_type}")
                
                return {
                    "id": f"cmd_{self.command_counter}",
                    "type": command_type,
                    "params": params,
                    "source": "marked",
                    "raw": marked_matches[0][0] + marked_matches[0][1]
                }
            
            # Пробуем найти директивную команду
            directive_patterns = [
                (r'#navigate\s+(?:to\s+)?(?P<url>https?://\S+)', CommandType.NAVIGATION, lambda m: {"url": m.group("url")}),
                (r'#goto\s+(?P<url>https?://\S+)', CommandType.NAVIGATION, lambda m: {"url": m.group("url")}),
                (r'#click\s+(?:on\s+)?(?P<selector>.+?)(?=$|\n|\.)', CommandType.CLICK, lambda m: {"selector": m.group("selector")}),
                (r'#type\s+(?P<text>.*?)\s+(?:in|into)\s+(?P<selector>.+?)(?=$|\n|\.)', CommandType.TYPE, lambda m: {"text": m.group("text"), "selector": m.group("selector")}),
                (r'#wait\s+(?:for\s+)?(?P<duration>\d+)(?:\s+seconds?)?', CommandType.WAIT, lambda m: {"duration": int(m.group("duration"))}),
                (r'#screenshot', CommandType.SCREENSHOT, lambda m: {}),
                (r'#analyze', CommandType.ANALYZE, lambda m: {})
            ]
            
            for pattern, cmd_type, param_extractor in directive_patterns:
                match = re.search(pattern, message, re.IGNORECASE)
                if match:
                    params = param_extractor(match)
                    
                    logger.info(f"Обнаружена директивная команда: {cmd_type}")
                    
                    return {
                        "id": f"cmd_{self.command_counter}",
                        "type": cmd_type,
                        "params": params,
                        "source": "directive",
                        "raw": match.group(0)
                    }
            
            # Неявные команды в тексте
            # Проверяем на наличие URL для навигации
            url_pattern = r'(?:go to|navigate to|open|visit)\s+(https?://\S+)'
            url_match = re.search(url_pattern, message, re.IGNORECASE)
            
            if url_match:
                url = url_match.group(1)
                logger.info(f"Обнаружена неявная команда навигации: {url}")
                
                return {
                    "id": f"cmd_{self.command_counter}",
                    "type": CommandType.NAVIGATION,
                    "params": {"url": url},
                    "source": "implicit",
                    "raw": url_match.group(0)
                }
            
            # Если не обнаружено команд
            logger.info("Команды не обнаружены в сообщении")
            return None
            
        except Exception as e:
            logger.error(f"Ошибка при парсинге команды: {str(e)}")
            return None
    
    async def _execute_command(self, command: Dict[str, Any]) -> Dict[str, Any]:
        """Выполняет команду и возвращает результат"""
        command_type = command["type"]
        params = command["params"]
        command_id = command["id"]
        
        logger.info(f"Выполнение команды {command_id} типа {command_type} с параметрами: {params}")
        
        result = {
            "command_id": command_id,
            "type": command_type,
            "status": "error",
            "message": ""
        }
        
        try:
            if command_type == CommandType.NAVIGATION:
                url = params.get("url")
                if url:
                    success = await self.browser.navigate_to(url)
                    if success:
                        result["status"] = "success"
                        result["message"] = f"Успешно открыт URL: {url}"
                    else:
                        result["message"] = f"Ошибка при переходе на URL: {url}"
                else:
                    result["message"] = "URL не указан"
            
            elif command_type == CommandType.CLICK:
                selector = params.get("selector")
                if selector:
                    try:
                        element = await self.browser.wait_for_selector(selector, timeout=10000)
                        if element:
                            success = await self.browser.click(selector)
                            if success:
                                result["status"] = "success"
                                result["message"] = f"Успешно выполнен клик по элементу: {selector}"
                            else:
                                result["message"] = f"Ошибка при клике на элемент: {selector}"
                        else:
                            result["message"] = f"Элемент не найден: {selector}"
                    except Exception as click_error:
                        logger.error(f"Ошибка при выполнении клика: {str(click_error)}")
                        result["message"] = f"Ошибка при клике: {str(click_error)}"
                else:
                    result["message"] = "Селектор не указан"
            
            elif command_type == CommandType.TYPE:
                text = params.get("text")
                selector = params.get("selector")
                if text and selector:
                    try:
                        element = await self.browser.wait_for_selector(selector, timeout=10000)
                        if element:
                            success = await self.browser.type_text(selector, text)
                            if success:
                                result["status"] = "success"
                                result["message"] = f"Успешно введен текст в элемент: {selector}"
                            else:
                                result["message"] = f"Ошибка при вводе текста в элемент: {selector}"
                        else:
                            result["message"] = f"Элемент не найден: {selector}"
                    except Exception as type_error:
                        logger.error(f"Ошибка при вводе текста: {str(type_error)}")
                        result["message"] = f"Ошибка при вводе текста: {str(type_error)}"
                else:
                    result["message"] = "Текст или селектор не указаны"
            
            elif command_type == CommandType.WAIT:
                try:
                    duration = params.get("duration")
                    if duration:
                        await asyncio.sleep(float(duration))
                        result["status"] = "success"
                        result["message"] = f"Ожидание {duration} секунд выполнено"
                    else:
                        await asyncio.sleep(2)  # Дефолтное ожидание
                        result["status"] = "success"
                        result["message"] = "Ожидание 2 секунды выполнено (по умолчанию)"
                except Exception as wait_error:
                    result["message"] = f"Ошибка при ожидании: {str(wait_error)}"
            
            elif command_type == CommandType.SCREENSHOT:
                try:
                    screenshot_path = await self.browser.take_screenshot()
                    if screenshot_path:
                        result["status"] = "success"
                        result["message"] = f"Скриншот сохранен: {screenshot_path}"
                        result["data"] = {"screenshot_path": screenshot_path}
                    else:
                        result["message"] = "Ошибка при создании скриншота"
                except Exception as screenshot_error:
                    logger.error(f"Ошибка при создании скриншота: {str(screenshot_error)}")
                    result["message"] = f"Ошибка при создании скриншота: {str(screenshot_error)}"
            
            elif command_type == CommandType.ANALYZE:
                try:
                    # Анализируем текущую страницу
                    page_title = await self.browser.page.title()
                    page_url = self.browser.page.url
                    
                    # Собираем информацию о ключевых элементах
                    elements_info = await self._analyze_page_elements()
                    
                    result["status"] = "success"
                    result["message"] = f"Анализ страницы {page_title} выполнен"
                    result["data"] = {
                        "title": page_title,
                        "url": page_url,
                        "elements": elements_info
                    }
                except Exception as analyze_error:
                    logger.error(f"Ошибка при анализе страницы: {str(analyze_error)}")
                    result["message"] = f"Ошибка при анализе страницы: {str(analyze_error)}"
            
            else:
                result["message"] = f"Неизвестный тип команды: {command_type}"
            
        except Exception as e:
            logger.error(f"Ошибка при выполнении команды {command_id}: {str(e)}")
            result["message"] = f"Ошибка: {str(e)}"
        
        logger.info(f"Результат команды {command_id}: {result['status']} - {result['message']}")
        return result
    
    async def _analyze_page_elements(self) -> Dict[str, Any]:
        """Анализирует элементы на текущей странице"""
        try:
            elements_info = {}
            
            # Получаем формы
            forms = await self.browser.page.query_selector_all("form")
            forms_data = []
            for i, form in enumerate(forms):
                form_inputs = await form.query_selector_all("input, select, textarea")
                inputs_data = []
                for input_el in form_inputs:
                    input_type = await input_el.get_attribute("type") or "text"
                    input_name = await input_el.get_attribute("name") or ""
                    input_id = await input_el.get_attribute("id") or ""
                    input_placeholder = await input_el.get_attribute("placeholder") or ""
                    
                    inputs_data.append({
                        "type": input_type,
                        "name": input_name,
                        "id": input_id,
                        "placeholder": input_placeholder
                    })
                
                forms_data.append({
                    "index": i,
                    "inputs": inputs_data,
                    "action": await form.get_attribute("action") or "",
                    "method": await form.get_attribute("method") or "get"
                })
            
            elements_info["forms"] = forms_data
            
            # Получаем кнопки
            buttons = await self.browser.page.query_selector_all("button, input[type='button'], input[type='submit'], a.btn, .button")
            buttons_data = []
            for i, button in enumerate(buttons):
                button_text = await button.inner_text() or await button.get_attribute("value") or ""
                button_id = await button.get_attribute("id") or ""
                button_class = await button.get_attribute("class") or ""
                
                buttons_data.append({
                    "index": i,
                    "text": button_text.strip(),
                    "id": button_id,
                    "class": button_class
                })
            
            elements_info["buttons"] = buttons_data
            
            # Получаем навигационные элементы
            navigation = await self.browser.page.query_selector_all("nav, .nav, .navigation, .menu")
            nav_data = []
            for i, nav in enumerate(navigation):
                nav_links = await nav.query_selector_all("a")
                links_data = []
                for link in nav_links:
                    link_text = await link.inner_text()
                    link_href = await link.get_attribute("href") or ""
                    
                    links_data.append({
                        "text": link_text.strip(),
                        "href": link_href
                    })
                
                nav_data.append({
                    "index": i,
                    "links": links_data
                })
            
            elements_info["navigation"] = nav_data
            
            return elements_info
            
        except Exception as e:
            logger.error(f"Ошибка при анализе элементов страницы: {str(e)}")
            return {"error": str(e)}
    
    async def _send_command_result(self, command: Dict[str, Any], result: Dict[str, Any]):
        """Отправляет результат выполнения команды обратно в чат"""
        # Формируем краткое сообщение о результате с учетом требуемого формата
        status_text = "OK" if result["status"] == "success" else "ОШИБКА"
        command_type = command["type"]
        command_id = command["id"]
        log_id = f"log_{self.command_counter}"
        
        # Формируем описание для различных типов команд
        description = ""
        if command_type == CommandType.NAVIGATION:
            description = f"→ '{command['params'].get('url', '')}'"
        elif command_type == CommandType.CLICK:
            description = f"→ '{command['params'].get('selector', '')}'"
        elif command_type == CommandType.TYPE:
            description = f"→ '{command['params'].get('selector', '')}'"
        elif command_type == CommandType.WAIT:
            description = f"→ {command['params'].get('duration', 2)} сек"
        elif command_type == CommandType.SCREENSHOT or command_type == CommandType.ANALYZE:
            description = ""
            
        # Формируем сообщение для отправки по новому формату
        response_message = f"[оболочка]: Команда #{command_id}: {command_type} {description} — {status_text}. #{log_id}"
        
        # Отправляем сообщение обратно в чат
        await self.chat.send_message(response_message)
        
        # Логируем отправку сообщения
        logger.info(f"Отправлен результат в чат: {response_message}")
    
    def _save_command_to_history(self, command: Dict[str, Any], result: Dict[str, Any]):
        """Сохраняет команду и результат в историю"""
        try:
            history_entry = {
                "timestamp": time.time(),
                "command": command,
                "result": result
            }
            
            self.command_history.append(history_entry)
            
            # Сохраняем сжатый лог для долгосрочного хранения
            compressed_log = {
                "id": command["id"],
                "type": command["type"],
                "status": result["status"],
                "timestamp": time.time(),
                "message": result["message"]
            }
            
            # Загружаем существующие логи
            existing_logs = []
            if os.path.exists(self.compressed_logs_file):
                try:
                    with open(self.compressed_logs_file, 'r') as f:
                        existing_logs = json.load(f)
                except:
                    pass
            
            # Добавляем новый лог
            existing_logs.append(compressed_log)
            
            # Сохраняем обновленные логи
            with open(self.compressed_logs_file, 'w') as f:
                json.dump(existing_logs, f, indent=2)
            
            # Сохраняем счетчик команд
            self._save_command_counter()
            
        except Exception as e:
            logger.error(f"Ошибка при сохранении команды в историю: {str(e)}")
    
    def _save_command_counter(self):
        """Сохраняет счетчик команд"""
        try:
            counter_file = self.log_dir / "command_counter.json"
            with open(counter_file, 'w') as f:
                json.dump({"counter": self.command_counter}, f)
        except Exception as e:
            logger.error(f"Ошибка при сохранении счетчика команд: {str(e)}")
    
    def _load_command_counter(self):
        """Загружает счетчик команд"""
        try:
            counter_file = self.log_dir / "command_counter.json"
            if os.path.exists(counter_file):
                with open(counter_file, 'r') as f:
                    data = json.load(f)
                    self.command_counter = data.get("counter", 0)
        except Exception as e:
            logger.error(f"Ошибка при загрузке счетчика команд: {str(e)}")
