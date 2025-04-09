
import React from 'react';
import { Separator } from '@/components/ui/separator';
import CommandInput from '../CommandInput';
import LogViewer from '../LogViewer';
import { getCommandHelp, getCommandExamples } from '@/utils/commandHelpers';
import { CommandType } from '@/types/types';

interface CommandTabProps {
  onCommandExecuted: (result: any) => void;
}

const CommandTab: React.FC<CommandTabProps> = ({ onCommandExecuted }) => {
  const renderCommandHelp = () => {
    const commandHelp = getCommandHelp();
    const commandExamples = getCommandExamples();
    
    return (
      <div className="text-sm text-muted-foreground space-y-3 p-2">
        <p>Commands use the following format:</p>
        <pre className="bg-muted p-2 rounded-sm text-xs">/command_type#command_id{'{parameters}'}</pre>
        
        <p>Available commands:</p>
        <ul className="space-y-1 pl-4">
          {Object.values(CommandType).map((cmd) => (
            <li key={cmd} className="text-xs">
              <code className="bg-muted px-1 rounded-sm">{cmd}</code>
              <span className="ml-2">{commandHelp[cmd] || ''}</span>
            </li>
          ))}
        </ul>
        
        <p>Examples:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {Object.entries(commandExamples).map(([name, example]) => (
            <pre key={name} className="bg-muted p-2 rounded-sm text-xs overflow-x-auto">
              <div className="text-xs font-semibold mb-1">{name}</div>
              {example}
            </pre>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="space-y-4">
      <CommandInput onCommandExecuted={onCommandExecuted} />
      <Separator />
      {renderCommandHelp()}
      <div className="mt-4">
        <LogViewer maxHeight="150px" />
      </div>
    </div>
  );
};

export default CommandTab;
