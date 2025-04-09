
"""
Handler for click commands
"""

import logging
from typing import Dict, Any
import numpy as np
import cv2

from command_types import CommandType
from .pattern_memory import pattern_memory
from pattern_matcher import pattern_matcher

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
    force_visual = params.get("force_visual", False)
    
    if selector:
        try:
            # Try to recognize the element using pattern memory
            pattern = await pattern_memory.recognize_element(browser, selector, context)
            
            if pattern and not force_visual:
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
                    # Try visual pattern matching as fallback
                    try:
                        # Take a screenshot
                        screenshot_path = await browser.take_screenshot()
                        if screenshot_path:
                            # Load screenshot for matching
                            screenshot = cv2.imread(screenshot_path)
                            if screenshot is not None:
                                # Get current URL for context
                                url = await browser.page.url
                                
                                # Try to find a visual match
                                match = pattern_matcher.find_best_match(url, screenshot)
                                
                                if match:
                                    # Click on the matched element using PyAutoGUI
                                    if pattern_matcher.click_match(match):
                                        result["status"] = "success"
                                        result["message"] = f"Selector failed, visual pattern match used for: {selector}"
                                        result["fallback_used"] = True
                                        result["matched_pattern"] = match["id"]
                                        
                                        # Log success with special attributes
                                        log_record = logger.makeLogRecord({
                                            'msg': f"Selector failed, visual fallback used: {selector} -> matched '{match['id']}'",
                                            'levelname': 'INFO',
                                            'command_id': command_id,
                                            'command_status': 'success',
                                            'command_type': CommandType.CLICK
                                        })
                                        logger.handle(log_record)
                                        return result
                    except Exception as visual_error:
                        logger.error(f"Visual pattern matching error: {str(visual_error)}")
                    
                    # If we got here, both selector and visual matching failed
                    result["message"] = f"Element not found with selector or visual matching: {selector}"
                    log_record = logger.makeLogRecord({
                        'msg': f"Element not found with selector or visual matching: {selector}",
                        'levelname': 'ERROR',
                        'command_id': command_id,
                        'command_status': 'error',
                        'command_type': CommandType.CLICK
                    })
                    logger.handle(log_record)
            else:
                # Try direct selector first if not forcing visual
                element = await browser.wait_for_selector(selector, timeout=10000)
                if element and not force_visual:
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
                    # Try visual pattern matching as fallback or primary method if forced
                    try:
                        # Take a screenshot
                        screenshot_path = await browser.take_screenshot()
                        if screenshot_path:
                            # Load screenshot for matching
                            screenshot = cv2.imread(screenshot_path)
                            if screenshot is not None:
                                # Get current URL for context
                                url = await browser.page.url
                                
                                # Extract element ID from selector for more specific matching
                                element_id = None
                                if selector.startswith('#'):
                                    element_id = selector[1:]
                                
                                # Try to find a visual match
                                match = pattern_matcher.find_best_match(url, screenshot, element_id)
                                
                                if match:
                                    # Click on the matched element using PyAutoGUI
                                    if pattern_matcher.click_match(match):
                                        result["status"] = "success"
                                        context_msg = "visual pattern match used"
                                        if force_visual:
                                            context_msg = "forced visual pattern match used"
                                        elif not element:
                                            context_msg = "selector failed, visual pattern match used"
                                            
                                        result["message"] = f"{context_msg} for: {selector}"
                                        result["fallback_used"] = True
                                        result["matched_pattern"] = match["id"]
                                        
                                        # Log success with special attributes
                                        log_record = logger.makeLogRecord({
                                            'msg': f"{context_msg}: {selector} -> matched '{match['id']}'",
                                            'levelname': 'INFO',
                                            'command_id': command_id,
                                            'command_status': 'success',
                                            'command_type': CommandType.CLICK
                                        })
                                        logger.handle(log_record)
                                        return result
                    except Exception as visual_error:
                        logger.error(f"Visual pattern matching error: {str(visual_error)}")
                    
                    # If we got here, both selector and visual matching failed
                    result["message"] = f"Element not found with selector or visual matching: {selector}"
                    log_record = logger.makeLogRecord({
                        'msg': f"Element not found with selector or visual matching: {selector}",
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
