
"""
Test script for pattern memory recall across sessions in EirosShell
"""

import asyncio
import logging
import os
import json
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
            return "input"
        elif "innerText" in js_expr:
            return ""
        elif "attributes" in js_expr:
            return {"name": "username", "type": "text"}
        return None
    
    async def bounding_box(self):
        """Mock bounding box method"""
        return {"x": 50, "y": 100, "width": 200, "height": 30}
    
    async def screenshot(self):
        """Mock screenshot method"""
        # Return a minimal PNG image
        return b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDAT\x08\xd7c\xf8\xff\xff?\x00\x05\xfe\x02\xfe\xdc\xccY\xe7\x00\x00\x00\x00IEND\xaeB`\x82"

class MockPage:
    """Mock Playwright page for testing"""
    
    def __init__(self):
        self.url = "https://example.com/dashboard"
        self.title_value = "Dashboard Page"
        
    async def title(self):
        return self.title_value
        
    async def query_selector(self, selector):
        """Mock query_selector method"""
        if selector in ["input[name=username]", "#username", ".username-field"]:
            return MockElementHandle()
        return None
        
    async def query_selector_all(self, selector):
        """Mock query_selector_all method"""
        if selector == "form *":
            return [MockElementHandle()]
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

async def test_pattern_recall_across_sessions():
    browser = MockBrowserController()
    
    # Setup: Create a pattern file for testing
    memory_file = Path(os.path.expanduser("~")) / "EirosShell" / "patterns" / "pattern_memory.json"
    memory_dir = memory_file.parent
    memory_dir.mkdir(parents=True, exist_ok=True)
    
    # Create test patterns
    test_patterns = {
        "input[name=username]:login_form": {
            "selector": "input[name=username]",
            "type": "input",
            "text": "",
            "location": [50, 100, 200, 30],
            "screenshot": "base64encodeddata...",
            "context": "login_form",
            "attributes": {"name": "username", "type": "text"},
            "last_seen": 1617293922.123,
            "learned_at": 1617293800.456,
            "times_seen": 3
        }
    }
    
    # Write test patterns to file
    with open(memory_file, 'w') as f:
        json.dump(test_patterns, f, indent=2)
    
    print("\n=== Testing pattern recall across sessions ===")
    
    # Create a new pattern memory instance (simulating a new session)
    new_pattern_memory = pattern_memory
    new_pattern_memory.load_patterns()
    
    # Verify patterns were loaded
    pattern_count = len(new_pattern_memory.patterns)
    print(f"Loaded {pattern_count} patterns from disk")
    
    # Try to recognize a previously seen element
    pattern = await new_pattern_memory.recognize_element(browser, "input[name=username]", "login_form")
    if pattern:
        print(f"Successfully recalled pattern: {pattern['selector']} in context {pattern['context']}")
        print(f"Previous times seen: {pattern.get('times_seen', 0) - 1}")
        print(f"Updated times seen: {pattern.get('times_seen', 0)}")
    else:
        print("Failed to recall pattern!")
    
    print("\n=== Testing pattern-aware command execution ===")
    
    # Try a type command with the recognized element
    type_command = """
    /type#cmd2{ "selector": "input[name=username]", "text": "testuser", "context": "login_form" }
    """
    result = await execute_dsl_command(browser, type_command)
    print(f"Type result: {result['formatted_message']}")
    
    # Check if pattern was updated correctly
    updated_pattern = new_pattern_memory.get_pattern("input[name=username]", "login_form")
    if updated_pattern:
        print(f"Pattern successfully updated: {updated_pattern['selector']}")
        print(f"Times seen now: {updated_pattern['times_seen']}")
    else:
        print("Failed to update pattern!")

if __name__ == "__main__":
    asyncio.run(test_pattern_recall_across_sessions())
