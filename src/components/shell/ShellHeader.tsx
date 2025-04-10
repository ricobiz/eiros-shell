
import React, { useEffect } from 'react';
import { CardTitle } from '@/components/ui/card';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Cpu, 
  Pin, 
  PinOff, 
  HelpCircle,
  Maximize2,
  Minimize2,
  Edit,
  Check
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMediaQuery } from "@/hooks/use-mobile";
import InstructionsTab from './InstructionsTab';
import { useShell } from '@/contexts/shell/ShellContext';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';
import TaskScheduler from '@/components/TaskScheduler';
import { useTaskScheduler } from '@/contexts/TaskSchedulerContext';

const ShellHeader: React.FC = () => {
  const { isPinned, isConnectedToAI, handleTogglePin, handleToggleAIConnection, handleEmergencyStop } = useShell();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { toast } = useToast();
  const { t } = useLanguage();
  const { isExecutionPaused, toggleExecutionPause } = useTaskScheduler();
  const [expanded, setExpanded] = React.useState(false);
  const [customTitle, setCustomTitle] = React.useState("Shell Assistant"); // Default custom title
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [titleInput, setTitleInput] = React.useState(customTitle);
  
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
    // Dispatch custom event to notify other components
    const event = new CustomEvent('shell-expand', { detail: !expanded });
    window.dispatchEvent(event);
  };

  // Load custom title from localStorage if available
  useEffect(() => {
    const savedTitle = localStorage.getItem('shellCustomTitle');
    if (savedTitle) {
      setCustomTitle(savedTitle);
      setTitleInput(savedTitle);
    }
  }, []);

  // Save custom title to localStorage when it changes
  const updateCustomTitle = (newTitle: string) => {
    if (newTitle.trim()) {
      setCustomTitle(newTitle);
      localStorage.setItem('shellCustomTitle', newTitle);
      toast({
        title: "Title updated",
        description: "The shell title has been updated."
      });
    }
  };

  const handleTitleSave = () => {
    updateCustomTitle(titleInput);
    setIsEditingTitle(false);
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
            {isEditingTitle ? (
              <div className="flex items-center ml-1">
                <Input 
                  type="text" 
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="h-6 py-1 px-2 text-sm w-32"
                  autoFocus
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 ml-1" 
                  onClick={handleTitleSave}
                >
                  <Check size={14} />
                </Button>
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="link" className="p-0 h-auto">
                    <CardTitle className="text-sm ml-1 flex items-center">
                      {customTitle}
                      <Edit size={12} className="ml-1 opacity-50" />
                    </CardTitle>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  className="bg-background border border-border shadow-md p-2 min-w-[150px]" 
                  align="start"
                >
                  <DropdownMenuItem onClick={() => setIsEditingTitle(true)}>
                    Edit title
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
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
