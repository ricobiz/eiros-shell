
import { AIWindowManager, AIConnectionOptions } from './types';

export class ChatGPTWindowManager implements AIWindowManager {
  private window: Window | null = null;
  
  openWindow(url: string, options: AIConnectionOptions = {}): Window | null {
    if (this.window && !this.window.closed) {
      this.focusWindow();
      return this.window;
    }
    
    const windowName = options.windowName || 'ChatGPT';
    const windowFeatures = options.windowFeatures || 'width=800,height=600';
    
    this.window = window.open(url, windowName, windowFeatures);
    return this.window;
  }
  
  closeWindow(): void {
    if (this.window && !this.window.closed) {
      this.window.close();
    }
    this.window = null;
  }
  
  isWindowOpen(): boolean {
    return !!(this.window && !this.window.closed);
  }
  
  focusWindow(): boolean {
    if (this.window && !this.window.closed) {
      this.window.focus();
      return true;
    }
    return false;
  }
}
