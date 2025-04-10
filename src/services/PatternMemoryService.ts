
import { UIPattern, MemoryType } from "../types/types";
import { memoryService } from "./MemoryService";
import { logService } from "./LogService";

class PatternMemoryService {
  private readonly STORAGE_KEY = 'eiros_pattern_memory';
  private learningMode: 'disabled' | 'active' | 'autonomous' = 'disabled';
  
  // Configuration
  private config = {
    // Number of successful uses before a pattern is considered stable
    stabilityThreshold: 5,
    // Number of failed attempts before marking a pattern as unstable
    failureThreshold: 2,
    // Maximum retry attempts before switching to failsafe
    maxRetries: 3,
    // Whether to auto-learn new patterns
    autoLearn: false,
    // Whether to auto-correct unstable patterns
    autoCorrect: true
  };
  
  constructor() {
    // Try to load settings from localStorage
    try {
      const savedSettings = localStorage.getItem('eiros_pattern_settings');
      if (savedSettings) {
        this.config = { ...this.config, ...JSON.parse(savedSettings) };
      }
    } catch (error) {
      console.error('Failed to load pattern settings:', error);
    }
  }
  
  // Save settings to local storage
  saveSettings(): void {
    try {
      localStorage.setItem('eiros_pattern_settings', JSON.stringify(this.config));
    } catch (error) {
      console.error('Failed to save pattern settings:', error);
    }
  }
  
  // Get all patterns
  getPatterns(): UIPattern[] {
    const patterns = memoryService.getMemoryItems(MemoryType.PATTERN, undefined, 1000);
    return patterns.map(item => item.data as UIPattern).filter(Boolean);
  }
  
  // Find a pattern by selector
  findPatternBySelector(selector: string, url?: string): UIPattern | null {
    const patterns = this.getPatterns();
    return patterns.find(pattern => 
      pattern.selector === selector && 
      (!url || pattern.url === url)
    ) || null;
  }
  
  // Find patterns by url
  findPatternsByUrl(url: string): UIPattern[] {
    const patterns = this.getPatterns();
    return patterns.filter(pattern => pattern.url === url);
  }
  
  // Save a new pattern
  savePattern(pattern: Omit<UIPattern, 'id' | 'createdAt' | 'successRate' | 'timesUsed' | 'lastUsed' | 'status'>): UIPattern {
    const timestamp = Date.now();
    
    const newPattern: UIPattern = {
      ...pattern,
      id: `pattern_${timestamp}_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: timestamp,
      lastUsed: timestamp,
      timesUsed: 0,
      successRate: 0,
      status: 'learning',
      tags: [...(pattern.tags || []), 'learned']
    };
    
    memoryService.addMemoryItem({
      type: MemoryType.PATTERN,
      data: newPattern,
      tags: ['pattern', ...(pattern.tags || []), `selector:${pattern.selector}`]
    });
    
    logService.addLog({
      type: 'info',
      message: `New pattern learned: ${pattern.selector}`,
      timestamp,
      details: { pattern: newPattern }
    });
    
    return newPattern;
  }
  
  // Update pattern after successful use
  recordSuccessfulUse(patternId: string): void {
    const patterns = this.getPatterns();
    const pattern = patterns.find(p => p.id === patternId);
    
    if (!pattern) return;
    
    const updatedPattern: UIPattern = {
      ...pattern,
      timesUsed: pattern.timesUsed + 1,
      lastUsed: Date.now(),
      successRate: (pattern.successRate * pattern.timesUsed + 1) / (pattern.timesUsed + 1),
      status: pattern.timesUsed >= this.config.stabilityThreshold ? 'stable' : pattern.status
    };
    
    memoryService.addMemoryItem({
      type: MemoryType.PATTERN,
      data: updatedPattern,
      tags: ['pattern', ...(pattern.tags || []), `selector:${pattern.selector}`]
    });
  }
  
  // Record failure and update pattern
  recordFailure(patternId: string, errorCode: string, errorMessage: string): void {
    const patterns = this.getPatterns();
    const pattern = patterns.find(p => p.id === patternId);
    
    if (!pattern) return;
    
    // Add error to history
    const errorHistory = [...(pattern.errorHistory || []), {
      code: errorCode,
      message: errorMessage,
      timestamp: Date.now()
    }];
    
    // Count recent failures (last 24 hours)
    const recentFailures = errorHistory.filter(
      error => error.timestamp > Date.now() - 24 * 60 * 60 * 1000
    ).length;
    
    // Update pattern
    const updatedPattern: UIPattern = {
      ...pattern,
      timesUsed: pattern.timesUsed + 1,
      lastUsed: Date.now(),
      successRate: (pattern.successRate * pattern.timesUsed) / (pattern.timesUsed + 1),
      status: recentFailures >= this.config.failureThreshold ? 'unstable' : pattern.status,
      errorHistory
    };
    
    memoryService.addMemoryItem({
      type: MemoryType.PATTERN,
      data: updatedPattern,
      tags: ['pattern', ...(pattern.tags || []), `selector:${pattern.selector}`, `error:${errorCode}`]
    });
    
    // Log failure
    logService.addLog({
      type: 'warning',
      message: `Pattern failure: ${pattern.selector} (${errorCode})`,
      timestamp: Date.now(),
      details: { 
        pattern: updatedPattern.id, 
        selector: pattern.selector,
        errorCode, 
        errorMessage 
      }
    });
  }
  
  // Learn new pattern from successful interaction
  learnFromInteraction(selector: string, url: string, text?: string, attributes?: Record<string, string>): UIPattern {
    // Check if we're allowed to learn
    if (this.learningMode === 'disabled') {
      logService.addLog({
        type: 'warning',
        message: 'Pattern learning is disabled',
        timestamp: Date.now()
      });
      throw new Error('Pattern learning is currently disabled');
    }
    
    // Check if pattern already exists
    const existingPattern = this.findPatternBySelector(selector, url);
    if (existingPattern) {
      this.recordSuccessfulUse(existingPattern.id);
      return existingPattern;
    }
    
    // Create new pattern
    return this.savePattern({
      selector,
      url,
      text,
      attributes,
      tags: ['learned', 'auto']
    });
  }
  
  // Retrain an unstable pattern
  async retrainPattern(patternId: string): Promise<UIPattern> {
    const patterns = this.getPatterns();
    const pattern = patterns.find(p => p.id === patternId);
    
    if (!pattern) {
      throw new Error(`Pattern not found: ${patternId}`);
    }
    
    // Reset pattern statistics
    const updatedPattern: UIPattern = {
      ...pattern,
      status: 'learning',
      successRate: 0,
      timesUsed: 0,
      lastUsed: Date.now(),
      tags: [...pattern.tags.filter(tag => tag !== 'unstable'), 'retrained']
    };
    
    memoryService.addMemoryItem({
      type: MemoryType.PATTERN,
      data: updatedPattern,
      tags: ['pattern', 'retrained', `selector:${pattern.selector}`]
    });
    
    logService.addLog({
      type: 'info',
      message: `Pattern retraining initiated: ${pattern.selector}`,
      timestamp: Date.now(),
      details: { pattern: updatedPattern }
    });
    
    return updatedPattern;
  }
  
  // Find alternative selectors for the same element
  findAlternativeSelectors(patternId: string): string[] {
    const patterns = this.getPatterns();
    const pattern = patterns.find(p => p.id === patternId);
    
    if (!pattern) return [];
    
    // Combine fallback selectors and any fallbacks from similar patterns
    const alternatives = [...(pattern.fallbackSelectors || [])];
    
    // Look for patterns with similar attributes or region
    if (pattern.attributes) {
      const similarPatterns = patterns.filter(p => 
        p.id !== patternId && 
        p.url === pattern.url &&
        p.attributes && 
        Object.entries(pattern.attributes).some(([key, value]) => 
          p.attributes?.[key] === value
        )
      );
      
      similarPatterns.forEach(p => {
        if (!alternatives.includes(p.selector)) {
          alternatives.push(p.selector);
        }
      });
    }
    
    return alternatives;
  }
  
  // Get pattern statistics
  getStats(): {
    total: number;
    stable: number;
    unstable: number;
    learning: number;
    errorCategories: Record<string, number>;
  } {
    const patterns = this.getPatterns();
    
    // Count patterns by status
    const stats = {
      total: patterns.length,
      stable: patterns.filter(p => p.status === 'stable').length,
      unstable: patterns.filter(p => p.status === 'unstable').length,
      learning: patterns.filter(p => p.status === 'learning').length,
      errorCategories: {} as Record<string, number>
    };
    
    // Count error categories
    patterns.forEach(pattern => {
      if (!pattern.errorHistory) return;
      
      pattern.errorHistory.forEach(error => {
        if (!stats.errorCategories[error.code]) {
          stats.errorCategories[error.code] = 0;
        }
        stats.errorCategories[error.code]++;
      });
    });
    
    return stats;
  }
  
  // Delete a pattern
  deletePattern(patternId: string): boolean {
    // Find the memory item with this pattern
    const memoryItems = memoryService.getMemoryItems(MemoryType.PATTERN);
    const item = memoryItems.find(item => item.data?.id === patternId);
    
    if (item) {
      logService.addLog({
        type: 'info',
        message: `Pattern deleted: ${item.data.selector}`,
        timestamp: Date.now()
      });
      
      return memoryService.removeMemoryItem(item.id || '');
    }
    
    return false;
  }
  
  // Set learning mode
  setLearningMode(mode: 'disabled' | 'active' | 'autonomous'): void {
    this.learningMode = mode;
    this.config.autoLearn = mode === 'autonomous';
    
    logService.addLog({
      type: 'info',
      message: `Pattern learning mode set to: ${mode}`,
      timestamp: Date.now()
    });
    
    // Save settings
    this.saveSettings();
  }
  
  // Get learning mode
  getLearningMode(): 'disabled' | 'active' | 'autonomous' {
    return this.learningMode;
  }
  
  // Export patterns to JSON
  exportPatterns(): string {
    const patterns = this.getPatterns();
    return JSON.stringify(patterns, null, 2);
  }
  
  // Import patterns from JSON
  importPatterns(json: string): number {
    try {
      const patterns = JSON.parse(json) as UIPattern[];
      
      if (!Array.isArray(patterns)) {
        throw new Error('Invalid pattern data format');
      }
      
      let importCount = 0;
      patterns.forEach(pattern => {
        memoryService.addMemoryItem({
          type: MemoryType.PATTERN,
          data: pattern,
          tags: ['pattern', 'imported', `selector:${pattern.selector}`, ...(pattern.tags || [])]
        });
        importCount++;
      });
      
      logService.addLog({
        type: 'success',
        message: `Imported ${importCount} patterns`,
        timestamp: Date.now()
      });
      
      return importCount;
    } catch (error) {
      logService.addLog({
        type: 'error',
        message: 'Failed to import patterns',
        timestamp: Date.now(),
        details: { error }
      });
      
      throw error;
    }
  }
}

export const patternMemoryService = new PatternMemoryService();
