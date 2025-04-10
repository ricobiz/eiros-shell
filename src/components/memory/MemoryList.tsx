
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MemoryItem } from '@/types/types';
import MemoryItemComponent from './MemoryItem';

interface MemoryListProps {
  items: MemoryItem[];
  onItemClick?: (item: MemoryItem) => void;
  formatDate: (timestamp: number) => string;
}

const MemoryList: React.FC<MemoryListProps> = ({ 
  items, 
  onItemClick = () => {}, 
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
          <MemoryItemComponent 
            key={item.id}
            item={item}
            onClick={onItemClick}
            formatDate={formatDate}
          />
        ))}
      </div>
    </ScrollArea>
  );
};

export default MemoryList;
