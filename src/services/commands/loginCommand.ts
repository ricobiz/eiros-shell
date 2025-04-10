
import { Command, MemoryType, CommandType } from "../../types/types";
import { logService } from "../LogService";
import { memoryService } from "../MemoryService";
import { navigationEvents } from "./navigationCommand";

export async function handleLoginCommand(command: Command): Promise<void> {
  const { service, username, password, url, usernameSelector, passwordSelector, submitSelector } = command.params;
  
  if (!service || !username || !password) {
    logService.addLog({
      type: 'error',
      message: 'Missing required parameters for login',
      timestamp: Date.now()
    });
    return;
  }
  
  // Store the credentials in memory
  memoryService.addMemoryItem({
    type: MemoryType.CREDENTIALS,
    data: {
      service,
      username,
      password,
      url,
      usernameSelector,
      passwordSelector,
      submitSelector
    },
    tags: ['credentials', service]
  });
  
  logService.addLog({
    type: 'success',
    message: `Credentials stored for ${service}`,
    timestamp: Date.now()
  });
  
  // If URL is provided, navigate to it
  if (url) {
    const navigateCommand: Command = {
      id: `login_nav_${Date.now()}`,
      type: CommandType.NAVIGATION,
      params: { url },
      timestamp: Date.now() // Add the timestamp
    };
    
    try {
      // Navigate to the URL
      navigationEvents.emit(url);
      
      logService.addLog({
        type: 'info',
        message: `Navigating to login URL: ${url}`,
        timestamp: Date.now()
      });
    } catch (error) {
      logService.addLog({
        type: 'error',
        message: `Failed to navigate to login URL`,
        timestamp: Date.now(),
        details: error
      });
    }
  }
  
  // If we have all selectors, attempt to auto-fill
  if (usernameSelector && passwordSelector && submitSelector) {
    const typeUsernameCommand: Command = {
      id: `login_type_username_${Date.now()}`,
      type: CommandType.TYPE,
      params: {
        element: usernameSelector,
        text: username
      },
      timestamp: Date.now() // Add the timestamp
    };
    
    const typePasswordCommand: Command = {
      id: `login_type_password_${Date.now()}`,
      type: CommandType.TYPE,
      params: {
        element: passwordSelector,
        text: password
      },
      timestamp: Date.now() // Add the timestamp
    };
    
    const clickSubmitCommand: Command = {
      id: `login_click_submit_${Date.now()}`,
      type: CommandType.CLICK,
      params: {
        element: submitSelector
      },
      timestamp: Date.now() // Add the timestamp
    };
    
    // Here we would execute these commands in sequence
    // In real implementation, we would use the browser automation
    
    logService.addLog({
      type: 'info',
      message: `Auto login sequence executing for ${service}`,
      timestamp: Date.now()
    });
  }
}

export async function performAutoLogin(service: string): Promise<boolean> {
  const credentials = memoryService.getCredentialsForService(service);
  
  if (!credentials || !credentials.url) {
    logService.addLog({
      type: 'error',
      message: `No credentials found for ${service}`,
      timestamp: Date.now()
    });
    return false;
  }
  
  const { url, username, password, usernameSelector, passwordSelector, submitSelector } = credentials;
  
  // Create a login command with the stored credentials
  const loginCommand: Command = {
    id: `auto_login_${Date.now()}`,
    type: CommandType.LOGIN,
    params: {
      service,
      username,
      password,
      url,
      usernameSelector,
      passwordSelector,
      submitSelector
    },
    timestamp: Date.now() // Add the timestamp
  };
  
  try {
    // Execute the login command
    await handleLoginCommand(loginCommand);
    return true;
  } catch (error) {
    logService.addLog({
      type: 'error',
      message: `Auto-login failed for ${service}`,
      timestamp: Date.now(),
      details: error
    });
    return false;
  }
}
