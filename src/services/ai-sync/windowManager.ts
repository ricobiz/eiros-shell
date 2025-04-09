
import { AIWindowManager, AIConnectionOptions } from './types';
import { logService } from '../LogService';

export class ChatGPTWindowManager implements AIWindowManager {
  private window: Window | null = null;
  private lastWindowCheckTime = 0;
  private readonly WINDOW_CHECK_INTERVAL = 1000; // 1 second
  
  openWindow(url: string, options: AIConnectionOptions = {}): Window | null {
    // If we already have a window and it's not closed, focus it instead of opening a new one
    if (this.window && !this.window.closed) {
      this.focusWindow();
      return this.window;
    }
    
    // Clear the previous window reference if it was closed
    if (this.window && this.window.closed) {
      this.window = null;
    }
    
    const windowName = options.windowName || 'ChatGPT';
    const windowFeatures = options.windowFeatures || 'width=800,height=600';
    
    try {
      this.window = window.open(url, windowName, windowFeatures);
      
      if (!this.window) {
        logService.addLog({
          type: 'error',
          message: 'Window could not be opened. Popup might be blocked.',
          timestamp: Date.now()
        });
        return null;
      }
      
      // Add a load event handler if possible
      if (this.window.addEventListener) {
        this.window.addEventListener('load', () => {
          logService.addLog({
            type: 'info',
            message: 'ChatGPT window loaded',
            timestamp: Date.now()
          });
        });
      }
      
      return this.window;
    } catch (e) {
      logService.addLog({
        type: 'error',
        message: 'Error opening window',
        timestamp: Date.now(),
        details: e
      });
      return null;
    }
  }
  
  closeWindow(): void {
    if (this.window && !this.window.closed) {
      try {
        this.window.close();
      } catch (e) {
        logService.addLog({
          type: 'warning',
          message: 'Error closing window',
          timestamp: Date.now(),
          details: e
        });
      }
    }
    this.window = null;
  }
  
  isWindowOpen(): boolean {
    // Throttle checks to avoid excessive DOM interaction
    const now = Date.now();
    if (now - this.lastWindowCheckTime < this.WINDOW_CHECK_INTERVAL) {
      // If we checked recently, return the last known state
      return !!(this.window && !this.window.closed);
    }
    
    this.lastWindowCheckTime = now;
    
    // Check if window exists and is not closed
    if (!this.window) {
      return false;
    }
    
    try {
      // Try to access a property of the window to see if it's accessible
      // This may throw an error if the window is closed or cross-origin
      const isClosed = this.window.closed;
      return !isClosed;
    } catch (e) {
      // If we can't access the window, it's likely closed or cross-origin
      // Reset our reference
      this.window = null;
      return false;
    }
  }
  
  focusWindow(): boolean {
    if (this.window && !this.window.closed) {
      try {
        this.window.focus();
        return true;
      } catch (e) {
        logService.addLog({
          type: 'warning',
          message: 'Could not focus window',
          timestamp: Date.now(),
          details: e
        });
        return false;
      }
    }
    return false;
  }
}
