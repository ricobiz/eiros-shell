
"""
Module for parsing JSON-formatted commands
"""

import json
import re
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger("EirosShell")

def parse_json_command(message: str, command_id: str) -> Optional[Dict[str, Any]]:
    """
    Extract and parse a JSON command from a message
    
    Args:
        message: The message to parse
        command_id: The ID to assign to the command
        
    Returns:
        A dictionary with the parsed command or None if parsing fails
    """
    try:
        # Extract JSON command
        json_pattern = r'\{[\s\S]*?"command"\s*?:\s*?"(\w+)"[\s\S]*?\}'
        json_match = re.search(json_pattern, message)
        
        if not json_match:
            return None
            
        # Extract the entire JSON string
        json_str = message[json_match.start():json_match.end()]
        command_json = json.loads(json_str)
        
        # Check for required fields
        if "command" not in command_json:
            logger.error("JSON command missing 'command' field")
            return None
            
        command_type = command_json["command"].lower()
        params = command_json.get("params", {})
        
        logger.info(f"Parsed JSON command: {command_type}")
        
        return {
            "id": command_id,
            "type": command_type,
            "params": params,
            "source": "json",
            "raw": json_str
        }
        
    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing error: {str(e)}")
        return None
    except Exception as e:
        logger.error(f"Error parsing JSON command: {str(e)}")
        return None
