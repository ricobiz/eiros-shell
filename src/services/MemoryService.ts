import { MemoryItem, MemoryType } from "../types/types";

class MemoryService {
  private memoryStore: MemoryItem[] = [];
  private readonly STORAGE_KEY = 'ai_shell_memory';
  
  constructor() {
    this.loadFromStorage();
  }
  
  private loadFromStorage(): void {
    try {
      const storedMemory = localStorage.getItem(this.STORAGE_KEY);
      if (storedMemory) {
        this.memoryStore = JSON.parse(storedMemory);
      }
    } catch (error) {
      console.error('Failed to load memory from storage', error);
    }
  }
  
  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.memoryStore));
    } catch (error) {
      console.error('Failed to save memory to storage', error);
    }
  }
  
  addMemoryItem(item: Omit<MemoryItem, 'id' | 'createdAt'>): MemoryItem {
    // Check if this is credential data that already exists
    if (item.type === MemoryType.CREDENTIALS && item.data && item.data.service) {
      // Try to find existing credentials for this service and update them
      const existingIndex = this.memoryStore.findIndex(
        mem => mem.type === MemoryType.CREDENTIALS && 
               mem.data && 
               mem.data.service === item.data.service
      );
      
      if (existingIndex >= 0) {
        // Update existing credentials
        this.memoryStore[existingIndex].data = {
          ...this.memoryStore[existingIndex].data,
          ...item.data
        };
        this.memoryStore[existingIndex].lastAccessed = Date.now();
        this.saveToStorage();
        
        return this.memoryStore[existingIndex];
      }
    }
    
    const newItem: MemoryItem = {
      ...item,
      id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: Date.now(),
    };
    
    this.memoryStore.push(newItem);
    this.saveToStorage();
    return newItem;
  }
  
  getMemoryItems(type?: MemoryType, tags?: string[], limit = 10): MemoryItem[] {
    let filtered = this.memoryStore;
    
    if (type) {
      filtered = filtered.filter(item => item.type === type);
    }
    
    if (tags && tags.length > 0) {
      filtered = filtered.filter(item => 
        tags.some(tag => item.tags.includes(tag))
      );
    }
    
    // Sort by recency (newest first)
    filtered.sort((a, b) => b.createdAt - a.createdAt);
    
    return filtered.slice(0, limit);
  }
  
  getMemoryById(id: string): MemoryItem | undefined {
    const item = this.memoryStore.find(item => item.id === id);
    
    if (item) {
      // Update last accessed time
      item.lastAccessed = Date.now();
      this.saveToStorage();
    }
    
    return item;
  }
  
  removeMemoryItem(id: string): boolean {
    const initialLength = this.memoryStore.length;
    this.memoryStore = this.memoryStore.filter(item => item.id !== id);
    
    if (this.memoryStore.length !== initialLength) {
      this.saveToStorage();
      return true;
    }
    
    return false;
  }
  
  searchMemory(query: string): MemoryItem[] {
    const queryLower = query.toLowerCase();
    
    return this.memoryStore.filter(item => {
      // Search in tags
      if (item.tags.some(tag => tag.toLowerCase().includes(queryLower))) {
        return true;
      }
      
      // Search in data if it's a string or has string properties
      if (typeof item.data === 'string') {
        return item.data.toLowerCase().includes(queryLower);
      }
      
      if (typeof item.data === 'object' && item.data !== null) {
        return Object.values(item.data).some(
          value => typeof value === 'string' && value.toLowerCase().includes(queryLower)
        );
      }
      
      return false;
    });
  }
  
  clearMemory(): void {
    this.memoryStore = [];
    this.saveToStorage();
  }
  
  getCredentialsForService(service: string): any | null {
    const credentials = this.memoryStore.find(
      item => item.type === MemoryType.CREDENTIALS && 
             item.data && 
             item.data.service === service
    );
    
    if (credentials) {
      // Update last accessed time
      credentials.lastAccessed = Date.now();
      this.saveToStorage();
      return credentials.data;
    }
    
    return null;
  }
}

export const memoryService = new MemoryService();
