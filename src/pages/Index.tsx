
import ShellInterface from "@/components/ShellInterface";

const Index = () => {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2 text-foreground">
            <span className="text-accent">AI</span> Shell Interface
          </h1>
          <p className="text-muted-foreground">
            A local interface shell for AI interaction with web browsers
          </p>
        </header>
        
        <main>
          <ShellInterface />
          
          <div className="mt-8 p-4 bg-card rounded-lg border border-border">
            <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
            
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>This shell interface allows AI to interact with web interfaces through:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Screen capture and analysis for UI understanding</li>
                  <li>Mouse and keyboard simulation for interaction</li>
                  <li>Memory system to learn from previous actions</li>
                  <li>Command system with unique IDs to prevent duplicates</li>
                  <li>Feedback through logs and screenshots</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Example Command</h3>
                <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
                  /click#button1{'{'}
                    "x": 100, 
                    "y": 200, 
                    "waitAfter": 1000
                  {'}'}
                </pre>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">
                  The interface provides a structured way for AI assistants to interact with browser interfaces
                  without requiring API access, making it useful for automating web-based tasks.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
