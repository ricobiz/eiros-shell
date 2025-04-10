
"""
Command types for EirosShell
"""

class CommandType:
    """
    Enumeration of command types supported by EirosShell
    """
    
    # Basic navigation commands
    NAVIGATION = "navigation"
    CLICK = "click"
    TYPE = "type"
    WAIT = "wait"
    
    # Visual commands
    SCREENSHOT = "screenshot"
    ANALYZE = "analyze"
    
    # Memory commands
    MEMORY_SAVE = "memory_save"
    MEMORY_RETRIEVE = "memory_retrieve"
    
    # Login commands
    LOGIN = "login"
    AUTO_LOGIN = "auto_login"
    
    # Pattern commands
    PATTERN_LEARN = "pattern_learn"
    PATTERN_RECALL = "pattern_recall"
    
    # DSL logical commands
    SET = "set"
    IF = "if"
    REPEAT = "repeat"
    
    # System commands
    SHELL = "shell"
    RESTART = "restart"
    KILL = "kill"
    READ_FILE = "read_file"
    WRITE_FILE = "write_file"
    LIST_DIR = "list_dir"
    
    # New commands
    RECORD = "record"
    CHAIN = "chain"
    SCHEDULE = "schedule"
    ANNOTATE = "annotate"
