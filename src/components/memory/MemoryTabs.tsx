
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MemoryItem, MemoryType } from '@/types/types';
import MemoryList from './MemoryList';

interface MemoryTabsProps {
  selectedTab: MemoryType | 'all';
  handleTabChange: (value: string) => void;
  memories: MemoryItem[];
  onItemClick?: (item: MemoryItem) => void;
  formatDate: (timestamp: number) => string;
}

const MemoryTabs: React.FC<MemoryTabsProps> = ({ 
  selectedTab, 
  handleTabChange, 
  memories, 
  onItemClick, 
  formatDate 
}) => {
  return (
    <Tabs defaultValue={selectedTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="w-full mb-2">
        <TabsTrigger value="all" className="text-xs flex-1">All</TabsTrigger>
        <TabsTrigger value="command" className="text-xs flex-1">Commands</TabsTrigger>
        <TabsTrigger value="screenshot" className="text-xs flex-1">Images</TabsTrigger>
        <TabsTrigger value="element" className="text-xs flex-1">Elements</TabsTrigger>
      </TabsList>
      
      <TabsContent value="all" className="mt-0">
        <MemoryList 
          items={memories} 
          onItemClick={onItemClick}
          formatDate={formatDate}
        />
      </TabsContent>
      
      {Object.values(MemoryType).map(type => (
        <TabsContent key={type} value={type} className="mt-0">
          <MemoryList 
            items={memories}
            onItemClick={onItemClick}
            formatDate={formatDate}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default MemoryTabs;
