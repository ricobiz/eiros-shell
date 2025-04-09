
"""
Handler for conditional operations in the DSL
"""
import logging
from typing import Dict, Any, List

from .executor import execute_dsl_command, execute_command_chain
from .variable_handler import evaluate_condition

logger = logging.getLogger("EirosShell")

async def handle_if_command(browser_controller, params: Dict[str, Any], command_id: str) -> Dict[str, Any]:
    """
    Handles the if command to conditionally execute commands
    Example: /if#cmd106{ "condition": "status == 'error'", "then": [ ... ], "else": [ ... ] }
    """
    try:
        condition = params.get("condition")
        then_commands = params.get("then", [])
        else_commands = params.get("else", [])
        
        if not condition:
            return {
                "command_id": command_id,
                "type": "if",
                "status": "error",
                "message": "Missing condition"
            }
        
        # Evaluate the condition
        condition_result = evaluate_condition(condition)
        logger.info(f"Condition '{condition}' evaluated to {condition_result}")
        
        # Execute the appropriate branch
        results = []
        branch_name = "then" if condition_result else "else"
        commands_to_execute = then_commands if condition_result else else_commands
        
        if not commands_to_execute:
            logger.info(f"No commands in the '{branch_name}' branch to execute")
            return {
                "command_id": command_id,
                "type": "if",
                "status": "success",
                "message": f"Condition '{condition}' = {condition_result}, no commands to execute",
                "condition_result": condition_result,
                "branch_executed": branch_name,
                "results": []
            }
            
        # Handle commands based on their type (string or dict)
        for cmd in commands_to_execute:
            if isinstance(cmd, str):
                # Execute as a DSL command
                if cmd.startswith('/chain#'):
                    # Execute as a chain
                    result = await execute_command_chain(browser_controller, cmd)
                else:
                    result = await execute_dsl_command(browser_controller, cmd)
                results.append(result)
                
        success_count = sum(1 for r in results if r and r.get("status") == "success")
        total_count = len(commands_to_execute)
            
        return {
            "command_id": command_id,
            "type": "if",
            "status": "success" if success_count == total_count else "partial" if success_count > 0 else "error",
            "message": f"Condition '{condition}' = {condition_result}, executed {success_count}/{total_count} commands",
            "condition_result": condition_result,
            "branch_executed": branch_name,
            "results": results
        }
    except Exception as e:
        logger.error(f"Error in if command: {str(e)}")
        return {
            "command_id": command_id,
            "type": "if",
            "status": "error",
            "message": f"Error in if command: {str(e)}"
        }
