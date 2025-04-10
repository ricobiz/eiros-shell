
import React, { createContext, useContext } from 'react';
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

  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>;
};

export const useShell = (): ShellContextType => {
  const context = useContext(ShellContext);
  if (context === undefined) {
    throw new Error('useShell must be used within a ShellProvider');
  }
  return context;
};
