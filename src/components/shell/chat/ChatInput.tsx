
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Zap } from 'lucide-react';

interface ChatInputProps {
  message: string;
  disabled: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onPaste?: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  onTestConnection?: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  message, 
  disabled, 
  onChange, 
  onSend, 
  onKeyPress,
  onPaste,
  onTestConnection
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Введите сообщение для ChatGPT..."
          value={message}
          onChange={onChange}
          onKeyPress={onKeyPress}
          onPaste={onPaste}
          className="flex-1"
          disabled={disabled}
        />
        <Button 
          variant="default" 
          size="icon"
          disabled={!message.trim() || disabled}
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
          disabled={disabled}
        >
          <Zap size={16} className="mr-1" />
          Тест связи с ChatGPT
        </Button>
      )}
    </div>
  );
};

export default ChatInput;
