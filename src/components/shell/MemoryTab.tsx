
import React from 'react';
import MemoryPanel from '../MemoryPanel';
import { MemoryItem } from '@/types/types';

interface MemoryTabProps {
  selectedMemory: MemoryItem | null;
  onMemoryItemSelected: (item: MemoryItem) => void;
}

const MemoryTab: React.FC<MemoryTabProps> = ({ 
  selectedMemory, 
  onMemoryItemSelected 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <MemoryPanel onMemoryItemSelected={onMemoryItemSelected} />
      </div>
      
      <div className="space-y-2">
        <div className="rounded-md border border-border bg-card p-2 h-[400px] overflow-auto">
          <h3 className="text-sm font-semibold mb-2">Memory Detail</h3>
          {selectedMemory ? (
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-xs font-mono bg-muted px-1 rounded">
                  {selectedMemory.id}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(selectedMemory.createdAt).toLocaleString()}
                </span>
              </div>
              
              {selectedMemory.type === 'screenshot' && (
                <img
                  src={selectedMemory.data}
                  alt="Screenshot"
                  className="max-w-full border border-border rounded-sm"
                />
              )}
              
              {selectedMemory.type !== 'screenshot' && (
                <pre className="text-xs bg-muted/30 p-2 rounded-sm overflow-auto mt-2">
                  {JSON.stringify(selectedMemory.data, null, 2)}
                </pre>
              )}
              
              <div className="mt-4">
                <h4 className="text-xs font-semibold">Tags:</h4>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedMemory.tags.map((tag, i) => (
                    <span key={i} className="text-[10px] bg-secondary/30 px-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Select a memory item to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemoryTab;
