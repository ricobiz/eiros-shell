
import { Command, CommandType } from "../types/types";
import { logService } from "./LogService";

export class CommandParser {
  static parseCommand(input: string): Command | null {
    try {
      // Command format: /command_type#command_id{params}
      const regex = /\/(\w+)#([a-zA-Z0-9_-]+)\{(.*)\}/;
      const match = input.match(regex);
      
      if (match) {
        const [, typeStr, id, paramsJson] = match;
        let type: CommandType;
        
        // Map command type aliases to actual command types
        switch (typeStr.toLowerCase()) {
          case 'shell': 
            type = CommandType.SHELL; 
            break;
          case 'restart': 
            type = CommandType.RESTART; 
            break;
          case 'kill': 
            type = CommandType.KILL; 
            break;
          case 'read': 
            type = CommandType.READ_FILE; 
            break;
          case 'write': 
            type = CommandType.WRITE_FILE; 
            break;
          case 'ls': 
            type = CommandType.LIST_DIR; 
            break;
          default:
            // Try to use the direct command type
            type = typeStr as CommandType;
        }
        
        // Validate command type
        const validTypes = Object.values(CommandType);
        if (!validTypes.includes(type)) {
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
            type,
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
}
