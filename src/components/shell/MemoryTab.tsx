import React, { useState } from 'react';
import { MemoryItem } from '@/types/types';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Zap, History, AlertTriangle } from 'lucide-react';
import { logService } from '@/services/LogService';
import MemoryPanel from '../memory/MemoryPanel';

interface MemoryTabProps {
  selectedMemory: MemoryItem | null;
  onMemoryItemSelected: (item: MemoryItem) => void;
}

const MemoryTab: React.FC<MemoryTabProps> = ({ 
  selectedMemory, 
  onMemoryItemSelected 
}) => {
  const [activeTab, setActiveTab] = useState('memory');
  const [learningMode, setLearningMode] = useState<'disabled' | 'active' | 'autonomous'>('disabled');
  
  const toggleLearningMode = () => {
    const modes = ['disabled', 'active', 'autonomous'] as const;
    const currentIndex = modes.indexOf(learningMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setLearningMode(modes[nextIndex]);
    
    logService.addLog({
      type: 'info',
      message: `Pattern learning mode changed to: ${modes[nextIndex]}`,
      timestamp: Date.now()
    });
  };
  
  const getStatusColor = () => {
    switch (learningMode) {
      case 'disabled': return 'bg-red-500/30';
      case 'active': return 'bg-yellow-500/30';
      case 'autonomous': return 'bg-green-500/30';
      default: return 'bg-muted';
    }
  };
  
  const getLearningModeText = () => {
    switch (learningMode) {
      case 'disabled': return 'Learning Disabled';
      case 'active': return 'Active Learning';
      case 'autonomous': return 'Autonomous Learning';
      default: return 'Unknown Mode';
    }
  };
  
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-3 mb-4">
        <TabsTrigger value="memory" className="text-xs">
          <History size={14} className="mr-1" />
          Memory Items
        </TabsTrigger>
        <TabsTrigger value="learning" className="text-xs">
          <Brain size={14} className="mr-1" />
          Pattern Learning
        </TabsTrigger>
        <TabsTrigger value="errors" className="text-xs">
          <AlertTriangle size={14} className="mr-1" />
          Error Analysis
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="memory" className="mt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <MemoryPanel onMemoryItemSelected={onMemoryItemSelected} />
          </div>
          
          <div className="space-y-2">
            <div className="rounded-md border border-border bg-card p-2 h-[400px] overflow-auto">
              <h3 className="text-sm font-semibold mb-2">Memory Detail</h3>
              {selectedMemory ? (
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs font-mono bg-muted px-1 rounded">
                      {selectedMemory.id}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(selectedMemory.createdAt).toLocaleString()}
                    </span>
                  </div>
                  
                  {selectedMemory.type === 'screenshot' && (
                    <img
                      src={selectedMemory.data}
                      alt="Screenshot"
                      className="max-w-full border border-border rounded-sm"
                    />
                  )}
                  
                  {selectedMemory.type !== 'screenshot' && (
                    <pre className="text-xs bg-muted/30 p-2 rounded-sm overflow-auto mt-2">
                      {JSON.stringify(selectedMemory.data, null, 2)}
                    </pre>
                  )}
                  
                  <div className="mt-4">
                    <h4 className="text-xs font-semibold">Tags:</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedMemory.tags.map((tag, i) => (
                        <span key={i} className="text-[10px] bg-secondary/30 px-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Select a memory item to view details
                </div>
              )}
            </div>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="learning" className="mt-0">
        <div className="rounded-md border border-border bg-card p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold">Pattern Learning System</h3>
            <Button variant="outline" size="sm" onClick={toggleLearningMode} className="h-8">
              <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor()}`}></div>
              {getLearningModeText()}
            </Button>
          </div>
          
          <div className="space-y-4">
            <div className="bg-muted/30 p-3 rounded-md">
              <h4 className="text-xs font-semibold mb-2">Learned UI Patterns</h4>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="text-center p-2 bg-muted/20 rounded-md">
                  <div className="text-lg font-bold">32</div>
                  <div className="text-xs text-muted-foreground">Total Patterns</div>
                </div>
                <div className="text-center p-2 bg-muted/20 rounded-md">
                  <div className="text-lg font-bold">87%</div>
                  <div className="text-xs text-muted-foreground">Success Rate</div>
                </div>
              </div>
              
              <h5 className="text-xs mb-1">Recently Learned Patterns</h5>
              <div className="space-y-1 max-h-[120px] overflow-y-auto text-xs">
                <div className="p-1 border-b border-border/50">
                  <div className="flex justify-between">
                    <span className="font-mono">#login-button</span>
                    <span className="text-green-400">✓ 8/8</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">Login form submission - 2 hours ago</span>
                </div>
                <div className="p-1 border-b border-border/50">
                  <div className="flex justify-between">
                    <span className="font-mono">.nav-item:nth-child(3)</span>
                    <span className="text-yellow-400">✓ 3/4</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">Dashboard navigation - 3 hours ago</span>
                </div>
                <div className="p-1 border-b border-border/50">
                  <div className="flex justify-between">
                    <span className="font-mono">[data-testid="submit"]</span>
                    <span className="text-red-400">✓ 1/4</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">Form submission - 1 day ago</span>
                </div>
              </div>
              
              <div className="flex justify-end mt-2">
                <Button variant="ghost" size="sm" className="h-6 text-xs">View All Patterns</Button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/30 p-3 rounded-md">
                <h4 className="text-xs font-semibold mb-2">Learning Settings</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Auto-retrain unstable patterns</span>
                    <span className="text-green-400">Enabled</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fail-safe loop</span>
                    <span className="text-green-400">Enabled (3 attempts)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Error classification</span>
                    <span className="text-green-400">Enabled</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pattern snapshots</span>
                    <span className="text-yellow-400">Visual Only</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-muted/30 p-3 rounded-md">
                <h4 className="text-xs font-semibold mb-2">Train Manual Pattern</h4>
                <div className="space-y-2 text-xs">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full h-7 text-xs"
                    onClick={() => {
                      logService.addLog({
                        type: 'info',
                        message: 'Manual pattern training initiated',
                        timestamp: Date.now()
                      });
                    }}
                  >
                    <Zap size={12} className="mr-1" />
                    Start Pattern Training
                  </Button>
                  <p className="text-[10px] text-muted-foreground">
                    Create a new pattern by demonstrating the interaction sequence and saving it for future reuse.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="errors" className="mt-0">
        <div className="rounded-md border border-border bg-card p-4">
          <h3 className="text-sm font-semibold mb-3">Error Classification & Analysis</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-muted/30 p-3 rounded-md">
              <h4 className="text-xs font-semibold mb-2">Error Categories</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-full bg-muted/50 h-2 rounded-full overflow-hidden mr-2">
                    <div className="bg-yellow-500/70 h-full" style={{ width: '45%' }}></div>
                  </div>
                  <span className="text-xs w-24">#selector_missing</span>
                  <span className="text-xs ml-auto">45%</span>
                </div>
                <div className="flex items-center">
                  <div className="w-full bg-muted/50 h-2 rounded-full overflow-hidden mr-2">
                    <div className="bg-red-500/70 h-full" style={{ width: '30%' }}></div>
                  </div>
                  <span className="text-xs w-24">#auth_failed</span>
                  <span className="text-xs ml-auto">30%</span>
                </div>
                <div className="flex items-center">
                  <div className="w-full bg-muted/50 h-2 rounded-full overflow-hidden mr-2">
                    <div className="bg-blue-500/70 h-full" style={{ width: '15%' }}></div>
                  </div>
                  <span className="text-xs w-24">#timeout</span>
                  <span className="text-xs ml-auto">15%</span>
                </div>
                <div className="flex items-center">
                  <div className="w-full bg-muted/50 h-2 rounded-full overflow-hidden mr-2">
                    <div className="bg-purple-500/70 h-full" style={{ width: '10%' }}></div>
                  </div>
                  <span className="text-xs w-24">#blocked</span>
                  <span className="text-xs ml-auto">10%</span>
                </div>
              </div>
            </div>
            
            <div className="bg-muted/30 p-3 rounded-md">
              <h4 className="text-xs font-semibold mb-2">Recent Failures</h4>
              <div className="space-y-1 text-xs max-h-[120px] overflow-y-auto">
                <div className="p-1 border-b border-border/50">
                  <span className="font-mono text-red-400">#auth_failed</span>
                  <div className="flex justify-between text-[10px]">
                    <span>login.php</span>
                    <span className="text-muted-foreground">3 hours ago</span>
                  </div>
                </div>
                <div className="p-1 border-b border-border/50">
                  <span className="font-mono text-yellow-400">#selector_missing</span>
                  <div className="flex justify-between text-[10px]">
                    <span>.submit-button</span>
                    <span className="text-muted-foreground">5 hours ago</span>
                  </div>
                </div>
                <div className="p-1 border-b border-border/50">
                  <span className="font-mono text-blue-400">#timeout</span>
                  <div className="flex justify-between text-[10px]">
                    <span>dashboard.php</span>
                    <span className="text-muted-foreground">1 day ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-muted/30 p-3 rounded-md">
            <h4 className="text-xs font-semibold mb-2">Retry Strategies</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span>When #selector_missing:</span>
                <span className="bg-secondary/20 px-2 py-0.5 rounded text-[10px]">
                  Try nearest similar element → Manual annotation → Retrain
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>When #auth_failed:</span>
                <span className="bg-secondary/20 px-2 py-0.5 rounded text-[10px]">
                  Refresh page → Relogin → Request credentials
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>When #timeout:</span>
                <span className="bg-secondary/20 px-2 py-0.5 rounded text-[10px]">
                  Increase wait time → Retry 3x → Report network issue
                </span>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default MemoryTab;
