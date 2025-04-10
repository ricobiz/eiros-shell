
import { Command, CommandType, MemoryType, SystemCommandResult, FileOperationResult } from '@/types/types';
import { systemCommandService } from '@/services/SystemCommandService';
import { memoryService } from '@/services/MemoryService';
import { logService } from '@/services/LogService';

/**
 * Execute a shell command
 */
export const handleShellCommand = async (command: Command): Promise<any> => {
  try {
    const { command: cmd, asAdmin = false } = command.params;

    logService.addLog({
      type: 'info',
      message: `Executing shell command: ${cmd}`,
      timestamp: Date.now(),
      details: { command, asAdmin }
    });

    // Execute the command
    const result = await systemCommandService.executeShellCommand(cmd, asAdmin);

    // Store the result in memory
    memoryService.addMemoryItem({
      type: MemoryType.RESULT,
      data: {
        command: cmd,
        result: result
      },
      tags: ['shell', 'command'],
      createdAt: Date.now()
    });

    return result;
  } catch (error) {
    logService.addLog({
      type: 'error',
      message: 'Failed to execute shell command',
      timestamp: Date.now(),
      details: error
    });
    throw error;
  }
};

/**
 * Restart the system
 */
export const handleRestartCommand = async (command: Command): Promise<any> => {
  try {
    logService.addLog({
      type: 'info',
      message: 'Requesting system restart',
      timestamp: Date.now()
    });

    // Request system restart
    const result = await systemCommandService.restartSystem();

    return result;
  } catch (error) {
    logService.addLog({
      type: 'error',
      message: 'Failed to restart system',
      timestamp: Date.now(),
      details: error
    });
    throw error;
  }
};

/**
 * Kill a process
 */
export const handleKillCommand = async (command: Command): Promise<any> => {
  try {
    const { process } = command.params;

    logService.addLog({
      type: 'info',
      message: `Killing process: ${process}`,
      timestamp: Date.now()
    });

    // Kill the process
    const result = await systemCommandService.killProcess(process);

    return result;
  } catch (error) {
    logService.addLog({
      type: 'error',
      message: 'Failed to kill process',
      timestamp: Date.now(),
      details: error
    });
    throw error;
  }
};

/**
 * Read a file
 */
export const handleReadFileCommand = async (command: Command): Promise<any> => {
  try {
    const { path } = command.params;

    logService.addLog({
      type: 'info',
      message: `Reading file: ${path}`,
      timestamp: Date.now()
    });

    // Read the file
    const result = await systemCommandService.readFile(path);

    return result;
  } catch (error) {
    logService.addLog({
      type: 'error',
      message: 'Failed to read file',
      timestamp: Date.now(),
      details: error
    });
    throw error;
  }
};

/**
 * Write to a file
 */
export const handleWriteFileCommand = async (command: Command): Promise<any> => {
  try {
    const { path, content } = command.params;

    logService.addLog({
      type: 'info',
      message: `Writing to file: ${path}`,
      timestamp: Date.now()
    });

    // Write to the file
    const result = await systemCommandService.writeFile(path, content);

    return result;
  } catch (error) {
    logService.addLog({
      type: 'error',
      message: 'Failed to write to file',
      timestamp: Date.now(),
      details: error
    });
    throw error;
  }
};

/**
 * List directory contents
 */
export const handleListDirCommand = async (command: Command): Promise<any> => {
  try {
    const { path } = command.params;

    logService.addLog({
      type: 'info',
      message: `Listing directory: ${path}`,
      timestamp: Date.now()
    });

    // List the directory
    const result = await systemCommandService.listDirectory(path);

    return result;
  } catch (error) {
    logService.addLog({
      type: 'error',
      message: 'Failed to list directory',
      timestamp: Date.now(),
      details: error
    });
    throw error;
  }
};
