
"""
Module for parsing directive commands
"""

import re
import logging
from typing import Dict, Any, Optional

from command_types import CommandType

logger = logging.getLogger("EirosShell")

def parse_directive_command(message: str, command_id: str) -> Optional[Dict[str, Any]]:
    """
    Extract and parse a directive command from a message
    
    Formats:
    - #navigate to https://example.com
    - #click on #submit
    - #type Hello into #input
    - #wait for 5 seconds
    - #screenshot
    - #analyze
    
    Args:
        message: The message to parse
        command_id: The ID to assign to the command
        
    Returns:
        A dictionary with the parsed command or None if parsing fails
    """
    try:
        # Define directive patterns with their command types and parameter extractors
        directive_patterns = [
            (r'#navigate\s+(?:to\s+)?(?P<url>https?://\S+)', CommandType.NAVIGATION, 
             lambda m: {"url": m.group("url")}),
            
            (r'#goto\s+(?P<url>https?://\S+)', CommandType.NAVIGATION, 
             lambda m: {"url": m.group("url")}),
            
            (r'#click\s+(?:on\s+)?(?P<selector>.+?)(?=$|\n|\.)', CommandType.CLICK, 
             lambda m: {"selector": m.group("selector")}),
            
            (r'#type\s+(?P<text>.*?)\s+(?:in|into)\s+(?P<selector>.+?)(?=$|\n|\.)', CommandType.TYPE, 
             lambda m: {"text": m.group("text"), "selector": m.group("selector")}),
            
            (r'#wait\s+(?:for\s+)?(?P<duration>\d+)(?:\s+seconds?)?', CommandType.WAIT, 
             lambda m: {"duration": int(m.group("duration"))}),
            
            (r'#screenshot', CommandType.SCREENSHOT, lambda m: {}),
            
            (r'#analyze', CommandType.ANALYZE, lambda m: {})
        ]
        
        # Check each pattern
        for pattern, cmd_type, param_extractor in directive_patterns:
            match = re.search(pattern, message, re.IGNORECASE)
            
            if match:
                params = param_extractor(match)
                
                logger.info(f"Parsed directive command: {cmd_type}")
                
                return {
                    "id": command_id,
                    "type": cmd_type,
                    "params": params,
                    "source": "directive",
                    "raw": match.group(0)
                }
                
        return None
        
    except Exception as e:
        logger.error(f"Error parsing directive command: {str(e)}")
        return None
