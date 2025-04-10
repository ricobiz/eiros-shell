
import React from 'react';
import { ShellProvider } from './contexts/shell/ShellContext';
import ShellContainer from './components/shell/ShellContainer';

function App() {
  return (
    <ShellProvider>
      <div className="w-full h-full min-h-screen bg-background text-foreground">
        <ShellContainer />
      </div>
    </ShellProvider>
  );
}

export default App;
