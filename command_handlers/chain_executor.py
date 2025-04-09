
"""
Chain command executor for EirosShell
"""

import logging
import re
from typing import Dict, Any, Optional, List

from command_format_adapter import parse_command_chain, is_command_chain
from .dsl_executor import execute_dsl_command

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
    
    # Execute each command in sequence
    results = []
    success_count = 0
    
    for cmd_string in commands:
        # Check if this is a nested chain
        if cmd_string.startswith('/chain#'):
            # Execute the nested chain
            chain_result = await execute_command_chain(browser_controller, cmd_string)
            results.append(chain_result)
            
            # Count as success if the nested chain succeeded
            if chain_result.get("status") == "success":
                success_count += 1
            
            # Send the nested chain result message to log
            logger.info(chain_result["formatted_message"])
        else:
            # Regular command
            cmd_result = await execute_dsl_command(browser_controller, cmd_string)
            results.append(cmd_result)
            
            # Count as success if the command succeeded
            if cmd_result.get("status") == "success":
                success_count += 1
    
    # Prepare the final result
    status = "success" if success_count == len(commands) else "error"
    status_text = "OK" if status == "success" else "ОШИБКА"
    
    chain_result = {
        "command_id": chain_id,
        "type": "chain",
        "status": status,
        "message": f"Выполнено {success_count}/{len(commands)} команд",
        "results": results
    }
    
    # Format the result message
    formatted_message = f"[оболочка]: Цепочка #{chain_id}: выполнено {success_count}/{len(commands)} команд — {status_text}. #log_{chain_id}"
    chain_result["formatted_message"] = formatted_message
    
    logger.info(formatted_message)
    
    return chain_result
