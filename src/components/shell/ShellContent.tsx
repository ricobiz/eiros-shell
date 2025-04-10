
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { useShell } from '@/contexts/shell/ShellContext';
import CommandTab from './CommandTab';
import InstructionsTab from './InstructionsTab';
import BrowserPreviewTab from './BrowserPreviewTab';
import VisionTab from './VisionTab';
import MemoryTab from './MemoryTab';
import ChatTab from './ChatTab';
import DocumentationTab from './DocumentationTab';

const ShellContent: React.FC = () => {
  const { activeTab, commandResult, handleCommandExecuted } = useShell();
  
  return (
    <>
      <TabsContent value="command">
        <CommandTab onCommandExecuted={handleCommandExecuted} />
      </TabsContent>
      
      <TabsContent value="instructions">
        <InstructionsTab />
      </TabsContent>
      
      <TabsContent value="browser">
        <BrowserPreviewTab />
      </TabsContent>
      
      <TabsContent value="vision">
        <VisionTab />
      </TabsContent>
      
      <TabsContent value="memory">
        <MemoryTab />
      </TabsContent>
      
      <TabsContent value="chat">
        <ChatTab />
      </TabsContent>
      
      <TabsContent value="docs">
        <DocumentationTab />
      </TabsContent>
    </>
  );
};

export default ShellContent;
