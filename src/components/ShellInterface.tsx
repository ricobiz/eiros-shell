
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader
} from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { CommandType, MemoryItem, MemoryType } from '@/types/types';
import { commandService } from '@/services/CommandService';
import { logService } from '@/services/LogService';
import { memoryService } from '@/services/MemoryService';
import { navigationEvents } from '@/services/commands/navigationCommand';
import { useToast } from '@/hooks/use-toast';
import { aiSyncService, aiSyncEvents } from '@/services/AISyncService';

// Import our refactored components
import ShellHeader from './shell/ShellHeader';
import ShellFooter from './shell/ShellFooter';
import TabNavigation from './shell/TabNavigation';
import CommandTab from './shell/CommandTab';
import VisionTab from './shell/VisionTab';
import MemoryTab from './shell/MemoryTab';
import ChatTab from './shell/ChatTab';
import BrowserPreviewTab from './shell/BrowserPreviewTab';
import InstructionsTab from './shell/InstructionsTab';

const ShellInterface: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('command');
  const [commandResult, setCommandResult] = useState<any>(null);
  const [selectedMemory, setSelectedMemory] = useState<MemoryItem | null>(null);
  const [isPinned, setIsPinned] = useState(false);
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [isConnectedToAI, setIsConnectedToAI] = useState(false);
  const [annotations, setAnnotations] = useState<{id: string, element: string, description: string}[]>([]);
  const [currentAnnotation, setCurrentAnnotation] = useState({element: '', description: ''});
  const [browserUrl, setBrowserUrl] = useState('https://example.com');
  
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

  const handleToggleAIConnection = async () => {
    if (isConnectedToAI) {
      aiSyncService.disconnectFromAI();
      setIsConnectedToAI(false);
      toast({
        title: "AI Disconnected",
        description: "Shell has been disconnected from AI",
      });
    } else {
      const connected = await aiSyncService.connectToAI();
      setIsConnectedToAI(connected);
      
      if (connected) {
        toast({
          title: "AI Connected",
          description: "Shell has been successfully connected to AI",
        });
      } else {
        toast({
          title: "Connection Failed",
          description: "Failed to connect to AI. Please try again.",
          variant: "destructive",
        });
      }
    }
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
  
  const handleCurrentAnnotationChange = (annotation: {element: string, description: string}) => {
    setCurrentAnnotation(annotation);
  };

  // Subscribe to navigation events
  useEffect(() => {
    const unsubscribe = navigationEvents.subscribe((url) => {
      setBrowserUrl(url);
      // Automatically switch to browser tab when navigation occurs
      setActiveTab('browser');
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

  // Subscribe to AI sync events
  useEffect(() => {
    const unsubscribe = aiSyncEvents.subscribe((connected, message) => {
      setIsConnectedToAI(connected);
      
      if (message) {
        toast({
          title: connected ? "AI Connected" : "AI Disconnected",
          description: message,
          variant: connected ? "default" : "destructive",
        });
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, [toast]);

  return (
    <Card className={`w-full shadow-lg bg-card border-border ${isPinned ? 'border-accent border-2' : ''}`}>
      <CardHeader className="p-2">
        <ShellHeader 
          isPinned={isPinned} 
          onTogglePin={handleTogglePin} 
          isConnectedToAI={isConnectedToAI}
          onToggleAIConnection={handleToggleAIConnection}
        />
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabNavigation 
          activeTab={activeTab} 
          isConnectedToAI={isConnectedToAI}
        />
        
        <CardContent className="p-4">
          <TabsContent value="command" className="mt-0">
            <CommandTab onCommandExecuted={handleCommandExecuted} />
          </TabsContent>
          
          <TabsContent value="vision" className="mt-0">
            <VisionTab 
              commandResult={commandResult}
              isAnnotating={isAnnotating}
              annotations={annotations}
              currentAnnotation={currentAnnotation}
              onToggleAnnotating={handleToggleAnnotating}
              onCurrentAnnotationChange={handleCurrentAnnotationChange}
              onSaveAnnotation={handleSaveAnnotation}
              onTakeScreenshot={handleTakeScreenshot}
              onAnalyzeInterface={handleAnalyzeInterface}
            />
          </TabsContent>
          
          <TabsContent value="memory" className="mt-0">
            <MemoryTab 
              selectedMemory={selectedMemory}
              onMemoryItemSelected={handleMemoryItemSelected}
            />
          </TabsContent>
          
          <TabsContent value="chat" className="mt-0">
            <ChatTab 
              onClearLogs={handleClearLogs}
              isConnectedToAI={isConnectedToAI}
            />
          </TabsContent>

          <TabsContent value="browser" className="mt-0">
            <BrowserPreviewTab url={browserUrl} setUrl={setBrowserUrl} />
          </TabsContent>

          <TabsContent value="instructions" className="mt-0">
            <InstructionsTab />
          </TabsContent>
        </CardContent>
      </Tabs>
      
      <CardFooter className="p-2">
        <ShellFooter 
          isPinned={isPinned}
          isConnectedToAI={isConnectedToAI}
        />
      </CardFooter>
    </Card>
  );
};

export default ShellInterface;
