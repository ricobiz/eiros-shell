
import React from 'react';
import { ShellProvider } from './contexts/shell/ShellContext';
import ShellContainer from './components/shell/ShellContainer';
import { LanguageProvider } from './contexts/LanguageContext';
import { TaskSchedulerProvider } from './contexts/TaskSchedulerContext';

function App() {
  return (
    <LanguageProvider>
      <TaskSchedulerProvider>
        <ShellProvider>
          <div className="w-full h-full min-h-screen bg-background text-foreground">
            <ShellContainer />
          </div>
        </ShellProvider>
      </TaskSchedulerProvider>
    </LanguageProvider>
  );
}

export default App;
