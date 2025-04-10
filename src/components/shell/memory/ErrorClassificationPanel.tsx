
import React from 'react';

const ErrorClassificationPanel: React.FC = () => {
  return (
    <div className="rounded-md border border-border bg-card p-4">
      <h3 className="text-sm font-semibold mb-3">Error Classification & Analysis</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-muted/30 p-3 rounded-md">
          <h4 className="text-xs font-semibold mb-2">Error Categories</h4>
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="w-full bg-muted/50 h-2 rounded-full overflow-hidden mr-2">
                <div className="bg-yellow-500/70 h-full" style={{ width: '45%' }}></div>
              </div>
              <span className="text-xs w-24">#selector_missing</span>
              <span className="text-xs ml-auto">45%</span>
            </div>
            <div className="flex items-center">
              <div className="w-full bg-muted/50 h-2 rounded-full overflow-hidden mr-2">
                <div className="bg-red-500/70 h-full" style={{ width: '30%' }}></div>
              </div>
              <span className="text-xs w-24">#auth_failed</span>
              <span className="text-xs ml-auto">30%</span>
            </div>
            <div className="flex items-center">
              <div className="w-full bg-muted/50 h-2 rounded-full overflow-hidden mr-2">
                <div className="bg-blue-500/70 h-full" style={{ width: '15%' }}></div>
              </div>
              <span className="text-xs w-24">#timeout</span>
              <span className="text-xs ml-auto">15%</span>
            </div>
            <div className="flex items-center">
              <div className="w-full bg-muted/50 h-2 rounded-full overflow-hidden mr-2">
                <div className="bg-purple-500/70 h-full" style={{ width: '10%' }}></div>
              </div>
              <span className="text-xs w-24">#blocked</span>
              <span className="text-xs ml-auto">10%</span>
            </div>
          </div>
        </div>
        
        <div className="bg-muted/30 p-3 rounded-md">
          <h4 className="text-xs font-semibold mb-2">Recent Failures</h4>
          <div className="space-y-1 text-xs max-h-[120px] overflow-y-auto">
            <div className="p-1 border-b border-border/50">
              <span className="font-mono text-red-400">#auth_failed</span>
              <div className="flex justify-between text-[10px]">
                <span>login.php</span>
                <span className="text-muted-foreground">3 hours ago</span>
              </div>
            </div>
            <div className="p-1 border-b border-border/50">
              <span className="font-mono text-yellow-400">#selector_missing</span>
              <div className="flex justify-between text-[10px]">
                <span>.submit-button</span>
                <span className="text-muted-foreground">5 hours ago</span>
              </div>
            </div>
            <div className="p-1 border-b border-border/50">
              <span className="font-mono text-blue-400">#timeout</span>
              <div className="flex justify-between text-[10px]">
                <span>dashboard.php</span>
                <span className="text-muted-foreground">1 day ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-muted/30 p-3 rounded-md">
        <h4 className="text-xs font-semibold mb-2">Retry Strategies</h4>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span>When #selector_missing:</span>
            <span className="bg-secondary/20 px-2 py-0.5 rounded text-[10px]">
              Try nearest similar element → Manual annotation → Retrain
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>When #auth_failed:</span>
            <span className="bg-secondary/20 px-2 py-0.5 rounded text-[10px]">
              Refresh page → Relogin → Request credentials
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>When #timeout:</span>
            <span className="bg-secondary/20 px-2 py-0.5 rounded text-[10px]">
              Increase wait time → Retry 3x → Report network issue
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorClassificationPanel;
