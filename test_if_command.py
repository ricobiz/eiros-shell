
"""
Test script for the if conditional command in EirosShell
"""

import asyncio
import logging
from command_handlers import execute_dsl_command
from command_handlers.variable_handler import clear_variables

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger("EirosShell")

class MockBrowserController:
    """A mock browser controller for testing purposes"""
    
    async def navigate_to(self, url):
        logger.info(f"Mock navigate to: {url}")
        return True
        
    async def click(self, selector):
        logger.info(f"Mock click on: {selector}")
        return True
        
    async def type_text(self, selector, text):
        logger.info(f"Mock type '{text}' into: {selector}")
        return True
        
    async def take_screenshot(self):
        logger.info("Mock take screenshot")
        return "/tmp/mock_screenshot.png"
        
    @property
    def page(self):
        class MockPage:
            async def title(self):
                return "Mock Page Title"
                
            url = "https://example.com"
        
        return MockPage()

async def test_if_command():
    browser = MockBrowserController()
    
    # Clear variables before starting
    clear_variables()
    
    print("\n=== Testing if command - TRUE condition ===")
    # Set a variable
    await execute_dsl_command(browser, '/set#cmd1{ "role": "admin" }')
    
    # Test IF command with true condition - standard format
    if_true_command = """
    /if#cmd2{ 
        "condition": "$role == 'admin'",
        "then": [
            "/click#cmd3{ \\"element\\": \\"#adminPanel\\" }"
        ],
        "else": [
            "/click#cmd4{ \\"element\\": \\"#normalPanel\\" }"
        ]
    }
    """
    result = await execute_dsl_command(browser, if_true_command)
    print(f"Result: {result['formatted_message']}")
    
    print("\n=== Testing if command - FALSE condition ===")
    # Set a variable for false condition
    await execute_dsl_command(browser, '/set#cmd5{ "role": "user" }')
    
    # Test IF command with false condition
    if_false_command = """
    /if#cmd6{ 
        "condition": "$role == 'admin'",
        "then": [
            "/click#cmd7{ \\"element\\": \\"#adminPanel\\" }"
        ],
        "else": [
            "/click#cmd8{ \\"element\\": \\"#normalPanel\\" }"
        ]
    }
    """
    result = await execute_dsl_command(browser, if_false_command)
    print(f"Result: {result['formatted_message']}")
    
    print("\n=== Testing alternative '@if' syntax ===")
    # Test alternative if syntax
    alt_if_command = """
    @if#cmd9{ "condition": "$role == 'user'" }[
        /click#cmd10{ "element": "#userPanel" }
    ]
    """
    result = await execute_dsl_command(browser, alt_if_command)
    print(f"Result: {result['formatted_message']}")

if __name__ == "__main__":
    asyncio.run(test_if_command())
