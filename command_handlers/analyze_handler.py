
"""
Handler for analyze commands
"""

import logging
from typing import Dict, Any

from command_types import CommandType

logger = logging.getLogger("EirosShell")

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
