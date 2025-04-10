
import React, { useEffect } from 'react';
import ShellInterface from './components/ShellInterface';

function App() {
  useEffect(() => {
    console.log('App component mounted - root component');
  }, []);

  return (
    <div className="w-full h-full min-h-screen bg-background text-foreground">
      <ShellInterface />
    </div>
  );
}

export default App;
