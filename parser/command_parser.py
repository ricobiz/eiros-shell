
"""
Main command parser that delegates to specialized parsers
"""

import logging
from typing import Dict, Any, Optional

from .format_detector import detect_command_format
from .json_parser import parse_json_command
from .marked_parser import parse_marked_command
from .directive_parser import parse_directive_command
from .implicit_parser import parse_implicit_command

logger = logging.getLogger("EirosShell")

class CommandParser:
    def __init__(self, initial_counter=0):
        """
        Initialize the command parser
        
        Args:
            initial_counter: Initial value for the command counter
        """
        self.command_counter = initial_counter
    
    def parse_command(self, message: str) -> Optional[Dict[str, Any]]:
        """
        Parse a message and extract a command
        
        Supported formats:
        1. JSON: {"command": "navigation", "params": {"url": "https://example.com"}}
        2. Marked: [command: navigation] [url: https://example.com]
        3. Directive: #navigate to https://example.com
        4. Implicit: "go to https://example.com"
        
        Args:
            message: The message to parse
            
        Returns:
            A dictionary with the parsed command or None if no command is found
        """
        try:
            # Increment command counter
            self.command_counter += 1
            
            # Generate command ID
            command_id = f"cmd_{self.command_counter}"
            
            # Detect command format
            format_type = detect_command_format(message)
            
            if format_type == "json":
                return parse_json_command(message, command_id)
            elif format_type == "marked":
                return parse_marked_command(message, command_id)
            elif format_type == "directive":
                return parse_directive_command(message, command_id)
            elif format_type == "implicit":
                return parse_implicit_command(message, command_id)
                
            logger.info("No command found in message")
            return None
            
        except Exception as e:
            logger.error(f"Error in command parser: {str(e)}")
            return None
    
    def get_command_counter(self) -> int:
        """
        Get the current value of the command counter
        
        Returns:
            The current command counter value
        """
        return self.command_counter
