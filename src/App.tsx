
import React from 'react';
import { ShellProvider } from './contexts/shell/ShellContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { TaskSchedulerProvider } from './contexts/TaskSchedulerContext';
import ShellContainer from './components/shell/ShellContainer';

function App() {
  return (
    <div className="w-full h-full min-h-screen bg-background text-foreground">
      <LanguageProvider>
        <TaskSchedulerProvider>
          <ShellProvider>
            <ShellContainer />
          </ShellProvider>
        </TaskSchedulerProvider>
      </LanguageProvider>
    </div>
  );
}

export default App;
