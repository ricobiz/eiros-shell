
"""
Handler for wait commands
"""

import logging
import asyncio
from typing import Dict, Any

from command_types import CommandType

logger = logging.getLogger("EirosShell")

async def handle_wait_command(params, command_id):
    """Обрабатывает команду ожидания"""
    result = {
        "command_id": command_id,
        "type": CommandType.WAIT,
        "status": "error",
        "message": ""
    }
    
    try:
        duration = params.get("duration")
        if duration:
            await asyncio.sleep(float(duration))
            result["status"] = "success"
            result["message"] = f"Ожидание {duration} секунд выполнено"
        else:
            await asyncio.sleep(2)  # Дефолтное ожидание
            result["status"] = "success"
            result["message"] = "Ожидание 2 секунды выполнено (по умолчанию)"
    except Exception as wait_error:
        result["message"] = f"Ошибка при ожидании: {str(wait_error)}"
    
    return result
