
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { commandService } from '@/services/CommandService';
import { toast } from 'sonner';

const dslExamples = {
  variables: `/set#cmd101{ "var": "username", "value": "admin" }
/set#cmd102{ "var": "password", "value": "secure123" }
/type#cmd103{ "selector": "#login", "text": "$username" }`,

  conditions: `/set#cmd201{ "var": "isLoggedIn", "value": true }
/if#cmd202{
  "condition": "$isLoggedIn == true",
  "then": [
    "/click#cmd203{ \\"element\\": \\"#logout\\" }"
  ],
  "else": [
    "/click#cmd204{ \\"element\\": \\"#login\\" }"
  ]
}`,

  loops: `/set#cmd301{ "var": "count", "value": 0 }
/repeat#cmd302{
  "times": 3,
  "do": [
    "/set#cmd303{ \\"var\\": \\"count\\", \\"value\\": \\"$count + 1\\" }",
    "/click#cmd304{ \\"element\\": \\".item-$count\\" }"
  ]
}`,

  chain: `/chain#cmd401[
  /set#cmd402{ "var": "username", "value": "admin" },
  /set#cmd403{ "var": "password", "value": "secure123" },
  /navigate#cmd404{ "url": "https://example.com/login" },
  /type#cmd405{ "selector": "#username", "text": "$username" },
  /type#cmd406{ "selector": "#password", "text": "$password" },
  /click#cmd407{ "element": "#loginButton" },
  /if#cmd408{
    "condition": "$success == true",
    "then": [
      "/click#cmd409{ \\"element\\": \\"#dashboard\\" }"
    ],
    "else": [
      "/repeat#cmd410{
        \\"times\\": 3,
        \\"do\\": [
          \\"/click#cmd411{ \\\\\\"element\\\\\\": \\\\\\".retry\\\\\\" }\\"
        ]
      }"
    ]
  }
]`
};

const AdvancedDSLDemo: React.FC = () => {
  const [dslCommand, setDslCommand] = useState(dslExamples.variables);
  const [result, setResult] = useState<any>(null);

  const handleExecute = async () => {
    try {
      const command = commandService.parseCommand(dslCommand);
      
      if (!command) {
        toast.error('Failed to parse command');
        return;
      }
      
      const result = await commandService.executeCommand(command);
      setResult(result);
      toast.success('Command executed successfully');
    } catch (error) {
      console.error('Error executing command:', error);
      toast.error('Error executing command');
      setResult({ error });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Advanced DSL Demo</h1>
      
      <Tabs defaultValue="variables" className="mb-8">
        <TabsList>
          <TabsTrigger value="variables">Variables</TabsTrigger>
          <TabsTrigger value="conditions">Conditions</TabsTrigger>
          <TabsTrigger value="loops">Loops</TabsTrigger>
          <TabsTrigger value="chain">Command Chain</TabsTrigger>
        </TabsList>
        
        {Object.entries(dslExamples).map(([key, example]) => (
          <TabsContent key={key} value={key}>
            <Card>
              <CardHeader>
                <CardTitle>{key.charAt(0).toUpperCase() + key.slice(1)} Example</CardTitle>
                <CardDescription>
                  {key === 'variables' && 'Set and use variables in commands'}
                  {key === 'conditions' && 'Conditional execution based on variable values'}
                  {key === 'loops' && 'Repeat commands multiple times'}
                  {key === 'chain' && 'Complex chain combining variables, conditions and loops'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setDslCommand(example)} 
                  variant="outline" 
                  className="mb-2"
                >
                  Load Example
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>DSL Command</CardTitle>
            <CardDescription>Enter your DSL command below</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea 
              value={dslCommand}
              onChange={(e) => setDslCommand(e.target.value)}
              className="font-mono h-80"
            />
            <Button onClick={handleExecute} className="mt-4">Execute</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Command Result</CardTitle>
            <CardDescription>Output from command execution</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md overflow-auto h-80">
              {result ? JSON.stringify(result, null, 2) : 'No result yet'}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdvancedDSLDemo;
