
"""
Handler for manual annotation commands
"""

import logging
import threading
from typing import Dict, Any

from command_types import CommandType
from manual_ui_annotator import manual_annotator, start_with_last_screenshot

logger = logging.getLogger("EirosShell")

async def handle_annotate_command(browser, params, command_id):
    """Handle manual annotation command"""
    result = {
        "command_id": command_id,
        "type": CommandType.ANNOTATE,
        "status": "success",
        "message": "Starting manual annotation tool"
    }
    
    try:
        screenshot_path = None
        url = None
        
        # If browser is available, take a screenshot
        if browser and browser.page:
            screenshot_path = await browser.take_screenshot()
            url = await browser.page.url
        
        # Start annotator in a separate thread to not block the main thread
        if screenshot_path:
            threading.Thread(
                target=lambda: manual_annotator.start(screenshot_path, url),
                daemon=True
            ).start()
            result["message"] = "Manual annotation tool started with current screenshot"
        else:
            # Try to start with last screenshot from memory
            threading.Thread(
                target=start_with_last_screenshot,
                daemon=True
            ).start()
            result["message"] = "Manual annotation tool started"
        
        # Log success
        logger.info(f"Manual annotation tool started for command: {command_id}")
        
    except Exception as e:
        logger.error(f"Error starting manual annotation tool: {str(e)}")
        result["status"] = "error"
        result["message"] = f"Error starting manual annotation tool: {str(e)}"
    
    return result

async def handle_reference_command(browser, command_type, params, command_id):
    """Handle commands that reference manually annotated elements"""
    from pattern_storage import PatternStorage
    
    result = {
        "command_id": command_id,
        "type": command_type,
        "status": "error",
        "message": "Failed to process reference command"
    }
    
    try:
        storage = PatternStorage()
        patterns = storage.load_patterns()
        
        # Get the element reference
        element_ref = params.get("element_ref")
        if not element_ref:
            result["message"] = "No element reference provided"
            return result
        
        # Get the context
        context = params.get("context", "manual")
        
        # Look for the pattern
        pattern_key = f"@{element_ref}:{context}"
        if pattern_key not in patterns:
            # Try without context
            pattern_key = f"@{element_ref}"
            if pattern_key not in patterns:
                result["message"] = f"Element reference not found: @{element_ref}"
                return result
        
        # Get the pattern
        pattern = patterns[pattern_key]
        
        # Update the command parameters based on the pattern
        if pattern.get("selector"):
            # If pattern has a selector, use it
            params["selector"] = pattern["selector"]
        
        # Include pattern location data
        if "location" in pattern:
            params["x"] = pattern["location"][0] + pattern["location"][2] // 2
            params["y"] = pattern["location"][1] + pattern["location"][3] // 2
            params["element_region"] = pattern["location"]
        
        # Remove manual reference flags
        params.pop("manual_ref", None)
        params.pop("element_ref", None)
        
        # Forward to the appropriate handler based on the command type
        from command_executor import execute_command
        
        # Create a new command with updated parameters
        command = {
            "id": command_id,
            "type": command_type,
            "params": params
        }
        
        # Execute the command
        handler_result = await execute_command(browser, command)
        
        # Return the result from the handler
        return handler_result
        
    except Exception as e:
        logger.error(f"Error handling reference command: {str(e)}")
        result["message"] = f"Error handling reference command: {str(e)}"
        return result
