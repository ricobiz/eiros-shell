
"""
Handler for recording pattern commands
"""

import logging
from typing import Dict, Any

from command_types import CommandType
from pattern_matcher import pattern_matcher

logger = logging.getLogger("EirosShell")

async def handle_record_command(browser, params, command_id):
    """Handles command to record a UI pattern for future recognition"""
    result = {
        "command_id": command_id,
        "type": CommandType.RECORD,
        "status": "error",
        "message": ""
    }
    
    selector = params.get("selector") or params.get("element")
    name = params.get("name", "")
    
    if not selector:
        result["message"] = "No selector provided for recording"
        return result
    
    # Call the pattern_matcher to record the pattern
    record_result = await pattern_matcher.record_pattern(browser, selector, name)
    
    if record_result["status"] == "success":
        pattern_id = record_result["pattern"]["id"]
        result["status"] = "success"
        result["message"] = f"Pattern '{pattern_id}' saved successfully"
        
        # Log with special attributes for the debug GUI
        log_record = logger.makeLogRecord({
            'msg': f"Pattern '{pattern_id}' recorded for element: {selector}",
            'levelname': 'INFO',
            'command_id': command_id,
            'command_status': 'success',
            'command_type': CommandType.RECORD
        })
        logger.handle(log_record)
    else:
        result["message"] = record_result["message"]
        
        # Log error with special attributes
        log_record = logger.makeLogRecord({
            'msg': f"Failed to record pattern: {record_result['message']}",
            'levelname': 'ERROR',
            'command_id': command_id,
            'command_status': 'error',
            'command_type': CommandType.RECORD
        })
        logger.handle(log_record)
    
    return result
