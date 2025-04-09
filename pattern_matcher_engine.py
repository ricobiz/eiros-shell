
"""
Pattern matcher engine for visual element recognition
"""

import cv2
import pyautogui
import logging
import numpy as np
from typing import Dict, List, Any, Optional

from pattern_storage import PatternStorage
from pattern_image_processor import PatternImageProcessor

logger = logging.getLogger("EirosShell")

class PatternMatcherEngine:
    """
    Core matching engine to find UI patterns
    """
    
    def __init__(self, storage: PatternStorage, image_processor: PatternImageProcessor):
        self.storage = storage
        self.image_processor = image_processor
        self.patterns = {}
        
    def load_patterns(self) -> None:
        """Load patterns from storage"""
        self.patterns = self.storage.load_patterns()
    
    def save_patterns(self) -> bool:
        """Save patterns to storage"""
        return self.storage.save_patterns(self.patterns)
        
    def find_best_match(self, url: str, screenshot: np.ndarray, element_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Find the best match for a given URL and optional element ID"""
        # Filter patterns by URL if provided
        url_patterns = []
        for pattern_id, pattern in self.patterns.items():
            if element_id and pattern_id != element_id:
                continue
            
            if pattern.get("url") == url or not url:
                url_patterns.append(pattern)
        
        if not url_patterns:
            logger.info(f"No patterns found for URL {url}")
            return None
        
        # Match against filtered patterns
        matches = self.image_processor.match_patterns(screenshot, url_patterns)
        
        if matches:
            logger.info(f"Found {len(matches)} matches for URL {url}")
            return matches[0]  # Return the best match (highest confidence)
        return None
    
    def click_match(self, match: Dict[str, Any]) -> bool:
        """Click on the center of a matched element using PyAutoGUI"""
        try:
            if "center" in match:
                x, y = match["center"]
                pyautogui.click(x, y)
                logger.info(f"Clicked on matched element at ({x}, {y})")
                return True
            elif "region" in match:
                x, y, w, h = match["region"]
                center_x = x + w // 2
                center_y = y + h // 2
                pyautogui.click(center_x, center_y)
                logger.info(f"Clicked on matched element at ({center_x}, {center_y})")
                return True
            return False
        except Exception as e:
            logger.error(f"Error clicking on match: {str(e)}")
            return False
    
    async def record_pattern(self, browser, selector: str, name: Optional[str] = None) -> Dict[str, Any]:
        """Record a new pattern by taking a screenshot and saving element region"""
        try:
            # Get the current URL
            url = await browser.page.url
            
            # Find the element on the page
            element = await browser.wait_for_selector(selector)
            if not element:
                return {"status": "error", "message": f"Element not found: {selector}"}
            
            # Get the bounding box
            bbox = await element.bounding_box()
            if not bbox:
                return {"status": "error", "message": f"Could not get bounding box for {selector}"}
            
            # Take a screenshot of the page
            screenshot_path = str(self.storage.patterns_dir / f"temp_screenshot.png")
            await browser.take_screenshot(path=screenshot_path)
            
            # Load the screenshot
            screenshot = cv2.imread(screenshot_path)
            if screenshot is None:
                return {"status": "error", "message": "Failed to capture screenshot"}
            
            # Generate pattern ID if not provided
            if not name:
                name = selector.replace("#", "").replace(".", "").replace("[", "").replace("]", "").replace("=", "")
                name = ''.join(c for c in name if c.isalnum() or c == '_')
            
            pattern_id = name
            image_path = self.storage.get_pattern_path(pattern_id)
            
            # Crop the region of the element
            element_img = self.image_processor.crop_element(screenshot, bbox)
            
            # Save the cropped image
            cv2.imwrite(image_path, element_img)
            
            # Get the element's text if possible
            element_text = ""
            try:
                element_text = await element.inner_text()
            except:
                pass
            
            # Create and save the pattern
            new_pattern = {
                "id": pattern_id,
                "selector": selector,
                "url": url,
                "text": element_text,
                "image_path": image_path,
                "region": [bbox["x"], bbox["y"], bbox["width"], bbox["height"]]
            }
            
            # Add to patterns dictionary
            self.patterns[pattern_id] = new_pattern
            
            # Save patterns to disk
            self.save_patterns()
            
            return {
                "status": "success",
                "message": f"Pattern '{pattern_id}' saved successfully",
                "pattern": new_pattern
            }
            
        except Exception as e:
            logger.error(f"Error recording pattern: {str(e)}")
            return {"status": "error", "message": f"Error: {str(e)}"}
