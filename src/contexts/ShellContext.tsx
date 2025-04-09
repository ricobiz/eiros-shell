
import React, { createContext, useContext, useState, useEffect } from 'react';
import { CommandType, MemoryItem } from '@/types/types';
import { commandService } from '@/services/CommandService';
import { logService } from '@/services/LogService';
import { navigationEvents } from '@/services/commands/navigationCommand';
import { aiSyncService, aiSyncEvents } from '@/services/AISyncService';
import { useToast } from '@/hooks/use-toast';

type ShellContextType = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  commandResult: any;
  setCommandResult: (result: any) => void;
  selectedMemory: MemoryItem | null;
  setSelectedMemory: (item: MemoryItem | null) => void;
  isPinned: boolean;
  setIsPinned: (pinned: boolean) => void;
  isAnnotating: boolean;
  setIsAnnotating: (annotating: boolean) => void;
  isConnectedToAI: boolean;
  setIsConnectedToAI: (connected: boolean) => void;
  annotations: {id: string, element: string, description: string}[];
  setAnnotations: React.Dispatch<React.SetStateAction<{id: string, element: string, description: string}[]>>;
  currentAnnotation: {element: string, description: string};
  setCurrentAnnotation: React.Dispatch<React.SetStateAction<{element: string, description: string}>>;
  browserUrl: string;
  setBrowserUrl: (url: string) => void;
  handleCommandExecuted: (result: any) => void;
  handleMemoryItemSelected: (item: MemoryItem) => void;
  handleClearLogs: () => void;
  handleTakeScreenshot: () => Promise<void>;
  handleAnalyzeInterface: () => Promise<void>;
  handleTogglePin: () => void;
  handleToggleAIConnection: () => Promise<void>;
  handleToggleAnnotating: () => void;
  handleSaveAnnotation: () => void;
  handleCurrentAnnotationChange: (annotation: {element: string, description: string}) => void;
};

const ShellContext = createContext<ShellContextType | undefined>(undefined);

export const ShellProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  const value = {
    activeTab,
    setActiveTab,
    commandResult,
    setCommandResult,
    selectedMemory,
    setSelectedMemory,
    isPinned,
    setIsPinned,
    isAnnotating,
    setIsAnnotating,
    isConnectedToAI,
    setIsConnectedToAI,
    annotations,
    setAnnotations,
    currentAnnotation,
    setCurrentAnnotation,
    browserUrl,
    setBrowserUrl,
    handleCommandExecuted,
    handleMemoryItemSelected,
    handleClearLogs,
    handleTakeScreenshot,
    handleAnalyzeInterface,
    handleTogglePin,
    handleToggleAIConnection,
    handleToggleAnnotating,
    handleSaveAnnotation,
    handleCurrentAnnotationChange
  };

  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>;
};

export const useShell = (): ShellContextType => {
  const context = useContext(ShellContext);
  if (context === undefined) {
    throw new Error('useShell must be used within a ShellProvider');
  }
  return context;
};
