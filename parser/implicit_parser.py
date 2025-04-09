
"""
Module for parsing implicit commands
"""

import re
import logging
from typing import Dict, Any, Optional

from command_types import CommandType

logger = logging.getLogger("EirosShell")

def parse_implicit_command(message: str, command_id: str) -> Optional[Dict[str, Any]]:
    """
    Extract and parse implicit commands from natural language
    
    Args:
        message: The message to parse
        command_id: The ID to assign to the command
        
    Returns:
        A dictionary with the parsed command or None if parsing fails
    """
    try:
        # Check for navigation commands
        url_pattern = r'(?:go to|navigate to|open|visit)\s+(https?://\S+)'
        url_match = re.search(url_pattern, message, re.IGNORECASE)
        
        if url_match:
            url = url_match.group(1)
            logger.info(f"Parsed implicit navigation command: {url}")
            
            return {
                "id": command_id,
                "type": CommandType.NAVIGATION,
                "params": {"url": url},
                "source": "implicit",
                "raw": url_match.group(0)
            }
            
        # Add more implicit command patterns here as needed
        
        return None
        
    except Exception as e:
        logger.error(f"Error parsing implicit command: {str(e)}")
        return None
