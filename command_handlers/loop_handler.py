
"""
Handler for loop operations in the DSL
"""
import logging
from typing import Dict, Any, List

from .dsl_executor import execute_dsl_command
from .chain_executor import execute_command_chain

logger = logging.getLogger("EirosShell")

async def handle_repeat_command(browser_controller, params: Dict[str, Any], command_id: str) -> Dict[str, Any]:
    """
    Handles the repeat command to execute commands multiple times
    Example: /repeat#cmdX{ "times": 3, "do": [ ... ] }
    Alternative: /repeat#cmdX{ "count": 3, "body": [ ... ] }
    """
    try:
        # Support multiple parameter names for flexibility
        times = params.get("times", params.get("count", 0))
        
        # Support multiple parameter names for the commands
        do_commands = params.get("do", params.get("body", []))
        
        if not isinstance(times, int) or times <= 0:
            return {
                "command_id": command_id,
                "type": "repeat",
                "status": "error",
                "message": "Invalid times parameter, must be a positive integer",
                "formatted_message": f"[оболочка]: Цикл #{command_id} — ОШИБКА: неверное количество повторений. #log_{command_id}"
            }
            
        if not do_commands:
            return {
                "command_id": command_id,
                "type": "repeat",
                "status": "success",
                "message": f"No commands to repeat",
                "iterations": 0,
                "results": [],
                "formatted_message": f"[оболочка]: Цикл #{command_id} завершен: 0 итераций — OK. #log_{command_id}"
            }
            
        # Track results for each iteration
        all_results = []
        success_count = 0
        
        # Execute the commands the specified number of times
        for iteration in range(times):
            logger.info(f"Executing repeat iteration {iteration+1}/{times}")
            
            iteration_results = []
            iteration_success = True
            
            # Execute each command in the do block
            for cmd in do_commands:
                if isinstance(cmd, str):
                    # Execute as a DSL command
                    if cmd.startswith('/chain#'):
                        # Execute as a chain
                        result = await execute_command_chain(browser_controller, cmd)
                    else:
                        result = await execute_dsl_command(browser_controller, cmd)
                        
                    iteration_results.append(result)
                    
                    # Log the iteration details
                    iteration_log = f"[оболочка]: Цикл #{command_id}: итерация {iteration+1}/{times}, команда {result['command_id']} — "
                    if result and result.get("status") == "success":
                        iteration_log += "OK"
                    else:
                        iteration_log += "ОШИБКА"
                        iteration_success = False
                    
                    logger.info(iteration_log)
            
            all_results.append({
                "iteration": iteration + 1,
                "results": iteration_results,
                "success": iteration_success
            })
            
            if iteration_success:
                success_count += 1
                
        status = "success" if success_count == times else "partial" if success_count > 0 else "error"
        status_text = "OK" if status == "success" else "ОШИБКА"
        
        return {
            "command_id": command_id,
            "type": "repeat",
            "status": status,
            "message": f"Executed {times} iterations, {success_count} successful",
            "iterations": times,
            "results": all_results,
            "formatted_message": f"[оболочка]: Цикл #{command_id} завершен: {success_count}/{times} итераций — {status_text}. #log_{command_id}"
        }
    except Exception as e:
        logger.error(f"Error in repeat command: {str(e)}")
        return {
            "command_id": command_id,
            "type": "repeat",
            "status": "error",
            "message": f"Error in repeat command: {str(e)}",
            "formatted_message": f"[оболочка]: Цикл #{command_id} — ОШИБКА: {str(e)}. #log_{command_id}"
        }
