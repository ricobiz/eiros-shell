
"""
Module for parsing and routing commands
"""

import logging
import uuid
from typing import Dict, Any, Optional

from .format_detector import detect_command_format
from .json_parser import parse_json_command
from .marked_parser import parse_marked_command
from .directive_parser import parse_directive_command
from .implicit_parser import parse_implicit_command
from .manual_reference_parser import parse_manual_reference_command

logger = logging.getLogger("EirosShell")

class CommandParser:
    """
    Parser for extracting and routing commands from messages
    """
    
    def parse(self, message: str) -> Optional[Dict[str, Any]]:
        """
        Parse a message and extract a command
        
        Args:
            message: The message to parse
            
        Returns:
            A dictionary with the parsed command or None if no command is found
        """
        # Generate a unique command ID
        command_id = f"cmd_{uuid.uuid4().hex[:8]}"
        
        try:
            # Detect the message format
            cmd_format = detect_command_format(message)
            
            # Route to the appropriate parser
            if cmd_format == 'json':
                return parse_json_command(message, command_id)
            elif cmd_format == 'marked':
                return parse_marked_command(message, command_id)
            elif cmd_format == 'directive':
                return parse_directive_command(message, command_id)
            elif cmd_format == 'manual_ref':
                return parse_manual_reference_command(message, command_id)
            elif cmd_format == 'implicit':
                return parse_implicit_command(message, command_id)
                
            return None
            
        except Exception as e:
            logger.error(f"Error parsing command: {str(e)}")
            return None
