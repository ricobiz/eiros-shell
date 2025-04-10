
import { CommandType } from '@/types/types';

export const getCommandHelp = () => {
  return {
    [CommandType.CLICK]: 'Click on an element identified by selector',
    [CommandType.TYPE]: 'Type text into an element identified by selector',
    [CommandType.NAVIGATION]: 'Navigate to a URL',
    [CommandType.WAIT]: 'Wait for a specified duration in seconds',
    [CommandType.SCREENSHOT]: 'Take a screenshot of the current page',
    [CommandType.ANALYZE]: 'Analyze the page structure and elements',
    [CommandType.MEMORY_SAVE]: 'Save data to memory',
    [CommandType.MEMORY_RETRIEVE]: 'Retrieve data from memory',
    [CommandType.LOGIN]: 'Perform a login operation',
    [CommandType.AUTO_LOGIN]: 'Perform an automatic login operation',
    [CommandType.PATTERN_LEARN]: 'Learn a new UI pattern',
    [CommandType.PATTERN_RECALL]: 'Recall and use a learned UI pattern',
    // New system commands
    [CommandType.SHELL]: 'Execute a shell command',
    [CommandType.RESTART]: 'Restart the system or application',
    [CommandType.KILL]: 'Terminate a process by name',
    [CommandType.READ_FILE]: 'Read content from a file',
    [CommandType.WRITE_FILE]: 'Write content to a file',
    [CommandType.LIST_DIR]: 'List contents of a directory'
  };
};

export const getCommandExamples = () => {
  return {
    click: '/click#cmd1{"selector": ".btn-submit"}',
    type: '/type#cmd2{"selector": "#username", "text": "user123"}',
    navigation: '/navigation#cmd3{"url": "https://example.com"}',
    wait: '/wait#cmd4{"duration": 3}',
    screenshot: '/screenshot#cmd5{}',
    analyze: '/analyze#cmd6{}',
    // New system command examples
    shell: '/shell#cmd88{"cmd": "dir /s", "asAdmin": true}',
    restart: '/restart#cmd89{}',
    kill: '/kill#cmd90{"process": "chrome.exe"}',
    readFile: '/read_file#cmd91{"path": "D:/data/logs.txt"}',
    writeFile: '/write_file#cmd92{"path": "C:/Users/xxx/out.txt", "text": "Done"}',
    listDir: '/list_dir#cmd93{"path": "D:/projects"}'
  };
};
