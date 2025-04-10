
import { MemoryItem } from '@/types/types';

export interface ShellTabsState {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  browserUrl: string;
  setBrowserUrl: (url: string) => void;
}

export interface ShellCommandState {
  commandResult: any;
  setCommandResult: (result: any) => void;
  handleCommandExecuted: (result: any) => void;
}

export interface ShellMemoryState {
  selectedMemory: MemoryItem | null;
  setSelectedMemory: (item: MemoryItem | null) => void;
  handleMemoryItemSelected: (item: MemoryItem) => void;
  handleClearLogs: () => void;
  handleTakeScreenshot: () => Promise<void>;
  handleAnalyzeInterface: () => Promise<void>;
}

export interface ShellAIState {
  isConnectedToAI: boolean;
  setIsConnectedToAI: (connected: boolean) => void;
  handleToggleAIConnection: () => Promise<void>;
  handleEmergencyStop: () => void;
}

export interface ShellUIState {
  isPinned: boolean;
  setIsPinned: (pinned: boolean) => void;
  isAnnotating: boolean;
  setIsAnnotating: (annotating: boolean) => void;
  annotations: {id: string, element: string, description: string}[];
  setAnnotations: React.Dispatch<React.SetStateAction<{id: string, element: string, description: string}[]>>;
  currentAnnotation: {element: string, description: string};
  setCurrentAnnotation: React.Dispatch<React.SetStateAction<{element: string, description: string}>>;
  handleTogglePin: () => void;
  handleToggleAnnotating: () => void;
  handleSaveAnnotation: () => void;
  handleCurrentAnnotationChange: (annotation: {element: string, description: string}) => void;
}

export type ShellContextType = ShellTabsState & 
  ShellCommandState & 
  ShellMemoryState & 
  ShellAIState & 
  ShellUIState;
