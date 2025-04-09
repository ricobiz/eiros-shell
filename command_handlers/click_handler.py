
"""
Handler for click commands
"""

import logging
from typing import Dict, Any

from command_types import CommandType
from .pattern_memory import pattern_memory

logger = logging.getLogger("EirosShell")

async def handle_click_command(browser, params, command_id):
    """Обрабатывает команду клика по элементу"""
    result = {
        "command_id": command_id,
        "type": CommandType.CLICK,
        "status": "error",
        "message": ""
    }
    
    selector = params.get("selector") or params.get("element")
    context = params.get("context", "default")
    
    if selector:
        try:
            # Try to recognize the element using pattern memory
            pattern = await pattern_memory.recognize_element(browser, selector, context)
            
            if pattern:
                # Found in pattern memory
                element = await browser.wait_for_selector(selector, timeout=10000)
                if element:
                    success = await browser.click(selector)
                    if success:
                        result["status"] = "success"
                        result["message"] = f"Успешно выполнен клик по элементу: {selector}"
                        result["pattern_info"] = f"Element recognized via pattern memory ({context})"
                    else:
                        result["message"] = f"Ошибка при клике на элемент: {selector}"
                else:
                    result["message"] = f"Элемент не найден: {selector}"
            else:
                # Regular click without pattern recognition
                element = await browser.wait_for_selector(selector, timeout=10000)
                if element:
                    success = await browser.click(selector)
                    if success:
                        result["status"] = "success"
                        result["message"] = f"Успешно выполнен клик по элементу: {selector}"
                    else:
                        result["message"] = f"Ошибка при клике на элемент: {selector}"
                else:
                    result["message"] = f"Элемент не найден: {selector}"
        except Exception as click_error:
            logger.error(f"Ошибка при выполнении клика: {str(click_error)}")
            result["message"] = f"Ошибка при клике: {str(click_error)}"
    else:
        result["message"] = "Селектор не указан"
        
    return result
