
"""
Image processing module for pattern matching
"""

import cv2
import numpy as np
import logging
from typing import Dict, List, Any, Tuple, Optional

logger = logging.getLogger("EirosShell")

class PatternImageProcessor:
    """
    Handles image processing operations for pattern matching
    """
    
    def __init__(self):
        self.match_threshold = 0.8  # Minimum confidence for a match
        
    def match_pattern(self, screenshot: np.ndarray, template_path: str) -> Optional[Dict[str, Any]]:
        """Match a single pattern in the screenshot"""
        try:
            template = cv2.imread(template_path)
            if template is None:
                logger.warning(f"Could not load template image from {template_path}")
                return None
                
            # Convert both to grayscale for better matching
            gray_screenshot = cv2.cvtColor(screenshot, cv2.COLOR_BGR2GRAY)
            gray_template = cv2.cvtColor(template, cv2.COLOR_BGR2GRAY)
            
            # Apply template matching
            result = cv2.matchTemplate(gray_screenshot, gray_template, cv2.TM_CCOEFF_NORMED)
            
            # Get the best match location and confidence
            min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(result)
            
            if max_val > self.match_threshold:
                top_left = max_loc
                h, w = template.shape[:2]
                
                match = {
                    "confidence": float(max_val),
                    "region": [top_left[0], top_left[1], w, h],
                    "center": [top_left[0] + w//2, top_left[1] + h//2]
                }
                return match
            
        except Exception as e:
            logger.error(f"Error in pattern matching: {str(e)}")
            
        return None
    
    def match_patterns(self, screenshot: np.ndarray, patterns: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Match all provided patterns against the screenshot"""
        matches = []
        
        for pattern in patterns:
            if "image_path" in pattern:
                match = self.match_pattern(screenshot, pattern["image_path"])
                if match:
                    # Add pattern information to match data
                    match["id"] = pattern["id"]
                    match["selector"] = pattern.get("selector", "")
                    match["original_pattern"] = pattern
                    matches.append(match)
                    logger.info(f"Found match for pattern {pattern['id']} with confidence {match['confidence']:.2f}")
        
        # Sort by confidence (highest first)
        matches.sort(key=lambda x: x["confidence"], reverse=True)
        return matches
    
    def crop_element(self, screenshot: np.ndarray, bbox: Dict[str, float]) -> np.ndarray:
        """Crop an element from a screenshot using its bounding box"""
        x, y = int(bbox["x"]), int(bbox["y"])
        w, h = int(bbox["width"]), int(bbox["height"])
        return screenshot[y:y+h, x:x+w]
