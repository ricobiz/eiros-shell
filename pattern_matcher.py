
"""
Pattern Matcher module for visual element recognition
"""

import os
import json
import logging
import cv2
import numpy as np
import pyautogui
from pathlib import Path
from typing import Dict, List, Tuple, Optional, Any

logger = logging.getLogger("EirosShell")

class PatternMatcher:
    def __init__(self):
        self.patterns = {}
        self.patterns_dir = Path(os.path.expanduser("~")) / "EirosShell" / "patterns"
        self.patterns_dir.mkdir(parents=True, exist_ok=True)
        self.patterns_file = self.patterns_dir / "pattern_memory.json"
        self.load_patterns()
        
    def load_patterns(self, path: Optional[str] = None) -> Dict[str, Any]:
        """Load all patterns from the patterns directory or specified path"""
        try:
            if path:
                patterns_file = Path(path)
            else:
                patterns_file = self.patterns_file
                
            if patterns_file.exists():
                with open(patterns_file, 'r') as f:
                    self.patterns = json.load(f)
                logger.info(f"Loaded {len(self.patterns)} patterns from {patterns_file}")
            else:
                self.patterns = {}
                logger.info(f"No patterns file found at {patterns_file}, starting with empty patterns")
                
            return self.patterns
        except Exception as e:
            logger.error(f"Error loading patterns: {str(e)}")
            return {}
    
    def save_patterns(self) -> bool:
        """Save patterns to the patterns file"""
        try:
            with open(self.patterns_file, 'w') as f:
                json.dump(self.patterns, f, indent=2)
            logger.info(f"Saved {len(self.patterns)} patterns to {self.patterns_file}")
            return True
        except Exception as e:
            logger.error(f"Error saving patterns: {str(e)}")
            return False
    
    def match_elements(self, screenshot: np.ndarray, patterns: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Match screenshot against a list of patterns using template matching"""
        matches = []
        
        for pattern in patterns:
            if "image_path" in pattern:
                try:
                    template = cv2.imread(pattern["image_path"])
                    if template is None:
                        logger.warning(f"Could not load image for pattern {pattern['id']}")
                        continue
                        
                    # Convert both to grayscale for better matching
                    gray_screenshot = cv2.cvtColor(screenshot, cv2.COLOR_BGR2GRAY)
                    gray_template = cv2.cvtColor(template, cv2.COLOR_BGR2GRAY)
                    
                    # Apply template matching
                    result = cv2.matchTemplate(gray_screenshot, gray_template, cv2.TM_CCOEFF_NORMED)
                    
                    # Get the best match location and confidence
                    min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(result)
                    
                    if max_val > 0.8:  # Threshold for a good match
                        top_left = max_loc
                        h, w = template.shape[:2]
                        
                        match = {
                            "id": pattern["id"],
                            "selector": pattern.get("selector", ""),
                            "confidence": float(max_val),
                            "region": [top_left[0], top_left[1], w, h],
                            "center": [top_left[0] + w//2, top_left[1] + h//2],
                            "original_pattern": pattern
                        }
                        matches.append(match)
                        logger.info(f"Found match for pattern {pattern['id']} with confidence {max_val:.2f}")
                except Exception as e:
                    logger.error(f"Error matching pattern {pattern['id']}: {str(e)}")
        
        # Sort by confidence (highest first)
        matches.sort(key=lambda x: x["confidence"], reverse=True)
        return matches
    
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
        matches = self.match_elements(screenshot, url_patterns)
        
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
            screenshot_path = str(self.patterns_dir / f"temp_screenshot.png")
            await browser.take_screenshot(path=screenshot_path)
            
            # Load the screenshot
            screenshot = cv2.imread(screenshot_path)
            if screenshot is None:
                return {"status": "error", "message": "Failed to capture screenshot"}
            
            # Crop the region of the element
            x, y = int(bbox["x"]), int(bbox["y"])
            w, h = int(bbox["width"]), int(bbox["height"])
            element_img = screenshot[y:y+h, x:x+w]
            
            # Generate pattern ID if not provided
            if not name:
                name = selector.replace("#", "").replace(".", "").replace("[", "").replace("]", "").replace("=", "")
                name = ''.join(c for c in name if c.isalnum() or c == '_')
            
            pattern_id = name
            image_path = str(self.patterns_dir / f"{pattern_id}.png")
            
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
                "region": [x, y, w, h]
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

# Initialize the global pattern matcher
pattern_matcher = PatternMatcher()

