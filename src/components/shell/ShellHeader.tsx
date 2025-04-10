
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
  HelpCircle,
  Link,
  Unlink,
  AlertOctagon,
  Maximize2,
  Minimize2
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
import { useShell } from '@/contexts/shell/ShellContext';
import { aiSyncService } from '@/services/ai-sync';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';
import TaskScheduler from '@/components/TaskScheduler';
import EmergencyPauseButton from '@/components/EmergencyPauseButton';
import { useTaskScheduler } from '@/contexts/TaskSchedulerContext';

const ShellHeader: React.FC = () => {
  const { isPinned, isConnectedToAI, handleTogglePin, handleToggleAIConnection, handleEmergencyStop } = useShell();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { toast } = useToast();
  const { t } = useLanguage();
  const { isExecutionPaused, toggleExecutionPause } = useTaskScheduler();
  const [expanded, setExpanded] = React.useState(false);
  
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

  const handleExpandToggle = () => {
    setExpanded(!expanded);
  };

  return (
    <div className="bg-muted/30 px-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5 items-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={() => handleToggleAIConnection()} 
                    className="h-3 w-3 rounded-full bg-green-500 hover:bg-green-600 active:bg-green-700 cursor-pointer"
                  />
                </TooltipTrigger>
                <TooltipContent>
                  {isConnectedToAI ? t('disconnect') : t('connect')}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={() => toggleExecutionPause()} 
                    className="h-3 w-3 rounded-full bg-[#FFBD44] hover:bg-[#E0A93E] active:bg-[#C19435] cursor-pointer"
                  />
                </TooltipTrigger>
                <TooltipContent>
                  {isExecutionPaused ? t('resumeExecution') : t('pauseExecution')}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={() => handleEmergencyStop()} 
                    className="h-3 w-3 rounded-full bg-destructive hover:bg-red-600 active:bg-red-700 cursor-pointer"
                  />
                </TooltipTrigger>
                <TooltipContent>
                  {t('emergencyStop')}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="flex items-center ml-3">
            <Cpu size={14} className="text-accent" />
            <CardTitle className="text-sm ml-1">{t('shell')}</CardTitle>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <LanguageSelector />
          
          <TaskScheduler />
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleExpandToggle}
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
      </div>
    </div>
  );
};

export default ShellHeader;
