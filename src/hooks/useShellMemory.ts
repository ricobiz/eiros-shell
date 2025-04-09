
import { useState } from 'react';
import { MemoryItem } from '@/types/types';
import { logService } from '@/services/LogService';

export function useShellMemory() {
  const [selectedMemory, setSelectedMemory] = useState<MemoryItem | null>(null);
  
  const handleMemoryItemSelected = (item: MemoryItem) => {
    setSelectedMemory(item);
  };
  
  const handleClearLogs = () => {
    logService.clearLogs();
  };

  return {
    selectedMemory,
    setSelectedMemory,
    handleMemoryItemSelected,
    handleClearLogs
  };
}
