
export interface Command {
  id: string;
  type: CommandType;
  params: Record<string, any>;
  timestamp: number;
}

export enum CommandType {
  CLICK = 'click',
  TYPE = 'type',
  NAVIGATE = 'navigate',
  SCREENSHOT = 'screenshot',
  LOGIN = 'login',
  MEMORY_SAVE = 'memory_save',
  MEMORY_RETRIEVE = 'memory_retrieve',
  ANALYZE = 'analyze',
}

export interface MemoryItem {
  id: string;
  type: MemoryType;
  data: any;
  tags: string[];
  createdAt: number;
  lastAccessed?: number;
}

export enum MemoryType {
  COMMAND = 'command',
  SCREENSHOT = 'screenshot',
  ELEMENT = 'element',
  FLOW = 'flow',
  CREDENTIALS = 'credentials',
}

export interface ScreenElement {
  id: string;
  type: string;
  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  text?: string;
  role?: string;
  confidence: number;
}

export interface LogEntry {
  timestamp: number;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  details?: any;
}

export interface AuthConfig {
  service: string;
  username: string;
  password: string;
}
