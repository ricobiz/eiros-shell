
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
      }
      
      return connected;
    } catch (error) {
      console.error('Failed to connect to AI:', error);
      
      logService.addLog({
        type: 'error',
        message: 'Failed to connect to AI',
        timestamp: Date.now(),
        details: error
      });
      
      return false;
    }
  }
  
  /**
   * Disconnect from the AI backend
   */
  disconnectFromAI(): void {
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
   * Emergency stop - halt all operations
   */
  emergencyStop(): void {
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
