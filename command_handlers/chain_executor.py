
"""
Chain command executor for EirosShell
"""

import logging
import re
import json
import time
from typing import Dict, Any, Optional, List

from dsl_parser import parse_command_chain, is_command_chain
from .dsl_executor import execute_dsl_command
from .variable_handler import get_all_variables

logger = logging.getLogger("EirosShell")

async def execute_command_chain(browser_controller, dsl_string: str) -> Optional[Dict[str, Any]]:
    """
    Execute a chain of DSL commands in sequence
    
    Example:
    /chain#cmd9[
      /navigate#cmd1{ "url": "https://example.com" },
      /type#cmd2{ "selector": "#login", "text": "admin" },
      /click#cmd3{ "element": "#submit" }
    ]
    
    Supports nested chains:
    /chain#cmd30[
      /navigate#cmd31{ "url": "https://site.com" },
      /chain#cmd32[
        /type#cmd33{ "selector": "#user", "text": "admin" },
        /click#cmd34{ "element": "#next" }
      ],
      /click#cmd35{ "element": "#final" }
    ]
    
    Returns a result dictionary with information about the chain execution
    """
    logger.info(f"Executing command chain: {dsl_string}")
    
    # Extract the chain ID
    chain_id_pattern = r'^/chain#([a-zA-Z0-9_-]+)\['
    chain_id_match = re.match(chain_id_pattern, dsl_string.strip())
    
    if not chain_id_match:
        logger.error(f"Invalid command chain format: {dsl_string}")
        return {
            "command_id": "unknown",
            "type": "chain",
            "status": "error",
            "message": "Invalid command chain format",
            "formatted_message": f"[оболочка]: Цепочка #unknown: ошибка формата — ОШИБКА. #log_error"
        }
    
    chain_id = chain_id_match.group(1)
    
    # Parse the command chain
    commands = parse_command_chain(dsl_string)
    
    if not commands:
        logger.error(f"No valid commands found in chain: {dsl_string}")
        return {
            "command_id": chain_id,
            "type": "chain",
            "status": "error",
            "message": "No valid commands found in chain",
            "formatted_message": f"[оболочка]: Цепочка #{chain_id}: нет команд — ОШИБКА. #log_{chain_id}"
        }
    
    # Store start time for execution metrics
    start_time = time.time()
    
    # Execute each command in sequence
    results = []
    success_count = 0
    error_count = 0
    
    for cmd_string in commands:
        # Check if this is a nested chain
        if cmd_string.startswith('/chain#'):
            # Execute the nested chain
            chain_result = await execute_command_chain(browser_controller, cmd_string)
            results.append(chain_result)
            
            # Count as success if the nested chain succeeded
            if chain_result.get("status") == "success":
                success_count += 1
            else:
                error_count += 1
            
            # Send the nested chain result message to log
            logger.info(chain_result["formatted_message"])
        else:
            # Regular command
            try:
                cmd_result = await execute_dsl_command(browser_controller, cmd_string)
                results.append(cmd_result)
                
                # Count as success if the command succeeded
                if cmd_result.get("status") == "success":
                    success_count += 1
                else:
                    error_count += 1
                    
                # Log the command result
                logger.info(cmd_result.get("formatted_message", f"Command result: {cmd_result.get('status')}"))
            except Exception as e:
                logger.error(f"Error executing command in chain: {str(e)}")
                error_count += 1
                results.append({
                    "status": "error",
                    "message": f"Command execution failed: {str(e)}",
                    "command": cmd_string
                })
    
    # Prepare the final result
    total_commands = len(commands)
    status = "success" if error_count == 0 else "partial" if success_count > 0 else "error"
    status_text = "OK" if status == "success" else "ЧАСТИЧНО" if status == "partial" else "ОШИБКА"
    
    # Calculate execution time
    execution_time = time.time() - start_time
    
    chain_result = {
        "command_id": chain_id,
        "type": "chain",
        "status": status,
        "message": f"Executed {success_count}/{total_commands} commands successfully",
        "results": results,
        "success_count": success_count,
        "error_count": error_count,
        "total_commands": total_commands,
        "execution_time": execution_time,
        "variables": get_all_variables(),  # Include current variable state for debugging
    }
    
    # Format the result message
    formatted_message = f"[оболочка]: Цепочка #{chain_id}: выполнено {success_count}/{total_commands} команд — {status_text}. #log_{chain_id}"
    chain_result["formatted_message"] = formatted_message
    
    logger.info(formatted_message)
    
    # Export command history to JSON
    try:
        with open("command_history.json", "w", encoding="utf-8") as f:
            # Create a serializable version of the results
            export_data = {
                "chain_id": chain_id,
                "timestamp": time.time(),
                "status": status,
                "success_count": success_count,
                "total_commands": total_commands,
                "execution_time": execution_time,
                "commands": [cmd for cmd in commands],
                "variables": get_all_variables(),
            }
            json.dump(export_data, f, indent=2, ensure_ascii=False)
        logger.info(f"Command history exported to command_history.json")
    except Exception as e:
        logger.error(f"Failed to export command history: {str(e)}")
    
    return chain_result
