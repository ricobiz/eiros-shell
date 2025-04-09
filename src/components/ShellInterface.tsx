
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
import { Switch } from '@/components/ui/switch';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from '@/components/ui/tooltip';
import CommandInput from './CommandInput';
import LogViewer from './LogViewer';
import MemoryPanel from './MemoryPanel';
import { CommandType, MemoryItem } from '@/types/types';
import { commandService } from '@/services/CommandService';
import { logService } from '@/services/LogService';
import { memoryService } from '@/services/MemoryService';
import { getCommandExamples, getCommandHelp } from '@/utils/commandHelpers';
import { Brain, Command, Eye, MessageSquare, TerminalSquare, Cpu, Pin, PinOff, Edit, Save } from 'lucide-react';

const ShellInterface: React.FC = () => {
  const [activeTab, setActiveTab] = useState('command');
  const [commandResult, setCommandResult] = useState<any>(null);
  const [selectedMemory, setSelectedMemory] = useState<MemoryItem | null>(null);
  const [isPinned, setIsPinned] = useState(false);
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [annotations, setAnnotations] = useState<{id: string, element: string, description: string}[]>([]);
  const [currentAnnotation, setCurrentAnnotation] = useState({element: '', description: ''});
  
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
  
  const handleTogglePin = () => {
    setIsPinned(!isPinned);
    
    // In a real implementation, this would make the window "always on top"
    // Since this is a web app, we'd need browser extensions or electron for real pinning
    logService.addLog({
      type: 'info',
      message: `Shell window ${!isPinned ? 'pinned' : 'unpinned'}`,
      timestamp: Date.now()
    });
  };
  
  const handleToggleAnnotating = () => {
    setIsAnnotating(!isAnnotating);
    
    if (isAnnotating) {
      // Save annotation mode
      logService.addLog({
        type: 'info',
        message: 'Exiting annotation mode',
        timestamp: Date.now()
      });
    } else {
      logService.addLog({
        type: 'info',
        message: 'Entering annotation mode - click on elements to annotate',
        timestamp: Date.now()
      });
    }
  };
  
  const handleSaveAnnotation = () => {
    if (currentAnnotation.element && currentAnnotation.description) {
      const newAnnotation = {
        id: `annotation_${Date.now()}`,
        ...currentAnnotation
      };
      
      setAnnotations([...annotations, newAnnotation]);
      setCurrentAnnotation({element: '', description: ''});
      
      // Save annotation to memory
      memoryService.addMemoryItem({
        type: MemoryType.ELEMENT,
        data: newAnnotation,
        tags: ['annotation', 'element', 'ui_training']
      });
      
      logService.addLog({
        type: 'success',
        message: 'Element annotation saved',
        timestamp: Date.now()
      });
    }
  };
  
  const renderCommandHelp = () => {
    const commandHelp = getCommandHelp();
    const commandExamples = getCommandExamples();
    
    return (
      <div className="text-sm text-muted-foreground space-y-3 p-2">
        <p>Commands use the following format:</p>
        <pre className="bg-muted p-2 rounded-sm text-xs">/command_type#command_id{'{parameters}'}</pre>
        
        <p>Available commands:</p>
        <ul className="space-y-1 pl-4">
          {Object.values(CommandType).map((cmd) => (
            <li key={cmd} className="text-xs">
              <code className="bg-muted px-1 rounded-sm">{cmd}</code>
              <span className="ml-2">{commandHelp[cmd] || ''}</span>
            </li>
          ))}
        </ul>
        
        <p>Examples:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {Object.entries(commandExamples).map(([name, example]) => (
            <pre key={name} className="bg-muted p-2 rounded-sm text-xs overflow-x-auto">
              <div className="text-xs font-semibold mb-1">{name}</div>
              {example}
            </pre>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <Card className={`w-full shadow-lg bg-card border-border ${isPinned ? 'border-accent border-2' : ''}`}>
      <CardHeader className="bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Cpu size={18} className="text-accent animate-pulse-accent" />
            <CardTitle className="text-lg">AI Shell Interface</CardTitle>
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleTogglePin}
                  className="h-8 w-8"
                >
                  {isPinned ? <PinOff size={16} /> : <Pin size={16} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isPinned ? 'Unpin window' : 'Pin window (always on top)'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
            <div className="flex justify-between items-center">
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
              
              <div className="flex items-center space-x-2">
                <span className="text-sm">Annotate Mode</span>
                <Switch 
                  checked={isAnnotating} 
                  onCheckedChange={handleToggleAnnotating} 
                />
              </div>
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
            
            {isAnnotating && (
              <div className="mt-2 p-3 border border-accent/30 rounded-md">
                <h3 className="text-sm font-semibold mb-2">Annotate UI Element</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs mb-1 block">Element Selector</label>
                    <input 
                      type="text" 
                      className="w-full p-2 text-xs rounded-sm border border-border"
                      placeholder="#login-button or .navbar"
                      value={currentAnnotation.element}
                      onChange={(e) => setCurrentAnnotation({...currentAnnotation, element: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs mb-1 block">Description/Purpose</label>
                    <input 
                      type="text" 
                      className="w-full p-2 text-xs rounded-sm border border-border"
                      placeholder="Login button that submits credentials"
                      value={currentAnnotation.description}
                      onChange={(e) => setCurrentAnnotation({...currentAnnotation, description: e.target.value})}
                    />
                  </div>
                </div>
                <Button 
                  size="sm" 
                  onClick={handleSaveAnnotation}
                  disabled={!currentAnnotation.element || !currentAnnotation.description}
                  className="w-full"
                >
                  <Save size={14} className="mr-1" />
                  Save Element Annotation
                </Button>
              </div>
            )}
            
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
            
            {annotations.length > 0 && (
              <div className="mt-2">
                <h3 className="text-sm font-semibold mb-1">Saved Annotations:</h3>
                <div className="bg-muted/30 p-2 rounded-md text-xs space-y-1 max-h-[200px] overflow-y-auto">
                  {annotations.map((anno) => (
                    <div key={anno.id} className="p-1 border-b border-border last:border-0">
                      <div className="flex justify-between">
                        <span className="font-semibold">{anno.element}</span>
                        <Button variant="ghost" size="sm" className="h-5 px-1 text-[10px]">
                          <Edit size={10} className="mr-1" />
                          Edit
                        </Button>
                      </div>
                      <span className="text-accent text-[10px]">{anno.description}</span>
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
          Status: <span className={`text-${isPinned ? 'accent' : 'muted-foreground'}`}>
            {isPinned ? 'Pinned' : 'Active'}
          </span>
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
