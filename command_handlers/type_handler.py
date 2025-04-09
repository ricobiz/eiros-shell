
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
                        
                        # Log with special attributes for the debug GUI
                        log_record = logger.makeLogRecord({
                            'msg': f"Успешно введен текст в элемент: {selector} (pattern memory: {context})",
                            'levelname': 'INFO',
                            'command_id': command_id,
                            'command_status': 'success',
                            'command_type': CommandType.TYPE
                        })
                        logger.handle(log_record)
                    else:
                        result["message"] = f"Ошибка при вводе текста в элемент: {selector}"
                        # Log error with special attributes
                        log_record = logger.makeLogRecord({
                            'msg': f"Ошибка при вводе текста в элемент: {selector}",
                            'levelname': 'ERROR',
                            'command_id': command_id,
                            'command_status': 'error',
                            'command_type': CommandType.TYPE
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
                        'command_type': CommandType.TYPE
                    })
                    logger.handle(log_record)
            else:
                # Regular type without pattern recognition
                element = await browser.wait_for_selector(selector, timeout=10000)
                if element:
                    success = await browser.type_text(selector, text)
                    if success:
                        result["status"] = "success"
                        result["message"] = f"Успешно введен текст в элемент: {selector}"
                        # Log success with special attributes
                        log_record = logger.makeLogRecord({
                            'msg': f"Успешно введен текст в элемент: {selector}",
                            'levelname': 'INFO',
                            'command_id': command_id,
                            'command_status': 'success',
                            'command_type': CommandType.TYPE
                        })
                        logger.handle(log_record)
                    else:
                        result["message"] = f"Ошибка при вводе текста в элемент: {selector}"
                        # Log error with special attributes
                        log_record = logger.makeLogRecord({
                            'msg': f"Ошибка при вводе текста в элемент: {selector}",
                            'levelname': 'ERROR',
                            'command_id': command_id,
                            'command_status': 'error',
                            'command_type': CommandType.TYPE
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
                        'command_type': CommandType.TYPE
                    })
                    logger.handle(log_record)
        except Exception as type_error:
            logger.error(f"Ошибка при вводе текста: {str(type_error)}")
            result["message"] = f"Ошибка при вводе текста: {str(type_error)}"
            # Log exception with special attributes
            log_record = logger.makeLogRecord({
                'msg': f"Ошибка при вводе текста: {str(type_error)}",
                'levelname': 'ERROR',
                'command_id': command_id,
                'command_status': 'error',
                'command_type': CommandType.TYPE
            })
            logger.handle(log_record)
    else:
        result["message"] = "Текст или селектор не указаны"
        # Log error with special attributes
        log_record = logger.makeLogRecord({
            'msg': "Текст или селектор не указаны",
            'levelname': 'ERROR',
            'command_id': command_id,
            'command_status': 'error',
            'command_type': CommandType.TYPE
        })
        logger.handle(log_record)
        
    return result
