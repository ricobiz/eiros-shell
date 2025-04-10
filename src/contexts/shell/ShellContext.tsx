
import React, { createContext, useContext, useEffect } from 'react';
import { ShellContextType } from './types';
import { useShellTabs } from '@/hooks/useShellTabs';
import { useShellCommands } from '@/hooks/useShellCommands';
import { useShellMemory } from '@/hooks/useShellMemory';
import { useAISync } from '@/hooks/useAISync';
import { useShellUI } from '@/hooks/useShellUI';
import { useShellPatterns } from '@/hooks/useShellPatterns';

// Create the context with a default undefined value
const ShellContext = createContext<ShellContextType | undefined>(undefined);

export const ShellProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Compose all our hooks to build the complete state
  const tabsState = useShellTabs();
  const commandState = useShellCommands();
  const memoryState = useShellMemory();
  const aiState = useAISync();
  const uiState = useShellUI();
  const patternState = useShellPatterns();

  // Combine all states into a single value object
  const value: ShellContextType = {
    ...tabsState,
    ...commandState,
    ...memoryState,
    ...aiState,
    ...uiState,
    ...patternState
  };

  useEffect(() => {
    console.log('ShellProvider initialized with context value:', Object.keys(value));
  }, [value]);

  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>;
};

export const useShell = (): ShellContextType => {
  const context = useContext(ShellContext);
  
  if (context === undefined) {
    console.error('useShell was called outside of ShellProvider - context is undefined');
    throw new Error('useShell must be used within a ShellProvider');
  }
  
  console.log('useShell called successfully, returning context with keys:', Object.keys(context));
  return context;
};
