
import React from 'react';
import { CardTitle } from '@/components/ui/card';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { 
  Cpu, 
  Pin, 
  PinOff, 
  Command, 
  HelpCircle,
  Link,
  Unlink
} from 'lucide-react';
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { 
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-mobile";
import InstructionsTab from './InstructionsTab';
import { aiSyncService } from '@/services/AISyncService';

interface ShellHeaderProps {
  isPinned: boolean;
  onTogglePin: () => void;
  isConnectedToAI: boolean;
  onToggleAIConnection: () => void;
}

const ShellHeader: React.FC<ShellHeaderProps> = ({ 
  isPinned, 
  onTogglePin, 
  isConnectedToAI, 
  onToggleAIConnection 
}) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  
  const Instructions = () => (
    <div className="px-2 py-4">
      <InstructionsTab />
    </div>
  );
  
  const InstructionsDisplay = isDesktop ? (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="ml-auto h-8 w-8">
          <HelpCircle size={16} />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>AI Shell Instructions</SheetTitle>
        </SheetHeader>
        <Instructions />
      </SheetContent>
    </Sheet>
  ) : (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="ml-auto h-8 w-8">
          <HelpCircle size={16} />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>AI Shell Instructions</DrawerTitle>
        </DrawerHeader>
        <Instructions />
      </DrawerContent>
    </Drawer>
  );

  return (
    <div className="bg-muted/30 px-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5 items-center">
            <div className="h-3 w-3 rounded-full bg-destructive" />
            <div className="h-3 w-3 rounded-full bg-[#FFBD44]" />
            <div className="h-3 w-3 rounded-full bg-accent animate-pulse" />
          </div>
          
          <div className="flex items-center ml-3">
            <Cpu size={14} className="text-accent" />
            <CardTitle className="text-sm ml-1">Shell</CardTitle>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={onToggleAIConnection}
                >
                  {isConnectedToAI ? (
                    <Link size={16} className="text-green-500" />
                  ) : (
                    <Unlink size={16} className="text-muted-foreground" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isConnectedToAI ? 'Disconnect from AI' : 'Connect to AI'}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Command size={16} className="text-primary" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                AI Integration
              </TooltipContent>
            </Tooltip>

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
          
          {InstructionsDisplay}
        </div>
      </div>
    </div>
  );
};

export default ShellHeader;
