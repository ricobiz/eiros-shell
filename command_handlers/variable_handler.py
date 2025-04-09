
"""
Handler for variable operations in the DSL
"""
import logging
import re
from typing import Dict, Any, Optional

logger = logging.getLogger("EirosShell")

# Global variable store
_variables = {}

def handle_set_command(params: Dict[str, Any], command_id: str) -> Dict[str, Any]:
    """
    Handles the set command to store a variable
    Example: /set#cmd101{ "var": "email", "value": "admin@example.com" }
    Or simplified format: /set#cmd1{ "name": "value" }
    """
    try:
        # Support both var/value and direct name/value formats
        var_name = params.get("var")
        value = params.get("value")
        
        # If using the simplified format, extract first key/value pair
        if not var_name:
            # Get the first key that's not "var" or "value"
            for key, val in params.items():
                if key not in ["var", "value"]:
                    var_name = key
                    value = val
                    break
        
        if not var_name:
            return {
                "command_id": command_id,
                "type": "set",
                "status": "error",
                "message": "Missing variable name",
                "formatted_message": f"[оболочка]: Переменная #{command_id} — ОШИБКА: имя переменной не указано. #log_{command_id}"
            }
            
        # Store the variable
        _variables[var_name] = value
        
        logger.info(f"Variable '{var_name}' set to '{value}'")
        
        return {
            "command_id": command_id,
            "type": "set",
            "status": "success",
            "message": f"Variable '{var_name}' set to '{value}'",
            "var_name": var_name,
            "value": value,
            "formatted_message": f"[оболочка]: Переменная {var_name} = '{value}' — OK. #log_{command_id}"
        }
    except Exception as e:
        logger.error(f"Error setting variable: {str(e)}")
        return {
            "command_id": command_id,
            "type": "set",
            "status": "error",
            "message": f"Error setting variable: {str(e)}",
            "formatted_message": f"[оболочка]: Установка переменной — ОШИБКА: {str(e)}. #log_{command_id}"
        }

def get_variable(var_name: str) -> Any:
    """
    Retrieve a variable's value from the store
    """
    return _variables.get(var_name)

def resolve_variables(text: str) -> str:
    """
    Replace variables in a string with their values
    Example: "Hello $name" -> "Hello John" if $name = "John"
    """
    if not text or not isinstance(text, str):
        return text
        
    # Find all variable references in the text
    var_pattern = r'\$([a-zA-Z0-9_]+)'
    
    def replace_var(match):
        var_name = match.group(1)
        value = get_variable(var_name)
        return str(value) if value is not None else f"${var_name}"
        
    # Replace all variables in the text
    return re.sub(var_pattern, replace_var, text)

def evaluate_condition(condition_str: str) -> bool:
    """
    Evaluate a condition string with variables
    Examples: 
        - "$var1 == 'admin'"
        - "$count > 3"
        - "$status == 'error'"
        - "'admin' in $roles"
    """
    try:
        # Replace variables with their values
        resolved_condition = condition_str
        var_pattern = r'\$([a-zA-Z0-9_]+)'
        
        for var_match in re.finditer(var_pattern, condition_str):
            var_name = var_match.group(1)
            var_value = get_variable(var_name)
            
            if var_value is None:
                logger.warning(f"Variable '{var_name}' not found in condition '{condition_str}'")
                var_value = "None"
                
            # For string values, wrap them in quotes
            if isinstance(var_value, str):
                var_value = f"'{var_value}'"
                
            resolved_condition = resolved_condition.replace(f"${var_name}", str(var_value))
        
        # Also handle direct variable names without $ prefix
        for var_name, var_value in _variables.items():
            if re.search(r'\b' + var_name + r'\b', resolved_condition):
                # For string values, wrap them in quotes
                if isinstance(var_value, str):
                    var_value = f"'{var_value}'"
                
                resolved_condition = re.sub(r'\b' + var_name + r'\b', str(var_value), resolved_condition)
        
        logger.debug(f"Evaluating condition: {resolved_condition}")
        
        # Evaluate the condition
        result = eval(resolved_condition, {"__builtins__": {}}, {})
        return bool(result)
    except Exception as e:
        logger.error(f"Error evaluating condition '{condition_str}': {str(e)}")
        return False

def clear_variables():
    """Clear all variables (useful for testing)"""
    _variables.clear()

def process_params_with_variables(params):
    """
    Process a parameter dictionary, resolving any variables in string values
    """
    if not isinstance(params, dict):
        return params
        
    processed_params = {}
    for key, value in params.items():
        if isinstance(value, str):
            processed_params[key] = resolve_variables(value)
        elif isinstance(value, dict):
            processed_params[key] = process_params_with_variables(value)
        elif isinstance(value, list):
            processed_params[key] = [
                process_params_with_variables(item) if isinstance(item, dict) else
                resolve_variables(item) if isinstance(item, str) else item
                for item in value
            ]
        else:
            processed_params[key] = value
            
    return processed_params

def get_all_variables() -> Dict[str, Any]:
    """Get all variables for export/debug purposes"""
    return dict(_variables)
