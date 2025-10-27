/**
 * Sanitizes user input to prevent injection attacks
 * Even though Mongoose sanitizes by default, this provides an extra layer of security
 */
export const sanitizeInput = (input: unknown): unknown => {
  if (typeof input === 'string') {
    // Remove any $ or . at the start of strings (MongoDB operators)
    return input.replace(/^\$/, '').replace(/^\./,'');
  }
  
  if (typeof input === 'object' && input !== null) {
    if (Array.isArray(input)) {
      return input.map(sanitizeInput);
    }
    
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      // Skip keys that start with $ (MongoDB operators)
      if (!key.startsWith('$') && !key.startsWith('.')) {
        sanitized[key] = sanitizeInput(value);
      }
    }
    return sanitized;
  }
  
  return input;
};

/**
 * Validates that an object doesn't contain MongoDB query operators
 */
export const validateNoQueryOperators = (obj: unknown): boolean => {
  if (typeof obj === 'object' && obj !== null) {
    const keys = Object.keys(obj);
    
    // Check if any key starts with $ or contains MongoDB operators
    const hasOperators = keys.some(key => 
      key.startsWith('$') || 
      key.includes('$where') ||
      key.includes('$function')
    );
    
    if (hasOperators) {
      return false;
    }
    
    // Recursively check nested objects
    for (const value of Object.values(obj)) {
      if (typeof value === 'object' && value !== null) {
        if (!validateNoQueryOperators(value)) {
          return false;
        }
      }
    }
  }
  
  return true;
};
