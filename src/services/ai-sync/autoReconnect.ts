
import { AIConnectionService } from './connectionService';

export class AutoReconnectService {
  private windowCheckInterval: number | null = null;
  private readonly CHECK_INTERVAL = 30000; // 30 seconds check interval
  private isReconnecting = false;
  private isEnabled = false; // Track whether auto-reconnect is enabled
  
  constructor(private connectionService: AIConnectionService) {}
  
  setupAutoReconnect() {
    // If already running, stop it first to reset
    this.stopAutoReconnect();
    
    // Mark as enabled
    this.isEnabled = true;
    
    // Check connection status periodically and reconnect if needed
    this.windowCheckInterval = window.setInterval(() => {
      // Only attempt reconnection if enabled and not already reconnecting
      if (!this.isEnabled || this.isReconnecting) return;
      
      if (!this.connectionService.isConnected()) {
        this.isReconnecting = true;
        console.log("Auto reconnect attempting to restore connection");
        this.connectionService.connectToAI().finally(() => {
          this.isReconnecting = false;
        });
      }
    }, this.CHECK_INTERVAL);
    
    console.log("Auto reconnect service started");
  }
  
  stopAutoReconnect() {
    this.isEnabled = false; // Disable first to prevent new attempts
    
    if (this.windowCheckInterval !== null) {
      window.clearInterval(this.windowCheckInterval);
      this.windowCheckInterval = null;
      console.log("Auto reconnect service stopped");
    }
  }
  
  isAutoReconnectEnabled(): boolean {
    return this.isEnabled;
  }
}
