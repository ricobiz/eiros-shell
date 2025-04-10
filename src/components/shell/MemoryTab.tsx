
import React, { useState } from 'react';
import { MemoryItem } from '@/types/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Zap, History, AlertTriangle } from 'lucide-react';
import { logService } from '@/services/LogService';
import MemoryView from './memory/MemoryView';
import PatternLearningPanel from './memory/PatternLearningPanel';
import ErrorClassificationPanel from './memory/ErrorClassificationPanel';

interface MemoryTabProps {
  selectedMemory: MemoryItem | null;
  onMemoryItemSelected: (item: MemoryItem) => void;
}

const MemoryTab: React.FC<MemoryTabProps> = ({ 
  selectedMemory, 
  onMemoryItemSelected 
}) => {
  const [activeTab, setActiveTab] = useState('memory');
  const [learningMode, setLearningMode] = useState<'disabled' | 'active' | 'autonomous'>('disabled');
  
  const toggleLearningMode = () => {
    const modes = ['disabled', 'active', 'autonomous'] as const;
    const currentIndex = modes.indexOf(learningMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setLearningMode(modes[nextIndex]);
    
    logService.addLog({
      type: 'info',
      message: `Pattern learning mode changed to: ${modes[nextIndex]}`,
      timestamp: Date.now()
    });
  };
  
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-3 mb-4">
        <TabsTrigger value="memory" className="text-xs">
          <History size={14} className="mr-1" />
          Memory Items
        </TabsTrigger>
        <TabsTrigger value="learning" className="text-xs">
          <Brain size={14} className="mr-1" />
          Pattern Learning
        </TabsTrigger>
        <TabsTrigger value="errors" className="text-xs">
          <AlertTriangle size={14} className="mr-1" />
          Error Analysis
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="memory" className="mt-0">
        <MemoryView 
          selectedMemory={selectedMemory} 
          onMemoryItemSelected={onMemoryItemSelected} 
        />
      </TabsContent>
      
      <TabsContent value="learning" className="mt-0">
        <PatternLearningPanel 
          learningMode={learningMode}
          toggleLearningMode={toggleLearningMode}
        />
      </TabsContent>
      
      <TabsContent value="errors" className="mt-0">
        <ErrorClassificationPanel />
      </TabsContent>
    </Tabs>
  );
};

export default MemoryTab;
