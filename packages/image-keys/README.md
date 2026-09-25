# @whiskey-social/image-keys

Type-safe image key utilities for Whiskey Social applications.

## Installation

```bash
yarn add @whiskey-social/image-keys
```

## Usage

### Creating Image Keys

```typescript
import { createImageKey } from '@whiskey-social/image-keys';

// Create prefixed image keys
const profileKey = createImageKey('profile', 'abc-123-def');
// Returns: "profile_abc-123-def"

const whiskeyKey = createImageKey('whiskey', 'xyz-789');
// Returns: "whiskey_xyz-789"
```

### Parsing Image Keys

```typescript
import { parseImageKey } from '@whiskey-social/image-keys';

const parsed = parseImageKey('profile_abc-123-def');
// Returns: { type: 'profile', id: 'abc-123-def', originalKey: 'profile_abc-123-def' }

const invalid = parseImageKey('invalid-key');
// Returns: null
```

### Legacy Support

```typescript
import { parseImageKeyWithLegacySupport } from '@whiskey-social/image-keys';

// Handles keys with or without prefixes
const modern = parseImageKeyWithLegacySupport('profile_abc-123');
// Returns: { type: 'profile', id: 'abc-123', originalKey: 'profile_abc-123' }

const legacy = parseImageKeyWithLegacySupport('old-image-key');
// Returns: { type: 'post', id: 'old-image-key', originalKey: 'old-image-key' }
```

## Supported Image Types

- `profile` - User profile pictures
- `cover` - User cover pictures
- `post` - Social post images
- `whiskey` - Whiskey product images
- `menu` - Venue menu PDFs
- `brand` - Brand logos
- `special` - Special product images

## Development

```bash
# Install dependencies
yarn install

# Build the library
yarn build

# Watch for changes
yarn dev
```