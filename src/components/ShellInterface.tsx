
import React from 'react';
import { ShellProvider } from '@/contexts/shell/ShellContext';
import ShellHeader from './shell/ShellHeader';
import ShellContent from './shell/ShellContent';
import { TaskSchedulerProvider } from '@/contexts/TaskSchedulerContext';
import { LanguageProvider } from '@/contexts/LanguageContext';

const ShellInterface: React.FC = () => {
  return (
    <LanguageProvider>
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
    </LanguageProvider>
  );
};

export default ShellInterface;
