"""
DSL command executor for EirosShell
"""

import logging
import re
from typing import Dict, Any, Optional

from command_types import CommandType
from dsl_parser import parse_dsl_command
from .basic_executor import execute_command

logger = logging.getLogger("EirosShell")

async def execute_dsl_command(browser_controller, dsl_string: str) -> Optional[Dict[str, Any]]:
    """
    Executes a command in DSL format and returns the result
    
    Example: /click#cmd99{ "element": ".submit", "waitAfter": 500 }
    """
    logger.info(f"Executing DSL command: {dsl_string}")
    
    # Parse the DSL command
    command = parse_dsl_command(dsl_string)
    
    if not command:
        logger.error("Failed to parse DSL command")
        return {
            "command_id": "unknown",
            "type": "unknown",
            "status": "error",
            "message": f"Failed to parse DSL command: {dsl_string}",
            "formatted_message": f"[оболочка]: Command #unknown: unknown — ERROR. #log_error"
        }
    
    # Execute the parsed command
    result = await execute_command(browser_controller, command)
    
    # Format the result for logging
    command_type = command["type"]
    command_id = command["id"]
    status_text = "OK" if result["status"] == "success" else "ERROR"
    
    # Build a description of the command for the log
    description = ""
    if command_type == CommandType.NAVIGATION:
        description = f"→ '{command['params'].get('url', '')}'"
    elif command_type == CommandType.CLICK:
        description = f"→ '{command['params'].get('element', '') or command['params'].get('selector', '')}'"
    elif command_type == CommandType.TYPE:
        description = f"→ '{command['params'].get('selector', '')}'"
    elif command_type == CommandType.WAIT:
        description = f"→ {command['params'].get('duration', 2)} sec"
    elif command_type == CommandType.SET:
        var_name = command['params'].get('var', '')
        if not var_name:
            # Find first key that's not 'var' or 'value'
            for key in command['params'].keys():
                if key not in ['var', 'value']:
                    var_name = key
                    break
        var_value = command['params'].get('value', command['params'].get(var_name, ''))
        description = f"→ ${var_name} = '{var_value}'"
    elif command_type == CommandType.IF:
        condition = command['params'].get('condition', '')
        description = f"→ '{condition}'"
    elif command_type == CommandType.REPEAT:
        times = command['params'].get('times', command['params'].get('count', 0))
        description = f"→ {times} times"
    elif command_type == CommandType.SCREENSHOT or command_type == CommandType.ANALYZE:
        description = ""
    
    # Extract numeric part of the command ID for the log ID
    log_id = ""
    if command_id.startswith('cmd') and command_id[3:].isdigit():
        log_id = command_id[3:]
    else:
        log_id = command_id
    
    # Format the result message
    result_message = f"[оболочка]: Command #{command_id}: {command_type} {description} — {status_text}."
    
    # Add pattern recognition info if available
    if "pattern_info" in result:
        result_message += f" {result['pattern_info']}."
        
    # Add log ID
    result_message += f" #log_{log_id}"
    
    # Log the result message
    logger.info(result_message)
    
    # Add the formatted message to the result
    result["formatted_message"] = result_message
    
    return result
