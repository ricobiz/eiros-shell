
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
  private chatGPTWindow: Window | null = null;
  private windowCheckInterval: number | null = null;
  
  constructor() {
    // Setup automatic reconnection on initialization
    this.setupAutoReconnect();
  }
  
  private setupAutoReconnect() {
    // Check connection status every 5 seconds and reconnect if needed
    this.windowCheckInterval = window.setInterval(() => {
      if (!this.connected || (this.chatGPTWindow && this.chatGPTWindow.closed)) {
        this.connectToAI();
      }
    }, 5000);
  }
  
  isConnected(): boolean {
    // Check if the window is still open
    if (this.chatGPTWindow && this.chatGPTWindow.closed) {
      this.connected = false;
      this.chatGPTWindow = null;
      // Emit disconnection event
      aiSyncEvents.emit(false, 'ChatGPT window was closed');
    }
    return this.connected;
  }
  
  async connectToAI(): Promise<boolean> {
    // If already connected and window is open, do nothing
    if (this.isConnected() && this.chatGPTWindow && !this.chatGPTWindow.closed) {
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
      this.chatGPTWindow = window.open('https://chat.openai.com/', 'ChatGPT', 'width=800,height=600');
      
      if (!this.chatGPTWindow) {
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
      this.chatGPTWindow.focus();
      
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
    if (this.chatGPTWindow && !this.chatGPTWindow.closed) {
      this.chatGPTWindow.close();
    }
    
    this.connected = false;
    this.chatGPTWindow = null;
    
    logService.addLog({
      type: 'info',
      message: 'Disconnected from ChatGPT window',
      timestamp: Date.now()
    });
    
    // Emit sync event
    aiSyncEvents.emit(false, 'ChatGPT window closed');
  }
  
  sendMessageToAI(message: string): void {
    if (!this.isConnected()) {
      // Try to reconnect first
      this.connectToAI().then(connected => {
        if (connected) {
          logService.addLog({
            type: 'info',
            message: 'Reconnected to AI, now can send message',
            timestamp: Date.now()
          });
          
          this.sendMessageAfterConnection(message);
        } else {
          logService.addLog({
            type: 'warning',
            message: 'Cannot send message: Failed to reconnect to AI',
            timestamp: Date.now()
          });
        }
      });
      return;
    }
    
    this.sendMessageAfterConnection(message);
  }
  
  private sendMessageAfterConnection(message: string): void {
    // Focus the window to make it visible to the user
    if (this.chatGPTWindow && !this.chatGPTWindow.closed) {
      this.chatGPTWindow.focus();
      
      logService.addLog({
        type: 'info',
        message: 'Message ready to send to ChatGPT',
        timestamp: Date.now(),
        details: { message }
      });
      
      // In the browser approach, the message is shown to the user to paste manually
      console.log('Ready to send to ChatGPT:', message);
      
      // We could try to copy to clipboard as well
      try {
        navigator.clipboard.writeText(message).then(() => {
          logService.addLog({
            type: 'info',
            message: 'Message copied to clipboard for easy pasting',
            timestamp: Date.now()
          });
        });
      } catch (err) {
        logService.addLog({
          type: 'warning',
          message: 'Could not copy message to clipboard',
          timestamp: Date.now(),
          details: err
        });
      }
    }
  }
  
  // Method to clean up resources when service is no longer needed
  cleanup(): void {
    if (this.windowCheckInterval !== null) {
      window.clearInterval(this.windowCheckInterval);
      this.windowCheckInterval = null;
    }
    
    this.disconnectFromAI();
  }
}

export const aiSyncService = new AISyncService();
