
"""
DSL Parser package for parsing EirosShell command DSL
"""

from .detector import is_dsl_command, is_command_chain
from .command_parser import parse_dsl_command
from .chain_parser import parse_command_chain

__all__ = [
    'is_dsl_command',
    'is_command_chain',
    'parse_dsl_command',
    'parse_command_chain'
]
