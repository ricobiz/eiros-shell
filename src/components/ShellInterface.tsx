
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShellProvider } from '@/contexts/shell/ShellContext';
import ShellHeader from './shell/ShellHeader';
import ShellContent from './shell/ShellContent';
import { TaskSchedulerProvider } from '@/contexts/TaskSchedulerContext';

const ShellInterface: React.FC = () => {
  return (
    <TaskSchedulerProvider>
      <ShellProvider>
        <div className="flex flex-col h-screen">
          <ShellHeader />
          <div className="flex-1 overflow-auto p-4">
            <ShellContent />
          </div>
        </div>
      </ShellProvider>
    </TaskSchedulerProvider>
  );
};

export default ShellInterface;
