
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
import ManualAnnotationTab from './ManualAnnotationTab';

const ShellContent: React.FC = () => {
  const { 
    activeTab, 
    commandResult, 
    handleCommandExecuted,
    browserUrl,
    setBrowserUrl,
    isAnnotating,
    annotations,
    currentAnnotation,
    handleToggleAnnotating,
    handleCurrentAnnotationChange,
    handleSaveAnnotation,
    handleTakeScreenshot,
    handleAnalyzeInterface,
    selectedMemory,
    handleMemoryItemSelected,
    handleClearLogs,
    isConnectedToAI
  } = useShell();
  
  return (
    <>
      <TabsContent value="command">
        <CommandTab onCommandExecuted={handleCommandExecuted} />
      </TabsContent>
      
      <TabsContent value="instructions">
        <InstructionsTab />
      </TabsContent>
      
      <TabsContent value="browser">
        <BrowserPreviewTab url={browserUrl} setUrl={setBrowserUrl} />
      </TabsContent>
      
      <TabsContent value="vision">
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
      
      <TabsContent value="memory">
        <MemoryTab
          selectedMemory={selectedMemory}
          onMemoryItemSelected={handleMemoryItemSelected}
        />
      </TabsContent>
      
      <TabsContent value="chat">
        <ChatTab
          onClearLogs={handleClearLogs}
          isConnectedToAI={isConnectedToAI}
        />
      </TabsContent>
      
      <TabsContent value="docs">
        <DocumentationTab />
      </TabsContent>
      
      <TabsContent value="annotate">
        <ManualAnnotationTab />
      </TabsContent>
    </>
  );
};

export default ShellContent;
