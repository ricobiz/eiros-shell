
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { MemoryItem as MemoryItemType } from '@/types/types';

interface MemoryItemProps {
  item: MemoryItemType;
  onClick: (item: MemoryItemType) => void;
  formatDate: (timestamp: number) => string;
}

const MemoryItemComponent: React.FC<MemoryItemProps> = ({ item, onClick, formatDate }) => {
  const renderMemoryContent = () => {
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
    <div 
      className="memory-item cursor-pointer"
      onClick={() => onClick(item)}
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
      
      {renderMemoryContent()}
      
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
  );
};

export default MemoryItemComponent;
