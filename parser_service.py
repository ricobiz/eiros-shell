
"""
Parser service module for EirosShell that provides unified access to parsing functions
"""

from parser.command_parser import CommandParser
from parser.format_detector import detect_command_format
from parser.json_parser import parse_json_command
from parser.marked_parser import parse_marked_command
from parser.directive_parser import parse_directive_command
from parser.implicit_parser import parse_implicit_command

# Create a single instance to be shared
default_parser = CommandParser()

__all__ = [
    'CommandParser',
    'default_parser',
    'detect_command_format',
    'parse_json_command', 
    'parse_marked_command',
    'parse_directive_command',
    'parse_implicit_command'
]
