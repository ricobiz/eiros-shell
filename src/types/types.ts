
export type LogType = 'info' | 'warning' | 'error' | 'success';

export interface LogEntry {
  type: LogType;
  message: string;
  timestamp: number;
  details?: any;
}

// Define both as type and const object for dual use
export type CommandType = 
  | 'click' 
  | 'type' 
  | 'navigation' 
  | 'wait' 
  | 'screenshot' 
  | 'analyze' 
  | 'conditional' 
  | 'loop' 
  | 'variable' 
  | 'record'
  | 'memory_save'
  | 'memory_retrieve'
  | 'annotate'
  | 'schedule'
  | 'login'
  | 'auto_login';

// Create a constant version of CommandType for runtime use
export const CommandType = {
  CLICK: 'click' as CommandType,
  TYPE: 'type' as CommandType,
  NAVIGATION: 'navigation' as CommandType,
  WAIT: 'wait' as CommandType,
  SCREENSHOT: 'screenshot' as CommandType,
  ANALYZE: 'analyze' as CommandType,
  CONDITIONAL: 'conditional' as CommandType,
  LOOP: 'loop' as CommandType, 
  VARIABLE: 'variable' as CommandType,
  RECORD: 'record' as CommandType,
  MEMORY_SAVE: 'memory_save' as CommandType,
  MEMORY_RETRIEVE: 'memory_retrieve' as CommandType,
  ANNOTATE: 'annotate' as CommandType,
  SCHEDULE: 'schedule' as CommandType,
  LOGIN: 'login' as CommandType,
  AUTO_LOGIN: 'auto_login' as CommandType
};

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
