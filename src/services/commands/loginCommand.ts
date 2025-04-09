
import { Command, MemoryType } from "../../types/types";
import { logService } from "../LogService";
import { memoryService } from "../MemoryService";

export async function handleLoginCommand(command: Command): Promise<void> {
  const { service, username, password } = command.params;
  
  logService.addLog({
    type: 'info',
    message: `Logging into service`,
    timestamp: Date.now(),
    details: { service, username: username?.substring(0, 2) + '***' }
  });
  
  // Store credentials securely (in reality should encrypt)
  memoryService.addMemoryItem({
    type: MemoryType.CREDENTIALS,
    data: { service, username },
    tags: ['auth', service]
  });
  
  console.log(`Logging into ${service} with user ${username}`);
}
