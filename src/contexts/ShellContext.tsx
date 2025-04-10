
// This file is kept for backward compatibility
// It re-exports the refactored context from the shell directory
import { ShellProvider as OriginalShellProvider, useShell as originalUseShell } from './shell/ShellContext';
import type { ShellContextType } from './shell/types';

console.log('Loading backward compatibility ShellContext wrapper');

// Re-export with the same names for backward compatibility
export const ShellProvider = OriginalShellProvider;
export const useShell = originalUseShell;
export type { ShellContextType };
