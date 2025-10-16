# @orga-ai/core

Framework-agnostic core library for Orga AI SDK. This package provides the shared types, client logic, and utilities used by all Orga AI framework adapters.

## Features

- 🎯 **Framework Agnostic** - No React, React Native, or other framework dependencies
- 🔌 **Port-based Architecture** - Clean platform abstractions via ports
- 📦 **Tree-shakeable** - Modern ESM with conditional exports
- 🔒 **Type Safe** - Full TypeScript support
- ✅ **Well Tested** - Comprehensive test coverage

## Installation

```bash
npm install @orga-ai/core
# or
pnpm add @orga-ai/core
```

## Usage

This package is typically used as a dependency by framework-specific SDKs like `@orga-ai/react` or `@orga-ai/react-native`. It's not meant to be used directly in most applications.

### For SDK Developers

```typescript
import { OrgaAI } from '@orga-ai/core';
import type { OrgaAIConfig, SessionConfig } from '@orga-ai/core/types';
import { ConfigurationError } from '@orga-ai/core/errors';
import { logger } from '@orga-ai/core/utils';

// Initialize the SDK
OrgaAI.init({
  sessionConfigEndpoint: 'https://your-api.com/session',
  logLevel: 'info',
});
```

## Exports

- `@orga-ai/core` - Main client and core functionality
- `@orga-ai/core/types` - TypeScript types and interfaces
- `@orga-ai/core/errors` - Error classes
- `@orga-ai/core/utils` - Utility functions
- `@orga-ai/core/ports` - Platform abstraction interfaces

## License

Proprietary

