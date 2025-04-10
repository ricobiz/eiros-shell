
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MemorySearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: () => void;
}

const MemorySearch: React.FC<MemorySearchProps> = ({ 
  searchQuery, 
  setSearchQuery, 
  handleSearch 
}) => {
  return (
    <div className="flex items-center space-x-2 mb-3">
      <Input
        placeholder="Search memory..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="text-sm h-8"
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
      />
      <Button size="sm" variant="secondary" onClick={handleSearch} className="h-8">
        Search
      </Button>
    </div>
  );
};

export default MemorySearch;
