
"""
Test script for the advanced DSL features in EirosShell (variables, conditions, loops)
"""

import asyncio
import logging
from command_handlers import execute_command_chain, execute_dsl_command
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
    """Run tests for advanced DSL features"""
    browser = MockBrowserController()
    
    # Clear variables before starting
    clear_variables()
    
    # Test variable setting and usage
    logger.info("\n=== Testing variables ===")
    
    # Set a variable
    await execute_dsl_command(browser, '/set#cmd1{ "var": "username", "value": "admin" }')
    
    # Use the variable in a command
    await execute_dsl_command(browser, '/type#cmd2{ "selector": "#login", "text": "$username" }')
    
    # Test conditional execution
    logger.info("\n=== Testing conditional execution ===")
    
    # Set status variable
    await execute_dsl_command(browser, '/set#cmd3{ "var": "status", "value": "success" }')
    
    # If condition that should evaluate to true
    if_true_command = """
    /if#cmd4{
        "condition": "status == 'success'",
        "then": [
            "/click#cmd5{ \\"element\\": \\"#continue\\" }"
        ],
        "else": [
            "/screenshot#cmd6{ }"
        ]
    }
    """
    await execute_dsl_command(browser, if_true_command)
    
    # Change status and test false condition
    await execute_dsl_command(browser, '/set#cmd7{ "var": "status", "value": "error" }')
    
    # If condition that should evaluate to false
    if_false_command = """
    /if#cmd8{
        "condition": "status == 'success'",
        "then": [
            "/click#cmd9{ \\"element\\": \\"#continue\\" }"
        ],
        "else": [
            "/screenshot#cmd10{ }"
        ]
    }
    """
    await execute_dsl_command(browser, if_false_command)
    
    # Test loop execution
    logger.info("\n=== Testing loop execution ===")
    
    # Simple repeat command
    repeat_command = """
    /repeat#cmd11{
        "times": 3,
        "do": [
            "/click#cmd12{ \\"element\\": \\"#increment\\" }"
        ]
    }
    """
    await execute_dsl_command(browser, repeat_command)
    
    # Test complex chain with all features
    logger.info("\n=== Testing complex chain ===")
    
    complex_chain = """
    /chain#cmd100[
        /set#cmd101{ "var": "email", "value": "admin@example.com" },
        /navigate#cmd102{ "url": "https://site.com/login" },
        /type#cmd103{ "selector": "#email", "text": "$email" },
        /type#cmd104{ "selector": "#pass", "text": "123456" },
        /click#cmd105{ "element": "#login" },
        /if#cmd106{
            "condition": "status == 'error'",
            "then": [ /screenshot#cmd107{ } ],
            "else": [ /click#cmd108{ "element": "#continue" } ]
        }
    ]
    """
    
    # Execute the complex chain
    result = await execute_command_chain(browser, complex_chain)
    if result:
        logger.info(f"Complex chain result: {result['status']}")
        logger.info(f"Message: {result['formatted_message']}")
    else:
        logger.error("Complex chain execution returned no result")

    # Test chain error resilience
    logger.info("\n=== Testing chain error resilience ===")
    
    error_chain = """
    /chain#cmd200[
        /navigate#cmd201{ "url": "https://site.com/page" },
        /click#cmd202{ "element": "#non-existent" },
        /type#cmd203{ "selector": "#email", "text": "still-works@example.com" }
    ]
    """
    
    # Execute the chain with an error
    result = await execute_command_chain(browser, error_chain)
    if result:
        logger.info(f"Error chain result: {result['status']}")
        logger.info(f"Message: {result['formatted_message']}")
        logger.info(f"Success count: {result['success_count']}/{result['total_commands']}")
    else:
        logger.error("Error chain execution returned no result")

if __name__ == "__main__":
    asyncio.run(run_test())
