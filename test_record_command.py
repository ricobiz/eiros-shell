
"""
Test script for the record command functionality
"""

import asyncio
import json
from unittest.mock import MagicMock, AsyncMock
from command_handlers import execute_command
from command_types import CommandType

class MockBrowser:
    def __init__(self):
        self.page = AsyncMock()
        self.page.url = AsyncMock(return_value="https://example.com/login")
        
    async def wait_for_selector(self, selector, timeout=30000):
        element_mock = AsyncMock()
        element_mock.bounding_box = AsyncMock(return_value={"x": 100, "y": 50, "width": 200, "height": 40})
        element_mock.inner_text = AsyncMock(return_value="Login Button")
        return element_mock
    
    async def take_screenshot(self, path=None):
        # Create a dummy screenshot file
        import numpy as np
        import cv2
        from pathlib import Path
        
        if not path:
            path = str(Path.cwd() / "test_screenshot.png")
            
        # Create a simple test screenshot
        test_screenshot = np.zeros((600, 800, 3), dtype=np.uint8)
        cv2.rectangle(test_screenshot, (100, 50), (300, 90), (255, 255, 255), -1)
        cv2.imwrite(path, test_screenshot)
        
        return path

async def test_record_command():
    """Test the record command functionality"""
    print("Testing record command...")
    
    # Create a mock browser
    browser = MockBrowser()
    
    # Create a record command
    command = {
        "type": CommandType.RECORD,
        "id": "test_cmd1",
        "params": {
            "selector": "#login-btn",
            "name": "login_button"
        }
    }
    
    # Execute the command
    result = await execute_command(browser, command)
    
    # Print the result
    print(f"Command status: {result['status']}")
    print(f"Command message: {result['message']}")
    
    # Check if the pattern was saved
    from pattern_matcher import pattern_matcher
    if "login_button" in pattern_matcher.patterns:
        print("Pattern was successfully saved!")
        print(json.dumps(pattern_matcher.patterns["login_button"], indent=2))
    else:
        print("Pattern was not saved.")
    
    print("Test completed")

if __name__ == "__main__":
    asyncio.run(test_record_command())
