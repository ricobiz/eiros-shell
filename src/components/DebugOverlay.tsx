
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Code, 
  Play, 
  Pause, 
  StepForward, 
  RotateCcw, 
  X,
  Terminal,
  AlertCircle
} from 'lucide-react';
import { logService } from '@/services/LogService';
import { LogEntry } from '@/types/types';

interface DebugOverlayProps {
  onClose: () => void;
}

const DebugOverlay: React.FC<DebugOverlayProps> = ({ onClose }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [commandInput, setCommandInput] = useState('');
  
  React.useEffect(() => {
    // Subscribe to logs
    const unsubscribe = logService.subscribe(newLogs => {
      if (!isPaused) {
        setLogs(newLogs.slice(0, 100)); // Limit to 100 most recent logs
      }
    });
    
    // Get initial logs
    setLogs(logService.getLogs(100));
    
    // Add debug mode activated log
    logService.addLog({
      type: 'info',
      message: 'Debug mode activated',
      timestamp: Date.now()
    });
    
    return () => {
      unsubscribe();
      
      // Add debug mode deactivated log
      logService.addLog({
        type: 'info',
        message: 'Debug mode deactivated',
        timestamp: Date.now()
      });
    };
  }, [isPaused]);
  
  const handlePauseToggle = () => {
    setIsPaused(!isPaused);
    logService.addLog({
      type: 'info',
      message: !isPaused ? 'Debug logging paused' : 'Debug logging resumed',
      timestamp: Date.now()
    });
  };
  
  const handleClearLogs = () => {
    logService.clearLogs();
    setLogs([]);
  };
  
  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commandInput.trim()) return;
    
    // In a real implementation, this would execute the command
    logService.addLog({
      type: 'command',
      message: `> ${commandInput}`,
      timestamp: Date.now()
    });
    
    // Mock command response
    setTimeout(() => {
      logService.addLog({
        type: 'success',
        message: `Command executed: ${commandInput}`,
        timestamp: Date.now()
      });
    }, 500);
    
    setCommandInput('');
  };
  
  return (
    <Card className="fixed bottom-4 right-4 w-[500px] h-[400px] shadow-lg z-50 flex flex-col">
      <CardHeader className="p-3 bg-muted/50">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium flex items-center">
            <Code className="h-4 w-4 mr-2" />
            EirosShell Debug Console
          </CardTitle>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Log display */}
          <div className="flex-1 p-3 overflow-y-auto bg-muted/20 font-mono text-xs">
            {logs.length === 0 ? (
              <div className="text-center text-muted-foreground py-4">
                <AlertCircle className="h-5 w-5 mx-auto mb-2" />
                <p>No logs to display</p>
              </div>
            ) : (
              logs.map((log, index) => (
                <div 
                  key={index} 
                  className={`py-0.5 ${
                    log.type === 'error' ? 'text-red-500' : 
                    log.type === 'warning' ? 'text-yellow-500' : 
                    log.type === 'success' ? 'text-green-500' : 
                    log.type === 'command' ? 'text-purple-500 font-bold' : ''
                  }`}
                >
                  [{new Date(log.timestamp).toLocaleTimeString()}] {log.message}
                </div>
              ))
            )}
          </div>
          
          {/* Command input */}
          <div className="border-t p-2 bg-background">
            <form onSubmit={handleCommandSubmit} className="flex items-center">
              <Terminal className="h-4 w-4 mr-2 text-muted-foreground" />
              <input
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-sm"
                placeholder="Enter debug command..."
              />
            </form>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-2 bg-muted/30 border-t flex justify-between">
        <div className="flex items-center space-x-1">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-7"
            onClick={handlePauseToggle}
          >
            {isPaused ? (
              <>
                <Play className="h-3.5 w-3.5 mr-1" />
                <span className="text-xs">Resume</span>
              </>
            ) : (
              <>
                <Pause className="h-3.5 w-3.5 mr-1" />
                <span className="text-xs">Pause</span>
              </>
            )}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="h-7"
            disabled={logs.length === 0}
            onClick={handleClearLogs}
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            <span className="text-xs">Clear</span>
          </Button>
        </div>
        
        <Button 
          variant="secondary" 
          size="sm" 
          className="h-7"
        >
          <StepForward className="h-3.5 w-3.5 mr-1" />
          <span className="text-xs">Step</span>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DebugOverlay;
