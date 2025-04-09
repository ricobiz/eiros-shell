
"""
Module for parsing command chains in EirosShell DSL
"""

import re
import logging
from typing import List

logger = logging.getLogger("EirosShell")

def parse_command_chain(dsl_string: str) -> List[str]:
    """
    Parse a command chain into individual command strings.
    
    Example:
    /chain#cmd9[
      /navigate#cmd1{ "url": "https://example.com" },
      /type#cmd2{ "selector": "#login", "text": "admin" },
      /click#cmd3{ "element": "#submit" }
    ]
    
    Returns a list of command strings.
    """
    try:
        # Extract the command ID
        chain_id_pattern = r'^/chain#([a-zA-Z0-9_-]+)\['
        chain_id_match = re.match(chain_id_pattern, dsl_string.strip())
        
        if not chain_id_match:
            logger.error(f"Invalid command chain format: {dsl_string}")
            return []
            
        chain_id = chain_id_match.group(1)
        
        # Extract the commands between [ and ]
        # We need to find the correct closing bracket for the main chain
        content_start = dsl_string.find("[") + 1
        if content_start <= 0:
            logger.error(f"Invalid chain format, missing opening bracket: {dsl_string}")
            return []
            
        # Find matching closing bracket by counting brackets
        bracket_count = 1
        content_end = content_start
        
        for i in range(content_start, len(dsl_string)):
            if dsl_string[i] == '[':
                bracket_count += 1
            elif dsl_string[i] == ']':
                bracket_count -= 1
                
            if bracket_count == 0:
                content_end = i
                break
        
        if bracket_count != 0:
            logger.error(f"Unbalanced brackets in chain: {dsl_string}")
            return []
            
        commands_str = dsl_string[content_start:content_end].strip()
        
        # Split the commands while respecting nested structures
        commands = []
        current_cmd = ""
        brace_count = 0
        bracket_count = 0
        
        for char in commands_str:
            current_cmd += char
            
            if char == '{':
                brace_count += 1
            elif char == '}':
                brace_count -= 1
            elif char == '[':
                bracket_count += 1
            elif char == ']':
                bracket_count -= 1
            
            # If we're at a comma, and not inside any braces or brackets
            if char == ',' and brace_count == 0 and bracket_count == 0:
                # We've found a command boundary
                cmd = current_cmd[:-1].strip()  # Remove the comma
                if cmd:
                    commands.append(cmd)
                current_cmd = ""
        
        # Don't forget the last command (which doesn't end with a comma)
        if current_cmd.strip():
            commands.append(current_cmd.strip())
        
        return commands
        
    except Exception as e:
        logger.error(f"Error parsing command chain: {str(e)}")
        return []
