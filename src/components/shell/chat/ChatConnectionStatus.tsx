
import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, AlertOctagon } from 'lucide-react';
import { aiSyncService } from '@/services/ai-sync';
import { useLanguage } from '@/contexts/LanguageContext';

interface ChatConnectionStatusProps {
  isWindowOpen: boolean;
  isConnecting: boolean;
  onConnectToChatGPT: () => void;
  onEmergencyStop: () => void;
}

const ChatConnectionStatus: React.FC<ChatConnectionStatusProps> = ({ 
  isWindowOpen, 
  isConnecting,
  onConnectToChatGPT,
  onEmergencyStop
}) => {
  const { t } = useLanguage();

  return isWindowOpen ? (
    <div className="flex items-center space-x-2">
      <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs">
        <span className="mr-1.5 h-2 w-2 rounded-full bg-green-500"></span>
        {t('aiConnected')}
      </div>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-1"
        onClick={() => {
          if (aiSyncService.isConnected()) {
            window.open('https://chat.openai.com/', 'ChatGPT', 'width=800,height=600');
          }
        }}
      >
        <ExternalLink size={14} />
        <span>{t('open')}</span>
      </Button>
      
      <Button
        variant="destructive"
        size="sm"
        className="flex items-center gap-1"
        onClick={onEmergencyStop}
      >
        <AlertOctagon size={14} />
        <span>{t('stop')}</span>
      </Button>
    </div>
  ) : (
    <Button
      variant="outline"
      size="sm"
      className="flex items-center gap-1"
      onClick={onConnectToChatGPT}
      disabled={isConnecting}
    >
      {isConnecting ? (
        <>
          <span className="mr-1.5 h-2 w-2 rounded-full bg-yellow-500 animate-pulse"></span>
          {t('loading')}
        </>
      ) : (
        <>
          <ExternalLink size={14} />
          <span>{t('connect')}</span>
        </>
      )}
    </Button>
  );
};

export default ChatConnectionStatus;
