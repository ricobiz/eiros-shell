
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
  RECORD = "record"
}

export enum MemoryType {
  COMMAND = "command",
  SCREENSHOT = "screenshot",
  ELEMENT = "element",
  VARIABLE = "variable"
}

export interface Command {
  id: string;
  type: CommandType;
  params: Record<string, any>;
  timestamp: number;
}

export interface MemoryItem {
  type: MemoryType;
  data: any;
  tags: string[];
  timestamp?: number;
}

export interface LogEntry {
  type: 'info' | 'warning' | 'error' | 'success' | 'command';
  message: string;
  timestamp: number;
  details?: any;
}
