
import React, { useEffect } from 'react';
import { ShellProvider } from '@/contexts/shell/ShellContext';
import ShellContainer from './shell/ShellContainer';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { TaskSchedulerProvider } from '@/contexts/TaskSchedulerContext';

const ShellInterface: React.FC = () => {
  useEffect(() => {
    console.log('ShellInterface mounted - setting up provider hierarchy');
  }, []);

  return (
    <LanguageProvider>
      {console.log('LanguageProvider rendered')}
      <TaskSchedulerProvider>
        {console.log('TaskSchedulerProvider rendered')}
        <ShellProvider>
          {console.log('ShellProvider rendered - context should be available')}
          <div className="w-full h-full">
            <ShellContainer />
          </div>
        </ShellProvider>
      </TaskSchedulerProvider>
    </LanguageProvider>
  );
};

export default ShellInterface;
