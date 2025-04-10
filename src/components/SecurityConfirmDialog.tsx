
import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Shield, AlertTriangle } from 'lucide-react';

interface SecurityConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  commandText: string;
  danger: boolean;
}

const SecurityConfirmDialog: React.FC<SecurityConfirmDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  commandText,
  danger = true
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center space-x-2">
            {danger ? (
              <AlertTriangle className="h-5 w-5 text-red-500" />
            ) : (
              <Shield className="h-5 w-5 text-amber-500" />
            )}
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="bg-muted p-3 rounded-md font-mono text-sm overflow-auto max-h-[100px]">
          {commandText}
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className={danger ? 'bg-red-600 hover:bg-red-700' : ''}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SecurityConfirmDialog;
