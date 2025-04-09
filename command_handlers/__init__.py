
"""
Command handlers package for EirosShell
"""

from .executor import execute_command, execute_dsl_command, execute_command_chain
from .navigation_handler import handle_navigation_command
from .click_handler import handle_click_command
from .type_handler import handle_type_command
from .wait_handler import handle_wait_command
from .screenshot_handler import handle_screenshot_command
from .analyze_handler import handle_analyze_command, analyze_page_elements
from .variable_handler import handle_set_command, get_variable, resolve_variables, evaluate_condition, process_params_with_variables
from .conditional_handler import handle_if_command
from .loop_handler import handle_repeat_command
from .pattern_memory import pattern_memory, PatternMemory
from .record_handler import handle_record_command

__all__ = [
    'execute_command',
    'execute_dsl_command',
    'execute_command_chain',
    'handle_navigation_command',
    'handle_click_command',
    'handle_type_command',
    'handle_wait_command', 
    'handle_screenshot_command',
    'handle_analyze_command',
    'analyze_page_elements',
    'handle_set_command',
    'get_variable',
    'resolve_variables',
    'evaluate_condition',
    'process_params_with_variables',
    'handle_if_command',
    'handle_repeat_command',
    'pattern_memory',
    'PatternMemory',
    'handle_record_command'
]
