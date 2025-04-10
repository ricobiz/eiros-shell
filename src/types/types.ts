
export type LogType = 'info' | 'warning' | 'error' | 'success';

export interface LogEntry {
  type: LogType;
  message: string;
  timestamp: number;
  details?: any;
}

// Define both as type and enum for dual use
export enum CommandType {
  CLICK = 'click',
  TYPE = 'type',
  NAVIGATION = 'navigation',
  WAIT = 'wait',
  SCREENSHOT = 'screenshot',
  ANALYZE = 'analyze',
  CONDITIONAL = 'conditional',
  LOOP = 'loop', 
  VARIABLE = 'variable',
  RECORD = 'record',
  MEMORY_SAVE = 'memory_save',
  MEMORY_RETRIEVE = 'memory_retrieve',
  ANNOTATE = 'annotate',
  SCHEDULE = 'schedule',
  LOGIN = 'login',
  AUTO_LOGIN = 'auto_login'
}

export interface Command {
  type: CommandType;
  id: string;
  params: Record<string, any>;
  timestamp?: number;
}

export interface MemoryItem {
  type: MemoryType;
  data: any;
  timestamp?: number;
  tags?: string[];
  expiration?: number;
  id?: string;
  createdAt?: number;
  lastAccessed?: number;
}

export enum MemoryType {
  COMMAND = 'command',
  RESULT = 'result',
  PATTERN = 'pattern',
  SCREENSHOT = 'screenshot',
  VARIABLE = 'variable',
  USER_ANNOTATION = 'user_annotation',
  CREDENTIALS = 'credentials',
  ELEMENT = 'element'
}

export interface Task {
  id: string;
  type: 'message' | 'command';
  content: string;
  interval: number; // in seconds
  active: boolean;
  name?: string;
  lastExecuted?: number;
  enabled?: boolean;
  message?: string;
}
