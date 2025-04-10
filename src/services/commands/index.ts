
import { handleClickCommand } from './clickCommand';
import { handleTypeCommand } from './typeCommand';
import { handleNavigationCommand } from './navigationCommand';
import { handleScreenshotCommand } from './screenshotCommand';
import { handleLoginCommand } from './loginCommand';
import { handleMemorySaveCommand, handleMemoryRetrieveCommand } from './memoryCommands';
import { handleAnalyzeCommand } from './analyzeCommand';
import { handleAutoLoginCommand } from './autoLoginCommand';
import { handleWaitCommand } from './waitCommand';
import { CommandType } from '../../types/types';

export const commandHandlers: Record<string, any> = {
  [CommandType.CLICK]: handleClickCommand,
  [CommandType.TYPE]: handleTypeCommand,
  [CommandType.NAVIGATION]: handleNavigationCommand,
  [CommandType.SCREENSHOT]: handleScreenshotCommand,
  [CommandType.LOGIN]: handleLoginCommand,
  [CommandType.MEMORY_SAVE]: handleMemorySaveCommand,
  [CommandType.MEMORY_RETRIEVE]: handleMemoryRetrieveCommand,
  [CommandType.ANALYZE]: handleAnalyzeCommand,
  [CommandType.AUTO_LOGIN]: handleAutoLoginCommand,
  [CommandType.WAIT]: handleWaitCommand
};
