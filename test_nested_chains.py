
"""
Test script for nested command chains execution in EirosShell
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
    """Run tests for nested command chain execution"""
    browser = MockBrowserController()
    
    # Test a valid nested command chain
    nested_chain = """
    /chain#cmd30[
      /navigation#cmd31{ "url": "https://site.com" },
      /chain#cmd32[
        /type#cmd33{ "selector": "#user", "text": "admin" },
        /click#cmd34{ "element": "#next" }
      ],
      /click#cmd35{ "element": "#final" }
    ]
    """
    
    # Test deeply nested chains
    deep_nested_chain = """
    /chain#cmd40[
      /navigation#cmd41{ "url": "https://site.com" },
      /chain#cmd42[
        /type#cmd43{ "selector": "#user", "text": "admin" },
        /chain#cmd44[
          /click#cmd45{ "element": "#submenu" },
          /type#cmd46{ "selector": "#password", "text": "secret" }
        ],
        /click#cmd47{ "element": "#next" }
      ],
      /click#cmd48{ "element": "#final" }
    ]
    """
    
    # Execute the nested chain
    logger.info("\n=== Testing nested command chain ===")
    result = await execute_command_chain(browser, nested_chain)
    if result:
        logger.info(f"Chain result: {result['status']}")
        logger.info(f"Message: {result['formatted_message']}")
        logger.info(f"Success rate: {result['message']}")
    else:
        logger.error("Chain execution returned no result")
    
    # Execute the deeply nested chain
    logger.info("\n=== Testing deeply nested command chain ===")
    deep_result = await execute_command_chain(browser, deep_nested_chain)
    if deep_result:
        logger.info(f"Chain result: {deep_result['status']}")
        logger.info(f"Message: {deep_result['formatted_message']}")
        logger.info(f"Success rate: {deep_result['message']}")
    else:
        logger.error("Chain execution returned no result")

if __name__ == "__main__":
    asyncio.run(run_test())
