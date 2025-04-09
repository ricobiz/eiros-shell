
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

const InstructionsTab: React.FC = () => {
  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-6 p-2">
        <section>
          <h3 className="font-medium text-lg mb-2">Getting Started with AI Shell</h3>
          <p className="text-muted-foreground">
            This interface allows you to interact with web browsers through AI commands.
            You can issue commands, analyze visual content, and store memories for future reference.
          </p>
        </section>

        <section>
          <h3 className="font-medium text-lg mb-2">Available Commands</h3>
          <div className="space-y-2">
            <div>
              <h4 className="font-medium">Click</h4>
              <pre className="bg-muted p-2 rounded-md text-xs">/click#elementID{'\{'}x: 100, y: 200, waitAfter: 1000{'}'}</pre>
            </div>
            <div>
              <h4 className="font-medium">Type</h4>
              <pre className="bg-muted p-2 rounded-md text-xs">/type#elementID{'\{'}text: "Hello world", waitAfter: 500{'}'}</pre>
            </div>
            <div>
              <h4 className="font-medium">Navigate</h4>
              <pre className="bg-muted p-2 rounded-md text-xs">/navigate#page{'\{'}url: "https://example.com"{'}'}</pre>
            </div>
            <div>
              <h4 className="font-medium">Screenshot</h4>
              <pre className="bg-muted p-2 rounded-md text-xs">/screenshot#capture{'\{'}{'}'}</pre>
            </div>
          </div>
        </section>

        <section>
          <h3 className="font-medium text-lg mb-2">Working with the Vision Tab</h3>
          <p className="text-muted-foreground mb-2">
            The Vision tab allows you to capture and analyze web interfaces.
            You can annotate UI elements to teach the AI about specific elements.
          </p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Click "Take Screenshot" to capture the current web view</li>
            <li>Toggle "Annotation Mode" to start annotating elements</li>
            <li>Click on elements and provide descriptions</li>
            <li>Save annotations to teach the AI about the interface</li>
          </ol>
        </section>

        <section>
          <h3 className="font-medium text-lg mb-2">Memory System</h3>
          <p className="text-muted-foreground">
            The Memory tab stores information that can be recalled later.
            This includes annotated UI elements, saved credentials, and navigation history.
            You can retrieve memories using the Memory tab or through commands.
          </p>
        </section>
        
        <section>
          <h3 className="font-medium text-lg mb-2">Browser Preview</h3>
          <p className="text-muted-foreground">
            The Browser Preview tab shows you the current web content the AI is interacting with.
            You can monitor actions in real-time and switch to fullscreen for a better view.
          </p>
        </section>
      </div>
    </ScrollArea>
  );
};

export default InstructionsTab;
