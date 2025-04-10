
import { CommandType } from '../types/types';
import { getCommandHelp, getCommandExamples } from '@/utils/commandHelpers';

class DocumentationService {
  private documentation: Record<string, any> = {};

  constructor() {
    this.initializeDocumentation();
  }

  private initializeDocumentation() {
    this.documentation = {
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      sections: [
        {
          title: 'Introduction',
          content: 'EirosShell is an interactive interface for controlling web browsers through AI commands. It provides a set of commands for navigation, interaction, analysis, and automation.'
        },
        {
          title: 'Command Format',
          content: 'Commands use the format: /command_type#command_id{parameters}. The command_id is a unique identifier and parameters are provided in JSON format.'
        },
        {
          title: 'Available Commands',
          items: Object.values(CommandType).map(cmd => ({
            name: cmd,
            description: getCommandHelp()[cmd] || 'No description available',
            examples: Object.entries(getCommandExamples())
              .filter(([name, example]) => example.startsWith(`/${cmd}`))
              .map(([name, example]) => ({ name, code: example }))
          }))
        },
        {
          title: 'Special Functions',
          items: [
            {
              name: 'Memory System',
              description: 'The shell provides a memory system to store and retrieve information across sessions.',
              examples: [
                { name: 'Save to Memory', code: '/memory_save#mem1{ "type": "note", "data": "Important information", "tags": ["important", "note"] }' },
                { name: 'Retrieve from Memory', code: '/memory_retrieve#get1{ "tags": ["important"] }' }
              ]
            },
            {
              name: 'Pattern Recognition',
              description: 'The shell can learn UI patterns and reuse them later.',
              examples: [
                { name: 'Record Pattern', code: '/record#pattern1{ "name": "login_button", "selector": ".login-btn" }' }
              ]
            },
            {
              name: 'Annotations',
              description: 'Annotate UI elements to teach the AI about specific page components.',
              examples: [
                { name: 'Annotate Element', code: '/annotate#anno1{ "selector": "#main-nav", "description": "Main navigation menu" }' }
              ]
            }
          ]
        },
        {
          title: 'Vision System',
          content: 'The shell can take screenshots and analyze web interfaces. This allows the AI to understand page structure and identify interactive elements.'
        }
      ]
    };
  }

  public generateMarkdownDocumentation(): string {
    const { sections } = this.documentation;
    let markdown = `# EirosShell Documentation\n\n`;
    markdown += `*Version: ${this.documentation.version} | Last Updated: ${new Date(this.documentation.lastUpdated).toLocaleDateString()}*\n\n`;
    
    sections.forEach((section: any) => {
      markdown += `## ${section.title}\n\n`;
      
      if (section.content) {
        markdown += `${section.content}\n\n`;
      }
      
      if (section.items) {
        section.items.forEach((item: any) => {
          markdown += `### ${item.name}\n\n`;
          
          if (item.description) {
            markdown += `${item.description}\n\n`;
          }
          
          if (item.examples && item.examples.length > 0) {
            markdown += `**Examples:**\n\n`;
            item.examples.forEach((example: any) => {
              if (example.name) markdown += `*${example.name}*\n`;
              markdown += `\`\`\`\n${example.code}\n\`\`\`\n\n`;
            });
          }
        });
      }
    });
    
    return markdown;
  }

  public addNewCommand(commandType: string, description: string, examples: Array<{name: string, code: string}>) {
    const commandsSection = this.documentation.sections.find((section: any) => section.title === 'Available Commands');
    if (commandsSection) {
      const existingCommand = commandsSection.items.find((item: any) => item.name === commandType);
      
      if (existingCommand) {
        existingCommand.description = description;
        // Merge examples, avoiding duplicates
        examples.forEach(example => {
          if (!existingCommand.examples.some((ex: any) => ex.code === example.code)) {
            existingCommand.examples.push(example);
          }
        });
      } else {
        commandsSection.items.push({
          name: commandType,
          description,
          examples
        });
      }
      
      this.documentation.lastUpdated = new Date().toISOString();
    }
  }

  public getDocumentation() {
    return this.documentation;
  }
}

export const documentationService = new DocumentationService();
