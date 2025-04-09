import { LogEntry } from "../types/types";

class LogService {
  private logs: LogEntry[] = [];
  private readonly MAX_LOGS = 100;
  private listeners: ((logs: LogEntry[]) => void)[] = [];
  
  addLog(entry: LogEntry): void {
    this.logs.unshift(entry);
    
    // Keep logs within limits
    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(0, this.MAX_LOGS);
    }
    
    // Notify listeners
    this.notifyListeners();
  }
  
  getLogs(limit?: number, type?: 'info' | 'warning' | 'error' | 'success'): LogEntry[] {
    let filteredLogs = this.logs;
    
    if (type) {
      filteredLogs = filteredLogs.filter(log => log.type === type);
    }
    
    if (limit && limit > 0) {
      return filteredLogs.slice(0, limit);
    }
    
    return filteredLogs;
  }
  
  clearLogs(): void {
    this.logs = [];
    this.notifyListeners();
  }
  
  subscribe(listener: (logs: LogEntry[]) => void): () => void {
    this.listeners.push(listener);
    
    // Return an unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  
  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener(this.logs);
    }
  }
  
  getCompactLogs(limit: number = 5): string {
    return this.logs
      .slice(0, limit)
      .map(log => {
        const time = new Date(log.timestamp).toLocaleTimeString();
        return `[${time}] ${log.type.toUpperCase()}: ${log.message}`;
      })
      .join('\n');
  }
}

export const logService = new LogService();
