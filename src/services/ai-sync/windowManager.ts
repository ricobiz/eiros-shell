
import { AIWindowManager, AIConnectionOptions } from './types';

/**
 * Window manager for handling ChatGPT browser windows
 */
export class WindowManager implements AIWindowManager {
  private chatWindow: Window | null = null;
  private readonly WINDOW_NAME = 'ChatGPTWindow';
  private readonly DEFAULT_FEATURES = 'width=800,height=600,resizable=yes,scrollbars=yes';

  openWindow(url: string, options?: AIConnectionOptions): Window | null {
    const windowName = options?.windowName || this.WINDOW_NAME;
    const windowFeatures = options?.windowFeatures || this.DEFAULT_FEATURES;

    try {
      // Close any existing window first
      if (this.chatWindow && !this.chatWindow.closed) {
        this.chatWindow.close();
      }
      
      // Open new window
      this.chatWindow = window.open(url, windowName, windowFeatures);
      
      // Detect popup blocker
      if (!this.chatWindow || this.chatWindow.closed || typeof this.chatWindow.closed === 'undefined') {
        const errorMessage = 'Popup blocker prevented opening the window';
        console.error(errorMessage);
        throw new Error(errorMessage);
      }
      
      // Focus the window and bring to front
      if (this.chatWindow) {
        this.chatWindow.focus();
        
        // Add event listener for window close
        const interval = setInterval(() => {
          if (this.chatWindow && this.chatWindow.closed) {
            clearInterval(interval);
            console.log('ChatGPT window was closed by user');
            this.chatWindow = null;
          }
        }, 1000);
      }
      
      return this.chatWindow;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to open chat window:', errorMessage);
      this.chatWindow = null;
      return null;
    }
  }

  closeWindow(): void {
    if (this.chatWindow && !this.chatWindow.closed) {
      this.chatWindow.close();
    }
    this.chatWindow = null;
  }

  isWindowOpen(): boolean {
    return this.chatWindow !== null && !this.chatWindow.closed;
  }
  
  getWindow(): Window | null {
    return this.isWindowOpen() ? this.chatWindow : null;
  }

  focusWindow(): boolean {
    if (this.isWindowOpen() && this.chatWindow) {
      try {
        this.chatWindow.focus();
        return true;
      } catch (error) {
        console.error('Failed to focus window:', error);
        return false;
      }
    }
    return false;
  }
}

export const windowManager = new WindowManager();
