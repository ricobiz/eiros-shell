
"""
Module for detecting DSL commands in text
"""

import logging

logger = logging.getLogger("EirosShell")

def is_dsl_command(message: str) -> bool:
    """
    Check if a message is in DSL command format.
    Format: /command_type#command_id{json_params}
    Or alternative: @command_type#command_id{json_params}[commands]
    
    Example: /click#cmd99{ "element": ".submit", "waitAfter": 500 }
    
    Returns True if the message matches the DSL command pattern.
    """
    message = message.strip()
    return (message.startswith("/") or message.startswith("@")) and "#" in message and ("{" in message or "[" in message)

def is_command_chain(message: str) -> bool:
    """
    Check if a message is a command chain.
    Format: /chain#command_id[commands...]
    
    Example: /chain#cmd9[/navigate#cmd1{...}, /click#cmd2{...}]
    
    Returns True if the message matches the command chain pattern.
    """
    message = message.strip()
    return message.startswith("/chain#") and "[" in message and "]" in message
