
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
                        
                        # Log with special attributes for the debug GUI
                        log_record = logger.makeLogRecord({
                            'msg': f"Успешно выполнен клик по элементу: {selector} (pattern memory: {context})",
                            'levelname': 'INFO',
                            'command_id': command_id,
                            'command_status': 'success',
                            'command_type': CommandType.CLICK
                        })
                        logger.handle(log_record)
                    else:
                        result["message"] = f"Ошибка при клике на элемент: {selector}"
                        # Log error with special attributes
                        log_record = logger.makeLogRecord({
                            'msg': f"Ошибка при клике на элемент: {selector}",
                            'levelname': 'ERROR',
                            'command_id': command_id,
                            'command_status': 'error',
                            'command_type': CommandType.CLICK
                        })
                        logger.handle(log_record)
                else:
                    result["message"] = f"Элемент не найден: {selector}"
                    # Log error with special attributes
                    log_record = logger.makeLogRecord({
                        'msg': f"Элемент не найден: {selector}",
                        'levelname': 'ERROR',
                        'command_id': command_id,
                        'command_status': 'error',
                        'command_type': CommandType.CLICK
                    })
                    logger.handle(log_record)
            else:
                # Regular click without pattern recognition
                element = await browser.wait_for_selector(selector, timeout=10000)
                if element:
                    success = await browser.click(selector)
                    if success:
                        result["status"] = "success"
                        result["message"] = f"Успешно выполнен клик по элементу: {selector}"
                        # Log success with special attributes
                        log_record = logger.makeLogRecord({
                            'msg': f"Успешно выполнен клик по элементу: {selector}",
                            'levelname': 'INFO',
                            'command_id': command_id,
                            'command_status': 'success',
                            'command_type': CommandType.CLICK
                        })
                        logger.handle(log_record)
                    else:
                        result["message"] = f"Ошибка при клике на элемент: {selector}"
                        # Log error with special attributes
                        log_record = logger.makeLogRecord({
                            'msg': f"Ошибка при клике на элемент: {selector}",
                            'levelname': 'ERROR',
                            'command_id': command_id,
                            'command_status': 'error',
                            'command_type': CommandType.CLICK
                        })
                        logger.handle(log_record)
                else:
                    result["message"] = f"Элемент не найден: {selector}"
                    # Log error with special attributes
                    log_record = logger.makeLogRecord({
                        'msg': f"Элемент не найден: {selector}",
                        'levelname': 'ERROR',
                        'command_id': command_id,
                        'command_status': 'error',
                        'command_type': CommandType.CLICK
                    })
                    logger.handle(log_record)
        except Exception as click_error:
            logger.error(f"Ошибка при выполнении клика: {str(click_error)}")
            result["message"] = f"Ошибка при клике: {str(click_error)}"
            # Log exception with special attributes
            log_record = logger.makeLogRecord({
                'msg': f"Ошибка при выполнении клика: {str(click_error)}",
                'levelname': 'ERROR',
                'command_id': command_id,
                'command_status': 'error',
                'command_type': CommandType.CLICK
            })
            logger.handle(log_record)
    else:
        result["message"] = "Селектор не указан"
        # Log error with special attributes
        log_record = logger.makeLogRecord({
            'msg': "Селектор не указан",
            'levelname': 'ERROR',
            'command_id': command_id,
            'command_status': 'error',
            'command_type': CommandType.CLICK
        })
        logger.handle(log_record)
        
    return result
