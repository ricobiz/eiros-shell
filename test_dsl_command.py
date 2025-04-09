
"""
Test script for DSL command execution in EirosShell
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
        
    async def wait_for_selector(self, selector, timeout=10000):
        logger.info(f"Mock wait for selector: {selector}")
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
            
            async def query_selector_all(self, selector):
                return []
        
        return MockPage()

async def run_test():
    """Run a series of DSL command tests"""
    browser = MockBrowserController()
    
    # Test different command types
    test_commands = [
        '/navigation#cmd1{ "url": "https://example.com" }',
        '/click#cmd2{ "element": ".submit-button" }',
        '/type#cmd3{ "selector": "input[name=email]", "text": "test@example.com" }',
        '/wait#cmd4{ "duration": 2 }',
        '/screenshot#cmd5{}'
    ]
    
    # Test invalid commands
    invalid_commands = [
        'invalid command format',
        '/unknown#cmd6{ "param": "value" }',
        '/click#cmd7{ invalid json }'
    ]
    
    logger.info("=== Testing valid DSL commands ===")
    for cmd in test_commands:
        logger.info(f"\nExecuting: {cmd}")
        result = await execute_dsl_command(browser, cmd)
        if result:
            logger.info(f"Result: {result['status']}")
            logger.info(f"Message: {result['formatted_message']}")
        else:
            logger.error("Command returned no result")
            
    logger.info("\n=== Testing invalid DSL commands ===")
    for cmd in invalid_commands:
        logger.info(f"\nExecuting invalid: {cmd}")
        result = await execute_dsl_command(browser, cmd)
        if result:
            logger.info(f"Result: {result['status']}")
            logger.info(f"Message: {result.get('formatted_message', result['message'])}")
        else:
            logger.error("Command returned no result")

if __name__ == "__main__":
    asyncio.run(run_test())
