
import React, { useEffect, useState } from 'react';
import { CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit, Check } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';

const TitleEditor: React.FC = () => {
  const [customTitle, setCustomTitle] = useState("E.I.R.O.S. // SPAWN"); // Updated default title
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(customTitle);
  const {
    toast
  } = useToast();

  // Load custom title from localStorage if available
  useEffect(() => {
    const savedTitle = localStorage.getItem('shellCustomTitle');
    if (savedTitle) {
      setCustomTitle(savedTitle);
      setTitleInput(savedTitle);
    }
  }, []);

  // Save custom title to localStorage when it changes
  const updateCustomTitle = (newTitle: string) => {
    if (newTitle.trim()) {
      setCustomTitle(newTitle);
      localStorage.setItem('shellCustomTitle', newTitle);
      toast({
        title: "Title updated",
        description: "The shell title has been updated."
      });
    }
  };
  
  const handleTitleSave = () => {
    updateCustomTitle(titleInput);
    setIsEditingTitle(false);
  };
  
  return (
    <div className="flex items-center">
      {isEditingTitle ? (
        <div className="flex items-center ml-1">
          <Input type="text" value={titleInput} onChange={e => setTitleInput(e.target.value)} className="h-6 py-1 px-2 text-sm w-32" autoFocus />
          <Button variant="ghost" size="icon" className="h-6 w-6 ml-1" onClick={handleTitleSave}>
            <Check size={14} />
          </Button>
        </div>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="link" className="p-0 h-auto">
              <CardTitle className="text-sm flex items-center">
                <span className="font-serif">
                  {customTitle}
                </span>
                <div className="text-xs text-muted-foreground ml-2 font-normal">
                  (Enhanced Intelligent Reactive Operating Shell)
                </div>
                <Edit size={12} className="ml-1 opacity-50" />
              </CardTitle>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-background border border-border shadow-md p-2 min-w-[150px]" align="start">
            <DropdownMenuItem onClick={() => setIsEditingTitle(true)}>
              Edit title
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

export default TitleEditor;
