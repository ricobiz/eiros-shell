
import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { LogEntry } from '@/types/types';
import { logService } from '@/services/LogService';

interface LogViewerProps {
  maxHeight?: string;
  maxLogs?: number;
  filter?: 'info' | 'warning' | 'error' | 'success';
}

const LogViewer: React.FC<LogViewerProps> = ({ 
  maxHeight = '200px', 
  maxLogs = 50,
  filter
}) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [expanded, setExpanded] = useState(false);
  
  useEffect(() => {
    const unsubscribe = logService.subscribe((newLogs) => {
      setLogs(newLogs.slice(0, maxLogs));
    });
    
    // Initial load
    setLogs(logService.getLogs(maxLogs, filter));
    
    return () => unsubscribe();
  }, [maxLogs, filter]);
  
  const getLogColor = (type: LogEntry['type']): string => {
    switch (type) {
      case 'error': return 'text-destructive';
      case 'warning': return 'text-yellow-500';
      case 'success': return 'text-accent';
      default: return 'text-muted-foreground';
    }
  };
  
  const formatTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString();
  };
  
  return (
    <div className="rounded-md border border-border bg-card p-2">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold text-muted-foreground">System Logs</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 px-2"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Collapse' : 'Expand'}
        </Button>
      </div>
      
      <ScrollArea className={`w-full ${expanded ? 'h-[400px]' : `h-[${maxHeight}]`}`}>
        <div className="space-y-1 pr-2">
          {logs.length === 0 ? (
            <p className="text-xs text-center text-muted-foreground py-4">No logs available</p>
          ) : (
            logs.map((log, index) => (
              <div 
                key={`${log.timestamp}_${index}`}
                className={`text-xs p-1 rounded ${getLogColor(log.type)}`}
              >
                <span className="text-muted-foreground">{formatTime(log.timestamp)}</span>
                {' '}<span className="font-bold">[{log.type.toUpperCase()}]</span>{' '}
                <span>{log.message}</span>
                {log.details && expanded && (
                  <pre className="mt-1 p-1 bg-muted/50 rounded text-xs overflow-x-auto">
                    {typeof log.details === 'string' 
                      ? log.details 
                      : JSON.stringify(log.details, null, 2)}
                  </pre>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default LogViewer;
