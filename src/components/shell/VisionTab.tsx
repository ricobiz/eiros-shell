
import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Edit, Save } from 'lucide-react';
import { CommandType, MemoryType } from '@/types/types';
import { memoryService } from '@/services/MemoryService';
import { logService } from '@/services/LogService';

interface VisionTabProps {
  commandResult: any;
  isAnnotating: boolean;
  annotations: {id: string, element: string, description: string}[];
  currentAnnotation: {element: string, description: string};
  onToggleAnnotating: () => void;
  onCurrentAnnotationChange: (annotation: {element: string, description: string}) => void;
  onSaveAnnotation: () => void;
  onTakeScreenshot: () => void;
  onAnalyzeInterface: () => void;
}

const VisionTab: React.FC<VisionTabProps> = ({
  commandResult,
  isAnnotating,
  annotations,
  currentAnnotation,
  onToggleAnnotating,
  onCurrentAnnotationChange,
  onSaveAnnotation,
  onTakeScreenshot,
  onAnalyzeInterface
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={onTakeScreenshot}
          >
            Take Screenshot
          </Button>
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={onAnalyzeInterface}
          >
            Analyze Interface
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm">Annotate Mode</span>
          <Switch 
            checked={isAnnotating} 
            onCheckedChange={onToggleAnnotating} 
          />
        </div>
      </div>
      
      <div className="aspect-video bg-muted/30 rounded-md border border-border flex items-center justify-center">
        {commandResult && typeof commandResult === 'string' && commandResult.startsWith('data:image') ? (
          <img 
            src={commandResult} 
            alt="Captured Screenshot" 
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <div className="text-muted-foreground text-sm">
            Visual analysis content will appear here
          </div>
        )}
      </div>
      
      {isAnnotating && (
        <div className="mt-2 p-3 border border-accent/30 rounded-md">
          <h3 className="text-sm font-semibold mb-2">Annotate UI Element</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs mb-1 block">Element Selector</label>
              <input 
                type="text" 
                className="w-full p-2 text-xs rounded-sm border border-border"
                placeholder="#login-button or .navbar"
                value={currentAnnotation.element}
                onChange={(e) => onCurrentAnnotationChange({...currentAnnotation, element: e.target.value})}
              />
            </div>
            <div>
              <label className="text-xs mb-1 block">Description/Purpose</label>
              <input 
                type="text" 
                className="w-full p-2 text-xs rounded-sm border border-border"
                placeholder="Login button that submits credentials"
                value={currentAnnotation.description}
                onChange={(e) => onCurrentAnnotationChange({...currentAnnotation, description: e.target.value})}
              />
            </div>
          </div>
          <Button 
            size="sm" 
            onClick={onSaveAnnotation}
            disabled={!currentAnnotation.element || !currentAnnotation.description}
            className="w-full"
          >
            <Save size={14} className="mr-1" />
            Save Element Annotation
          </Button>
        </div>
      )}
      
      {commandResult && typeof commandResult === 'object' && commandResult.elements && (
        <div className="mt-2">
          <h3 className="text-sm font-semibold mb-1">Detected Elements:</h3>
          <div className="bg-muted/30 p-2 rounded-md text-xs space-y-1 max-h-[200px] overflow-y-auto">
            {commandResult.elements.map((elem: any, i: number) => (
              <div key={i} className="p-1 border-b border-border last:border-0">
                <div className="flex justify-between">
                  <span className="font-semibold">{elem.type}</span>
                  <span className="text-muted-foreground text-[10px]">
                    ({elem.rect.x}, {elem.rect.y})
                  </span>
                </div>
                {elem.text && <span className="text-accent text-[10px]">{elem.text}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {annotations.length > 0 && (
        <div className="mt-2">
          <h3 className="text-sm font-semibold mb-1">Saved Annotations:</h3>
          <div className="bg-muted/30 p-2 rounded-md text-xs space-y-1 max-h-[200px] overflow-y-auto">
            {annotations.map((anno) => (
              <div key={anno.id} className="p-1 border-b border-border last:border-0">
                <div className="flex justify-between">
                  <span className="font-semibold">{anno.element}</span>
                  <Button variant="ghost" size="sm" className="h-5 px-1 text-[10px]">
                    <Edit size={10} className="mr-1" />
                    Edit
                  </Button>
                </div>
                <span className="text-accent text-[10px]">{anno.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VisionTab;
