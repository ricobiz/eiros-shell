
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useShell } from '@/contexts/shell/ShellContext';
import { commandService } from '@/services/CommandService';

interface Screenshot {
  path: string;
  timestamp: number;
}

const ManualAnnotationTab: React.FC = () => {
  const { handleTakeScreenshot } = useShell();
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [currentScreenshot, setCurrentScreenshot] = useState<Screenshot | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Get the latest screenshot or take a new one
  const loadScreenshot = async () => {
    setLoading(true);
    try {
      // First try to get existing screenshots
      const result = await commandService.executeCommand({
        id: `get_screenshots_${Date.now()}`,
        type: 'GET_SCREENSHOTS',
        params: { limit: 1 },
        timestamp: Date.now()
      });
      
      if (result && result.screenshots && result.screenshots.length > 0) {
        setScreenshots(result.screenshots);
        setCurrentScreenshot(result.screenshots[0]);
      } else {
        // If no screenshots, take a new one
        const screenshotResult = await handleTakeScreenshot();
        if (screenshotResult && typeof screenshotResult === 'object' && 'path' in screenshotResult) {
          const newScreenshot: Screenshot = {
            path: screenshotResult.path as string,
            timestamp: Date.now()
          };
          setScreenshots([newScreenshot]);
          setCurrentScreenshot(newScreenshot);
        }
      }
    } catch (error) {
      console.error("Failed to load or take screenshot:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Start annotation mode
  const handleStartAnnotating = async () => {
    try {
      await commandService.executeCommand({
        id: `annotate_${Date.now()}`,
        type: 'ANNOTATE',
        params: {},
        timestamp: Date.now()
      });
    } catch (error) {
      console.error("Failed to start annotation mode:", error);
    }
  };
  
  useEffect(() => {
    // Load screenshot when tab is activated
    loadScreenshot();
  }, []);
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Manual Annotation</h2>
        <div className="space-x-2">
          <Button onClick={loadScreenshot} disabled={loading}>
            {loading ? "Loading..." : "Take New Screenshot"}
          </Button>
          <Button onClick={handleStartAnnotating}>
            Start Annotating
          </Button>
        </div>
      </div>
      
      {currentScreenshot ? (
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-center">
              <img 
                src={`file://${currentScreenshot.path}`} 
                alt="Screenshot for annotation" 
                className="max-w-full max-h-[600px] object-contain border border-border"
              />
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                Screenshot taken at {new Date(currentScreenshot.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex justify-center items-center h-40 border border-dashed border-border rounded-md">
          <p className="text-muted-foreground">
            {loading ? "Loading screenshot..." : "No screenshot available. Take a new one to begin annotation."}
          </p>
        </div>
      )}
      
      <div className="space-y-2">
        <h3 className="text-md font-medium">Instructions</h3>
        <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1 pl-4">
          <li>Take a screenshot of the current browser window</li>
          <li>Click "Start Annotating" to open the annotation tool</li>
          <li>Draw regions on the screenshot and name them</li>
          <li>Save annotations to use them in later commands</li>
        </ol>
      </div>
    </div>
  );
};

export default ManualAnnotationTab;
