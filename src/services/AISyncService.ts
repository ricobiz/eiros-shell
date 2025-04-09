
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
      // In a real implementation, this would establish a connection to an AI service
      // For now, we'll simulate a successful connection
      logService.addLog({
        type: 'info',
        message: 'Attempting to connect to AI...',
        timestamp: Date.now()
      });
      
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate success
      this.connected = true;
      this.connectionAttempts = 0;
      
      logService.addLog({
        type: 'success',
        message: 'AI connection established',
        timestamp: Date.now()
      });
      
      // Emit sync event
      aiSyncEvents.emit(true, 'AI connection successful');
      
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
      message: 'Disconnected from AI',
      timestamp: Date.now()
    });
    
    // Emit sync event
    aiSyncEvents.emit(false, 'AI disconnected');
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
      message: 'Message sent to AI',
      timestamp: Date.now(),
      details: { message }
    });
    
    // In a real implementation, this would send the message to the AI service
    console.log('Sending message to AI:', message);
  }
}

export const aiSyncService = new AISyncService();
