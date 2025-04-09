
"""
Module for parsing DSL commands for EirosShell
"""

import json
import re
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger("EirosShell")

def parse_dsl_command(dsl_string: str) -> Optional[Dict[str, Any]]:
    """
    Parse a DSL command string in the format:
    /command_type#command_id{json_params}
    
    Example: /click#cmd99{ "element": ".submit", "waitAfter": 500 }
    
    Returns a dictionary with the command structure or None if parsing failed
    """
    try:
        # Using regex to extract command parts
        pattern = r'^/(\w+)#([a-zA-Z0-9_-]+)\{(.*)\}$'
        match = re.match(pattern, dsl_string.strip())
        
        if not match:
            logger.error(f"Invalid DSL command format: {dsl_string}")
            return None
            
        command_type, command_id, params_str = match.groups()
        
        # Parse the JSON parameters
        try:
            params = json.loads(f"{{{params_str}}}")
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse command parameters: {e}")
            return None
            
        # Return the structured command
        return {
            "type": command_type,
            "id": command_id,
            "params": params
        }
        
    except Exception as e:
        logger.error(f"Error parsing DSL command: {str(e)}")
        return None
