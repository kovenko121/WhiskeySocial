/**
 * Image Key Utility Library
 *
 * Provides type-safe functions for creating and parsing image keys with prefixes.
 * This ensures consistency across all image uploads and eliminates typos.
 */

// Basic image types that we know about
export type ImageType = 'profile' | 'cover' | 'post' | 'whiskey' | 'menu' | 'brand' | 'special';

// Result of parsing an image key
export interface ParsedImageKey {
  type: ImageType;
  id: string;
  originalKey: string;
}

/**
 * Creates a prefixed image key from an image type and ID
 *
 * @param type - The type of image (determines prefix)
 * @param id - The unique identifier (usually a UUID)
 * @returns Prefixed image key string
 *
 * @example
 * createImageKey('profile', 'abc-123-def') // Returns: "profile_abc-123-def"
 * createImageKey('whiskey', 'xyz-789') // Returns: "whiskey_xyz-789"
 */
export function createImageKey(type: ImageType, id: string): string {
  if (!id || id.trim() === '') {
    throw new Error('Image ID cannot be empty');
  }

  return `${type}_${id}`;
}

/**
 * Parses a prefixed image key back into its components
 *
 * @param key - The prefixed image key to parse
 * @returns Parsed components or null if invalid format
 *
 * @example
 * parseImageKey('profile_abc-123-def')
 * // Returns: { type: 'profile', id: 'abc-123-def', originalKey: 'profile_abc-123-def' }
 */
export function parseImageKey(key: string): ParsedImageKey | null {
  if (!key || typeof key !== 'string') {
    return null;
  }

  const parts = key.split('_');
  if (parts.length < 2) {
    return null;
  }

  const [type, ...idParts] = parts;
  const id = idParts.join('_'); // Handle IDs that might contain underscores

  // Validate that the type is a known image type
  const validTypes: ImageType[] = ['profile', 'cover', 'post', 'whiskey', 'menu', 'brand', 'special'];

  if (!validTypes.includes(type as ImageType)) {
    return null;
  }

  return {
    type: type as ImageType,
    id,
    originalKey: key
  };
}

/**
 * Legacy support: Handles unprefixed keys (backwards compatibility)
 *
 * @param key - Image key that might not have a prefix
 * @returns Parsed result, treating unprefixed keys as legacy posts
 */
export function parseImageKeyWithLegacySupport(key: string): ParsedImageKey {
  const parsed = parseImageKey(key);

  if (parsed) {
    return parsed;
  }

  // No prefix found - treat as legacy post
  return {
    type: 'post',
    id: key,
    originalKey: key
  };
}