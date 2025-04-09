
import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MemoryItem, MemoryType } from '@/types/types';
import { memoryService } from '@/services/MemoryService';

interface MemoryPanelProps {
  onMemoryItemSelected?: (item: MemoryItem) => void;
}

const MemoryPanel: React.FC<MemoryPanelProps> = ({ onMemoryItemSelected }) => {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<MemoryType | 'all'>('all');
  
  useEffect(() => {
    loadMemories();
  }, [selectedTab]);
  
  const loadMemories = () => {
    if (selectedTab === 'all') {
      setMemories(memoryService.getMemoryItems(undefined, undefined, 50));
    } else {
      setMemories(memoryService.getMemoryItems(selectedTab, undefined, 50));
    }
  };
  
  const handleSearch = () => {
    if (searchQuery.trim()) {
      const results = memoryService.searchMemory(searchQuery);
      setMemories(results);
    } else {
      loadMemories();
    }
  };
  
  const handleTabChange = (value: string) => {
    setSelectedTab(value as MemoryType | 'all');
    setSearchQuery('');
  };
  
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };
  
  const renderMemoryContent = (item: MemoryItem) => {
    switch (item.type) {
      case 'screenshot':
        return (
          <div className="mt-1">
            <img 
              src={item.data} 
              alt="Screenshot" 
              className="max-h-32 object-cover rounded-sm border border-border"
            />
          </div>
        );
      case 'command':
        return (
          <div className="mt-1 text-xs font-mono">
            <div className="bg-muted p-1 rounded">
              <span className="text-accent">{item.data.type}</span>
              <span className="text-muted-foreground"> {item.data.id}</span>
            </div>
          </div>
        );
      case 'element':
        return (
          <div className="mt-1 text-xs">
            <span className="text-muted-foreground">
              {item.data.elements?.length || 0} elements detected
            </span>
          </div>
        );
      default:
        return (
          <div className="mt-1 text-xs text-muted-foreground">
            {typeof item.data === 'object' 
              ? JSON.stringify(item.data).substring(0, 50) + '...'
              : String(item.data).substring(0, 50)}
          </div>
        );
    }
  };
  
  return (
    <div className="rounded-md border border-border bg-card p-2">
      <h3 className="text-sm font-semibold mb-2">Memory Storage</h3>
      
      <div className="flex items-center space-x-2 mb-3">
        <Input
          placeholder="Search memory..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="text-sm h-8"
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button size="sm" variant="secondary" onClick={handleSearch} className="h-8">
          Search
        </Button>
      </div>
      
      <Tabs defaultValue="all" onValueChange={handleTabChange} className="w-full">
        <TabsList className="w-full mb-2">
          <TabsTrigger value="all" className="text-xs flex-1">All</TabsTrigger>
          <TabsTrigger value="command" className="text-xs flex-1">Commands</TabsTrigger>
          <TabsTrigger value="screenshot" className="text-xs flex-1">Images</TabsTrigger>
          <TabsTrigger value="element" className="text-xs flex-1">Elements</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-0">
          <MemoryList 
            items={memories} 
            onItemClick={onMemoryItemSelected}
            renderContent={renderMemoryContent}
            formatDate={formatDate}
          />
        </TabsContent>
        
        {Object.values(MemoryType).map(type => (
          <TabsContent key={type} value={type} className="mt-0">
            <MemoryList 
              items={memories}
              onItemClick={onMemoryItemSelected}
              renderContent={renderMemoryContent}
              formatDate={formatDate}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

interface MemoryListProps {
  items: MemoryItem[];
  onItemClick?: (item: MemoryItem) => void;
  renderContent: (item: MemoryItem) => React.ReactNode;
  formatDate: (timestamp: number) => string;
}

const MemoryList: React.FC<MemoryListProps> = ({ 
  items, 
  onItemClick, 
  renderContent,
  formatDate
}) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        No memory items found
      </div>
    );
  }
  
  return (
    <ScrollArea className="h-[320px]">
      <div className="space-y-2 pr-2">
        {items.map(item => (
          <div 
            key={item.id}
            className="memory-item cursor-pointer"
            onClick={() => onItemClick?.(item)}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-1">
                <span className="text-xs font-semibold">
                  {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {formatDate(item.createdAt)}
              </span>
            </div>
            
            {renderContent(item)}
            
            <div className="mt-1 flex flex-wrap gap-1">
              {item.tags.map((tag, i) => (
                <Badge 
                  key={`${item.id}_tag_${i}`}
                  variant="outline" 
                  className="text-[10px] h-4 bg-secondary/30"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default MemoryPanel;
