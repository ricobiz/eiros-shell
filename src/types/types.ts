export type LogType = 'info' | 'warning' | 'error' | 'success';

export interface LogEntry {
  type: LogType;
  message: string;
  timestamp: number;
  details?: any;
}

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
  | 'schedule';

export interface Command {
  type: CommandType;
  id: string;
  params: Record<string, any>;
}

export interface MemoryItem {
  type: MemoryType;
  data: any;
  timestamp?: number;
  tags?: string[];
  expiration?: number;
}

export enum MemoryType {
  COMMAND = 'command',
  RESULT = 'result',
  PATTERN = 'pattern',
  SCREENSHOT = 'screenshot',
  VARIABLE = 'variable',
  USER_ANNOTATION = 'user_annotation'
}

export interface Task {
  id: string;
  type: 'message' | 'command';
  content: string;
  interval: number; // in seconds
  active: boolean;
  name?: string;
  lastExecuted?: number;
}
