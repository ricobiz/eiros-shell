
import { Command } from "../../types/types";
import { logService } from "../LogService";
import { performAutoLogin } from "./loginCommand";

export async function handleAutoLoginCommand(command: Command): Promise<void> {
  const { service } = command.params;
  
  if (!service) {
    logService.addLog({
      type: 'error',
      message: `Auto-login command requires service parameter`,
      timestamp: Date.now()
    });
    return;
  }
  
  logService.addLog({
    type: 'info',
    message: `Attempting auto-login to ${service}`,
    timestamp: Date.now()
  });
  
  const success = await performAutoLogin(service);
  
  if (!success) {
    logService.addLog({
      type: 'error',
      message: `Auto-login to ${service} failed`,
      timestamp: Date.now()
    });
  }
}
