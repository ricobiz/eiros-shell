
"""
Test script for the variable system in EirosShell
"""

import asyncio
import logging
from command_handlers import execute_dsl_command, execute_command_chain
from command_handlers.variable_handler import clear_variables, get_variable

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

async def test_variables():
    browser = MockBrowserController()
    
    # Clear variables before starting
    clear_variables()
    
    print("\n=== Testing variable setting - standard format ===")
    # Set a variable using var/value format
    set_command = '/set#cmd1{ "var": "username", "value": "admin" }'
    result = await execute_dsl_command(browser, set_command)
    print(f"Result: {result['formatted_message']}")
    
    # Verify the variable was set
    username = get_variable("username")
    print(f"Variable 'username' value: {username}")
    
    print("\n=== Testing variable setting - simplified format ===")
    # Set a variable using direct key/value format
    set_direct_command = '/set#cmd2{ "email": "admin@example.com" }'
    result = await execute_dsl_command(browser, set_direct_command)
    print(f"Result: {result['formatted_message']}")
    
    # Verify the variable was set
    email = get_variable("email")
    print(f"Variable 'email' value: {email}")
    
    print("\n=== Testing variable usage in commands ===")
    # Use variables in commands
    type_command = '/type#cmd3{ "selector": "#email", "text": "$email" }'
    result = await execute_dsl_command(browser, type_command)
    print(f"Result: {result['formatted_message']}")
    
    print("\n=== Testing complex chain with variables ===")
    # Test a complex chain with variables
    complex_chain = """
    /chain#cmd100[
      /set#cmd101{ "var": "email", "value": "admin@example.com" },
      /set#cmd102{ "password": "123456" },
      /navigate#cmd103{ "url": "https://site.com/login" },
      /type#cmd104{ "selector": "#email", "text": "$email" },
      /type#cmd105{ "selector": "#pass", "text": "$password" },
      /click#cmd106{ "element": "#login" }
    ]
    """
    result = await execute_command_chain(browser, complex_chain)
    print(f"Complex chain result: {result['formatted_message']}")

if __name__ == "__main__":
    asyncio.run(test_variables())
