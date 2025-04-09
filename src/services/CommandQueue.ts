
import { Command } from "../types/types";
import { logService } from "./LogService";
import { commandHandlers } from "./commands";

export class CommandQueue {
  private commandQueue: Command[] = [];
  private isProcessing = false;
  
  queueCommand(command: Command): void {
    this.commandQueue.push(command);
    
    if (!this.isProcessing) {
      this.processQueue();
    }
  }
  
  private async processQueue(): Promise<void> {
    if (this.commandQueue.length === 0) {
      this.isProcessing = false;
      return;
    }
    
    this.isProcessing = true;
    const command = this.commandQueue.shift();
    
    try {
      if (command) {
        await this.executeCommand(command);
      }
    } catch (error) {
      console.error('Error processing command:', error);
      logService.addLog({
        type: 'error',
        message: `Command execution error`,
        timestamp: Date.now(),
        details: { error, command: command?.type }
      });
    } finally {
      // Continue processing the queue
      setTimeout(() => this.processQueue(), 100);
    }
  }
  
  async executeCommand(command: Command): Promise<any> {
    try {
      logService.addLog({
        type: 'info',
        message: `Executing command: ${command.type}`,
        timestamp: Date.now(),
        details: { id: command.id }
      });
      
      // Execute handler for this command type
      const handler = commandHandlers[command.type];
      if (handler) {
        return await handler(command);
      } else {
        throw new Error(`No handler for command type: ${command.type}`);
      }
    } catch (error) {
      logService.addLog({
        type: 'error',
        message: `Command execution failed: ${command.type}`,
        timestamp: Date.now(),
        details: { error, command }
      });
      throw error;
    }
  }
}
