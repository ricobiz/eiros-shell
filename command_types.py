
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
    CONDITIONAL = "conditional"
    LOOP = "loop" 
    VARIABLE = "variable"
    RECORD = "record"
    MEMORY_SAVE = "memory_save"
    MEMORY_RETRIEVE = "memory_retrieve"
    ANNOTATE = "annotate"  # Command type for manual annotation
    SCHEDULE = "schedule"  # Command type for scheduled tasks
    LOGIN = "login"  # Command type for credential storage and login
    AUTO_LOGIN = "auto_login"  # Command type for auto-login with stored credentials
