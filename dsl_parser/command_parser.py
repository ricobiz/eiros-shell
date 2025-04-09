
"""
Module for parsing individual DSL commands
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
    
    Or alternative format:
    @command_type#command_id{json_params}[commands]
    
    Example: /click#cmd99{ "element": ".submit", "waitAfter": 500 }
    
    Returns a dictionary with the command structure or None if parsing failed
    """
    try:
        dsl_string = dsl_string.strip()
        
        # Check for @ syntax for conditional and loop commands
        if dsl_string.startswith('@'):
            # This is the alternative syntax with brackets for commands
            # @if#cmd2{ "condition": "$role == 'admin'" }[...commands...]
            pattern = r'^@(\w+)#([a-zA-Z0-9_-]+)\{(.*?)\}\[(.*)\]$'
            match = re.match(pattern, dsl_string, re.DOTALL)
            
            if match:
                command_type, command_id, params_str, commands_str = match.groups()
                
                # Parse the JSON parameters
                try:
                    params = json.loads(f"{{{params_str}}}")
                except json.JSONDecodeError as e:
                    logger.error(f"Failed to parse command parameters: {e}")
                    return None
                
                # For if command, add the commands as then branch
                if command_type.lower() == "if":
                    # Import here to avoid circular import
                    from .chain_parser import parse_command_chain
                    commands = parse_command_chain(f"/chain#temp[{commands_str}]")
                    params["then"] = commands
                
                # For repeat command, add the commands as do list
                elif command_type.lower() == "repeat":
                    # Import here to avoid circular import
                    from .chain_parser import parse_command_chain
                    commands = parse_command_chain(f"/chain#temp[{commands_str}]")
                    params["do"] = commands
                
                # Return the structured command
                return {
                    "type": command_type.lower(),
                    "id": command_id,
                    "params": params
                }
        
        # Using regex to extract command parts for standard format
        pattern = r'^/(\w+)#([a-zA-Z0-9_-]+)\{(.*)\}$'
        match = re.match(pattern, dsl_string)
        
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
            "type": command_type.lower(),
            "id": command_id,
            "params": params
        }
        
    except Exception as e:
        logger.error(f"Error parsing DSL command: {str(e)}")
        return None
