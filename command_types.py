
"""
Command types for EirosShell
"""

class CommandType:
    """Command types"""
    CLICK = "click"
    TYPE = "type"
    NAVIGATION = "navigation"
    WAIT = "wait"
    SCREENSHOT = "screenshot"
    ANALYZE = "analyze"
    CONDITIONAL = "if"
    LOOP = "repeat"
    VARIABLE = "variable"
    RECORD = "record"
    MEMORY_SAVE = "memory_save"
    MEMORY_RETRIEVE = "memory_retrieve"
    ANNOTATE = "annotate"  # Command type for manual annotation
    SCHEDULE = "schedule"  # New command type for scheduled tasks
