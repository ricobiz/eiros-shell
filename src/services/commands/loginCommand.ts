
import { Command, MemoryType } from "../../types/types";
import { logService } from "../LogService";
import { memoryService } from "../MemoryService";
import { handleNavigateCommand } from "./navigationCommand";
import { handleTypeCommand } from "./typeCommand";
import { handleClickCommand } from "./clickCommand";

export async function handleLoginCommand(command: Command): Promise<void> {
  const { service, username, password, url, usernameSelector, passwordSelector, submitSelector } = command.params;
  
  logService.addLog({
    type: 'info',
    message: `Logging into service`,
    timestamp: Date.now(),
    details: { service, username: username?.substring(0, 2) + '***', url }
  });
  
  // Store credentials securely (in reality should encrypt)
  memoryService.addMemoryItem({
    type: MemoryType.CREDENTIALS,
    data: { service, username, url, usernameSelector, passwordSelector, submitSelector },
    tags: ['auth', service]
  });
  
  // If URL is provided, navigate to the login page
  if (url) {
    await handleNavigateCommand({
      id: `nav_to_${service}_${Date.now()}`,
      type: 'navigate',
      params: { url },
      timestamp: Date.now()
    });
    
    // Wait for page to load
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // If selectors are provided, perform auto-login
    if (usernameSelector && passwordSelector && username && password) {
      // Type username
      await handleTypeCommand({
        id: `type_username_${Date.now()}`,
        type: 'type',
        params: { 
          text: username,
          element: usernameSelector,
          waitAfter: 300
        },
        timestamp: Date.now()
      });
      
      // Type password
      await handleTypeCommand({
        id: `type_password_${Date.now()}`,
        type: 'type',
        params: { 
          text: password,
          element: passwordSelector,
          waitAfter: 300
        },
        timestamp: Date.now()
      });
      
      // Click submit button if provided
      if (submitSelector) {
        await handleClickCommand({
          id: `click_submit_${Date.now()}`,
          type: 'click',
          params: { element: submitSelector, waitAfter: 1000 },
          timestamp: Date.now()
        });
        
        logService.addLog({
          type: 'success',
          message: `Auto-login sequence completed`,
          timestamp: Date.now(),
          details: { service }
        });
      }
    }
  }
  
  console.log(`Logging into ${service} with user ${username}`);
}

// Function to handle automatic login with saved credentials
export async function performAutoLogin(serviceIdentifier: string): Promise<boolean> {
  // Find credentials for the requested service
  const credentials = memoryService.getMemoryItems(
    MemoryType.CREDENTIALS, 
    [serviceIdentifier], 
    1
  );
  
  if (credentials.length === 0) {
    logService.addLog({
      type: 'warning',
      message: `No saved credentials found for ${serviceIdentifier}`,
      timestamp: Date.now()
    });
    return false;
  }
  
  const credentialData = credentials[0].data;
  
  if (!credentialData.url) {
    logService.addLog({
      type: 'warning',
      message: `Saved credentials for ${serviceIdentifier} do not include URL`,
      timestamp: Date.now()
    });
    return false;
  }
  
  // Execute login command with saved credentials
  await handleLoginCommand({
    id: `auto_login_${Date.now()}`,
    type: 'login',
    params: credentialData,
    timestamp: Date.now()
  });
  
  return true;
}
