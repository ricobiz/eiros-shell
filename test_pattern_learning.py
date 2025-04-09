
"""
Test script for the pattern memory in EirosShell
"""

import asyncio
import logging
import os
from pathlib import Path

from command_handlers import pattern_memory, execute_dsl_command

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger("EirosShell")

class MockElementHandle:
    """Mock Playwright element handle for testing"""
    
    async def evaluate(self, js_expr):
        """Mock evaluate method"""
        if "tagName" in js_expr:
            return "button"
        elif "innerText" in js_expr:
            return "Submit"
        elif "attributes" in js_expr:
            return {"id": "submit", "class": "btn btn-primary"}
        return None
    
    async def bounding_box(self):
        """Mock bounding box method"""
        return {"x": 100, "y": 200, "width": 120, "height": 40}
    
    async def screenshot(self):
        """Mock screenshot method"""
        # Return a minimal PNG image
        return b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDAT\x08\xd7c\xf8\xff\xff?\x00\x05\xfe\x02\xfe\xdc\xccY\xe7\x00\x00\x00\x00IEND\xaeB`\x82"

class MockPage:
    """Mock Playwright page for testing"""
    
    def __init__(self):
        self.url = "https://example.com/login"
        self.title_value = "Login Page"
        
    async def title(self):
        return self.title_value
        
    async def query_selector(self, selector):
        """Mock query_selector method"""
        if selector in ["#submit", ".login-btn", "button[type=submit]"]:
            return MockElementHandle()
        return None
        
    async def query_selector_all(self, selector):
        """Mock query_selector_all method"""
        if selector == "form *":
            return [MockElementHandle(), MockElementHandle()]
        return []

class MockBrowserController:
    """A mock browser controller for testing"""
    
    def __init__(self):
        self._page = MockPage()
    
    @property
    def page(self):
        return self._page
    
    async def navigate_to(self, url):
        logger.info(f"Mock navigate to: {url}")
        self._page.url = url
        return True
        
    async def click(self, selector):
        logger.info(f"Mock click on: {selector}")
        return True
        
    async def type_text(self, selector, text):
        logger.info(f"Mock type '{text}' into: {selector}")
        return True
    
    async def wait_for_selector(self, selector, timeout=10000):
        logger.info(f"Mock wait for selector: {selector}")
        return await self._page.query_selector(selector)

async def test_pattern_learning():
    browser = MockBrowserController()
    
    # Clear existing patterns
    pattern_memory.clear_patterns()
    
    print("\n=== Testing pattern learning ===")
    
    # Learn a new element
    pattern1 = await pattern_memory.learn_element(browser, "#submit", "login_form")
    print(f"Learned pattern: {pattern1['selector']} ({pattern1['type']})")
    
    # Try a click command with context
    click_command = """
    /click#cmd1{ "element": "#submit", "context": "login_form" }
    """
    result = await execute_dsl_command(browser, click_command)
    print(f"Click result: {result['formatted_message']}")
    
    # Learn another element
    pattern2 = await pattern_memory.learn_element(browser, ".login-btn", "home_page")
    print(f"Learned pattern: {pattern2['selector']} ({pattern2['type']})")
    
    # Check if pattern was stored correctly
    stored_pattern = pattern_memory.get_pattern("#submit", "login_form")
    if stored_pattern:
        print(f"Pattern successfully stored: {stored_pattern['selector']} in context {stored_pattern['context']}")
        print(f"Times seen: {stored_pattern['times_seen']}")
    else:
        print("Failed to store pattern!")
    
    print("\n=== Testing pattern recognition ===")
    
    # Try to recognize the same element again
    pattern3 = await pattern_memory.recognize_element(browser, "#submit", "login_form")
    print(f"Recognized pattern: {pattern3['selector']} ({pattern3['type']})")
    print(f"Times seen: {pattern3['times_seen']}")
    
    # Expected output will show the pattern was recognized and times_seen increased

if __name__ == "__main__":
    asyncio.run(test_pattern_learning())
