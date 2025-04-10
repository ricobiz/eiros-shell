
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Save, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useShell } from '@/contexts/shell/ShellContext';

interface Annotation {
  id: string;
  name: string;
  selector?: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

const ManualAnnotationTab: React.FC = () => {
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [currentAnnotation, setCurrentAnnotation] = useState<Partial<Annotation> | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [annotationName, setAnnotationName] = useState('');
  const [annotationSelector, setAnnotationSelector] = useState('');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const { toast } = useToast();
  const { handleTakeScreenshot } = useShell();
  
  useEffect(() => {
    // Load any saved annotations from local storage
    const savedAnnotations = localStorage.getItem('eirosAnnotations');
    if (savedAnnotations) {
      try {
        setAnnotations(JSON.parse(savedAnnotations));
      } catch (e) {
        console.error('Failed to load annotations:', e);
      }
    }
    
    // Load the last screenshot if available
    const lastScreenshot = localStorage.getItem('eirosLastScreenshot');
    if (lastScreenshot) {
      setScreenshot(lastScreenshot);
    }
  }, []);
  
  useEffect(() => {
    if (screenshot) {
      drawCanvas();
    }
  }, [screenshot, annotations, currentAnnotation]);
  
  const takeScreenshot = async () => {
    try {
      const result = await handleTakeScreenshot();
      if (result && result.screenshot) {
        setScreenshot(result.screenshot);
        localStorage.setItem('eirosLastScreenshot', result.screenshot);
        toast({
          title: "Screenshot taken",
          description: "You can now annotate elements on this screenshot."
        });
      }
    } catch (err) {
      toast({
        title: "Failed to take screenshot",
        description: "Please try again or check console for errors.",
        variant: "destructive"
      });
      console.error(err);
    }
  };
  
  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    
    if (!canvas || !ctx || !screenshot) return;
    
    // Load the image if not already loaded
    if (!imgRef.current) {
      imgRef.current = new Image();
      imgRef.current.onload = () => {
        canvas.width = imgRef.current!.width;
        canvas.height = imgRef.current!.height;
        redraw();
      };
      imgRef.current.src = screenshot;
    } else {
      redraw();
    }
    
    function redraw() {
      if (!ctx || !imgRef.current) return;
      
      // Clear canvas and draw the screenshot
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(imgRef.current, 0, 0);
      
      // Draw existing annotations
      annotations.forEach(ann => {
        ctx.strokeStyle = '#21e6c1';
        ctx.lineWidth = 2;
        ctx.strokeRect(ann.x, ann.y, ann.width, ann.height);
        
        // Draw label
        ctx.fillStyle = '#21e6c1';
        ctx.fillRect(ann.x, ann.y - 20, ctx.measureText(ann.name).width + 10, 20);
        ctx.fillStyle = '#000';
        ctx.font = '12px sans-serif';
        ctx.fillText(ann.name, ann.x + 5, ann.y - 5);
      });
      
      // Draw current annotation being created
      if (currentAnnotation && currentAnnotation.width && currentAnnotation.height) {
        ctx.strokeStyle = '#FF5555';
        ctx.lineWidth = 2;
        ctx.strokeRect(
          currentAnnotation.x as number, 
          currentAnnotation.y as number, 
          currentAnnotation.width, 
          currentAnnotation.height
        );
      }
    }
  };
  
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
    setStartPos({ x, y });
    setCurrentAnnotation({
      x,
      y,
      width: 0,
      height: 0
    });
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current || !currentAnnotation) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const width = x - startPos.x;
    const height = y - startPos.y;
    
    setCurrentAnnotation({
      x: width > 0 ? startPos.x : x,
      y: height > 0 ? startPos.y : y,
      width: Math.abs(width),
      height: Math.abs(height)
    });
  };
  
  const handleMouseUp = () => {
    setIsDrawing(false);
  };
  
  const saveAnnotation = () => {
    if (!currentAnnotation || !annotationName.trim()) {
      toast({
        title: "Cannot save annotation",
        description: "Please draw a region and provide a name.",
        variant: "destructive"
      });
      return;
    }
    
    const newAnnotation: Annotation = {
      id: `annotation_${Date.now()}`,
      name: annotationName,
      selector: annotationSelector || undefined,
      x: currentAnnotation.x as number,
      y: currentAnnotation.y as number,
      width: currentAnnotation.width as number,
      height: currentAnnotation.height as number
    };
    
    const updatedAnnotations = [...annotations, newAnnotation];
    setAnnotations(updatedAnnotations);
    
    // Save to local storage
    localStorage.setItem('eirosAnnotations', JSON.stringify(updatedAnnotations));
    
    // Reset form
    setAnnotationName('');
    setAnnotationSelector('');
    setCurrentAnnotation(null);
    
    toast({
      title: "Annotation saved",
      description: `Element "${newAnnotation.name}" has been added to pattern memory.`
    });
  };
  
  const deleteAnnotation = (id: string) => {
    const updatedAnnotations = annotations.filter(ann => ann.id !== id);
    setAnnotations(updatedAnnotations);
    localStorage.setItem('eirosAnnotations', JSON.stringify(updatedAnnotations));
    
    toast({
      title: "Annotation deleted",
      description: "The selected annotation has been removed."
    });
  };
  
  if (!screenshot) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-4">
        <p className="text-muted-foreground mb-4">No screenshot available for annotation.</p>
        <Button onClick={takeScreenshot} className="flex items-center">
          <Camera className="mr-2 h-4 w-4" /> Take Screenshot
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Manual Annotation</h3>
        <Button onClick={takeScreenshot} size="sm" variant="outline">
          <Camera className="mr-2 h-4 w-4" /> New Screenshot
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 border rounded-md overflow-auto max-h-[500px]">
          <canvas 
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="cursor-crosshair"
          />
        </div>
        
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Element Name</Label>
                <Input 
                  id="name" 
                  value={annotationName} 
                  onChange={(e) => setAnnotationName(e.target.value)} 
                  placeholder="e.g. Login Button"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="selector">CSS Selector (optional)</Label>
                <Input 
                  id="selector" 
                  value={annotationSelector} 
                  onChange={(e) => setAnnotationSelector(e.target.value)} 
                  placeholder="e.g. #login-button"
                />
              </div>
              
              <Button 
                onClick={saveAnnotation} 
                disabled={!currentAnnotation || !annotationName.trim()}
                className="w-full"
              >
                <Save className="mr-2 h-4 w-4" /> Save Annotation
              </Button>
            </CardContent>
          </Card>
          
          {annotations.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Saved Annotations</h4>
              <div className="max-h-[200px] overflow-y-auto space-y-1">
                {annotations.map(ann => (
                  <div 
                    key={ann.id} 
                    className="flex justify-between items-center p-2 text-xs bg-muted rounded-md"
                  >
                    <span>{ann.name}</span>
                    <button 
                      onClick={() => deleteAnnotation(ann.id)}
                      className="text-destructive hover:text-destructive/80"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManualAnnotationTab;
