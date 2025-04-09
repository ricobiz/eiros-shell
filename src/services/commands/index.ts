
import { handleClickCommand } from './clickCommand';
import { handleTypeCommand } from './typeCommand';
import { handleNavigateCommand } from './navigationCommand';
import { handleScreenshotCommand } from './screenshotCommand';
import { handleLoginCommand } from './loginCommand';
import { handleMemorySaveCommand, handleMemoryRetrieveCommand } from './memoryCommands';
import { handleAnalyzeCommand } from './analyzeCommand';
import { CommandType } from '../../types/types';

export const commandHandlers = {
  [CommandType.CLICK]: handleClickCommand,
  [CommandType.TYPE]: handleTypeCommand,
  [CommandType.NAVIGATE]: handleNavigateCommand,
  [CommandType.SCREENSHOT]: handleScreenshotCommand,
  [CommandType.LOGIN]: handleLoginCommand,
  [CommandType.MEMORY_SAVE]: handleMemorySaveCommand,
  [CommandType.MEMORY_RETRIEVE]: handleMemoryRetrieveCommand,
  [CommandType.ANALYZE]: handleAnalyzeCommand
};
