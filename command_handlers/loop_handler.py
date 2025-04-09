
"""
Handler for loop operations in the DSL
"""
import logging
from typing import Dict, Any, List

from .executor import execute_dsl_command, execute_command_chain

logger = logging.getLogger("EirosShell")

async def handle_repeat_command(browser_controller, params: Dict[str, Any], command_id: str) -> Dict[str, Any]:
    """
    Handles the repeat command to execute commands multiple times
    Example: /repeat#cmdX{ "times": 3, "do": [ ... ] }
    """
    try:
        times = params.get("times")
        do_commands = params.get("do", [])
        
        if not isinstance(times, int) or times <= 0:
            return {
                "command_id": command_id,
                "type": "repeat",
                "status": "error",
                "message": "Invalid times parameter, must be a positive integer"
            }
            
        if not do_commands:
            return {
                "command_id": command_id,
                "type": "repeat",
                "status": "success",
                "message": f"No commands to repeat",
                "iterations": 0,
                "results": []
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
                    
                    if result and result.get("status") != "success":
                        iteration_success = False
            
            all_results.append({
                "iteration": iteration + 1,
                "results": iteration_results,
                "success": iteration_success
            })
            
            if iteration_success:
                success_count += 1
                
        return {
            "command_id": command_id,
            "type": "repeat",
            "status": "success" if success_count == times else "partial" if success_count > 0 else "error",
            "message": f"Executed {times} iterations, {success_count} successful",
            "iterations": times,
            "results": all_results
        }
    except Exception as e:
        logger.error(f"Error in repeat command: {str(e)}")
        return {
            "command_id": command_id,
            "type": "repeat",
            "status": "error",
            "message": f"Error in repeat command: {str(e)}"
        }
