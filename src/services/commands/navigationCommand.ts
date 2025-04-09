
import { Command } from "../../types/types";
import { logService } from "../LogService";

// We need a way to communicate between components
// This is a simple event system for navigation events
export const navigationEvents = {
  listeners: new Set<(url: string) => void>(),
  
  subscribe(callback: (url: string) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  },
  
  emit(url: string) {
    this.listeners.forEach(callback => callback(url));
  }
};

export async function handleNavigateCommand(command: Command): Promise<void> {
  const { url } = command.params;
  
  logService.addLog({
    type: 'info',
    message: `Navigating to URL`,
    timestamp: Date.now(),
    details: { url }
  });
  
  // Emit navigation event to update browser preview
  navigationEvents.emit(url);
  
  // In a real implementation, this would navigate within the WebView
  console.log(`Navigating to ${url}`);
}
