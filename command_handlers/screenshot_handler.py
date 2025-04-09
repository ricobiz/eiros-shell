
"""
Handler for screenshot commands
"""

import logging
from typing import Dict, Any

from command_types import CommandType

logger = logging.getLogger("EirosShell")

async def handle_screenshot_command(browser, command_id):
    """Обрабатывает команду создания скриншота"""
    result = {
        "command_id": command_id,
        "type": CommandType.SCREENSHOT,
        "status": "error",
        "message": ""
    }
    
    try:
        screenshot_path = await browser.take_screenshot()
        if screenshot_path:
            result["status"] = "success"
            result["message"] = f"Скриншот сохранен: {screenshot_path}"
            result["data"] = {"screenshot_path": screenshot_path}
        else:
            result["message"] = "Ошибка при создании скриншота"
    except Exception as screenshot_error:
        logger.error(f"Ошибка при создании скриншота: {str(screenshot_error)}")
        result["message"] = f"Ошибка при создании скриншота: {str(screenshot_error)}"
    
    return result
