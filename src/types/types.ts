
export enum CommandType {
  NAVIGATION = "navigation",
  CLICK = "click",
  TYPE = "type",
  WAIT = "wait",
  SCREENSHOT = "screenshot",
  ANALYZE = "analyze",
  SET = "set",
  IF = "if",
  REPEAT = "repeat",
  RECORD = "record",
  // Adding missing command types
  MEMORY_SAVE = "memory_save",
  MEMORY_RETRIEVE = "memory_retrieve",
  LOGIN = "login",
  AUTO_LOGIN = "auto_login",
  PATTERN_LEARN = "pattern_learn",
  PATTERN_RECALL = "pattern_recall",
  SHELL = "shell",
  RESTART = "restart",
  KILL = "kill",
  READ_FILE = "read_file",
  WRITE_FILE = "write_file",
  LIST_DIR = "list_dir",
  ANNOTATE = "annotate"
}

export enum MemoryType {
  COMMAND = "command",
  SCREENSHOT = "screenshot",
  ELEMENT = "element",
  VARIABLE = "variable",
  // Adding missing memory types
  CREDENTIALS = "credentials",
  PATTERN = "pattern",
  RESULT = "result"
}

export interface Command {
  id: string;
  type: CommandType;
  params: Record<string, any>;
  timestamp: number;
}

export interface MemoryItem {
  id?: string;
  type: MemoryType;
  data: any;
  tags: string[];
  timestamp?: number;
  // Adding missing properties
  createdAt: number;
  lastAccessed?: number;
}

export interface LogEntry {
  type: 'info' | 'warning' | 'error' | 'success' | 'command';
  message: string;
  timestamp: number;
  details?: any;
}

// Adding missing Task interface
export interface Task {
  id: string;
  name: string;
  type: 'command' | 'message';
  content: string;
  interval: number;
  active: boolean;
  lastRun?: number;
}

// Adding missing UIPattern interface
export interface UIPattern {
  id: string;
  selector: string;
  url: string;
  text?: string;
  attributes?: Record<string, string>;
  tags: string[];
  createdAt: number;
  lastUsed: number;
  timesUsed: number;
  successRate: number;
  status: 'learning' | 'stable' | 'unstable';
  errorHistory?: Array<{
    code: string;
    message: string;
    timestamp: number;
  }>;
  fallbackSelectors?: string[];
  location?: number[];
}

// Adding missing system command result interfaces
export interface SystemCommandResult {
  success: boolean;
  output?: string;
  error?: string;
  exitCode: number;
  asAdmin?: boolean;
}

export interface FileOperationResult {
  success: boolean;
  path: string;
  error?: string;
  content?: string;
  files?: string[];
  directories?: string[];
}
