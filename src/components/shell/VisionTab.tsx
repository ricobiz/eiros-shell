
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Edit, Save, RefreshCw, Trash2 } from 'lucide-react';
import { CommandType, MemoryType } from '@/types/types';
import { memoryService } from '@/services/MemoryService';
import { logService } from '@/services/LogService';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

interface PatternStats {
  total: number;
  successful: number;
  failed: number;
  patterns: {
    id: string;
    selector: string;
    successRate: number;
    lastUsed: number;
    timesUsed: number;
    tags: string[];
  }[];
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
  const [activeTab, setActiveTab] = useState('visual');
  const [patternStats, setPatternStats] = useState<PatternStats>({
    total: 0,
    successful: 0,
    failed: 0,
    patterns: []
  });

  // Fetch pattern statistics on component mount
  useEffect(() => {
    // This would be replaced with actual API call to get pattern stats
    const fetchPatternStats = async () => {
      try {
        // Mock data for now - would be replaced with actual API call
        const patterns = memoryService.getMemoryItems(MemoryType.PATTERN, undefined, 100);
        
        const stats: PatternStats = {
          total: patterns.length,
          successful: patterns.filter(p => p.data?.successRate >= 0.7).length,
          failed: patterns.filter(p => p.data?.successRate < 0.7).length,
          patterns: patterns.map(p => ({
            id: p.id || '',
            selector: p.data?.selector || '',
            successRate: p.data?.successRate || 0,
            lastUsed: p.lastAccessed || p.createdAt || Date.now(),
            timesUsed: p.data?.timesUsed || 0,
            tags: p.tags || []
          }))
        };
        
        setPatternStats(stats);
      } catch (error) {
        console.error('Failed to fetch pattern stats:', error);
      }
    };
    
    fetchPatternStats();
    
    // Set up refresh interval
    const intervalId = setInterval(fetchPatternStats, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };
  
  const deletePattern = (patternId: string) => {
    // Would call API to delete pattern
    memoryService.removeMemoryItem(patternId);
    
    // Update stats
    setPatternStats(prev => ({
      ...prev,
      total: prev.total - 1,
      patterns: prev.patterns.filter(p => p.id !== patternId)
    }));
    
    logService.addLog({
      type: 'info',
      message: `Pattern deleted: ${patternId}`,
      timestamp: Date.now()
    });
  };
  
  const retrainPattern = (patternId: string) => {
    // Would initiate retraining workflow for this pattern
    logService.addLog({
      type: 'info',
      message: `Pattern retraining initiated: ${patternId}`,
      timestamp: Date.now()
    });
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-2">
          <TabsTrigger value="visual" className="text-xs">Visual Analysis</TabsTrigger>
          <TabsTrigger value="patterns" className="text-xs">Pattern Memory</TabsTrigger>
        </TabsList>
        
        <TabsContent value="visual" className="space-y-4">
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
        </TabsContent>
        
        <TabsContent value="patterns" className="space-y-4">
          <Card className="p-4 bg-muted/20">
            <h3 className="text-sm font-semibold mb-2">Pattern Memory Statistics</h3>
            
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="rounded-lg bg-muted/30 p-2 text-center">
                <div className="text-xl font-bold">{patternStats.total}</div>
                <div className="text-xs text-muted-foreground">Total Patterns</div>
              </div>
              
              <div className="rounded-lg bg-green-900/20 p-2 text-center">
                <div className="text-xl font-bold">{patternStats.successful}</div>
                <div className="text-xs text-muted-foreground">Stable</div>
              </div>
              
              <div className="rounded-lg bg-red-900/20 p-2 text-center">
                <div className="text-xl font-bold">{patternStats.failed}</div>
                <div className="text-xs text-muted-foreground">Unstable</div>
              </div>
            </div>
            
            <h4 className="text-xs font-semibold mb-1">Pattern Registry</h4>
            {patternStats.patterns.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground text-sm">
                No patterns learned yet
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {patternStats.patterns.map((pattern) => (
                  <div key={pattern.id} className="bg-muted/30 rounded p-2 text-xs">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-mono">{pattern.selector}</span>
                      <div className="space-x-1">
                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => retrainPattern(pattern.id)}>
                          <RefreshCw size={12} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-5 w-5 text-red-400" onClick={() => deletePattern(pattern.id)}>
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-[10px] text-muted-foreground">Success:</span>
                      <Progress value={pattern.successRate * 100} className="h-1" />
                      <span className="text-[10px]">{(pattern.successRate * 100).toFixed(0)}%</span>
                    </div>
                    
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>Used: {pattern.timesUsed} times</span>
                      <span>Last: {formatDate(pattern.lastUsed)}</span>
                    </div>
                    
                    <div className="mt-1 flex flex-wrap gap-1">
                      {pattern.tags.map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-[9px] h-3 px-1 bg-secondary/30">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-3 flex justify-end">
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => {
                logService.addLog({
                  type: 'info',
                  message: 'Pattern memory export initiated',
                  timestamp: Date.now()
                });
              }}>
                Export Patterns
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VisionTab;
