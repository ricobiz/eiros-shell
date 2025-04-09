
"""
Handler for conditional operations in the DSL
"""
import logging
from typing import Dict, Any, List, Union

from .variable_handler import evaluate_condition
from .dsl_executor import execute_dsl_command

logger = logging.getLogger("EirosShell")

async def handle_if_command(browser_controller, params: Dict[str, Any], command_id: str) -> Dict[str, Any]:
    """
    Handles the if command to conditionally execute commands
    Example: /if#cmd2{ "condition": "$role == 'admin'", "then": [...], "else": [...] }
    
    Also supports alternative syntax:
    @if#cmd2{ "condition": "$role == 'admin'" }[...]
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
                "message": "Missing condition",
                "formatted_message": f"[оболочка]: Условие #{command_id} — ОШИБКА: условие не задано. #log_{command_id}"
            }
            
        # Evaluate the condition
        result = evaluate_condition(condition)
        
        # Log the condition result
        log_msg = f"Condition '{condition}' evaluated to {result}"
        logger.info(log_msg)
        
        # Execute the appropriate branch
        branch_results = []
        executed_branch = None
        
        if result:
            executed_branch = "then"
            formatted_result = f"[оболочка]: Условие #{command_id} вычислено — ИСТИНА. Выполняется блок then. #log_{command_id}"
            logger.info(formatted_result)
            
            # Execute then commands
            if then_commands:
                for cmd in then_commands:
                    if isinstance(cmd, str):
                        # Execute as a DSL command
                        cmd_result = await execute_dsl_command(browser_controller, cmd)
                        branch_results.append(cmd_result)
        else:
            executed_branch = "else"
            
            # Execute else commands
            if else_commands:
                formatted_result = f"[оболочка]: Условие #{command_id} вычислено — ЛОЖЬ. Выполняется блок else. #log_{command_id}"
                logger.info(formatted_result)
                
                for cmd in else_commands:
                    if isinstance(cmd, str):
                        # Execute as a DSL command
                        cmd_result = await execute_dsl_command(browser_controller, cmd)
                        branch_results.append(cmd_result)
            else:
                # No else branch to execute
                formatted_result = f"[оболочка]: Условие #{command_id} вычислено — ЛОЖЬ. Блок else отсутствует. #log_{command_id}"
                logger.info(formatted_result)
        
        # Count successes and errors
        success_count = sum(1 for result in branch_results if result.get("status") == "success")
        error_count = len(branch_results) - success_count
        
        # Determine overall status
        status = "success" if error_count == 0 else "error"
        status_text = "OK" if status == "success" else "ОШИБКА"
        
        # Prepare the result
        return {
            "command_id": command_id,
            "type": "if",
            "status": status,
            "message": log_msg,
            "condition": condition,
            "result": result,
            "executed_branch": executed_branch,
            "branch_results": branch_results,
            "success_count": success_count,
            "error_count": error_count,
            "formatted_message": f"[оболочка]: Условие #{command_id}: {condition} — {status_text}. #log_{command_id}"
        }
    except Exception as e:
        logger.error(f"Error in if command: {str(e)}")
        return {
            "command_id": command_id,
            "type": "if",
            "status": "error",
            "message": f"Error in if command: {str(e)}",
            "formatted_message": f"[оболочка]: Условие #{command_id} — ОШИБКА: {str(e)}. #log_{command_id}"
        }
