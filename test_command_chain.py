
"""
Test script for command chain execution in EirosShell
"""

import asyncio
import logging
from command_handlers import execute_command_chain
from command_format_adapter import is_command_chain

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
    """Run tests for command chain execution"""
    browser = MockBrowserController()
    
    # Test a valid command chain
    valid_chain = """
    /chain#cmd9[
        /navigation#cmd1{ "url": "https://example.com" },
        /type#cmd2{ "selector": "#login", "text": "admin" },
        /click#cmd3{ "element": "#submit" }
    ]
    """
    
    # Test an invalid command chain
    invalid_chain = """
    /chain#err1[
        /navigation#cmd1{ invalid_json },
        /unknown#cmd2{ "param": "value" }
    ]
    """
    
    # Test detection function
    logger.info(f"Is valid chain? {is_command_chain(valid_chain)}")
    logger.info(f"Is invalid chain? {is_command_chain(invalid_chain)}")
    
    # Execute the valid chain
    logger.info("\n=== Testing valid command chain ===")
    result = await execute_command_chain(browser, valid_chain)
    if result:
        logger.info(f"Chain result: {result['status']}")
        logger.info(f"Message: {result['formatted_message']}")
    else:
        logger.error("Chain execution returned no result")
    
    # Execute the invalid chain
    logger.info("\n=== Testing invalid command chain ===")
    result = await execute_command_chain(browser, invalid_chain)
    if result:
        logger.info(f"Chain result: {result['status']}")
        logger.info(f"Message: {result.get('formatted_message', result['message'])}")
    else:
        logger.error("Chain execution returned no result")

if __name__ == "__main__":
    asyncio.run(run_test())
