type Primitive = 'string' | 'number' | 'boolean' | 'symbol' | 'bigint' | 'undefined' | 'object' | 'function';

export const getValueIfDefined = <T>(value: unknown, type: Primitive, defaultValue?: T): T | undefined => {
  if (typeof value === type) {
    return value as T;
  }
  return defaultValue;
}

export const removeUndefinedAndNull = <T extends Record<string, unknown>>(obj: T): T => Object.entries(obj).reduce((acc: any, [key, value]) => {
    if (value !== null && value !== undefined) {
      if (typeof acc === 'object') {
        acc[key] = value;
      }
    }
    return acc;
  }, {}) as T;