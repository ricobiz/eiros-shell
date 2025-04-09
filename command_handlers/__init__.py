
"""
Command handlers package for EirosShell
"""

from .executor import execute_command, execute_dsl_command
from .navigation_handler import handle_navigation_command
from .click_handler import handle_click_command
from .type_handler import handle_type_command
from .wait_handler import handle_wait_command
from .screenshot_handler import handle_screenshot_command
from .analyze_handler import handle_analyze_command, analyze_page_elements

__all__ = [
    'execute_command',
    'execute_dsl_command',
    'handle_navigation_command',
    'handle_click_command',
    'handle_type_command',
    'handle_wait_command', 
    'handle_screenshot_command',
    'handle_analyze_command',
    'analyze_page_elements'
]
