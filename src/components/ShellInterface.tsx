
import React, { useEffect } from 'react';
import { ShellProvider } from '@/contexts/shell/ShellContext';
import ShellContainer from './shell/ShellContainer';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { TaskSchedulerProvider } from '@/contexts/TaskSchedulerContext';

const ShellInterface: React.FC = () => {
  useEffect(() => {
    console.log('ShellInterface mounted - setting up provider hierarchy');
  }, []);

  // Log provider mounting outside of JSX
  useEffect(() => {
    console.log('LanguageProvider rendered');
    console.log('TaskSchedulerProvider rendered');
    console.log('ShellProvider rendered - context should be available');
  }, []);

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
