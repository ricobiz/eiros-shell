
import { logService } from '../LogService';
import { aiSyncEvents } from './events';
import { AIWindowManager, AIConnectionState } from './types';

export class AIConnectionService {
  private connected: boolean = false;
  private connectionAttempts: number = 0;
  private readonly MAX_ATTEMPTS = 3;
  private readonly MAX_RECONNECT_INTERVAL = 30000; // 30 seconds
  private lastConnectionAttempt: number = 0;
  private readonly AI_URL = 'https://chat.openai.com/';
  private readonly COOLDOWN_PERIOD = 5000; // 5 second cooldown between connection attempts
  private connectionState: AIConnectionState = AIConnectionState.DISCONNECTED;
  
  constructor(private windowManager: AIWindowManager) {}
  
  isConnected(): boolean {
    // Only check if window is still open if we think we're connected
    if (this.connected) {
      // Check if the window is still open
      if (!this.windowManager.isWindowOpen()) {
        this.connected = false;
        this.connectionState = AIConnectionState.DISCONNECTED;
        // Emit disconnection event
        aiSyncEvents.emit(false, 'AI window was closed');
        
        logService.addLog({
          type: 'warning',
          message: 'Connection to AI lost (window closed)',
          timestamp: Date.now()
        });
      }
    }
    return this.connected;
  }
  
  getConnectionState(): AIConnectionState {
    return this.connectionState;
  }
  
  async connectToAI(): Promise<boolean> {
    // Prevent connection spam by enforcing a cooldown period
    const now = Date.now();
    if ((now - this.lastConnectionAttempt) < this.COOLDOWN_PERIOD) {
      logService.addLog({
        type: 'info',
        message: 'Connection attempt rejected. Please wait a few seconds before trying again.',
        timestamp: Date.now()
      });
      return this.connected;
    }
    
    // If already connected and window is open, do nothing
    if (this.isConnected() && this.windowManager.isWindowOpen()) {
      logService.addLog({
        type: 'info',
        message: 'Already connected to AI',
        timestamp: Date.now()
      });
      return true;
    }
    
    this.lastConnectionAttempt = now;
    this.connectionAttempts++;
    this.connectionState = AIConnectionState.CONNECTING;
    
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
        this.connectionState = AIConnectionState.ERROR;
        const errorMessage = 'Failed to open ChatGPT window. Check if popup blocker is active or permissions are granted.';
        throw new Error(errorMessage);
      }
      
      // Introduce a delay to ensure the window has time to load
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Check if window is still open after delay
      if (!this.windowManager.isWindowOpen()) {
        this.connectionState = AIConnectionState.ERROR;
        throw new Error('ChatGPT window was closed too quickly. Popup blocker may be active or window was closed.');
      }
      
      // Inject the communication script into the ChatGPT window
      try {
        const injectionSuccess = await this.injectCommunicationScript();
        if (!injectionSuccess) {
          this.connectionState = AIConnectionState.ERROR;
          throw new Error('Failed to inject communication script into ChatGPT window.');
        }
        
        logService.addLog({
          type: 'success',
          message: 'Communication script injected into ChatGPT window',
          timestamp: Date.now()
        });
      } catch (error) {
        this.connectionState = AIConnectionState.ERROR;
        throw new Error(`Script injection failed: ${error instanceof Error ? error.message : String(error)}`);
      }
      
      // Mark as connected since we successfully opened the window and injected the script
      this.connected = true;
      this.connectionState = AIConnectionState.CONNECTED;
      this.connectionAttempts = 0;
      
      logService.addLog({
        type: 'success',
        message: 'ChatGPT browser window opened and communication established',
        timestamp: Date.now()
      });
      
      // Emit sync event
      aiSyncEvents.emit(true, 'Connected to AI system');
      
      // Focus the window
      this.windowManager.focusWindow();
      
      return true;
    } catch (error) {
      this.connectionState = AIConnectionState.ERROR;
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logService.addLog({
        type: 'error',
        message: `Error connecting to AI (attempt ${this.connectionAttempts}/${this.MAX_ATTEMPTS})`,
        timestamp: Date.now(),
        details: errorMessage
      });
      
      if (this.connectionAttempts >= this.MAX_ATTEMPTS) {
        this.connectionAttempts = 0;
        logService.addLog({
          type: 'warning',
          message: 'Maximum connection attempts reached. Will retry later.',
          timestamp: Date.now()
        });
      }
      
      // Emit sync event
      aiSyncEvents.emit(false, `Failed to connect to AI system: ${errorMessage}`);
      
      return false;
    }
  }
  
  private async injectCommunicationScript(): Promise<boolean> {
    try {
      const chatWindow = this.windowManager.getWindow();
      if (!chatWindow) {
        return false;
      }
      
      // First method: Try to inject via script element
      try {
        const scriptUrl = new URL('/ai_injection.js', window.location.origin).href;
        
        // Create a script element
        chatWindow.document.head.insertAdjacentHTML(
          'beforeend',
          `<script src="${scriptUrl}" id="eiros-shell-script" async></script>`
        );
        
        // Wait for script to load
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // Check if script was loaded
        const scriptElement = chatWindow.document.getElementById('eiros-shell-script');
        if (scriptElement) {
          logService.addLog({
            type: 'info',
            message: 'Script element injected into ChatGPT window',
            timestamp: Date.now()
          });
          return true;
        }
      } catch (e) {
        logService.addLog({
          type: 'warning',
          message: 'Script element injection failed, trying direct code injection',
          timestamp: Date.now(),
          details: e instanceof Error ? e.message : String(e)
        });
      }
      
      // Second method: Fetch the script content and inject directly
      try {
        const response = await fetch('/ai_injection.js');
        if (!response.ok) {
          throw new Error(`Failed to fetch injection script: ${response.status}`);
        }
        
        const scriptContent = await response.text();
        
        // Create a script element with the content
        const scriptElement = chatWindow.document.createElement('script');
        scriptElement.id = 'eiros-shell-script-direct';
        scriptElement.textContent = scriptContent;
        chatWindow.document.head.appendChild(scriptElement);
        
        logService.addLog({
          type: 'info',
          message: 'Script code directly injected into ChatGPT window',
          timestamp: Date.now()
        });
        
        return true;
      } catch (e) {
        logService.addLog({
          type: 'error',
          message: 'Direct script injection failed',
          timestamp: Date.now(),
          details: e instanceof Error ? e.message : String(e)
        });
      }
      
      // If we reached here, both methods failed
      return false;
    } catch (error) {
      logService.addLog({
        type: 'error',
        message: 'Failed to inject communication script',
        timestamp: Date.now(),
        details: error instanceof Error ? error.message : String(error)
      });
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
    this.connectionState = AIConnectionState.DISCONNECTED;
    
    logService.addLog({
      type: 'info',
      message: 'Disconnected from AI window',
      timestamp: Date.now()
    });
    
    // Emit sync event
    aiSyncEvents.emit(false, 'Disconnected from AI system');
  }
}
