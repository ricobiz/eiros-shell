
"""
Модуль для управления конфигурацией чата
"""

import json
import logging
import os
from pathlib import Path

logger = logging.getLogger("EirosShell")

class ChatConfigManager:
    def __init__(self):
        self.config_dir = Path(os.path.expanduser("~")) / "EirosShell" / "config"
        self.config_dir.mkdir(parents=True, exist_ok=True)
        self.chat_config_file = self.config_dir / "chat_config.json"
    
    def save_chat_config(self, config):
        """Сохраняет конфигурацию чата в файл"""
        try:
            # Загружаем существующую конфигурацию, если она есть
            existing_config = self.load_chat_config() or {}
            
            # Обновляем конфигурацию
            existing_config.update(config)
            
            # Сохраняем обновленную конфигурацию
            with open(self.chat_config_file, 'w') as f:
                json.dump(existing_config, f)
            
            return True
        except Exception as e:
            logger.error(f"Ошибка при сохранении конфигурации чата: {str(e)}")
            return False
    
    def load_chat_config(self):
        """Загружает конфигурацию чата из файла"""
        try:
            if not self.chat_config_file.exists():
                return None
            
            with open(self.chat_config_file, 'r') as f:
                config = json.load(f)
            
            return config
            
        except Exception as e:
            logger.error(f"Ошибка при загрузке конфигурации чата: {str(e)}")
            return None
