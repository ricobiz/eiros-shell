
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { useShell } from '@/contexts/ShellContext';
import CommandTab from './CommandTab';
import VisionTab from './VisionTab';
import MemoryTab from './MemoryTab';
import ChatTab from './ChatTab';
import BrowserPreviewTab from './BrowserPreviewTab';
import InstructionsTab from './InstructionsTab';

const ShellContent: React.FC = () => {
  const { 
    commandResult, 
    selectedMemory,
    isAnnotating,
    annotations,
    currentAnnotation,
    browserUrl,
    setBrowserUrl,
    handleCommandExecuted,
    handleMemoryItemSelected,
    handleClearLogs,
    handleTakeScreenshot,
    handleAnalyzeInterface,
    handleToggleAnnotating,
    handleCurrentAnnotationChange,
    handleSaveAnnotation,
    isConnectedToAI
  } = useShell();

  return (
    <>
      <TabsContent value="command" className="mt-0">
        <CommandTab onCommandExecuted={handleCommandExecuted} />
      </TabsContent>
      
      <TabsContent value="vision" className="mt-0">
        <VisionTab 
          commandResult={commandResult}
          isAnnotating={isAnnotating}
          annotations={annotations}
          currentAnnotation={currentAnnotation}
          onToggleAnnotating={handleToggleAnnotating}
          onCurrentAnnotationChange={handleCurrentAnnotationChange}
          onSaveAnnotation={handleSaveAnnotation}
          onTakeScreenshot={handleTakeScreenshot}
          onAnalyzeInterface={handleAnalyzeInterface}
        />
      </TabsContent>
      
      <TabsContent value="memory" className="mt-0">
        <MemoryTab 
          selectedMemory={selectedMemory}
          onMemoryItemSelected={handleMemoryItemSelected}
        />
      </TabsContent>
      
      <TabsContent value="chat" className="mt-0">
        <ChatTab 
          onClearLogs={handleClearLogs}
          isConnectedToAI={isConnectedToAI}
        />
      </TabsContent>

      <TabsContent value="browser" className="mt-0">
        <BrowserPreviewTab url={browserUrl} setUrl={setBrowserUrl} />
      </TabsContent>

      <TabsContent value="instructions" className="mt-0">
        <InstructionsTab />
      </TabsContent>
    </>
  );
};

export default ShellContent;
