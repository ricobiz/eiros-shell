
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
    
    # Advanced DSL command types
    SET = "set"
    IF = "if"
    REPEAT = "repeat"
    CHAIN = "chain"

