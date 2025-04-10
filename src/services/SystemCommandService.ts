
import { SystemCommandResult, FileOperationResult } from '@/types/types';
import { logService } from './LogService';

class SystemCommandService {
  private isAdmin: boolean | null = null;
  private securityWhitelist: string[] = [];
  
  constructor() {
    // Check admin rights on service creation
    this.checkAdminRights();
    
    // Initialize security whitelist
    this.initSecurityWhitelist();
  }
  
  private async checkAdminRights(): Promise<boolean> {
    try {
      // In a real implementation, we would check if running with admin privileges
      // For this frontend implementation, we'll simulate this with a mock result
      const mockIsAdmin = false;
      this.isAdmin = mockIsAdmin;
      
      logService.addLog({
        type: 'info',
        message: `Admin rights check: ${this.isAdmin ? 'Running with admin privileges' : 'Running without admin privileges'}`,
        timestamp: Date.now()
      });
      
      return this.isAdmin;
    } catch (error) {
      logService.addLog({
        type: 'error',
        message: 'Failed to check admin rights',
        timestamp: Date.now(),
        details: error
      });
      return false;
    }
  }
  
  private initSecurityWhitelist(): void {
    // Initialize security whitelist to prevent operations on critical system paths
    this.securityWhitelist = [
      // Common system directories to protect
      '/windows', 'C:\\Windows',
      '/Program Files', 'C:\\Program Files',
      '/Program Files (x86)', 'C:\\Program Files (x86)',
      '/System', '/System32',
      // App directories
      'src', 'node_modules',
      'package.json', 'package-lock.json'
    ];
  }
  
  public hasAdminRights(): boolean {
    return !!this.isAdmin;
  }
  
  public async requestElevation(): Promise<boolean> {
    try {
      logService.addLog({
        type: 'info',
        message: 'Requesting elevation to admin privileges...',
        timestamp: Date.now()
      });
      
      // In a real implementation, this would trigger a UAC prompt
      // For this frontend implementation, we'll simulate the result
      const mockElevationSuccess = false;
      
      if (mockElevationSuccess) {
        this.isAdmin = true;
        logService.addLog({
          type: 'success',
          message: 'Successfully elevated to admin privileges',
          timestamp: Date.now()
        });
      } else {
        logService.addLog({
          type: 'warning',
          message: 'Elevation to admin privileges denied',
          timestamp: Date.now()
        });
      }
      
      return mockElevationSuccess;
    } catch (error) {
      logService.addLog({
        type: 'error',
        message: 'Error requesting elevation',
        timestamp: Date.now(),
        details: error
      });
      return false;
    }
  }
  
  public isPathSecure(path: string): boolean {
    // Check if the path contains any whitelisted sensitive paths
    for (const protectedPath of this.securityWhitelist) {
      if (path.toLowerCase().includes(protectedPath.toLowerCase())) {
        return false;
      }
    }
    return true;
  }
  
  public async executeShellCommand(
    command: string, 
    asAdmin: boolean = false
  ): Promise<SystemCommandResult> {
    try {
      // Check if command contains dangerous operations
      if (this.containsDangerousCommand(command)) {
        return {
          success: false,
          error: 'Command contains potentially dangerous operations and was blocked by security layer',
          exitCode: 403
        };
      }
      
      // Check if admin is required but not available
      if (asAdmin && !this.isAdmin) {
        logService.addLog({
          type: 'warning',
          message: 'Command requires admin privileges',
          timestamp: Date.now(),
          details: { command }
        });
        
        // Try to get admin rights
        const elevated = await this.requestElevation();
        if (!elevated) {
          return {
            success: false,
            error: 'Command requires admin privileges, but elevation was denied',
            exitCode: 401
          };
        }
      }
      
      logService.addLog({
        type: 'info',
        message: `Executing shell command: ${command}`,
        timestamp: Date.now()
      });
      
      // In a real implementation, this would use Node.js process APIs or Python subprocess
      // For this frontend implementation, we'll simulate the result
      const mockOutput = `Simulated output for: ${command}\nExecuted at: ${new Date().toISOString()}`;
      
      logService.addLog({
        type: 'success',
        message: 'Shell command executed successfully',
        timestamp: Date.now(),
        details: { command, output: mockOutput }
      });
      
      return {
        success: true,
        output: mockOutput,
        exitCode: 0,
        executedAsAdmin: asAdmin && this.isAdmin
      };
    } catch (error) {
      logService.addLog({
        type: 'error',
        message: 'Error executing shell command',
        timestamp: Date.now(),
        details: { command, error }
      });
      
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        exitCode: 1
      };
    }
  }
  
  public async killProcess(processName: string): Promise<SystemCommandResult> {
    try {
      logService.addLog({
        type: 'info',
        message: `Attempting to kill process: ${processName}`,
        timestamp: Date.now()
      });
      
      // In a real implementation, this would use process.kill() or psutil.kill()
      // For this frontend implementation, we'll simulate the result
      const mockSuccess = true;
      
      if (mockSuccess) {
        logService.addLog({
          type: 'success',
          message: `Successfully terminated process: ${processName}`,
          timestamp: Date.now()
        });
        
        return {
          success: true,
          output: `Process ${processName} was terminated successfully`,
          exitCode: 0
        };
      } else {
        return {
          success: false,
          error: `Failed to terminate process: ${processName}`,
          exitCode: 1
        };
      }
    } catch (error) {
      logService.addLog({
        type: 'error',
        message: `Error killing process: ${processName}`,
        timestamp: Date.now(),
        details: error
      });
      
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        exitCode: 1
      };
    }
  }
  
  public async restartSystem(): Promise<SystemCommandResult> {
    try {
      logService.addLog({
        type: 'warning',
        message: 'System restart requested',
        timestamp: Date.now()
      });
      
      // In a real implementation, this would trigger a system reboot
      // For this frontend implementation, we'll simulate a page reload
      setTimeout(() => {
        window.location.reload();
      }, 3000);
      
      logService.addLog({
        type: 'info',
        message: 'Preparing to restart in 3 seconds...',
        timestamp: Date.now()
      });
      
      return {
        success: true,
        output: 'System restart initiated',
        exitCode: 0
      };
    } catch (error) {
      logService.addLog({
        type: 'error',
        message: 'Error initiating system restart',
        timestamp: Date.now(),
        details: error
      });
      
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        exitCode: 1
      };
    }
  }
  
  // Security checks
  private containsDangerousCommand(command: string): boolean {
    // List of potentially dangerous commands to block
    const dangerousPatterns = [
      /rm\s+-rf\s+\//, // Delete root directory
      /format\s+[a-zA-Z]:/, // Format drive
      /del\s+\/[a-zA-Z]\s+\/[a-zA-Z]/, // Delete system files in Windows
      /rd\s+\/s\s+\/q\s+[a-zA-Z]:\\windows/i, // Remove Windows directory
      /^\s*shutdown/, // Shutdown commands
      /^\s*halt/, // Halt system
      /^\s*reboot/, // Reboot system outside controlled methods
      /^\s*passwd/, // Change passwords
      /^\s*mkfs/, // Make filesystem
      /^\s*dd\s+if/, // DD command which can wipe drives
    ];
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(command.toLowerCase())) {
        logService.addLog({
          type: 'warning',
          message: 'Potentially dangerous command blocked',
          timestamp: Date.now(),
          details: { command, pattern: pattern.toString() }
        });
        return true;
      }
    }
    
    return false;
  }
  
  // File system operations - basic implementations
  public async readFile(path: string): Promise<FileOperationResult> {
    if (!this.isPathSecure(path)) {
      return {
        success: false,
        error: 'Access denied: Cannot read from protected path',
        path
      };
    }
    
    // Mock implementation for frontend
    return {
      success: true,
      content: `Mock content for file at ${path}`,
      path,
      stats: {
        size: 1024,
        modified: new Date().toISOString(),
        created: new Date().toISOString(),
        isDirectory: false
      }
    };
  }
  
  public async writeFile(path: string, content: string): Promise<FileOperationResult> {
    if (!this.isPathSecure(path)) {
      return {
        success: false,
        error: 'Access denied: Cannot write to protected path',
        path
      };
    }
    
    // Mock implementation for frontend
    return {
      success: true,
      path,
      stats: {
        size: content.length,
        modified: new Date().toISOString(),
        created: new Date().toISOString(),
        isDirectory: false
      }
    };
  }
  
  public async listDirectory(path: string): Promise<FileOperationResult> {
    if (!this.isPathSecure(path)) {
      return {
        success: false,
        error: 'Access denied: Cannot list protected directory',
        path
      };
    }
    
    // Mock implementation for frontend
    return {
      success: true,
      path,
      entries: [
        'file1.txt',
        'file2.log',
        'subfolder1',
        'subfolder2'
      ],
      stats: {
        size: 0,
        modified: new Date().toISOString(),
        created: new Date().toISOString(),
        isDirectory: true
      }
    };
  }
}

export const systemCommandService = new SystemCommandService();
