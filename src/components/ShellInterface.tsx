
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import CommandInput from './CommandInput';
import LogViewer from './LogViewer';
import MemoryPanel from './MemoryPanel';
import { CommandType, MemoryItem } from '@/types/types';
import { commandService } from '@/services/CommandService';
import { logService } from '@/services/LogService';
import { memoryService } from '@/services/MemoryService';
import { Brain, Command, Eye, MessageSquare, TerminalSquare, Cpu } from 'lucide-react';

const ShellInterface: React.FC = () => {
  const [activeTab, setActiveTab] = useState('command');
  const [commandResult, setCommandResult] = useState<any>(null);
  const [selectedMemory, setSelectedMemory] = useState<MemoryItem | null>(null);
  
  const handleCommandExecuted = (result: any) => {
    setCommandResult(result);
    logService.addLog({
      type: 'success',
      message: 'Command executed successfully',
      timestamp: Date.now(),
      details: result
    });
  };
  
  const handleMemoryItemSelected = (item: MemoryItem) => {
    setSelectedMemory(item);
  };
  
  const handleClearLogs = () => {
    logService.clearLogs();
  };
  
  const handleTakeScreenshot = async () => {
    const command = {
      id: `screenshot_${Date.now()}`,
      type: CommandType.SCREENSHOT,
      params: {},
      timestamp: Date.now()
    };
    
    try {
      const result = await commandService.executeCommand(command);
      setCommandResult(result);
    } catch (error) {
      console.error('Error taking screenshot:', error);
    }
  };
  
  const handleAnalyzeInterface = async () => {
    const command = {
      id: `analyze_${Date.now()}`,
      type: CommandType.ANALYZE,
      params: {},
      timestamp: Date.now()
    };
    
    try {
      const result = await commandService.executeCommand(command);
      setCommandResult(result);
    } catch (error) {
      console.error('Error analyzing interface:', error);
    }
  };
  
  const renderCommandHelp = () => (
    <div className="text-sm text-muted-foreground space-y-3 p-2">
      <p>Commands use the following format:</p>
      <pre className="bg-muted p-2 rounded-sm text-xs">/command_type#command_id{'{parameters}'}</pre>
      
      <p>Available commands:</p>
      <ul className="space-y-1 pl-4">
        {Object.values(CommandType).map((cmd) => (
          <li key={cmd} className="text-xs">
            <code className="bg-muted px-1 rounded-sm">{cmd}</code>
          </li>
        ))}
      </ul>
      
      <p>Example:</p>
      <pre className="bg-muted p-2 rounded-sm text-xs overflow-x-auto">
        /click#btn1{'{'}
          "x": 100, 
          "y": 200, 
          "waitAfter": 500
        {'}'}
      </pre>
    </div>
  );
  
  return (
    <Card className="w-full shadow-lg bg-card border-border">
      <CardHeader className="bg-muted/30">
        <div className="flex items-center space-x-2">
          <Cpu size={18} className="text-accent animate-pulse-accent" />
          <CardTitle className="text-lg">AI Shell Interface</CardTitle>
        </div>
        <CardDescription>Command & Control Interface for AI Interaction</CardDescription>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="command" className="flex items-center space-x-1">
            <TerminalSquare size={14} />
            <span>Command</span>
          </TabsTrigger>
          <TabsTrigger value="vision" className="flex items-center space-x-1">
            <Eye size={14} />
            <span>Vision</span>
          </TabsTrigger>
          <TabsTrigger value="memory" className="flex items-center space-x-1">
            <Brain size={14} />
            <span>Memory</span>
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center space-x-1">
            <MessageSquare size={14} />
            <span>Chat</span>
          </TabsTrigger>
        </TabsList>
        
        <CardContent className="p-4">
          <TabsContent value="command" className="mt-0">
            <div className="space-y-4">
              <CommandInput onCommandExecuted={handleCommandExecuted} />
              <Separator />
              {renderCommandHelp()}
              <div className="mt-4">
                <LogViewer maxHeight="150px" />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="vision" className="mt-0 space-y-4">
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={handleTakeScreenshot}
              >
                Take Screenshot
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={handleAnalyzeInterface}
              >
                Analyze Interface
              </Button>
            </div>
            
            <div className="aspect-video bg-muted/30 rounded-md border border-border flex items-center justify-center">
              {commandResult && typeof commandResult === 'string' && commandResult.startsWith('data:image') ? (
                <img 
                  src={commandResult} 
                  alt="Captured Screenshot" 
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="text-muted-foreground text-sm">
                  Visual analysis content will appear here
                </div>
              )}
            </div>
            
            {commandResult && typeof commandResult === 'object' && commandResult.elements && (
              <div className="mt-2">
                <h3 className="text-sm font-semibold mb-1">Detected Elements:</h3>
                <div className="bg-muted/30 p-2 rounded-md text-xs space-y-1 max-h-[200px] overflow-y-auto">
                  {commandResult.elements.map((elem: any, i: number) => (
                    <div key={i} className="p-1 border-b border-border last:border-0">
                      <div className="flex justify-between">
                        <span className="font-semibold">{elem.type}</span>
                        <span className="text-muted-foreground text-[10px]">
                          ({elem.rect.x}, {elem.rect.y})
                        </span>
                      </div>
                      {elem.text && <span className="text-accent text-[10px]">{elem.text}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="memory" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <MemoryPanel onMemoryItemSelected={handleMemoryItemSelected} />
              </div>
              
              <div className="space-y-2">
                <div className="rounded-md border border-border bg-card p-2 h-[400px] overflow-auto">
                  <h3 className="text-sm font-semibold mb-2">Memory Detail</h3>
                  {selectedMemory ? (
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-xs font-mono bg-muted px-1 rounded">
                          {selectedMemory.id}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(selectedMemory.createdAt).toLocaleString()}
                        </span>
                      </div>
                      
                      {selectedMemory.type === 'screenshot' && (
                        <img
                          src={selectedMemory.data}
                          alt="Screenshot"
                          className="max-w-full border border-border rounded-sm"
                        />
                      )}
                      
                      {selectedMemory.type !== 'screenshot' && (
                        <pre className="text-xs bg-muted/30 p-2 rounded-sm overflow-auto mt-2">
                          {JSON.stringify(selectedMemory.data, null, 2)}
                        </pre>
                      )}
                      
                      <div className="mt-4">
                        <h4 className="text-xs font-semibold">Tags:</h4>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedMemory.tags.map((tag, i) => (
                            <span key={i} className="text-[10px] bg-secondary/30 px-1 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      Select a memory item to view details
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="chat" className="mt-0">
            <div className="text-center py-8 space-y-3">
              <p className="text-muted-foreground">
                Chat history and interaction logs
              </p>
              <div className="bg-muted/30 p-4 rounded-md max-h-[300px] overflow-auto">
                <LogViewer maxHeight="250px" maxLogs={100} />
              </div>
              <Button variant="outline" size="sm" onClick={handleClearLogs}>
                Clear Logs
              </Button>
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>
      
      <CardFooter className="bg-muted/30 flex justify-between">
        <div className="text-xs text-muted-foreground">
          Status: <span className="text-accent">Active</span>
        </div>
        
        <div className="flex items-center space-x-1 text-xs">
          <span className="inline-block h-2 w-2 rounded-full bg-accent animate-pulse"/>
          <span className="text-muted-foreground">Listening for commands</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ShellInterface;
