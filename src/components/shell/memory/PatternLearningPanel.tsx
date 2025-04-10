
import React from 'react';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';
import { logService } from '@/services/LogService';
import LearningModeButton from './LearningModeButton';

interface PatternLearningPanelProps {
  learningMode: 'disabled' | 'active' | 'autonomous';
  toggleLearningMode: () => void;
}

const PatternLearningPanel: React.FC<PatternLearningPanelProps> = ({ 
  learningMode, 
  toggleLearningMode 
}) => {
  return (
    <div className="rounded-md border border-border bg-card p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold">Pattern Learning System</h3>
        <LearningModeButton 
          learningMode={learningMode} 
          toggleLearningMode={toggleLearningMode}
        />
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
  );
};

export default PatternLearningPanel;
