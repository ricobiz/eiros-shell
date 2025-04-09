
"""
Test script for the repeat command in EirosShell
"""

import asyncio
import logging
from command_handlers import execute_dsl_command

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
        
    @property
    def page(self):
        class MockPage:
            async def title(self):
                return "Mock Page Title"
                
            url = "https://example.com"
        
        return MockPage()

async def test_repeat_command():
    browser = MockBrowserController()
    
    print("\n=== Testing repeat command - standard format ===")
    # Test REPEAT command with standard format
    repeat_command = """
    /repeat#cmd1{ 
        "times": 3,
        "do": [
            "/click#cmd2{ \\"element\\": \\".next\\" }"
        ]
    }
    """
    result = await execute_dsl_command(browser, repeat_command)
    print(f"Result: {result['formatted_message']}")
    
    print("\n=== Testing alternative repeat format with 'count' parameter ===")
    # Test REPEAT with 'count' parameter
    repeat_count_command = """
    /repeat#cmd3{ 
        "count": 2,
        "do": [
            "/click#cmd4{ \\"element\\": \\".previous\\" }"
        ]
    }
    """
    result = await execute_dsl_command(browser, repeat_count_command)
    print(f"Result: {result['formatted_message']}")
    
    print("\n=== Testing alternative '@repeat' syntax ===")
    # Test alternative repeat syntax
    alt_repeat_command = """
    @repeat#cmd5{ "count": 3 }[
        /click#cmd6{ "element": ".item" }
    ]
    """
    result = await execute_dsl_command(browser, alt_repeat_command)
    print(f"Result: {result['formatted_message']}")

if __name__ == "__main__":
    asyncio.run(test_repeat_command())
