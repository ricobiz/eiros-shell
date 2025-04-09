
import React from 'react';
import { CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Cpu, Pin, PinOff } from 'lucide-react';

interface ShellHeaderProps {
  isPinned: boolean;
  onTogglePin: () => void;
}

const ShellHeader: React.FC<ShellHeaderProps> = ({ isPinned, onTogglePin }) => {
  return (
    <div className="bg-muted/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Cpu size={18} className="text-accent animate-pulse-accent" />
          <CardTitle className="text-lg">AI Shell Interface</CardTitle>
        </div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onTogglePin}
                className="h-8 w-8"
              >
                {isPinned ? <PinOff size={16} /> : <Pin size={16} />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isPinned ? 'Unpin window' : 'Pin window (always on top)'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <CardDescription>Command & Control Interface for AI Interaction</CardDescription>
    </div>
  );
};

export default ShellHeader;
