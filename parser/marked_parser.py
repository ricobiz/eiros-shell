
"""
Module for parsing marked-format commands
"""

import re
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger("EirosShell")

def parse_marked_command(message: str, command_id: str) -> Optional[Dict[str, Any]]:
    """
    Extract and parse a marked command from a message
    
    Format: [command: type] [param1: value1] [param2: value2]
    
    Args:
        message: The message to parse
        command_id: The ID to assign to the command
        
    Returns:
        A dictionary with the parsed command or None if parsing fails
    """
    try:
        # Find the marked command
        marked_pattern = r'\[command\s*:\s*(\w+)\](.*?)(?=\[command|$)'
        marked_matches = re.findall(marked_pattern, message, re.IGNORECASE | re.DOTALL)
        
        if not marked_matches:
            return None
            
        # Get the first marked command
        command_type = marked_matches[0][0].lower()
        command_text = marked_matches[0][1]
        
        # Extract parameters
        params = {}
        param_pattern = r'\[(\w+)\s*:\s*(.*?)\]'
        param_matches = re.findall(param_pattern, command_text, re.IGNORECASE | re.DOTALL)
        
        for param_name, param_value in param_matches:
            params[param_name.lower()] = param_value.strip()
            
        logger.info(f"Parsed marked command: {command_type}")
        
        return {
            "id": command_id,
            "type": command_type,
            "params": params,
            "source": "marked",
            "raw": marked_matches[0][0] + marked_matches[0][1]
        }
        
    except Exception as e:
        logger.error(f"Error parsing marked command: {str(e)}")
        return None
