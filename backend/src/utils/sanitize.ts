/**
 * Recursively strips keys that begin with '$' or contain '.'
 * to prevent NoSQL query operator injection attacks.
 */
export const sanitizeInput = <T>(input: T): T => {
  if (input === null || typeof input !== 'object') {
    return input;
  }

  if (Array.isArray(input)) {
    return input.map((item) => sanitizeInput(item)) as unknown as T;
  }

  const cleanObj: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    // Drop keys starting with '$' or containing '.'
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }
    cleanObj[key] = sanitizeInput(value);
  }

  return cleanObj as T;
};

/**
 * Escapes RegExp special characters from user-supplied search strings to prevent ReDoS.
 */
export const escapeRegex = (value: string): string => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};
