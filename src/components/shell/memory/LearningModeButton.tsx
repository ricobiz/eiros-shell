
import React from 'react';
import { Button } from '@/components/ui/button';

interface LearningModeButtonProps {
  learningMode: 'disabled' | 'active' | 'autonomous';
  toggleLearningMode: () => void;
}

const LearningModeButton: React.FC<LearningModeButtonProps> = ({ 
  learningMode, 
  toggleLearningMode 
}) => {
  const getStatusColor = () => {
    switch (learningMode) {
      case 'disabled': return 'bg-red-500/30';
      case 'active': return 'bg-yellow-500/30';
      case 'autonomous': return 'bg-green-500/30';
      default: return 'bg-muted';
    }
  };
  
  const getLearningModeText = () => {
    switch (learningMode) {
      case 'disabled': return 'Learning Disabled';
      case 'active': return 'Active Learning';
      case 'autonomous': return 'Autonomous Learning';
      default: return 'Unknown Mode';
    }
  };
  
  return (
    <Button variant="outline" size="sm" onClick={toggleLearningMode} className="h-8">
      <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor()}`}></div>
      {getLearningModeText()}
    </Button>
  );
};

export default LearningModeButton;
