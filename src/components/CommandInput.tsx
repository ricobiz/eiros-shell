
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Command } from '@/types/types';
import { commandService } from '@/services/CommandService';

interface CommandInputProps {
  onCommandExecuted?: (result: any) => void;
}

const CommandInput: React.FC<CommandInputProps> = ({ onCommandExecuted }) => {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    try {
      setIsProcessing(true);
      const command = commandService.parseCommand(input.trim());
      
      if (command) {
        const result = await commandService.executeCommand(command);
        if (onCommandExecuted) {
          onCommandExecuted(result);
        }
        setInput(''); // Clear input on success
      } else {
        console.error('Invalid command format');
      }
    } catch (error) {
      console.error('Error executing command:', error);
    } finally {
      setIsProcessing(false);
      inputRef.current?.focus();
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="flex space-x-2">
      <Input
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="/command#id{params}"
        className="flex-1 bg-background border-accent/30 focus:border-accent"
        disabled={isProcessing}
      />
      <Button 
        type="submit" 
        disabled={isProcessing || !input.trim()}
        variant="secondary"
        className="bg-secondary hover:bg-secondary/80"
      >
        {isProcessing ? 'Processing...' : 'Execute'}
      </Button>
    </form>
  );
};

export default CommandInput;
