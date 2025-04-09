
import { Command, CommandType, MemoryType } from "../types/types";
import { memoryService } from "./MemoryService";
import { CommandParser } from "./CommandParser";
import { CommandQueue } from "./CommandQueue";

class CommandService {
  private commandQueue = new CommandQueue();
  
  parseCommand(input: string): Command | null {
    return CommandParser.parseCommand(input);
  }
  
  async executeCommand(command: Command): Promise<any> {
    // Store command in memory
    memoryService.addMemoryItem({
      type: MemoryType.COMMAND,
      data: command,
      tags: [command.type, command.id]
    });
    
    // Execute the command
    return await this.commandQueue.executeCommand(command);
  }
  
  queueCommand(command: Command): void {
    this.commandQueue.queueCommand(command);
  }
}

export const commandService = new CommandService();
