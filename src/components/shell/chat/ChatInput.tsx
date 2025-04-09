
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

interface ChatInputProps {
  message: string;
  disabled: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  message, 
  disabled, 
  onChange, 
  onSend, 
  onKeyPress 
}) => {
  return (
    <div className="flex items-center gap-2">
      <Input
        placeholder="Введите сообщение для ChatGPT..."
        value={message}
        onChange={onChange}
        onKeyPress={onKeyPress}
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
  );
};

export default ChatInput;
