
import { aiSyncEvents } from './events';
import { logService } from '../LogService';
import { messagingService } from './messagingService';
import { windowManager } from './windowManager';
import { AIConnectionService } from './connectionService';

class AISyncService {
  private connectionService: AIConnectionService;
  private instructionsCache: string | null = null;
  
  constructor() {
    this.connectionService = new AIConnectionService(windowManager);
  }
  
  /**
   * Connect to the AI backend
   */
  async connectToAI(): Promise<boolean> {
    try {
      const connected = await this.connectionService.connectToAI();
      
      if (connected) {
        logService.addLog({
          type: 'success',
          message: 'Successfully connected to AI',
          timestamp: Date.now()
        });
        
        // After successful connection, set up a message listener
        this.setupMessageListener();
      }
      
      return connected;
    } catch (error) {
      console.error('Failed to connect to AI:', error);
      
      logService.addLog({
        type: 'error',
        message: 'Failed to connect to AI',
        timestamp: Date.now(),
        details: error instanceof Error ? error.message : String(error)
      });
      
      return false;
    }
  }
  
  /**
   * Set up listener for messages from ChatGPT window
   */
  private setupMessageListener(): void {
    // Remove any existing listeners first to prevent duplicates
    window.removeEventListener('message', this.handleWindowMessage);
    
    // Add the event listener
    window.addEventListener('message', this.handleWindowMessage);
    
    logService.addLog({
      type: 'info',
      message: 'Message listener set up for ChatGPT communication',
      timestamp: Date.now()
    });
  }
  
  /**
   * Handle messages from ChatGPT window
   */
  private handleWindowMessage = (event: MessageEvent): void => {
    try {
      // Log all messages for debugging
      console.log('Window message received:', event.data);
      
      // Check if this is a message from ChatGPT
      if (event.data && typeof event.data === 'object' && 
          (event.data.type === 'CHATGPT_RESPONSE' || event.data.type === 'EIROS_RESPONSE')) {
        
        console.log('Received message from ChatGPT window:', event.data);
        
        // Process the response
        messagingService.processAIResponse(event.data.message || event.data.content, true);
        
        logService.addLog({
          type: 'info',
          message: 'Received message from ChatGPT',
          timestamp: Date.now(),
          details: { message: event.data.message || event.data.content }
        });
      }
    } catch (error) {
      console.error('Error handling window message:', error);
      
      logService.addLog({
        type: 'error',
        message: 'Error handling window message',
        timestamp: Date.now(),
        details: error instanceof Error ? error.message : String(error)
      });
    }
  };
  
  /**
   * Disconnect from the AI backend
   */
  disconnectFromAI(): void {
    // Remove message listener
    window.removeEventListener('message', this.handleWindowMessage);
    
    this.connectionService.disconnectFromAI();
    
    logService.addLog({
      type: 'info',
      message: 'Disconnected from AI',
      timestamp: Date.now()
    });
  }
  
  /**
   * Check if currently connected to the AI backend
   */
  isConnected(): boolean {
    return this.connectionService.isConnected();
  }
  
  /**
   * Get the ChatGPT window reference directly (for debugging)
   */
  getChatGPTWindow(): Window | null {
    return windowManager.getWindow();
  }
  
  /**
   * Emergency stop - halt all operations
   */
  emergencyStop(): void {
    // Remove message listener
    window.removeEventListener('message', this.handleWindowMessage);
    
    this.connectionService.disconnectFromAI();
    
    logService.addLog({
      type: 'warning',
      message: 'Emergency stop triggered',
      timestamp: Date.now()
    });
  }
  
  /**
   * Clean up resources
   */
  cleanup(): void {
    // Remove message listener
    window.removeEventListener('message', this.handleWindowMessage);
    
    if (this.isConnected()) {
      this.disconnectFromAI();
    }
  }
  
  /**
   * Send a message to the AI
   */
  sendMessageToAI(message: string): boolean {
    return messagingService.sendMessageToAI(message, this.isConnected());
  }
  
  /**
   * Process a response from AI
   */
  processAIResponse(response: string): void {
    messagingService.processAIResponse(response, this.isConnected());
  }
  
  /**
   * Get the instructions file content for AI
   */
  async getInstructionsFile(): Promise<string> {
    if (this.instructionsCache) {
      return this.instructionsCache;
    }
    
    try {
      // In a real implementation, this would load from the ai_integration_instructions.txt file
      // For now, we'll use fetch to get the file content from the public directory
      const response = await fetch('/ai_integration_instructions.txt');
      
      if (!response.ok) {
        throw new Error(`Failed to load instructions file: ${response.status}`);
      }
      
      const instructions = await response.text();
      this.instructionsCache = instructions;
      return instructions;
    } catch (error) {
      console.error('Error loading instructions:', error);
      
      // Fallback to a basic set of instructions if file loading fails
      return '[EirosShell AI Bootstrap Instructions]\n\nYou are connected to EirosShell — an autonomous AI-interactive shell.\n\n✅ Use the DSL format for commands.\n\nExample: /click#cmd1{ "element": "#submit" }';
    }
  }
}

// Import CommandType for documentation generation
import { CommandType } from "@/types/types";
export const aiSyncService = new AISyncService();
