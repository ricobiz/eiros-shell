
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useShell } from '@/contexts/shell/ShellContext';
import { commandService } from '@/services/CommandService';
import { CommandType } from '@/types/types';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Save, Trash, Copy, MousePointer } from 'lucide-react';

interface Screenshot {
  path: string;
  timestamp: number;
}

interface Annotation {
  id: string;
  selector?: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

const ManualAnnotationTab: React.FC = () => {
  const { handleTakeScreenshot } = useShell();
  const { toast } = useToast();
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [currentScreenshot, setCurrentScreenshot] = useState<Screenshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentAnnotation, setCurrentAnnotation] = useState<Annotation | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [annotationName, setAnnotationName] = useState('');
  const [annotationSelector, setAnnotationSelector] = useState('');
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Get the latest screenshot or take a new one
  const loadScreenshot = async () => {
    setLoading(true);
    try {
      // First try to get existing screenshots
      const result = await commandService.executeCommand({
        id: `get_screenshots_${Date.now()}`,
        type: CommandType.SCREENSHOT,
        params: { limit: 1 },
        timestamp: Date.now()
      });
      
      if (result && result.screenshots && result.screenshots.length > 0) {
        setScreenshots(result.screenshots);
        setCurrentScreenshot(result.screenshots[0]);
      } else {
        // If no screenshots, take a new one
        await handleTakeScreenshot();
        // Then try to get the newly taken screenshot
        const newResult = await commandService.executeCommand({
          id: `get_new_screenshots_${Date.now()}`,
          type: CommandType.SCREENSHOT,
          params: { limit: 1 },
          timestamp: Date.now()
        });
        
        if (newResult && newResult.screenshots && newResult.screenshots.length > 0) {
          setScreenshots(newResult.screenshots);
          setCurrentScreenshot(newResult.screenshots[0]);
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
        type: CommandType.ANNOTATE,
        params: {},
        timestamp: Date.now()
      });
    } catch (error) {
      console.error("Failed to start annotation mode:", error);
    }
  };
  
  // Mouse handlers for drawing annotations
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!canvasRef.current || !currentScreenshot) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setStartPos({ x, y });
    setIsDrawing(true);
    
    // Create new annotation
    const newAnnotation: Annotation = {
      id: `annotation_${Date.now()}`,
      name: '',
      x,
      y,
      width: 0,
      height: 0
    };
    
    setCurrentAnnotation(newAnnotation);
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !canvasRef.current || !currentAnnotation) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Update current annotation
    setCurrentAnnotation({
      ...currentAnnotation,
      x: Math.min(startPos.x, x),
      y: Math.min(startPos.y, y),
      width: Math.abs(x - startPos.x),
      height: Math.abs(y - startPos.y)
    });
  };
  
  const handleMouseUp = () => {
    if (!isDrawing || !currentAnnotation) return;
    
    setIsDrawing(false);
    
    // Only add annotation if it has some size
    if (currentAnnotation.width > 5 && currentAnnotation.height > 5) {
      setAnnotations([...annotations, currentAnnotation]);
    }
  };
  
  const saveAnnotation = () => {
    if (!currentAnnotation) return;
    
    const updatedAnnotation = {
      ...currentAnnotation,
      name: annotationName || `Element ${annotations.length + 1}`,
      selector: annotationSelector
    };
    
    // Remove the current annotation from the list
    const filteredAnnotations = annotations.filter(a => a.id !== currentAnnotation.id);
    
    // Add the updated annotation
    setAnnotations([...filteredAnnotations, updatedAnnotation]);
    
    // Save to backend
    commandService.executeCommand({
      id: `save_annotation_${Date.now()}`,
      type: CommandType.MEMORY_SAVE,
      params: {
        type: 'annotation',
        key: updatedAnnotation.name,
        data: updatedAnnotation
      },
      timestamp: Date.now()
    });
    
    toast({
      title: "Annotation Saved",
      description: `Element "${updatedAnnotation.name}" has been saved`
    });
    
    // Reset form
    setAnnotationName('');
    setAnnotationSelector('');
    setCurrentAnnotation(null);
  };
  
  const deleteAnnotation = (id: string) => {
    setAnnotations(annotations.filter(a => a.id !== id));
    
    if (currentAnnotation?.id === id) {
      setCurrentAnnotation(null);
      setAnnotationName('');
      setAnnotationSelector('');
    }
  };
  
  const selectAnnotation = (annotation: Annotation) => {
    setCurrentAnnotation(annotation);
    setAnnotationName(annotation.name);
    setAnnotationSelector(annotation.selector || '');
  };
  
  const generateCommand = () => {
    if (!currentAnnotation) return;
    
    // Create a click command using the annotation
    const command = {
      id: `click_annotation_${Date.now()}`,
      type: CommandType.CLICK,
      params: {
        element_ref: currentAnnotation.name,
        context: "manual"
      },
      timestamp: Date.now()
    };
    
    // Execute the command
    commandService.executeCommand(command)
      .then(() => {
        toast({
          title: "Command Executed",
          description: `Click command for "${currentAnnotation.name}" executed`
        });
      })
      .catch(error => {
        console.error("Failed to execute command:", error);
        toast({
          title: "Command Failed",
          description: "Failed to execute the command",
          variant: "destructive"
        });
      });
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
          <Button onClick={loadScreenshot} disabled={loading} size="sm">
            {loading ? "Loading..." : "Take New Screenshot"}
          </Button>
          <Button onClick={handleStartAnnotating} size="sm" variant="outline">
            <Pencil className="h-4 w-4 mr-1" />
            Open External Editor
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          {currentScreenshot ? (
            <Card className="overflow-hidden">
              <CardContent className="p-0 relative">
                <div 
                  ref={canvasRef}
                  className="relative cursor-crosshair"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={() => isDrawing && setIsDrawing(false)}
                >
                  <img 
                    src={`file://${currentScreenshot.path}`} 
                    alt="Screenshot for annotation" 
                    className="max-w-full object-contain"
                  />
                  
                  {/* Render all saved annotations */}
                  {annotations.map((ann) => (
                    <div
                      key={ann.id}
                      className={`absolute border-2 ${
                        currentAnnotation?.id === ann.id 
                          ? 'border-blue-500 bg-blue-500/10' 
                          : 'border-green-500 bg-green-500/10'
                      }`}
                      style={{
                        left: `${ann.x}px`,
                        top: `${ann.y}px`,
                        width: `${ann.width}px`,
                        height: `${ann.height}px`,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        selectAnnotation(ann);
                      }}
                    >
                      <span className="absolute -top-6 left-0 text-xs px-1 bg-background border border-border">
                        {ann.name}
                      </span>
                    </div>
                  ))}
                  
                  {/* Render current drawing annotation */}
                  {isDrawing && currentAnnotation && (
                    <div
                      className="absolute border-2 border-dashed border-blue-500 bg-blue-500/10"
                      style={{
                        left: `${currentAnnotation.x}px`,
                        top: `${currentAnnotation.y}px`,
                        width: `${currentAnnotation.width}px`,
                        height: `${currentAnnotation.height}px`,
                      }}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex justify-center items-center h-64 border border-dashed border-border rounded-md">
              <p className="text-muted-foreground">
                {loading ? "Loading screenshot..." : "No screenshot available. Take a new one to begin annotation."}
              </p>
            </div>
          )}
        </div>
          
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="text-sm font-medium">Annotation Details</h3>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="elementName">Element Name</Label>
                  <Input
                    id="elementName"
                    value={annotationName}
                    onChange={(e) => setAnnotationName(e.target.value)}
                    placeholder="e.g., LoginButton"
                    disabled={!currentAnnotation}
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="cssSelector">CSS Selector (optional)</Label>
                  <Input
                    id="cssSelector"
                    value={annotationSelector}
                    onChange={(e) => setAnnotationSelector(e.target.value)}
                    placeholder="e.g., .login-button"
                    disabled={!currentAnnotation}
                  />
                </div>
                
                {currentAnnotation && (
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Position: {currentAnnotation.x}, {currentAnnotation.y}</p>
                    <p>Size: {currentAnnotation.width} × {currentAnnotation.height}</p>
                  </div>
                )}
                
                <div className="pt-2 flex space-x-2">
                  <Button 
                    onClick={saveAnnotation}
                    disabled={!currentAnnotation} 
                    size="sm"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  
                  {currentAnnotation && (
                    <>
                      <Button 
                        onClick={() => deleteAnnotation(currentAnnotation.id)}
                        variant="destructive" 
                        size="sm"
                      >
                        <Trash className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                      
                      <Button 
                        onClick={generateCommand}
                        variant="outline" 
                        size="sm"
                      >
                        <MousePointer className="h-4 w-4 mr-1" />
                        Use Element
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-medium mb-2">Saved Elements ({annotations.length})</h3>
              
              {annotations.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No annotations yet. Draw on the screenshot to create them.
                </p>
              ) : (
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                  {annotations.map(ann => (
                    <div 
                      key={ann.id}
                      className={`p-2 text-xs rounded border ${
                        currentAnnotation?.id === ann.id 
                          ? 'bg-muted border-blue-500' 
                          : 'bg-card border-border hover:bg-muted/50'
                      } cursor-pointer`}
                      onClick={() => selectAnnotation(ann)}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{ann.name}</span>
                        <Button
                          variant="ghost" 
                          size="icon" 
                          className="h-5 w-5"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteAnnotation(ann.id);
                          }}
                        >
                          <Trash className="h-3 w-3" />
                        </Button>
                      </div>
                      {ann.selector && (
                        <div className="text-muted-foreground mt-1 flex items-center justify-between">
                          <code className="text-[10px]">{ann.selector}</code>
                          <Button
                            variant="ghost" 
                            size="icon" 
                            className="h-5 w-5"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(ann.selector);
                              toast({
                                title: "Copied",
                                description: "Selector copied to clipboard"
                              });
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-md font-medium">Instructions</h3>
        <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1 pl-4">
          <li>Take a screenshot of the current browser window</li>
          <li>Draw regions on the screenshot by clicking and dragging</li>
          <li>Name the selected area and optionally add a CSS selector</li>
          <li>Save annotations to use them in later commands</li>
          <li>Click "Use Element" to generate a command using the selected annotation</li>
        </ol>
      </div>
    </div>
  );
};

export default ManualAnnotationTab;
