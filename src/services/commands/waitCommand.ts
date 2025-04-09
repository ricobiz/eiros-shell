
import { Command } from "../../types/types";
import { logService } from "../LogService";

export async function handleWaitCommand(command: Command): Promise<void> {
  const { duration } = command.params;
  
  const waitTime = Number(duration) || 1000;
  
  logService.addLog({
    type: 'info',
    message: `Waiting for ${waitTime}ms`,
    timestamp: Date.now()
  });
  
  await new Promise(resolve => setTimeout(resolve, waitTime));
  
  logService.addLog({
    type: 'success',
    message: `Wait completed`,
    timestamp: Date.now()
  });
}
