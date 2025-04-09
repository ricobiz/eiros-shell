
import { useState } from 'react';
import { logService } from '@/services/LogService';

export function useShellUI() {
  const [isPinned, setIsPinned] = useState(false);
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [annotations, setAnnotations] = useState<{id: string, element: string, description: string}[]>([]);
  const [currentAnnotation, setCurrentAnnotation] = useState({element: '', description: ''});

  const handleTogglePin = () => {
    setIsPinned(!isPinned);
    
    // In a real implementation, this would make the window "always on top"
    // Since this is a web app, we'd need browser extensions or electron for real pinning
    logService.addLog({
      type: 'info',
      message: `Shell window ${!isPinned ? 'pinned' : 'unpinned'}`,
      timestamp: Date.now()
    });
  };

  const handleToggleAnnotating = () => {
    setIsAnnotating(!isAnnotating);
    
    if (isAnnotating) {
      // Save annotation mode
      logService.addLog({
        type: 'info',
        message: 'Exiting annotation mode',
        timestamp: Date.now()
      });
    } else {
      logService.addLog({
        type: 'info',
        message: 'Entering annotation mode - click on elements to annotate',
        timestamp: Date.now()
      });
    }
  };
  
  const handleSaveAnnotation = () => {
    if (currentAnnotation.element && currentAnnotation.description) {
      const newAnnotation = {
        id: `annotation_${Date.now()}`,
        ...currentAnnotation
      };
      
      setAnnotations([...annotations, newAnnotation]);
      setCurrentAnnotation({element: '', description: ''});
      
      logService.addLog({
        type: 'success',
        message: 'Element annotation saved',
        timestamp: Date.now()
      });
    }
  };
  
  const handleCurrentAnnotationChange = (annotation: {element: string, description: string}) => {
    setCurrentAnnotation(annotation);
  };

  return {
    isPinned,
    setIsPinned,
    isAnnotating,
    setIsAnnotating,
    annotations,
    setAnnotations,
    currentAnnotation,
    setCurrentAnnotation,
    handleTogglePin,
    handleToggleAnnotating,
    handleSaveAnnotation,
    handleCurrentAnnotationChange
  };
}
