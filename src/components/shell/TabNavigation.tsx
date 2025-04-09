
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TerminalSquare, 
  Eye, 
  Brain, 
  MessageSquare, 
  Globe, 
  BookOpen,
  Link
} from 'lucide-react';
import { 
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';

interface TabNavigationProps {
  activeTab: string;
  isConnectedToAI?: boolean;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, isConnectedToAI = false }) => {
  const mobileView = (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <TerminalSquare size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[240px] p-0">
        <div className="flex flex-col py-2">
          {isConnectedToAI && (
            <div className="mx-2 mb-2 px-3 py-2 rounded-md bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs flex items-center">
              <Link size={12} className="mr-1.5" />
              Connected to AI
            </div>
          )}
          {[
            { value: "command", label: "Command", icon: <TerminalSquare size={14} /> },
            { value: "vision", label: "Vision", icon: <Eye size={14} /> },
            { value: "memory", label: "Memory", icon: <Brain size={14} /> },
            { value: "chat", label: "Chat", icon: <MessageSquare size={14} /> },
            { value: "browser", label: "Browser", icon: <Globe size={14} /> },
            { value: "instructions", label: "Help", icon: <BookOpen size={14} /> }
          ].map((tab) => (
            <Button 
              key={tab.value} 
              variant={activeTab === tab.value ? "secondary" : "ghost"}
              className="justify-start w-full rounded-none"
              asChild
            >
              <TabsTrigger value={tab.value} className="w-full justify-start">
                <span className="flex items-center space-x-2">
                  {tab.icon}
                  <span>{tab.label}</span>
                </span>
              </TabsTrigger>
            </Button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );

  const desktopView = (
    <div className="hidden md:block w-full">
      {isConnectedToAI && (
        <div className="mb-2 px-3 py-2 rounded-md bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs flex items-center justify-center">
          <Link size={12} className="mr-1.5" />
          Connected to AI
        </div>
      )}
      <TabsList className="grid grid-cols-6 w-full">
        <TabsTrigger value="command" className="flex items-center space-x-1">
          <TerminalSquare size={14} />
          <span>Command</span>
        </TabsTrigger>
        <TabsTrigger value="vision" className="flex items-center space-x-1">
          <Eye size={14} />
          <span>Vision</span>
        </TabsTrigger>
        <TabsTrigger value="memory" className="flex items-center space-x-1">
          <Brain size={14} />
          <span>Memory</span>
        </TabsTrigger>
        <TabsTrigger value="chat" className="flex items-center space-x-1">
          <MessageSquare size={14} />
          <span>Chat</span>
        </TabsTrigger>
        <TabsTrigger value="browser" className="flex items-center space-x-1">
          <Globe size={14} />
          <span>Browser</span>
        </TabsTrigger>
        <TabsTrigger value="instructions" className="flex items-center space-x-1">
          <BookOpen size={14} />
          <span>Help</span>
        </TabsTrigger>
      </TabsList>
    </div>
  );

  return (
    <div className="flex items-center w-full">
      {mobileView}
      {desktopView}
    </div>
  );
};

export default TabNavigation;
