
"""
Обработчики команд для EirosShell
"""

import asyncio
import logging
from typing import Dict, Any

from command_types import CommandType

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

async def handle_click_command(browser, params, command_id):
    """Обрабатывает команду клика по элементу"""
    result = {
        "command_id": command_id,
        "type": CommandType.CLICK,
        "status": "error",
        "message": ""
    }
    
    selector = params.get("selector")
    if selector:
        try:
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
    if text and selector:
        try:
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

async def handle_analyze_command(browser, command_id):
    """Обрабатывает команду анализа страницы"""
    result = {
        "command_id": command_id,
        "type": CommandType.ANALYZE,
        "status": "error",
        "message": ""
    }
    
    try:
        # Анализируем текущую страницу
        page_title = await browser.page.title()
        page_url = browser.page.url
        
        # Собираем информацию о ключевых элементах
        elements_info = await analyze_page_elements(browser)
        
        result["status"] = "success"
        result["message"] = f"Анализ страницы {page_title} выполнен"
        result["data"] = {
            "title": page_title,
            "url": page_url,
            "elements": elements_info
        }
    except Exception as analyze_error:
        logger.error(f"Ошибка при анализе страницы: {str(analyze_error)}")
        result["message"] = f"Ошибка при анализе страницы: {str(analyze_error)}"
    
    return result

async def analyze_page_elements(browser):
    """Анализирует элементы на текущей странице"""
    try:
        elements_info = {}
        
        # Получаем формы
        forms = await browser.page.query_selector_all("form")
        forms_data = []
        for i, form in enumerate(forms):
            form_inputs = await form.query_selector_all("input, select, textarea")
            inputs_data = []
            for input_el in form_inputs:
                input_type = await input_el.get_attribute("type") or "text"
                input_name = await input_el.get_attribute("name") or ""
                input_id = await input_el.get_attribute("id") or ""
                input_placeholder = await input_el.get_attribute("placeholder") or ""
                
                inputs_data.append({
                    "type": input_type,
                    "name": input_name,
                    "id": input_id,
                    "placeholder": input_placeholder
                })
            
            forms_data.append({
                "index": i,
                "inputs": inputs_data,
                "action": await form.get_attribute("action") or "",
                "method": await form.get_attribute("method") or "get"
            })
        
        elements_info["forms"] = forms_data
        
        # Получаем кнопки
        buttons = await browser.page.query_selector_all("button, input[type='button'], input[type='submit'], a.btn, .button")
        buttons_data = []
        for i, button in enumerate(buttons):
            button_text = await button.inner_text() or await button.get_attribute("value") or ""
            button_id = await button.get_attribute("id") or ""
            button_class = await button.get_attribute("class") or ""
            
            buttons_data.append({
                "index": i,
                "text": button_text.strip(),
                "id": button_id,
                "class": button_class
            })
        
        elements_info["buttons"] = buttons_data
        
        # Получаем навигационные элементы
        navigation = await browser.page.query_selector_all("nav, .nav, .navigation, .menu")
        nav_data = []
        for i, nav in enumerate(navigation):
            nav_links = await nav.query_selector_all("a")
            links_data = []
            for link in nav_links:
                link_text = await link.inner_text()
                link_href = await link.get_attribute("href") or ""
                
                links_data.append({
                    "text": link_text.strip(),
                    "href": link_href
                })
            
            nav_data.append({
                "index": i,
                "links": links_data
            })
        
        elements_info["navigation"] = nav_data
        
        return elements_info
        
    except Exception as e:
        logger.error(f"Ошибка при анализе элементов страницы: {str(e)}")
        return {"error": str(e)}
