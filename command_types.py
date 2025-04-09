
"""
Определение типов команд для EirosShell
"""

class CommandType:
    NAVIGATION = "navigation"
    CLICK = "click"
    TYPE = "type"
    WAIT = "wait"
    SCREENSHOT = "screenshot"
    ANALYZE = "analyze"
    UNKNOWN = "unknown"
    
    # New command types for advanced DSL
    SET = "set"
    IF = "if"
    REPEAT = "repeat"
