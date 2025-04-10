
import React, { useState, useEffect } from 'react';
import ShellInterface from "@/components/ShellInterface";
import DiagnosticPanel from "@/components/DiagnosticPanel";

const Index = () => {
  const [showDiagnostics, setShowDiagnostics] = useState(true);
  
  useEffect(() => {
    // Hide diagnostics after a few seconds on startup
    const timer = setTimeout(() => {
      setShowDiagnostics(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-4">
        {showDiagnostics && (
          <div className="mb-4">
            <DiagnosticPanel />
          </div>
        )}
        <main>
          <ShellInterface />
        </main>
      </div>
    </div>
  );
};

export default Index;
