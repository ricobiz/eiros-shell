
import React from 'react';
import { MemoryItem } from '@/types/types';
import MemoryPanel from '@/components/memory/MemoryPanel';
import MemoryDetailPanel from './MemoryDetailPanel';

interface MemoryViewProps {
  selectedMemory: MemoryItem | null;
  onMemoryItemSelected: (item: MemoryItem) => void;
}

const MemoryView: React.FC<MemoryViewProps> = ({ 
  selectedMemory, 
  onMemoryItemSelected 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <MemoryPanel onMemoryItemSelected={onMemoryItemSelected} />
      </div>
      
      <div className="space-y-2">
        <MemoryDetailPanel selectedMemory={selectedMemory} />
      </div>
    </div>
  );
};

export default MemoryView;
