
import { Command, CommandType, LogEntry } from "../types/types";
import { memoryService } from "./MemoryService";
import { logService } from "./LogService";

class CommandService {
  private commandQueue: Command[] = [];
  private isProcessing = false;
  private commandHandlers: Record<CommandType, (cmd: Command) => Promise<any>> = {
    [CommandType.CLICK]: this.handleClickCommand.bind(this),
    [CommandType.TYPE]: this.handleTypeCommand.bind(this),
    [CommandType.NAVIGATE]: this.handleNavigateCommand.bind(this),
    [CommandType.SCREENSHOT]: this.handleScreenshotCommand.bind(this),
    [CommandType.LOGIN]: this.handleLoginCommand.bind(this),
    [CommandType.MEMORY_SAVE]: this.handleMemorySaveCommand.bind(this),
    [CommandType.MEMORY_RETRIEVE]: this.handleMemoryRetrieveCommand.bind(this),
    [CommandType.ANALYZE]: this.handleAnalyzeCommand.bind(this)
  };
  
  parseCommand(input: string): Command | null {
    try {
      // Command format: /command_type#command_id{params}
      const regex = /\/(\w+)#([a-zA-Z0-9_-]+)\{(.*)\}/;
      const match = input.match(regex);
      
      if (match) {
        const [, typeStr, id, paramsJson] = match;
        const type = typeStr as CommandType;
        
        // Validate command type
        if (!Object.values(CommandType).includes(type)) {
          logService.addLog({
            type: 'error',
            message: `Invalid command type: ${typeStr}`,
            timestamp: Date.now()
          });
          return null;
        }
        
        try {
          const params = JSON.parse(`{${paramsJson}}`);
          return {
            id,
            type: type,
            params,
            timestamp: Date.now()
          };
        } catch (e) {
          logService.addLog({
            type: 'error',
            message: `Failed to parse command parameters`,
            timestamp: Date.now(),
            details: paramsJson
          });
          return null;
        }
      }
    } catch (error) {
      logService.addLog({
        type: 'error',
        message: `Command parsing error`,
        timestamp: Date.now(),
        details: error
      });
    }
    
    return null;
  }
  
  async executeCommand(command: Command): Promise<any> {
    try {
      logService.addLog({
        type: 'info',
        message: `Executing command: ${command.type}`,
        timestamp: Date.now(),
        details: { id: command.id }
      });
      
      // Store command in memory
      memoryService.addMemoryItem({
        type: 'command',
        data: command,
        tags: [command.type, command.id]
      });
      
      // Execute handler for this command type
      const handler = this.commandHandlers[command.type];
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
    } finally {
      // Continue processing the queue
      setTimeout(() => this.processQueue(), 100);
    }
  }
  
  // Command handlers
  private async handleClickCommand(command: Command): Promise<void> {
    const { x, y, element, waitAfter } = command.params;
    
    logService.addLog({
      type: 'info',
      message: `Simulating click`,
      timestamp: Date.now(),
      details: { x, y, element }
    });
    
    // Simulated click for now
    console.log(`Clicking at position (${x}, ${y}) or element ${element}`);
    
    // Simulate wait if specified
    if (waitAfter) {
      await new Promise(resolve => setTimeout(resolve, waitAfter));
    }
  }
  
  private async handleTypeCommand(command: Command): Promise<void> {
    const { text, element, waitAfter } = command.params;
    
    logService.addLog({
      type: 'info',
      message: `Typing text`,
      timestamp: Date.now(),
      details: { textLength: text?.length, element }
    });
    
    // Simulated typing for now
    console.log(`Typing "${text}" into element ${element}`);
    
    // Simulate wait if specified
    if (waitAfter) {
      await new Promise(resolve => setTimeout(resolve, waitAfter));
    }
  }
  
  private async handleNavigateCommand(command: Command): Promise<void> {
    const { url } = command.params;
    
    logService.addLog({
      type: 'info',
      message: `Navigating to URL`,
      timestamp: Date.now(),
      details: { url }
    });
    
    // In a real implementation, this would navigate within the WebView
    console.log(`Navigating to ${url}`);
  }
  
  private async handleScreenshotCommand(command: Command): Promise<string> {
    logService.addLog({
      type: 'info',
      message: `Taking screenshot`,
      timestamp: Date.now()
    });
    
    // In real implementation, this would take an actual screenshot
    const mockScreenshotData = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=`;
    
    // Store screenshot in memory
    memoryService.addMemoryItem({
      type: 'screenshot',
      data: mockScreenshotData,
      tags: ['screenshot', command.id, new Date().toISOString().split('T')[0]]
    });
    
    return mockScreenshotData;
  }
  
  private async handleLoginCommand(command: Command): Promise<void> {
    const { service, username, password } = command.params;
    
    logService.addLog({
      type: 'info',
      message: `Logging into service`,
      timestamp: Date.now(),
      details: { service, username: username?.substring(0, 2) + '***' }
    });
    
    // Store credentials securely (in reality should encrypt)
    memoryService.addMemoryItem({
      type: 'credentials',
      data: { service, username },
      tags: ['auth', service]
    });
    
    console.log(`Logging into ${service} with user ${username}`);
  }
  
  private async handleMemorySaveCommand(command: Command): Promise<void> {
    const { type, data, tags } = command.params;
    
    const memoryItem = memoryService.addMemoryItem({
      type,
      data,
      tags: Array.isArray(tags) ? tags : [tags]
    });
    
    logService.addLog({
      type: 'success',
      message: `Saved to memory`,
      timestamp: Date.now(),
      details: { id: memoryItem.id, type }
    });
  }
  
  private async handleMemoryRetrieveCommand(command: Command): Promise<any> {
    const { id, type, tags, limit } = command.params;
    
    let result;
    
    if (id) {
      result = memoryService.getMemoryById(id);
    } else {
      result = memoryService.getMemoryItems(type, tags, limit);
    }
    
    logService.addLog({
      type: 'info',
      message: `Retrieved from memory`,
      timestamp: Date.now(),
      details: { count: Array.isArray(result) ? result.length : 1 }
    });
    
    return result;
  }
  
  private async handleAnalyzeCommand(command: Command): Promise<any> {
    const { imageData, area } = command.params;
    
    logService.addLog({
      type: 'info',
      message: `Analyzing content`,
      timestamp: Date.now(),
      details: area ? { area } : {}
    });
    
    // This would be a real vision analysis in a complete implementation
    // For now, return mock data
    const mockAnalysisResult = {
      elements: [
        {
          id: 'elem_1',
          type: 'button',
          rect: { x: 100, y: 200, width: 80, height: 30 },
          text: 'Send',
          confidence: 0.95
        },
        {
          id: 'elem_2',
          type: 'input',
          rect: { x: 50, y: 150, width: 300, height: 40 },
          role: 'textbox',
          confidence: 0.98
        }
      ],
      text: 'Detected text content from image'
    };
    
    // Store analysis results in memory
    memoryService.addMemoryItem({
      type: 'element',
      data: mockAnalysisResult,
      tags: ['analysis', 'ui', command.id]
    });
    
    return mockAnalysisResult;
  }
}

export const commandService = new CommandService();
