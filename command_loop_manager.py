"""
Command loop manager for EirosShell
"""

import asyncio
import logging
from typing import Dict, Any, Optional

from dsl_parser import is_dsl_command, is_command_chain  # Updated import 
from command_handlers import execute_dsl_command, execute_command_chain

logger = logging.getLogger("EirosShell")

class CommandLoopManager:
    def __init__(self, command_executor, chat_connector):
        self.executor = command_executor
        self.chat = chat_connector
    
    async def run_command_loop(self):
        """Runs the main command processing loop"""
        logger.info("Starting the command loop...")
        
        while True:
            # Wait for a response from ChatGPT
            response = await self.chat.wait_for_response(timeout=300)
            
            if response:
                # Update debug GUI with current command if available
                if self.executor.debug_gui:
                    self.executor.debug_gui.update_current_command(response[:100] + "..." if len(response) > 100 else response)
                
                # Process commands in different formats
                await self._process_command_response(response)
            
            # Small pause before the next check
            await asyncio.sleep(1)
    
    async def _process_command_response(self, response):
        """Processes a command response from ChatGPT"""
        if is_command_chain(response):
            # Execute a chain of DSL commands
            await self._execute_command_chain(response)
        elif is_dsl_command(response):
            # Execute a DSL command
            await self._execute_dsl_command(response)
        else:
            # Process a regular command through CommandParser
            await self._execute_parsed_command(response)
    
    async def _execute_command_chain(self, response):
        """Executes a command chain"""
        chain_result = await execute_command_chain(self.executor.browser, response)
        
        if chain_result:
            # Update debug GUI with command result
            if self.executor.debug_gui:
                self.executor.debug_gui.log_command_result(
                    chain_result.get("command_id", "unknown"),
                    "chain",
                    chain_result.get("status", "error"),
                    chain_result.get("message", "Unknown result")
                )
            
            # Send the chain execution result
            self.executor.history_manager.save_command_to_history(
                {"type": "chain", "id": chain_result["command_id"]}, 
                chain_result
            )
            await self.chat.send_message(chain_result["formatted_message"])
    
    async def _execute_dsl_command(self, response):
        """Executes a DSL command"""
        command_result = await execute_dsl_command(self.executor.browser, response)
        
        if command_result:
            # Update debug GUI with command result
            if self.executor.debug_gui:
                self.executor.debug_gui.log_command_result(
                    command_result.get("command_id", "unknown"),
                    command_result.get("type", "unknown"),
                    command_result.get("status", "error"),
                    command_result.get("message", "Unknown result")
                )
            
            # Send the command execution result
            self.executor.history_manager.save_command_to_history(
                {"type": command_result["type"], "id": command_result["command_id"]}, 
                command_result
            )
            await self.chat.send_message(command_result["formatted_message"])
    
    async def _execute_parsed_command(self, response):
        """Executes a regular command parsed by CommandParser"""
        command = self.executor.command_parser.parse_command(response)
        self.executor.command_counter = self.executor.command_parser.get_command_counter()
        
        if command:
            await self.executor.execute_parsed_command(command)
