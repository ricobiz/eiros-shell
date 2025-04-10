
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { AlertCircle, X } from 'lucide-react';

interface Process {
  id: string;
  name: string;
  cpu: number;
  memory: number;
  status: 'running' | 'idle' | 'frozen' | 'terminated';
  startTime: Date;
}

const ProcessMonitor: React.FC = () => {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [sortBy, setSortBy] = useState<'cpu' | 'memory'>('cpu');
  
  useEffect(() => {
    // In a real implementation, this would connect to a system monitor API
    // For this frontend implementation, we'll simulate some processes
    const mockProcesses: Process[] = [
      {
        id: 'p1',
        name: 'chrome.exe',
        cpu: 12,
        memory: 1024,
        status: 'running',
        startTime: new Date(Date.now() - 3600000)
      },
      {
        id: 'p2',
        name: 'node.exe',
        cpu: 7,
        memory: 512,
        status: 'running',
        startTime: new Date(Date.now() - 1800000)
      },
      {
        id: 'p3',
        name: 'python.exe',
        cpu: 18,
        memory: 256,
        status: 'idle',
        startTime: new Date(Date.now() - 900000)
      },
      {
        id: 'p4',
        name: 'eiros_bridge.exe',
        cpu: 2,
        memory: 128,
        status: 'running',
        startTime: new Date(Date.now() - 7200000)
      }
    ];
    
    setProcesses(mockProcesses);
    
    // Simulate occasional updates to process stats
    const interval = setInterval(() => {
      setProcesses(prev => 
        prev.map(process => ({
          ...process,
          cpu: Math.min(100, Math.max(0, process.cpu + (Math.random() * 6 - 3))),
          memory: Math.min(2048, Math.max(64, process.memory + (Math.random() * 100 - 50)))
        }))
      );
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleKillProcess = (id: string) => {
    setProcesses(prev => 
      prev.map(process => 
        process.id === id 
          ? { ...process, status: 'terminated', cpu: 0 } 
          : process
      )
    );
  };
  
  const sortedProcesses = [...processes].sort((a, b) => 
    sortBy === 'cpu' 
      ? b.cpu - a.cpu 
      : b.memory - a.memory
  );
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-green-500';
      case 'idle': return 'text-amber-500';
      case 'frozen': return 'text-red-500';
      case 'terminated': return 'text-gray-500';
      default: return '';
    }
  };
  
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex justify-between">
          <span>Active Processes</span>
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSortBy('cpu')}
              className={`h-6 px-2 ${sortBy === 'cpu' ? 'bg-muted' : ''}`}
            >
              Sort by CPU
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSortBy('memory')}
              className={`h-6 px-2 ${sortBy === 'memory' ? 'bg-muted' : ''}`}
            >
              Sort by Memory
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pb-2">
        {sortedProcesses.map(process => (
          <div key={process.id} className="flex flex-col space-y-1 py-1">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className={`font-mono text-xs ${getStatusColor(process.status)}`}>•</span>
                <span className="text-sm font-medium">{process.name}</span>
                {process.status === 'frozen' && (
                  <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                )}
              </div>
              
              {process.status !== 'terminated' && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0" 
                  onClick={() => handleKillProcess(process.id)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">CPU</span>
                  <span>{process.cpu.toFixed(1)}%</span>
                </div>
                <Progress value={process.cpu} className="h-1" />
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Memory</span>
                  <span>{(process.memory / 1024).toFixed(1)} GB</span>
                </div>
                <Progress value={(process.memory / 2048) * 100} className="h-1" />
              </div>
            </div>
          </div>
        ))}
        
        {processes.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No active processes to display
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ProcessMonitor;
