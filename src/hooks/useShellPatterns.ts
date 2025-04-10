
import { useState } from 'react';
import { patternMemoryService } from '@/services/PatternMemoryService';
import { useToast } from '@/hooks/use-toast';
import { logService } from '@/services/LogService';

export function useShellPatterns() {
  const { toast } = useToast();
  const [patternLearningMode, setPatternLearningMode] = useState<'disabled' | 'active' | 'autonomous'>(
    patternMemoryService.getLearningMode()
  );

  const handleSetPatternLearningMode = (mode: 'disabled' | 'active' | 'autonomous') => {
    setPatternLearningMode(mode);
    patternMemoryService.setLearningMode(mode);
    
    toast({
      title: "Pattern Learning Mode",
      description: `Set to ${mode}`,
    });
  };

  const handleRetrainPattern = async (patternId: string) => {
    try {
      await patternMemoryService.retrainPattern(patternId);
      
      toast({
        title: "Pattern Retraining",
        description: "Pattern retraining initiated successfully",
      });
    } catch (error) {
      console.error('Error retraining pattern:', error);
      
      toast({
        title: "Pattern Retraining Failed",
        description: String(error),
        variant: "destructive"
      });
    }
  };

  const handleDeletePattern = (patternId: string) => {
    try {
      patternMemoryService.deletePattern(patternId);
      
      toast({
        title: "Pattern Deleted",
        description: "Pattern has been removed from memory",
      });
    } catch (error) {
      console.error('Error deleting pattern:', error);
      
      toast({
        title: "Delete Failed",
        description: String(error),
        variant: "destructive"
      });
    }
  };

  const handleExportPatterns = () => {
    try {
      const patternsJson = patternMemoryService.exportPatterns();
      
      // Create a download link
      const blob = new Blob([patternsJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `eiros_patterns_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      logService.addLog({
        type: 'info',
        message: 'Patterns exported successfully',
        timestamp: Date.now()
      });
      
      toast({
        title: "Patterns Exported",
        description: "Patterns saved to JSON file",
      });
    } catch (error) {
      console.error('Error exporting patterns:', error);
      
      toast({
        title: "Export Failed",
        description: String(error),
        variant: "destructive"
      });
    }
  };

  const handleImportPatterns = (json: string) => {
    try {
      const importCount = patternMemoryService.importPatterns(json);
      
      toast({
        title: "Patterns Imported",
        description: `Successfully imported ${importCount} patterns`,
      });
    } catch (error) {
      console.error('Error importing patterns:', error);
      
      toast({
        title: "Import Failed",
        description: String(error),
        variant: "destructive"
      });
    }
  };

  return {
    patternLearningMode,
    setPatternLearningMode: handleSetPatternLearningMode,
    handleRetrainPattern,
    handleDeletePattern,
    handleExportPatterns,
    handleImportPatterns
  };
}
