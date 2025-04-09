
"""
Central command executor that delegates to specific handlers
"""

import logging
import asyncio
from typing import Dict, Any

from command_types import CommandType
from .navigation_handler import handle_navigation_command
from .click_handler import handle_click_command
from .type_handler import handle_type_command
from .wait_handler import handle_wait_command
from .screenshot_handler import handle_screenshot_command
from .analyze_handler import handle_analyze_command

logger = logging.getLogger("EirosShell")

async def execute_command(browser_controller, command: Dict[str, Any]) -> Dict[str, Any]:
    """Выполняет команду и возвращает результат"""
    command_type = command["type"]
    params = command["params"]
    command_id = command["id"]
    
    logger.info(f"Выполнение команды {command_id} типа {command_type} с параметрами: {params}")
    
    result = {
        "command_id": command_id,
        "type": command_type,
        "status": "error",
        "message": ""
    }
    
    try:
        if command_type == CommandType.NAVIGATION:
            return await handle_navigation_command(browser_controller, params, command_id)
        elif command_type == CommandType.CLICK:
            return await handle_click_command(browser_controller, params, command_id)
        elif command_type == CommandType.TYPE:
            return await handle_type_command(browser_controller, params, command_id)
        elif command_type == CommandType.WAIT:
            return await handle_wait_command(params, command_id)
        elif command_type == CommandType.SCREENSHOT:
            return await handle_screenshot_command(browser_controller, command_id)
        elif command_type == CommandType.ANALYZE:
            return await handle_analyze_command(browser_controller, command_id)
        else:
            result["message"] = f"Неизвестный тип команды: {command_type}"
    
    except Exception as e:
        logger.error(f"Ошибка при выполнении команды {command_id}: {str(e)}")
        result["message"] = f"Ошибка: {str(e)}"
    
    logger.info(f"Результат команды {command_id}: {result['status']} - {result['message']}")
    return result
