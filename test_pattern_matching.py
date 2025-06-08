
"""
Test script for visual pattern matching functionality
"""

import asyncio
import cv2
import numpy as np
from pathlib import Path
from pattern_image_processor import PatternImageProcessor

async def test_pattern_matching():
    """Test the visual pattern matching functionality"""
    
    # Setup test directory
    test_dir = Path("./test_patterns")
    test_dir.mkdir(exist_ok=True)
    
    # Create a simple test pattern (a white rectangle on black background)
    test_pattern_img = np.zeros((300, 400, 3), dtype=np.uint8)
    cv2.rectangle(test_pattern_img, (50, 50), (150, 100), (255, 255, 255), -1)
    cv2.imwrite(str(test_dir / "test_button.png"), test_pattern_img)
    
    # Create a test screenshot with the pattern at a different position
    test_screenshot = np.zeros((600, 800, 3), dtype=np.uint8)
    cv2.rectangle(test_screenshot, (200, 150), (300, 200), (255, 255, 255), -1)
    cv2.imwrite(str(test_dir / "test_screenshot.png"), test_screenshot)
    
    # Create a test pattern record
    test_pattern = {
        "id": "test_button",
        "selector": "#test-button",
        "url": "https://example.com/test",
        "text": "Test Button",
        "image_path": str(test_dir / "test_button.png"),
        "region": [50, 50, 100, 50]
    }
    
    image_processor = PatternImageProcessor()
    
    # Test matching
    screenshot = cv2.imread(str(test_dir / "test_screenshot.png"))
    matches = image_processor.match_patterns(screenshot, [test_pattern])
    
    assert matches, "No match found"
    match = matches[0]
    assert match["confidence"] > image_processor.match_threshold, (
        f"Match confidence {match['confidence']:.2f} "
        f"is below threshold {image_processor.match_threshold}"
    )

    # Visualize the match for debugging purposes
    result_img = screenshot.copy()
    x, y, w, h = match["region"]
    cv2.rectangle(result_img, (x, y), (x+w, y+h), (0, 255, 0), 2)
    cv2.imwrite(str(test_dir / "match_result.png"), result_img)

if __name__ == "__main__":
    asyncio.run(test_pattern_matching())
