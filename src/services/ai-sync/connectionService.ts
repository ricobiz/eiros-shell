
import { logService } from '../LogService';
import { aiSyncEvents } from './events';
import { AIWindowManager } from './types';

export class AIConnectionService {
  private connected: boolean = false;
  private connectionAttempts: number = 0;
  private readonly MAX_ATTEMPTS = 3;
  private readonly AI_URL = 'https://chat.openai.com/';
  
  constructor(private windowManager: AIWindowManager) {}
  
  isConnected(): boolean {
    // Check if the window is still open
    if (!this.windowManager.isWindowOpen() && this.connected) {
      this.connected = false;
      // Emit disconnection event
      aiSyncEvents.emit(false, 'ChatGPT window was closed');
    }
    return this.connected;
  }
  
  async connectToAI(): Promise<boolean> {
    // If already connected and window is open, do nothing
    if (this.isConnected() && this.windowManager.isWindowOpen()) {
      logService.addLog({
        type: 'info',
        message: 'Already connected to AI',
        timestamp: Date.now()
      });
      return true;
    }
    
    this.connectionAttempts++;
    
    try {
      // When connecting to browser-based ChatGPT, log the attempt
      logService.addLog({
        type: 'info',
        message: 'Opening connection to browser-based ChatGPT...',
        timestamp: Date.now()
      });
      
      // Open ChatGPT in a new window
      const chatWindow = this.windowManager.openWindow(this.AI_URL);
      
      if (!chatWindow) {
        throw new Error('Failed to open ChatGPT window. Popup might be blocked.');
      }
      
      // Mark as connected since we successfully opened the window
      this.connected = true;
      this.connectionAttempts = 0;
      
      logService.addLog({
        type: 'success',
        message: 'ChatGPT browser window opened',
        timestamp: Date.now()
      });
      
      // Emit sync event
      aiSyncEvents.emit(true, 'ChatGPT browser window opened');
      
      // Focus the window
      this.windowManager.focusWindow();
      
      return true;
    } catch (error) {
      logService.addLog({
        type: 'error',
        message: `AI connection failed (attempt ${this.connectionAttempts}/${this.MAX_ATTEMPTS})`,
        timestamp: Date.now(),
        details: error
      });
      
      if (this.connectionAttempts >= this.MAX_ATTEMPTS) {
        this.connectionAttempts = 0;
        logService.addLog({
          type: 'warning',
          message: 'Maximum connection attempts reached. Will try again later.',
          timestamp: Date.now()
        });
      }
      
      // Emit sync event
      aiSyncEvents.emit(false, 'AI connection failed');
      
      return false;
    }
  }
  
  disconnectFromAI(): void {
    if (!this.connected) {
      return;
    }
    
    // Close the window if it's open
    this.windowManager.closeWindow();
    
    this.connected = false;
    
    logService.addLog({
      type: 'info',
      message: 'Disconnected from ChatGPT window',
      timestamp: Date.now()
    });
    
    // Emit sync event
    aiSyncEvents.emit(false, 'ChatGPT window closed');
  }
}
