
"""
Module for parsing manual reference commands
"""

import re
import json
import logging
from typing import Dict, Any, Optional

from command_types import CommandType

logger = logging.getLogger("EirosShell")

def parse_manual_reference_command(message: str, command_id: str) -> Optional[Dict[str, Any]]:
    """
    Extract and parse commands that reference manually annotated elements
    Format: /command#id{ "element": "@element_name", ... }
    
    Args:
        message: The message to parse
        command_id: The ID to assign to the command
        
    Returns:
        A dictionary with the parsed command or None if parsing fails
    """
    try:
        # Match commands with manually annotated element references
        manual_pattern = r'/(\w+)(?:#(\w+))?\s*(\{[\s\S]*?"element"\s*?:\s*?"@([^"]+)"[\s\S]*?\})'
        manual_match = re.search(manual_pattern, message)
        
        if not manual_match:
            return None
            
        command_type = manual_match.group(1).lower()
        cmd_id = manual_match.group(2) or command_id
        json_str = manual_match.group(3)
        ref_element = manual_match.group(4)
        
        try:
            params = json.loads(json_str)
        except json.JSONDecodeError:
            logger.error(f"JSON parsing error in manual reference command: {json_str}")
            return None
        
        # Replace the @element_name with the appropriate format for pattern lookup
        params["element_ref"] = ref_element
        params["manual_ref"] = True
        
        logger.info(f"Parsed manual reference command: {command_type} with element @{ref_element}")
        
        return {
            "id": cmd_id,
            "type": command_type,
            "params": params,
            "source": "manual_ref",
            "raw": manual_match.group(0)
        }
        
    except Exception as e:
        logger.error(f"Error parsing manual reference command: {str(e)}")
        return None
