
import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, AlertOctagon, Zap, ArrowRight } from 'lucide-react';
import { aiSyncService } from '@/services/ai-sync';
import { useLanguage } from '@/contexts/LanguageContext';

interface ChatConnectionStatusProps {
  isWindowOpen: boolean;
  isConnecting: boolean;
  isTestingConnection?: boolean;
  onConnectToChatGPT: () => void;
  onEmergencyStop: () => void;
  onTestConnection?: () => void;
}

const ChatConnectionStatus: React.FC<ChatConnectionStatusProps> = ({ 
  isWindowOpen, 
  isConnecting,
  isTestingConnection = false,
  onConnectToChatGPT,
  onEmergencyStop,
  onTestConnection
}) => {
  const { t } = useLanguage();

  return isWindowOpen ? (
    <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs">
        <span className="mr-1.5 h-2 w-2 rounded-full bg-green-500"></span>
        {t('aiConnected')}
      </div>
      
      {/* Test Connection Button - Always enabled when connected */}
      {onTestConnection && (
        <Button 
          variant={isTestingConnection ? "default" : "outline"}
          size="sm" 
          className="flex items-center gap-1"
          onClick={onTestConnection}
          disabled={isTestingConnection}
        >
          <Zap size={14} className={isTestingConnection ? "animate-pulse" : ""} />
          <span>{isTestingConnection ? t('testing') : t('testBidirectional')}</span>
        </Button>
      )}
      
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-1"
        onClick={() => {
          if (aiSyncService.isConnected()) {
            const chatWindow = window.open('https://chat.openai.com/', 'ChatGPT', 'width=800,height=600');
            if (chatWindow) chatWindow.focus();
          }
        }}
        title={t('openChatGPT')}
      >
        <ExternalLink size={14} />
        <span>{t('open')}</span>
      </Button>
      
      <Button
        variant="destructive"
        size="sm"
        className="flex items-center gap-1"
        onClick={onEmergencyStop}
        title={t('emergencyStop')}
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
      title={t('connectToChatGPT')}
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
          <ArrowRight size={14} className="ml-1" />
        </>
      )}
    </Button>
  );
};

export default ChatConnectionStatus;
