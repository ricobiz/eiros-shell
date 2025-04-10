
import React from 'react';
import { ShellProvider } from '@/contexts/shell/ShellContext';
import ShellContainer from './shell/ShellContainer';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { TaskSchedulerProvider } from '@/contexts/TaskSchedulerContext';

const ShellInterface: React.FC = () => {
  return (
    <LanguageProvider>
      <TaskSchedulerProvider>
        <ShellProvider>
          <div className="w-full h-full">
            <ShellContainer />
          </div>
        </ShellProvider>
      </TaskSchedulerProvider>
    </LanguageProvider>
  );
};

export default ShellInterface;
