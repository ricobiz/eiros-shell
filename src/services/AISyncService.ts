
import { logService } from "./LogService";

// Event system for AI sync events
export const aiSyncEvents = {
  listeners: new Set<(connected: boolean, message?: string) => void>(),
  
  subscribe(callback: (connected: boolean, message?: string) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  },
  
  emit(connected: boolean, message?: string) {
    this.listeners.forEach(callback => callback(connected, message));
  }
};

class AISyncService {
  private connected: boolean = false;
  private connectionAttempts: number = 0;
  private readonly MAX_ATTEMPTS = 3;
  
  isConnected(): boolean {
    return this.connected;
  }
  
  async connectToAI(): Promise<boolean> {
    if (this.connected) {
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
      
      // Mark as connected since we're using the browser window approach
      this.connected = true;
      this.connectionAttempts = 0;
      
      logService.addLog({
        type: 'success',
        message: 'ChatGPT browser window opened',
        timestamp: Date.now()
      });
      
      // Emit sync event
      aiSyncEvents.emit(true, 'ChatGPT browser window opened');
      
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
          message: 'Maximum connection attempts reached. Please try again later.',
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
    
    this.connected = false;
    logService.addLog({
      type: 'info',
      message: 'Disconnected from ChatGPT window',
      timestamp: Date.now()
    });
    
    // Emit sync event
    aiSyncEvents.emit(false, 'ChatGPT window closed');
  }
  
  sendMessageToAI(message: string): void {
    if (!this.connected) {
      logService.addLog({
        type: 'warning',
        message: 'Cannot send message: Not connected to AI',
        timestamp: Date.now()
      });
      return;
    }
    
    logService.addLog({
      type: 'info',
      message: 'Message ready to send to ChatGPT',
      timestamp: Date.now(),
      details: { message }
    });
    
    // In the browser approach, the message is shown to the user to paste manually
    console.log('Ready to send to ChatGPT:', message);
  }
}

export const aiSyncService = new AISyncService();
