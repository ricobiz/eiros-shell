
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { 
  Pin, 
  PinOff, 
  HelpCircle,
  Maximize2,
  Minimize2,
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
import InstructionsTab from '../InstructionsTab';
import { useShell } from '@/contexts/shell/ShellContext';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';
import TaskScheduler from '@/components/TaskScheduler';

interface HeaderActionsProps {
  expanded: boolean;
  onExpandToggle: () => void;
}

const HeaderActions: React.FC<HeaderActionsProps> = ({ expanded, onExpandToggle }) => {
  const { isPinned, handleTogglePin } = useShell();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { t } = useLanguage();
  
  const Instructions = () => (
    <div className="px-2 py-4">
      <InstructionsTab />
    </div>
  );
  
  const InstructionsDisplay = isDesktop ? (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
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
        <Button variant="ghost" size="icon" className="h-8 w-8">
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
    <div className="flex items-center space-x-1">
      <LanguageSelector />
      
      <TaskScheduler />
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onExpandToggle}
              className="h-8 w-8"
            >
              {expanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {expanded ? t('collapseInterface') : t('expandInterface')}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleTogglePin}
              className="h-8 w-8"
            >
              {isPinned ? <PinOff size={16} /> : <Pin size={16} />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isPinned ? t('unpinWindow') : t('pinWindow')}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {InstructionsDisplay}
    </div>
  );
};

export default HeaderActions;
