
"""
Command types for EirosShell
"""

from enum import Enum, auto

class CommandType:
    NAVIGATION = "navigate"
    CLICK = "click"
    TYPE = "type"
    WAIT = "wait"
    SCREENSHOT = "screenshot"
    ANALYZE = "analyze"
    SET = "set"
    IF = "if"
    REPEAT = "repeat"
    RECORD = "record"  # New command type for pattern recording

