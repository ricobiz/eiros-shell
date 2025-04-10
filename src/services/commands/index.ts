
import { CommandType } from '@/types/types';
import { handleClickCommand } from './clickCommand';
import { handleTypeCommand } from './typeCommand';
import { handleNavigationCommand } from './navigationCommand';
import { handleWaitCommand } from './waitCommand';
import { handleScreenshotCommand } from './screenshotCommand';
import { handleAnalyzeCommand } from './analyzeCommand';
import { handleMemorySaveCommand, handleMemoryRetrieveCommand } from './memoryCommands';
import { handleLoginCommand } from './loginCommand';
import { handleAutoLoginCommand } from './autoLoginCommand';
import { handlePatternLearnCommand, handlePatternRecallCommand } from './patternCommands';
import { 
  handleShellCommand,
  handleRestartCommand,
  handleKillCommand,
  handleReadFileCommand,
  handleWriteFileCommand,
  handleListDirCommand
} from './systemCommands';

export const commandHandlers = {
  [CommandType.CLICK]: handleClickCommand,
  [CommandType.TYPE]: handleTypeCommand,
  [CommandType.NAVIGATION]: handleNavigationCommand,
  [CommandType.WAIT]: handleWaitCommand,
  [CommandType.SCREENSHOT]: handleScreenshotCommand,
  [CommandType.ANALYZE]: handleAnalyzeCommand,
  [CommandType.MEMORY_SAVE]: handleMemorySaveCommand,
  [CommandType.MEMORY_RETRIEVE]: handleMemoryRetrieveCommand,
  [CommandType.LOGIN]: handleLoginCommand,
  [CommandType.AUTO_LOGIN]: handleAutoLoginCommand,
  [CommandType.PATTERN_LEARN]: handlePatternLearnCommand,
  [CommandType.PATTERN_RECALL]: handlePatternRecallCommand,
  // New system commands
  [CommandType.SHELL]: handleShellCommand,
  [CommandType.RESTART]: handleRestartCommand,
  [CommandType.KILL]: handleKillCommand,
  [CommandType.READ_FILE]: handleReadFileCommand,
  [CommandType.WRITE_FILE]: handleWriteFileCommand,
  [CommandType.LIST_DIR]: handleListDirCommand
};
