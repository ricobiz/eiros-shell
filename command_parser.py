
"""
Модуль для парсинга команд из сообщений ChatGPT
"""

import json
import logging
import re
from typing import Dict, Any, Optional

from command_types import CommandType

logger = logging.getLogger("EirosShell")

class CommandParser:
    def __init__(self, initial_counter=0):
        self.command_counter = initial_counter
    
    def parse_command(self, message: str) -> Optional[Dict[str, Any]]:
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
    
    def get_command_counter(self) -> int:
        """Возвращает текущее значение счетчика команд"""
        return self.command_counter
