
import React from 'react';
import './App.css';
import { Toaster } from '@/components/ui/toaster';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ShellInterface from '@/components/ShellInterface';
import AdvancedDSLDemo from '@/tests/AdvancedDSLDemo';
import { TaskSchedulerProvider } from '@/contexts/TaskSchedulerContext';

function App() {
  return (
    <TaskSchedulerProvider>
      <div className="container mx-auto py-4">
        <h1 className="text-3xl font-bold mb-6">EirosShell - Advanced DSL</h1>
        
        <Tabs defaultValue="shell">
          <TabsList className="mb-4">
            <TabsTrigger value="shell">Shell Interface</TabsTrigger>
            <TabsTrigger value="demo">DSL Demo</TabsTrigger>
          </TabsList>
          
          <TabsContent value="shell">
            <div className="border rounded-lg overflow-hidden">
              <ShellInterface />
            </div>
          </TabsContent>
          
          <TabsContent value="demo">
            <AdvancedDSLDemo />
          </TabsContent>
        </Tabs>
      </div>
      <Toaster />
    </TaskSchedulerProvider>
  );
}

export default App;
