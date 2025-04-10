
import React, { useState, useEffect } from 'react';
import { MemoryItem, MemoryType } from '@/types/types';
import { memoryService } from '@/services/MemoryService';
import MemorySearch from './MemorySearch';
import MemoryTabs from './MemoryTabs';

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
  
  return (
    <div className="rounded-md border border-border bg-card p-2">
      <h3 className="text-sm font-semibold mb-2">Memory Storage</h3>
      
      <MemorySearch 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
      />
      
      <MemoryTabs
        selectedTab={selectedTab}
        handleTabChange={handleTabChange}
        memories={memories}
        onItemClick={onMemoryItemSelected}
        formatDate={formatDate}
      />
    </div>
  );
};

export default MemoryPanel;
