
import React from 'react';
import { Separator } from '@/components/ui/separator';
import CommandInput from '../CommandInput';
import LogViewer from '../LogViewer';
import { getCommandHelp, getCommandExamples } from '@/utils/commandHelpers';
import { CommandType } from '@/types/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
          {Object.keys(CommandType).map((cmdKey) => {
            const cmd = CommandType[cmdKey as keyof typeof CommandType];
            return (
              <li key={cmdKey} className="text-xs">
                <code className="bg-muted px-1 rounded-sm">{cmd}</code>
                <span className="ml-2">{commandHelp[cmd] || ''}</span>
              </li>
            );
          })}
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
  
  const renderAdvancedDSLHelp = () => {
    return (
      <div className="text-sm text-muted-foreground space-y-3 p-2">
        <h3 className="font-semibold">Advanced DSL Features</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">Variables</h4>
            <p className="text-xs mb-1">Set and use variables in commands:</p>
            <pre className="bg-muted p-2 rounded-sm text-xs overflow-x-auto">
              /set#cmd101{`{ "var": "username", "value": "admin" }`}
              /type#cmd102{`{ "selector": "#login", "text": "$username" }`}
            </pre>
          </div>
          
          <div>
            <h4 className="font-medium">Conditional Execution</h4>
            <p className="text-xs mb-1">Execute commands based on conditions:</p>
            <pre className="bg-muted p-2 rounded-sm text-xs overflow-x-auto">
{`/if#cmd201{
  "condition": "$isLoggedIn == true",
  "then": [
    "/click#cmd202{ \\"element\\": \\"#logout\\" }"
  ],
  "else": [
    "/click#cmd203{ \\"element\\": \\"#login\\" }"
  ]
}`}
            </pre>
          </div>
          
          <div>
            <h4 className="font-medium">Loops</h4>
            <p className="text-xs mb-1">Repeat commands multiple times:</p>
            <pre className="bg-muted p-2 rounded-sm text-xs overflow-x-auto">
{`/repeat#cmd301{
  "times": 3,
  "do": [
    "/click#cmd302{ \\"element\\": \\".retry\\" }"
  ]
}`}
            </pre>
          </div>
          
          <div>
            <h4 className="font-medium">Command Chains</h4>
            <p className="text-xs mb-1">Execute multiple commands in sequence:</p>
            <pre className="bg-muted p-2 rounded-sm text-xs overflow-x-auto">
{`/chain#cmd401[
  /set#cmd402{ "var": "username", "value": "admin" },
  /navigate#cmd403{ "url": "https://example.com/login" },
  /type#cmd404{ "selector": "#username", "text": "$username" },
  /click#cmd405{ "element": "#loginButton" }
]`}
            </pre>
          </div>
          
          <div>
            <h4 className="font-medium">Nested Chains</h4>
            <p className="text-xs mb-1">Execute chains within chains for complex workflows:</p>
            <pre className="bg-muted p-2 rounded-sm text-xs overflow-x-auto">
{`/chain#cmd501[
  /navigate#cmd502{ "url": "https://example.com" },
  /chain#cmd503[
    /type#cmd504{ "selector": "#username", "text": "admin" },
    /type#cmd505{ "selector": "#password", "text": "secret" }
  ],
  /click#cmd506{ "element": "#loginButton" }
]`}
            </pre>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="space-y-4">
      <CommandInput onCommandExecuted={onCommandExecuted} />
      <Separator />
      
      <Tabs defaultValue="commands">
        <TabsList>
          <TabsTrigger value="commands">Basic Commands</TabsTrigger>
          <TabsTrigger value="advanced">Advanced DSL</TabsTrigger>
        </TabsList>
        <TabsContent value="commands">
          {renderCommandHelp()}
        </TabsContent>
        <TabsContent value="advanced">
          {renderAdvancedDSLHelp()}
        </TabsContent>
      </Tabs>
      
      <div className="mt-4">
        <LogViewer maxHeight="150px" />
      </div>
    </div>
  );
};

export default CommandTab;
