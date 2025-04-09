
"""
Handler for navigation commands
"""

import logging
from typing import Dict, Any

from command_types import CommandType

logger = logging.getLogger("EirosShell")

async def handle_navigation_command(browser, params, command_id):
    """Обрабатывает команду навигации"""
    result = {
        "command_id": command_id,
        "type": CommandType.NAVIGATION,
        "status": "error",
        "message": ""
    }
    
    url = params.get("url")
    if url:
        success = await browser.navigate_to(url)
        if success:
            result["status"] = "success"
            result["message"] = f"Успешно открыт URL: {url}"
        else:
            result["message"] = f"Ошибка при переходе на URL: {url}"
    else:
        result["message"] = "URL не указан"
        
    return result
