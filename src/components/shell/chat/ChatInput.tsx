
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Zap } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ChatInputProps {
  message: string;
  disabled: boolean;
  isTestingConnection?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onPaste?: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  onTestConnection?: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  message, 
  disabled, 
  isTestingConnection = false,
  onChange, 
  onSend, 
  onKeyPress,
  onPaste,
  onTestConnection
}) => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Input
          placeholder={t('chatInputPlaceholder')}
          value={message}
          onChange={onChange}
          onKeyPress={onKeyPress}
          onPaste={onPaste}
          className="flex-1"
          disabled={disabled || isTestingConnection}
        />
        <Button 
          variant="default" 
          size="icon"
          disabled={!message.trim() || disabled || isTestingConnection}
          onClick={onSend}
        >
          <Send size={16} />
        </Button>
      </div>
      
      {onTestConnection && (
        <Button
          variant="outline"
          size="sm"
          className="w-full flex items-center justify-center"
          onClick={onTestConnection}
          disabled={disabled || isTestingConnection}
        >
          {isTestingConnection ? (
            <>
              <div className="mr-2 h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
              {t('testingConnection')}
            </>
          ) : (
            <>
              <Zap size={16} className="mr-1" />
              {t('testConnection')}
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default ChatInput;
