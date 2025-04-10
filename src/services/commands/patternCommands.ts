
import { Command, CommandType } from "@/types/types";
import { logService } from "@/services/LogService";
import { patternMemoryService } from "@/services/PatternMemoryService";

export async function handlePatternLearnCommand(command: Command): Promise<any> {
  const { selector, url, text, attributes, tags } = command.params;
  
  try {
    if (!selector) {
      throw new Error("Selector is required for pattern learning");
    }
    
    const pattern = patternMemoryService.learnFromInteraction(
      selector,
      url || window.location.href,
      text,
      attributes
    );
    
    // Add custom tags if provided
    if (tags && Array.isArray(tags) && pattern) {
      // This would be implemented in a real system
      console.log('Would add tags:', tags);
    }
    
    logService.addLog({
      type: 'success',
      message: `Pattern learned: ${selector}`,
      timestamp: Date.now(),
      details: { pattern }
    });
    
    return pattern;
  } catch (error) {
    logService.addLog({
      type: 'error',
      message: `Failed to learn pattern: ${error}`,
      timestamp: Date.now(),
      details: { command }
    });
    
    throw error;
  }
}

export async function handlePatternRecallCommand(command: Command): Promise<any> {
  const { selector, url } = command.params;
  
  try {
    if (!selector) {
      throw new Error("Selector is required for pattern recall");
    }
    
    const pattern = patternMemoryService.findPatternBySelector(selector, url);
    
    if (!pattern) {
      throw new Error(`Pattern not found: ${selector}`);
    }
    
    // Record successful use
    patternMemoryService.recordSuccessfulUse(pattern.id);
    
    logService.addLog({
      type: 'info',
      message: `Pattern recalled: ${selector}`,
      timestamp: Date.now(),
      details: { pattern }
    });
    
    return pattern;
  } catch (error) {
    logService.addLog({
      type: 'warning',
      message: `Pattern recall failed: ${error}`,
      timestamp: Date.now(),
      details: { command }
    });
    
    // Try alternative selectors
    try {
      const alternatives = patternMemoryService.findPatternsByUrl(url || window.location.href);
      
      if (alternatives.length > 0) {
        return {
          error: `Original pattern not found: ${selector}`,
          alternatives,
          status: "fallback_available"
        };
      }
    } catch (fallbackError) {
      console.error("Error finding alternative patterns:", fallbackError);
    }
    
    throw error;
  }
}
