
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
  AUTO_LOGIN = 'auto_login',
  PATTERN_LEARN = 'pattern_learn',
  PATTERN_RECALL = 'pattern_recall'
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
  ELEMENT = 'element',
  ERROR = 'error'
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

export interface UIPattern {
  id: string;
  selector: string;
  url: string;
  text?: string;
  attributes?: Record<string, string>;
  imagePath?: string;
  region?: [number, number, number, number]; // [x, y, width, height]
  center?: [number, number]; // [x, y]
  successRate: number;
  timesUsed: number;
  lastUsed: number;
  createdAt: number;
  tags: string[];
  status: 'stable' | 'unstable' | 'learning';
  fallbackSelectors?: string[];
  errorHistory?: {
    code: string;
    message: string;
    timestamp: number;
  }[];
}

export interface PatternStats {
  total: number;
  successful: number;
  failed: number;
  byUrl: Record<string, number>;
  byType: Record<string, number>;
  errorCategories: Record<string, number>;
}

