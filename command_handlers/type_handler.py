
"""
Handler for type commands
"""

import logging
from typing import Dict, Any

from command_types import CommandType
from .pattern_memory import pattern_memory

logger = logging.getLogger("EirosShell")

async def handle_type_command(browser, params, command_id):
    """Обрабатывает команду ввода текста"""
    result = {
        "command_id": command_id,
        "type": CommandType.TYPE,
        "status": "error",
        "message": ""
    }
    
    text = params.get("text")
    selector = params.get("selector")
    context = params.get("context", "default")
    
    if text and selector:
        try:
            # Try to recognize the element using pattern memory
            pattern = await pattern_memory.recognize_element(browser, selector, context)
            
            if pattern:
                # Found in pattern memory
                element = await browser.wait_for_selector(selector, timeout=10000)
                if element:
                    success = await browser.type_text(selector, text)
                    if success:
                        result["status"] = "success"
                        result["message"] = f"Успешно введен текст в элемент: {selector}"
                        result["pattern_info"] = f"Element recognized via pattern memory ({context})"
                    else:
                        result["message"] = f"Ошибка при вводе текста в элемент: {selector}"
                else:
                    result["message"] = f"Элемент не найден: {selector}"
            else:
                # Regular type without pattern recognition
                element = await browser.wait_for_selector(selector, timeout=10000)
                if element:
                    success = await browser.type_text(selector, text)
                    if success:
                        result["status"] = "success"
                        result["message"] = f"Успешно введен текст в элемент: {selector}"
                    else:
                        result["message"] = f"Ошибка при вводе текста в элемент: {selector}"
                else:
                    result["message"] = f"Элемент не найден: {selector}"
        except Exception as type_error:
            logger.error(f"Ошибка при вводе текста: {str(type_error)}")
            result["message"] = f"Ошибка при вводе текста: {str(type_error)}"
    else:
        result["message"] = "Текст или селектор не указаны"
        
    return result
