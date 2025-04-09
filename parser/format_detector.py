
"""
Module for detecting the format of a command in a message
"""

import re
import logging

logger = logging.getLogger("EirosShell")

def detect_command_format(message: str):
    """
    Detects the format of a command in a message
    
    Returns:
    - "json" if the message contains a JSON command
    - "marked" if the message contains a marked command
    - "directive" if the message contains a directive command
    - "implicit" if the message contains an implicit command
    - None if no command format is detected
    """
    try:
        # Check for JSON command
        json_pattern = r'\{[\s\S]*?"command"\s*?:\s*?"(\w+)"[\s\S]*?\}'
        json_match = re.search(json_pattern, message)
        
        if json_match:
            return "json"
        
        # Check for marked command
        marked_pattern = r'\[command\s*:\s*(\w+)\]'
        if re.search(marked_pattern, message, re.IGNORECASE):
            return "marked"
        
        # Check for directive commands
        directive_patterns = [
            r'#navigate\s+(?:to\s+)?(?P<url>https?://\S+)',
            r'#goto\s+(?P<url>https?://\S+)',
            r'#click\s+(?:on\s+)?(?P<selector>.+?)(?=$|\n|\.)',
            r'#type\s+(?P<text>.*?)\s+(?:in|into)\s+(?P<selector>.+?)(?=$|\n|\.)',
            r'#wait\s+(?:for\s+)?(?P<duration>\d+)(?:\s+seconds?)?',
            r'#screenshot',
            r'#analyze'
        ]
        
        for pattern in directive_patterns:
            if re.search(pattern, message, re.IGNORECASE):
                return "directive"
        
        # Check for implicit navigation commands
        url_pattern = r'(?:go to|navigate to|open|visit)\s+(https?://\S+)'
        if re.search(url_pattern, message, re.IGNORECASE):
            return "implicit"
        
        return None
    except Exception as e:
        logger.error(f"Error detecting command format: {str(e)}")
        return None
