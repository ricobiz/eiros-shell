
"""
Module for parsing DSL commands for EirosShell (backward compatibility)
"""

from dsl_parser import is_dsl_command, is_command_chain, parse_dsl_command, parse_command_chain

# Re-export the functions for backward compatibility
__all__ = [
    'is_dsl_command',
    'is_command_chain',
    'parse_dsl_command',
    'parse_command_chain'
]
