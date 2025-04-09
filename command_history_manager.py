
"""
Command history manager for EirosShell
"""

import os
import time
import logging
import json
from pathlib import Path
from typing import Dict, Any, List

logger = logging.getLogger("EirosShell")

class CommandHistoryManager:
    def __init__(self):
        self.command_history = []
        self.command_counter = 0
        self.log_dir = Path(os.path.expanduser("~")) / "EirosShell" / "logs"
        self.log_dir.mkdir(parents=True, exist_ok=True)
        self.compressed_logs_file = Path(os.path.expanduser("~")) / "EirosShell" / "compressed_logs.json"
        self._load_command_counter()
    
    def get_command_counter(self) -> int:
        """Returns the current command counter"""
        return self.command_counter
    
    def get_history(self) -> List[Dict[str, Any]]:
        """Returns the command history"""
        return self.command_history
    
    def save_command_to_history(self, command: Dict[str, Any], result: Dict[str, Any]):
        """Saves a command and its result to history"""
        try:
            history_entry = {
                "timestamp": time.time(),
                "command": command,
                "result": result
            }
            
            self.command_history.append(history_entry)
            
            # Save compressed log for long-term storage
            compressed_log = {
                "id": command["id"],
                "type": command["type"],
                "status": result["status"],
                "timestamp": time.time(),
                "message": result["message"]
            }
            
            # Save command counter
            self._save_command_counter()
            
        except Exception as e:
            logger.error(f"Error saving command to history: {str(e)}")
    
    def _save_command_counter(self):
        """Saves the command counter"""
        try:
            counter_file = self.log_dir / "command_counter.json"
            with open(counter_file, 'w') as f:
                json.dump({"counter": self.command_counter}, f)
        except Exception as e:
            logger.error(f"Error saving command counter: {str(e)}")
    
    def _load_command_counter(self):
        """Loads the command counter"""
        try:
            counter_file = self.log_dir / "command_counter.json"
            if os.path.exists(counter_file):
                with open(counter_file, 'r') as f:
                    data = json.load(f)
                    self.command_counter = data.get("counter", 0)
        except Exception as e:
            logger.error(f"Error loading command counter: {str(e)}")
