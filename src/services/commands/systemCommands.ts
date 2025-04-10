
import { Command, CommandType } from '@/types/types';
import { logService } from '@/services/LogService';
import { systemCommandService } from '@/services/SystemCommandService';
import { memoryService } from '@/services/MemoryService';
import { MemoryType } from '@/types/types';

export const handleShellCommand = async (command: Command) => {
  try {
    const { cmd, asAdmin = false } = command.params;
    
    if (!cmd) {
      logService.addLog({
        type: 'error',
        message: 'Shell command missing required "cmd" parameter',
        timestamp: Date.now(),
        details: command
      });
      return { success: false, error: 'Missing required parameter: cmd' };
    }
    
    logService.addLog({
      type: 'info',
      message: `Executing shell command: ${cmd}${asAdmin ? ' (as admin)' : ''}`,
      timestamp: Date.now()
    });
    
    const result = await systemCommandService.executeShellCommand(cmd, asAdmin);
    
    // Store result in memory
    memoryService.addMemoryItem({
      type: MemoryType.RESULT,
      data: {
        command,
        result
      },
      tags: ['shell', 'command', asAdmin ? 'admin' : 'user']
    });
    
    return result;
  } catch (error) {
    logService.addLog({
      type: 'error',
      message: 'Error in shell command handler',
      timestamp: Date.now(),
      details: { error, command }
    });
    
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      exitCode: 1
    };
  }
};

export const handleRestartCommand = async (command: Command) => {
  try {
    logService.addLog({
      type: 'warning',
      message: 'System restart requested',
      timestamp: Date.now(),
      details: command
    });
    
    return await systemCommandService.restartSystem();
  } catch (error) {
    logService.addLog({
      type: 'error',
      message: 'Error in restart command handler',
      timestamp: Date.now(),
      details: { error, command }
    });
    
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      exitCode: 1
    };
  }
};

export const handleKillCommand = async (command: Command) => {
  try {
    const { process } = command.params;
    
    if (!process) {
      logService.addLog({
        type: 'error',
        message: 'Kill command missing required "process" parameter',
        timestamp: Date.now(),
        details: command
      });
      return { success: false, error: 'Missing required parameter: process' };
    }
    
    return await systemCommandService.killProcess(process);
  } catch (error) {
    logService.addLog({
      type: 'error',
      message: 'Error in kill command handler',
      timestamp: Date.now(),
      details: { error, command }
    });
    
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      exitCode: 1
    };
  }
};

export const handleReadFileCommand = async (command: Command) => {
  try {
    const { path } = command.params;
    
    if (!path) {
      return { success: false, error: 'Missing required parameter: path', path: '' };
    }
    
    return await systemCommandService.readFile(path);
  } catch (error) {
    logService.addLog({
      type: 'error',
      message: 'Error in read file command handler',
      timestamp: Date.now(),
      details: { error, command }
    });
    
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      path: command.params.path || ''
    };
  }
};

export const handleWriteFileCommand = async (command: Command) => {
  try {
    const { path, text } = command.params;
    
    if (!path) {
      return { success: false, error: 'Missing required parameter: path', path: '' };
    }
    
    if (text === undefined) {
      return { success: false, error: 'Missing required parameter: text', path };
    }
    
    return await systemCommandService.writeFile(path, text);
  } catch (error) {
    logService.addLog({
      type: 'error',
      message: 'Error in write file command handler',
      timestamp: Date.now(),
      details: { error, command }
    });
    
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      path: command.params.path || ''
    };
  }
};

export const handleListDirCommand = async (command: Command) => {
  try {
    const { path } = command.params;
    
    if (!path) {
      return { success: false, error: 'Missing required parameter: path', path: '' };
    }
    
    return await systemCommandService.listDirectory(path);
  } catch (error) {
    logService.addLog({
      type: 'error',
      message: 'Error in list directory command handler',
      timestamp: Date.now(),
      details: { error, command }
    });
    
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      path: command.params.path || ''
    };
  }
};
