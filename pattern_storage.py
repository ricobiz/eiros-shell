
"""
Pattern storage module for managing pattern persistence
"""

import os
import json
import logging
from pathlib import Path
from typing import Dict, Any, Optional

logger = logging.getLogger("EirosShell")

class PatternStorage:
    """
    Handles loading and saving patterns to/from disk
    """
    
    def __init__(self):
        self.patterns_dir = Path(os.path.expanduser("~")) / "EirosShell" / "patterns"
        self.patterns_dir.mkdir(parents=True, exist_ok=True)
        self.patterns_file = self.patterns_dir / "pattern_memory.json"
        
    def load_patterns(self, path: Optional[str] = None) -> Dict[str, Any]:
        """Load patterns from disk"""
        try:
            if path:
                patterns_file = Path(path)
            else:
                patterns_file = self.patterns_file
                
            if patterns_file.exists():
                with open(patterns_file, 'r') as f:
                    patterns = json.load(f)
                logger.info(f"Loaded {len(patterns)} patterns from {patterns_file}")
                return patterns
            else:
                logger.info(f"No patterns file found at {patterns_file}, starting with empty patterns")
                return {}
        except Exception as e:
            logger.error(f"Error loading patterns: {str(e)}")
            return {}
    
    def save_patterns(self, patterns: Dict[str, Any]) -> bool:
        """Save patterns to disk"""
        try:
            with open(self.patterns_file, 'w') as f:
                json.dump(patterns, f, indent=2)
            logger.info(f"Saved {len(patterns)} patterns to {self.patterns_file}")
            return True
        except Exception as e:
            logger.error(f"Error saving patterns: {str(e)}")
            return False
    
    def get_pattern_path(self, pattern_id: str) -> str:
        """Get the file path for a pattern image"""
        return str(self.patterns_dir / f"{pattern_id}.png")
