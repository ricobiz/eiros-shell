
import { Command } from "../../types/types";
import { logService } from "../LogService";
import { memoryService } from "../MemoryService";

export async function handleMemorySaveCommand(command: Command): Promise<void> {
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

export async function handleMemoryRetrieveCommand(command: Command): Promise<any> {
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
