
"""
Central command executor that delegates to specific handlers
"""

import logging
import asyncio
import re
from typing import Dict, Any, Optional, List

from command_types import CommandType
from .navigation_handler import handle_navigation_command
from .click_handler import handle_click_command
from .type_handler import handle_type_command
from .wait_handler import handle_wait_command
from .screenshot_handler import handle_screenshot_command
from .analyze_handler import handle_analyze_command
from command_format_adapter import parse_dsl_command, parse_command_chain, is_command_chain

logger = logging.getLogger("EirosShell")

async def execute_command(browser_controller, command: Dict[str, Any]) -> Dict[str, Any]:
    """Выполняет команду и возвращает результат"""
    command_type = command["type"]
    params = command["params"]
    command_id = command["id"]
    
    logger.info(f"Выполнение команды {command_id} типа {command_type} с параметрами: {params}")
    
    result = {
        "command_id": command_id,
        "type": command_type,
        "status": "error",
        "message": ""
    }
    
    try:
        if command_type == CommandType.NAVIGATION:
            return await handle_navigation_command(browser_controller, params, command_id)
        elif command_type == CommandType.CLICK:
            return await handle_click_command(browser_controller, params, command_id)
        elif command_type == CommandType.TYPE:
            return await handle_type_command(browser_controller, params, command_id)
        elif command_type == CommandType.WAIT:
            return await handle_wait_command(params, command_id)
        elif command_type == CommandType.SCREENSHOT:
            return await handle_screenshot_command(browser_controller, command_id)
        elif command_type == CommandType.ANALYZE:
            return await handle_analyze_command(browser_controller, command_id)
        else:
            result["message"] = f"Неизвестный тип команды: {command_type}"
    
    except Exception as e:
        logger.error(f"Ошибка при выполнении команды {command_id}: {str(e)}")
        result["message"] = f"Ошибка: {str(e)}"
    
    logger.info(f"Результат команды {command_id}: {result['status']} - {result['message']}")
    return result

async def execute_dsl_command(browser_controller, dsl_string: str) -> Optional[Dict[str, Any]]:
    """
    Executes a command in DSL format and returns the result
    
    Example: /click#cmd99{ "element": ".submit", "waitAfter": 500 }
    """
    logger.info(f"Executing DSL command: {dsl_string}")
    
    # Parse the DSL command
    command = parse_dsl_command(dsl_string)
    
    if not command:
        logger.error("Failed to parse DSL command")
        return {
            "command_id": "unknown",
            "type": "unknown",
            "status": "error",
            "message": f"Failed to parse DSL command: {dsl_string}",
            "formatted_message": f"[оболочка]: Команда #unknown: unknown — ОШИБКА. #log_error"
        }
    
    # Execute the parsed command
    result = await execute_command(browser_controller, command)
    
    # Format the result for logging
    command_type = command["type"]
    command_id = command["id"]
    status_text = "OK" if result["status"] == "success" else "ОШИБКА"
    
    # Build a description of the command for the log
    description = ""
    if command_type == CommandType.NAVIGATION:
        description = f"→ '{command['params'].get('url', '')}'"
    elif command_type == CommandType.CLICK:
        description = f"→ '{command['params'].get('element', '')}'"
    elif command_type == CommandType.TYPE:
        description = f"→ '{command['params'].get('selector', '')}'"
    elif command_type == CommandType.WAIT:
        description = f"→ {command['params'].get('duration', 2)} сек"
    elif command_type == CommandType.SCREENSHOT or command_type == CommandType.ANALYZE:
        description = ""
    
    # Extract numeric part of the command ID for the log ID
    log_id = ""
    if command_id.startswith('cmd') and command_id[3:].isdigit():
        log_id = command_id[3:]
    else:
        log_id = command_id
    
    # Format the result message
    result_message = f"[оболочка]: Команда #{command_id}: {command_type} {description} — {status_text}. #log_{log_id}"
    
    # Log the result message
    logger.info(result_message)
    
    # Add the formatted message to the result
    result["formatted_message"] = result_message
    
    return result

async def execute_command_chain(browser_controller, dsl_string: str) -> Optional[Dict[str, Any]]:
    """
    Execute a chain of DSL commands in sequence
    
    Example:
    /chain#cmd9[
      /navigate#cmd1{ "url": "https://example.com" },
      /type#cmd2{ "selector": "#login", "text": "admin" },
      /click#cmd3{ "element": "#submit" }
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
        cmd_result = await execute_dsl_command(browser_controller, cmd_string)
        results.append(cmd_result)
        
        # If any command fails, we might want to stop the chain
        if cmd_result.get("status") == "success":
            success_count += 1
        else:
            # Consider if we should break here or continue with remaining commands
            # For now, we'll continue to execute all commands
            pass
    
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
