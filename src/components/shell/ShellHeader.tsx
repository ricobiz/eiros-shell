
import React from 'react';
import { Separator } from '@/components/ui/separator';
import HeaderButtons from './header/HeaderButtons';

const ShellHeader: React.FC = () => {
  return (
    <div className="px-4 py-2 border-b bg-card flex justify-between items-center">
      <div>
        <h1 className="text-lg font-semibold">EirosShell</h1>
        <p className="text-xs text-muted-foreground">Advanced Browser Control DSL</p>
      </div>
      
      <div className="flex items-center">
        <HeaderButtons />
      </div>
    </div>
  );
};

export default ShellHeader;
