
"""
Pattern Matcher module for visual element recognition
"""

import logging
from typing import Dict, List, Any, Optional

from pattern_storage import PatternStorage
from pattern_image_processor import PatternImageProcessor
from pattern_matcher_engine import PatternMatcherEngine

logger = logging.getLogger("EirosShell")

# Initialize components
storage = PatternStorage()
image_processor = PatternImageProcessor()
pattern_matcher = PatternMatcherEngine(storage, image_processor)

# Load patterns on startup
pattern_matcher.load_patterns()
