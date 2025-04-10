
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
  AlertOctagon
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

const ShellHeader: React.FC = () => {
  const { isPinned, isConnectedToAI, handleTogglePin, handleToggleAIConnection } = useShell();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const Instructions = () => (
    <div className="px-2 py-4">
      <InstructionsTab />
    </div>
  );
  
  const handleEmergencyStop = () => {
    aiSyncService.emergencyStop();
    toast({
      title: t('emergencyStopTitle'),
      description: t('emergencyStopDesc'),
      variant: "destructive",
    });
  };
  
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
            <CardTitle className="text-sm ml-1">{t('shell')}</CardTitle>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <LanguageSelector />
          
          <TaskScheduler />
          
          <EmergencyPauseButton />
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant={isConnectedToAI ? "default" : "outline"} 
                  size="sm" 
                  className="h-8"
                  onClick={handleToggleAIConnection}
                >
                  {isConnectedToAI ? (
                    <div className="flex items-center">
                      <span className="mr-1.5 h-2 w-2 rounded-full bg-green-500"></span>
                      <Unlink size={14} className="mr-1" />
                      <span className="text-xs">{t('disconnect')}</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Link size={14} className="mr-1" />
                      <span className="text-xs">{t('connect')}</span>
                    </div>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isConnectedToAI ? t('disconnect') : t('connect')}
              </TooltipContent>
            </Tooltip>

            {isConnectedToAI && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    className="h-8"
                    onClick={handleEmergencyStop}
                  >
                    <AlertOctagon size={14} className="mr-1" />
                    <span className="text-xs">{t('stop')}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {t('emergencyStop')}
                </TooltipContent>
              </Tooltip>
            )}

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
