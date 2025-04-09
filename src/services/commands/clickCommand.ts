
import { Command } from "../../types/types";
import { logService } from "../LogService";

export async function handleClickCommand(command: Command): Promise<void> {
  const { x, y, element, waitAfter, doubleClick, rightClick } = command.params;
  
  const clickType = rightClick ? 'right click' : (doubleClick ? 'double click' : 'click');
  
  logService.addLog({
    type: 'info',
    message: `Simulating ${clickType}`,
    timestamp: Date.now(),
    details: { x, y, element }
  });
  
  // Simulated click for now
  if (element) {
    console.log(`${clickType} on element ${element}`);
  } else if (x !== undefined && y !== undefined) {
    console.log(`${clickType} at position (${x}, ${y})`);
  } else {
    logService.addLog({
      type: 'warning',
      message: `Click command missing target (element or coordinates)`,
      timestamp: Date.now()
    });
  }
  
  // Simulate wait if specified
  if (waitAfter) {
    await new Promise(resolve => setTimeout(resolve, waitAfter));
  }
}
