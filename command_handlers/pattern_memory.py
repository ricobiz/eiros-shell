
"""
Pattern memory module for EirosShell
Enables remembering and recognizing UI elements across sessions
"""

import json
import logging
import os
import base64
from typing import Dict, Any, List, Optional
from pathlib import Path
import time

logger = logging.getLogger("EirosShell")

class PatternMemory:
    """
    Stores and retrieves information about UI elements across sessions
    """
    
    def __init__(self):
        self.memory_file = Path(os.path.expanduser("~")) / "EirosShell" / "patterns" / "pattern_memory.json"
        self.memory_dir = self.memory_file.parent
        self.memory_dir.mkdir(parents=True, exist_ok=True)
        self.patterns = {}
        self.load_patterns()
    
    def load_patterns(self) -> None:
        """Load patterns from disk"""
        try:
            if self.memory_file.exists():
                with open(self.memory_file, 'r') as f:
                    self.patterns = json.load(f)
                logger.info(f"Loaded {len(self.patterns)} patterns from memory file")
            else:
                logger.info("No pattern memory file found, starting with empty patterns")
                self.patterns = {}
        except Exception as e:
            logger.error(f"Error loading pattern memory: {str(e)}")
            self.patterns = {}
    
    def save_patterns(self) -> None:
        """Save patterns to disk"""
        try:
            with open(self.memory_file, 'w') as f:
                json.dump(self.patterns, f, indent=2)
            logger.info(f"Saved {len(self.patterns)} patterns to memory file")
        except Exception as e:
            logger.error(f"Error saving pattern memory: {str(e)}")
    
    async def learn_element(self, browser, selector: str, context: str = "default") -> Dict[str, Any]:
        """
        Learn a new element and store its pattern
        Returns the element metadata
        """
        try:
            # Check if we already know this element
            pattern_key = f"{selector}:{context}"
            if pattern_key in self.patterns:
                logger.info(f"Element {selector} in context {context} already in pattern memory")
                return self.patterns[pattern_key]
            
            # Get element info using playwright
            element = await browser.page.query_selector(selector)
            if not element:
                logger.warning(f"Element {selector} not found, cannot learn pattern")
                return {}
            
            # Get element properties
            tag_name = await element.evaluate("el => el.tagName.toLowerCase()")
            inner_text = await element.evaluate("el => el.innerText || el.value || ''")
            
            # Get element bounding box
            bbox = await element.bounding_box()
            if not bbox:
                logger.warning(f"Element {selector} has no bounding box, cannot learn pattern")
                return {}
            
            location = [bbox["x"], bbox["y"], bbox["width"], bbox["height"]]
            
            # Take screenshot of the element
            screenshot_data = await element.screenshot()
            
            # Convert screenshot to base64
            screenshot_b64 = base64.b64encode(screenshot_data).decode('utf-8')
            
            # Save additional identifiers that might help with recovery
            attributes = await element.evaluate("""el => {
                const attrs = {};
                for (const attr of el.attributes) {
                    attrs[attr.name] = attr.value;
                }
                return attrs;
            }""")
            
            # Create pattern data
            timestamp = time.time()
            pattern_data = {
                "selector": selector,
                "type": tag_name,
                "text": inner_text,
                "location": location,
                "screenshot": screenshot_b64,
                "context": context,
                "attributes": attributes,
                "last_seen": timestamp,
                "learned_at": timestamp,
                "times_seen": 1
            }
            
            # Store pattern
            self.patterns[pattern_key] = pattern_data
            self.save_patterns()
            
            logger.info(f"Learned pattern for element {selector} in context {context}")
            return pattern_data
            
        except Exception as e:
            logger.error(f"Error learning element pattern: {str(e)}")
            return {}
    
    async def recognize_element(self, browser, selector: str, context: str = "default") -> Dict[str, Any]:
        """
        Try to recognize an element and return its stored metadata
        If it doesn't exist, learn it
        """
        pattern_key = f"{selector}:{context}"
        
        # Check if we know this element
        if pattern_key in self.patterns:
            pattern = self.patterns[pattern_key]
            
            # Try to find the element
            element = await browser.page.query_selector(selector)
            if element:
                # Update last seen timestamp and counter
                pattern["last_seen"] = time.time()
                pattern["times_seen"] = pattern.get("times_seen", 0) + 1
                self.patterns[pattern_key] = pattern
                self.save_patterns()
                
                logger.info(f"Recognized element {selector} in context {context}")
                return pattern
            else:
                logger.warning(f"Element {selector} known but not found in page")
                # Could implement fallback here using image matching
                return {}
        
        # Pattern not known, learn it
        return await self.learn_element(browser, selector, context)
    
    def get_pattern(self, selector: str, context: str = "default") -> Optional[Dict[str, Any]]:
        """Get a pattern from memory without updating it"""
        pattern_key = f"{selector}:{context}"
        return self.patterns.get(pattern_key)
    
    def clear_patterns(self) -> None:
        """Clear all patterns"""
        self.patterns = {}
        self.save_patterns()

# Global pattern memory instance
pattern_memory = PatternMemory()
