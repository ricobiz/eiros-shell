
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TerminalSquare, Eye, Brain, MessageSquare, Globe, BookOpen } from 'lucide-react';

interface TabNavigationProps {
  activeTab: string;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab }) => {
  return (
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
  );
};

export default TabNavigation;
