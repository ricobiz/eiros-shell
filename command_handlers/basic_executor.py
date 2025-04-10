
"""
Basic command executor that delegates to specific handlers
"""

import logging
from typing import Dict, Any, Optional

from command_types import CommandType
from .navigation_handler import handle_navigation_command
from .click_handler import handle_click_command
from .type_handler import handle_type_command
from .wait_handler import handle_wait_command
from .screenshot_handler import handle_screenshot_command
from .analyze_handler import handle_analyze_command
from .variable_handler import handle_set_command, process_params_with_variables
from .conditional_handler import handle_if_command
from .loop_handler import handle_repeat_command
from .record_handler import handle_record_command
from .schedule_handler import handle_schedule_command
from .pattern_memory import pattern_memory

logger = logging.getLogger("EirosShell")

async def execute_command(browser_controller, command: Dict[str, Any]) -> Dict[str, Any]:
    """Executes a command and returns the result"""
    command_type = command["type"]
    params = command["params"]
    command_id = command["id"]
    
    # Process variables in parameters
    processed_params = process_params_with_variables(params)
    
    # Check for pattern memory references in selectors
    if "selector" in processed_params and isinstance(processed_params["selector"], str) and processed_params["selector"].startswith("@"):
        # This is a pattern memory reference
        pattern_id = processed_params["selector"][1:]  # Remove the @ prefix
        pattern = pattern_memory.get_pattern(pattern_id)
        
        if pattern:
            # Use the original selector from the pattern
            processed_params["selector"] = pattern.get("selector", processed_params["selector"])
            logger.info(f"Using pattern memory for selector: {pattern_id} -> {processed_params['selector']}")
        else:
            logger.warning(f"Pattern '{pattern_id}' not found in pattern memory")
    
    logger.info(f"Executing command {command_id} of type {command_type} with parameters: {processed_params}")
    
    result = {
        "command_id": command_id,
        "type": command_type,
        "status": "error",
        "message": ""
    }
    
    try:
        if command_type == CommandType.NAVIGATION:
            return await handle_navigation_command(browser_controller, processed_params, command_id)
        elif command_type == CommandType.CLICK:
            return await handle_click_command(browser_controller, processed_params, command_id)
        elif command_type == CommandType.TYPE:
            return await handle_type_command(browser_controller, processed_params, command_id)
        elif command_type == CommandType.WAIT:
            return await handle_wait_command(processed_params, command_id)
        elif command_type == CommandType.SCREENSHOT:
            return await handle_screenshot_command(browser_controller, command_id)
        elif command_type == CommandType.ANALYZE:
            return await handle_analyze_command(browser_controller, command_id)
        elif command_type == CommandType.SET:
            return handle_set_command(processed_params, command_id)
        elif command_type == CommandType.IF:
            return await handle_if_command(browser_controller, processed_params, command_id)
        elif command_type == CommandType.REPEAT:
            return await handle_repeat_command(browser_controller, processed_params, command_id)
        elif command_type == CommandType.RECORD:
            return await handle_record_command(browser_controller, processed_params, command_id)
        elif command_type == CommandType.SCHEDULE:
            return await handle_schedule_command(processed_params, command_id)
        else:
            result["message"] = f"Unknown command type: {command_type}"
    
    except Exception as e:
        logger.error(f"Error executing command {command_id}: {str(e)}")
        result["message"] = f"Error: {str(e)}"
    
    logger.info(f"Command {command_id} result: {result['status']} - {result['message']}")
    return result
