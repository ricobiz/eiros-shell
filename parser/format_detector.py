
"""
Module for detecting command formats
"""

import re

def detect_command_format(message: str) -> str:
    """
    Detect the format of a command in a message
    
    Args:
        message: The message to check
        
    Returns:
        The detected format ('json', 'marked', 'directive', 'manual_ref', 'implicit', or 'unknown')
    """
    # Check for JSON format
    if re.search(r'\{[\s\S]*?"command"\s*?:\s*?"(\w+)"[\s\S]*?\}', message):
        return 'json'
        
    # Check for marked format
    if re.search(r'\[command\s*:\s*(\w+)\]', message):
        return 'marked'
        
    # Check for directive format
    if re.search(r'^\/(\w+)(?:\s+(.*))?$', message):
        return 'directive'
        
    # Check for manual reference format
    if re.search(r'/(\w+)(?:#(\w+))?\s*\{[\s\S]*?"element"\s*?:\s*?"@([^"]+)"[\s\S]*?\}', message):
        return 'manual_ref'
        
    # Check for implicit commands
    implicit_patterns = [
        r'(?:go to|navigate to|open|visit)\s+(https?://\S+)'
    ]
    for pattern in implicit_patterns:
        if re.search(pattern, message, re.IGNORECASE):
            return 'implicit'
            
    # No command detected
    return 'unknown'
