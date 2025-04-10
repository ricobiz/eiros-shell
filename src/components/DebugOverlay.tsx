
import React, { useState } from 'react';
import { useShell } from '@/contexts/shell/ShellContext';
import { X, Minimize, Maximize2, ChevronUp, ChevronDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DiagnosticResult } from '@/services/DiagnosticsService';

interface DebugOverlayProps {
  onClose: () => void;
  diagnosticResults?: DiagnosticResult[];
}

const DebugOverlay: React.FC<DebugOverlayProps> = ({ onClose, diagnosticResults = [] }) => {
  const [expanded, setExpanded] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const { isConnectedToAI, commandResult } = useShell();
  
  // Visual indicator components for system state
  const SystemStateIndicators = () => {
    const indicators = [
      { color: 'bg-green-500', status: isConnectedToAI },
      { color: 'bg-[#FFBD44]', status: true }, // Execution always on for demo
      { color: 'bg-blue-500', status: true }   // System state always on for demo
    ];
    
    return (
      <div className="flex items-center space-x-1.5">
        {indicators.map((indicator, index) => (
          <div 
            key={index} 
            className={`${indicator.status ? indicator.color : 'bg-gray-500'} w-[2px] h-4 transform rotate-45`}
          />
        ))}
      </div>
    );
  };

  if (minimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-card border border-border rounded-md shadow-lg flex items-center p-1.5 cursor-pointer hover:bg-muted/80">
          <div className="flex items-center" onClick={() => setMinimized(false)}>
            <SystemStateIndicators />
            <span className="ml-2 text-xs font-mono">ENS DEBUG</span>
          </div>
          <Button variant="ghost" size="icon" className="h-5 w-5 ml-2" onClick={onClose}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="shadow-xl border-border">
        <div className="flex justify-between items-center px-3 py-1.5 border-b border-border">
          <div className="flex items-center space-x-2">
            <SystemStateIndicators />
            <span className="text-xs font-mono">ENS DEBUG MODE</span>
          </div>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setMinimized(true)}>
              <Minimize className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setExpanded(!expanded)}>
              {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        {expanded && (
          <CardContent className="p-3 text-xs">
            <div className="space-y-3">
              <div>
                <h3 className="text-xs font-medium mb-1">System Status</h3>
                <div className="grid grid-cols-2 gap-1">
                  <Badge variant={isConnectedToAI ? "default" : "outline"} className="justify-center">
                    AI {isConnectedToAI ? "Connected" : "Disconnected"}
                  </Badge>
                  <Badge variant="default" className="justify-center">
                    Debug Mode Active
                  </Badge>
                </div>
              </div>
              
              <div>
                <h3 className="text-xs font-medium mb-1">System Checks</h3>
                <div className="grid grid-cols-2 gap-1">
                  {diagnosticResults.map((result, index) => (
                    <div key={index} className="flex justify-between text-[10px] py-0.5">
                      <span>{result.test}:</span>
                      <span className={result.passed ? "text-green-500" : "text-destructive"}>
                        {result.passed ? "✓" : "✗"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              {commandResult && (
                <div>
                  <h3 className="text-xs font-medium mb-1">Last Command Result</h3>
                  <div className="bg-muted p-2 rounded text-[10px] font-mono max-h-20 overflow-y-auto">
                    <div className="text-primary-foreground/80">
                      Type: {commandResult.type}
                    </div>
                    <div className={`${
                      commandResult.status === 'success' ? 'text-green-500' : 'text-destructive'
                    }`}>
                      Status: {commandResult.status}
                    </div>
                    <div className="truncate">
                      {commandResult.message}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default DebugOverlay;
