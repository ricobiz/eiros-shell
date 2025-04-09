
"""
Ultimate test file for EirosShell functionality
Tests all core features:
- Command chains
- Nested chains
- Variables
- Conditionals
- Loops
- Pattern memory
- Unified logging
"""
import asyncio
import json
import os
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("test_ultimate_chain.log"),
        logging.StreamHandler()
    ]
)

# Mock browser controller for testing
class MockBrowserController:
    def __init__(self):
        self.page = MockPage()
        self.url = None
        self.inputs = {}
        self.clicked = []
        self.screens = []
        
    async def navigate_to(self, url):
        self.url = url
        logging.info(f"Navigated to {url}")
        return True
        
    async def type_text(self, selector, text):
        self.inputs[selector] = text
        logging.info(f"Typed '{text}' into {selector}")
        return True
        
    async def click(self, selector):
        self.clicked.append(selector)
        logging.info(f"Clicked on {selector}")
        return True
        
    async def wait_for_selector(self, selector, timeout=5000):
        logging.info(f"Waiting for selector {selector}")
        return MockElement(selector)
        
    async def take_screenshot(self, path=None):
        if path:
            # Create directories if needed
            os.makedirs(os.path.dirname(path), exist_ok=True)
            # Create empty file
            with open(path, 'wb') as f:
                f.write(b'MOCK_SCREENSHOT')
        self.screens.append(path or "screenshot.png")
        logging.info(f"Screenshot taken: {path or 'screenshot.png'}")
        return True

class MockPage:
    async def url(self):
        return "https://example.com"
        
    async def query_selector(self, selector):
        logging.info(f"Querying selector: {selector}")
        return MockElement(selector)
        
    async def evaluate(self, js):
        logging.info(f"Evaluating JS: {js}")
        return {"text": "Mock text"}
        
class MockElement:
    def __init__(self, selector):
        self.selector = selector
        
    async def evaluate(self, js):
        logging.info(f"Evaluating JS on element {self.selector}: {js}")
        if "innerText" in js:
            return f"Text of {self.selector}"
        elif "tagName" in js:
            return "div"
        return {}
        
    async def bounding_box(self):
        return {"x": 100, "y": 100, "width": 200, "height": 50}
        
    async def screenshot(self):
        return b'MOCK_ELEMENT_SCREENSHOT'
        
    async def inner_text(self):
        return f"Text of {self.selector}"

# Import modules for testing
from command_handlers.executor import execute_command_chain
from command_handlers.variable_handler import clear_variables
from pattern_matcher import pattern_matcher

async def test_ultimate_chain():
    """Test the ultimate command chain with all features"""
    browser = MockBrowserController()
    
    # Clear variables before the test
    clear_variables()
    
    # Ensure the patterns directory exists
    patterns_dir = Path(os.path.expanduser("~")) / "EirosShell" / "patterns"
    patterns_dir.mkdir(parents=True, exist_ok=True)
    
    # Define the ultimate command chain
    ultimate_chain = """
    /chain#ultimate[
        /set#var1{ "username": "admin" },
        /set#var2{ "password": "secure123" },
        /navigate#nav1{ "url": "https://example.com/login" },
        
        /if#checkPage{ 
            "condition": "$username == 'admin'", 
            "then": [
                /record#rec1{ "selector": "#username" },
                /type#login{ "selector": "#username", "text": "$username" },
                /type#pass{ "selector": "#password", "text": "$password" }
            ],
            "else": [
                /navigate#nav2{ "url": "https://example.com/register" }
            ]
        },
        
        /wait#w1{ "duration": 1 },
        
        /chain#submitChain[
            /click#submit{ "selector": "#loginButton" },
            /wait#w2{ "duration": 2 }
        ],
        
        /repeat#loginAttempts{
            "times": 3,
            "do": [
                /set#attempt{ "count": "$count + 1" },
                /click#retry{ "selector": ".retry-button" },
                /wait#w3{ "duration": 1 }
            ]
        },
        
        /screenshot#final{}
    ]
    """
    
    # Execute the chain
    result = await execute_command_chain(browser, ultimate_chain)
    
    # Print the result
    print("\n\n=== ULTIMATE CHAIN RESULT ===")
    print(f"Status: {result['status']}")
    print(f"Message: {result['message']}")
    print(f"Success count: {result['success_count']}/{result['total_commands']}")
    print(f"Execution time: {result['execution_time']:.2f} seconds")
    print(f"Formatted message: {result['formatted_message']}")
    
    # Verify command history was exported
    if os.path.exists("command_history.json"):
        with open("command_history.json", "r") as f:
            history = json.load(f)
            print("\n=== COMMAND HISTORY ===")
            print(f"Chain ID: {history['chain_id']}")
            print(f"Total commands: {history['total_commands']}")
            print(f"Variables: {history['variables']}")
    
    return result

if __name__ == "__main__":
    print("\n=== RUNNING ULTIMATE CHAIN TEST ===\n")
    result = asyncio.run(test_ultimate_chain())
    print("\n=== TEST COMPLETED ===")
    
    if result["status"] == "success":
        print("✅ All commands executed successfully!")
    else:
        print(f"⚠️ {result['error_count']} commands failed.")
    
    print(f"\nCheck test_ultimate_chain.log for detailed logs.")
