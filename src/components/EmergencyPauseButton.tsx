
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertOctagon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { aiSyncService } from '@/services/ai-sync';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

// Компонент сохранен для обратной совместимости, но с нулевой непрозрачностью для скрытия
const EmergencyPauseButton: React.FC = () => {
  const { t } = useLanguage();

  const handleEmergencyStop = () => {
    aiSyncService.emergencyStop();
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleEmergencyStop}
            className="opacity-0 pointer-events-none h-0 w-0 p-0 m-0 overflow-hidden"
          >
            <AlertOctagon size={14} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {t('emergencyStop')}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default EmergencyPauseButton;
