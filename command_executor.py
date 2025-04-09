"""
Main command executor module for EirosShell
"""

import asyncio
import logging
from typing import Dict, Any, Optional

from parser.command_parser import CommandParser  # Updated import
from command_types import CommandType
from command_handlers import execute_command, execute_dsl_command, execute_command_chain
from dsl_parser import is_dsl_command, is_command_chain
from command_history_manager import CommandHistoryManager
from command_loop_manager import CommandLoopManager

logger = logging.getLogger("EirosShell")

class CommandExecutor:
    def __init__(self, browser_controller, chat_connector):
        self.browser = browser_controller
        self.chat = chat_connector
        self.history_manager = CommandHistoryManager()
        self.loop_manager = CommandLoopManager(self, self.chat)
        self.command_counter = self.history_manager.get_command_counter()
        self.command_parser = CommandParser(self.command_counter)
        self.debug_gui = None  # Will be set by main if available
        
    async def start_command_loop(self):
        """Launches the main command processing loop"""
        try:
            logger.info("Starting the main command processing loop...")
            await self.loop_manager.run_command_loop()
        except Exception as e:
            logger.exception(f"Critical error in the command processing loop: {str(e)}")
            # Update debug GUI with error
            if self.debug_gui:
                self.debug_gui.update_status(False, f"Command loop error: {str(e)}")
            # Send a message about the critical error to the chat
            await self.chat.send_message(f"[оболочка]: Critical error: {str(e)}. Please restart the shell.")
    
    async def execute_parsed_command(self, command):
        """Executes a parsed command and returns the result"""
        # Update debug GUI with current command
        if self.debug_gui:
            cmd_type = command.get("type", "unknown")
            cmd_id = command.get("id", "unknown")
            self.debug_gui.update_current_command(f"{cmd_type}#{cmd_id}")
        
        # Execute the command
        command_result = await execute_command(self.browser, command)
        
        # Save to history and send result
        if command_result:
            if self.debug_gui:
                self.debug_gui.log_command_result(
                    command_result.get("command_id", "unknown"),
                    command.get("type", "unknown"),
                    command_result.get("status", "error"),
                    command_result.get("message", "Unknown result")
                )
            
            self.history_manager.save_command_to_history(command, command_result)
            await self._send_command_result(command, command_result)
            return command_result
        return None
            
    async def _send_command_result(self, command: Dict[str, Any], result: Dict[str, Any]):
        """Sends the command execution result back to the chat"""
        # Format a brief message about the result according to the required format
        status_text = "OK" if result["status"] == "success" else "ОШИБКА"
        command_type = command["type"]
        command_id = command["id"]
        log_id = f"log_{self.command_counter}"
        
        # Format description for different command types
        description = ""
        if command_type == CommandType.NAVIGATION:
            description = f"→ '{command['params'].get('url', '')}'"
        elif command_type == CommandType.CLICK:
            description = f"→ '{command['params'].get('selector', '')}'"
        elif command_type == CommandType.TYPE:
            description = f"→ '{command['params'].get('selector', '')}'"
        elif command_type == CommandType.WAIT:
            description = f"→ {command['params'].get('duration', 2)} сек"
        elif command_type == CommandType.SCREENSHOT or command_type == CommandType.ANALYZE:
            description = ""
            
        # Format the message to send according to new format
        response_message = f"[оболочка]: Команда #{command_id}: {command_type} {description} — {status_text}. #{log_id}"
        
        # Send the message back to the chat
        await self.chat.send_message(response_message)
        
        # Log the message sending
        logger.info(f"Result sent to chat: {response_message}")
