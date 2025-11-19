# @orga-ai/core

Framework-agnostic core library for Orga AI SDK. This package provides the shared types, client logic, and utilities used by all Orga AI framework adapters.

## Features

- 🎯 **Framework Agnostic** - No React, React Native, or other framework dependencies
- 🔌 **Port-based Architecture** - Clean platform abstractions via ports
- 📦 **Tree-shakeable** - Modern ESM with conditional exports
- 🔒 **Type Safe** - Full TypeScript support
- ✅ **Well Tested** - Comprehensive test coverage

## 🚀  Quick Start Using the Core Package

### Installation (for SDK developers)

```bash
pnpm add @orga-ai/core
```

### Basic Usage

```typescript
import { OrgaAI } from '@orga-ai/core';
import type { OrgaAIConfig } from '@orga-ai/core/types';

// Initialize the SDK
const config: OrgaAIConfig = {
  sessionConfigEndpoint: 'https://your-api.com/session',
  logLevel: 'info',
  model: 'orga-1-beta',
  voice: 'alloy',
  temperature: 0.7,
  enableTranscriptions: true,
};

OrgaAI.init(config);

// Check if initialized
if (OrgaAI.isInitialized()) {
  console.log('SDK ready!');
}

// Get current config
const currentConfig = OrgaAI.getConfig();
```

### Using Utilities

```typescript
import { logger } from '@orga-ai/core/utils';

// Logger respects the logLevel from config
logger.debug('Debug message');
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message');
```

### Error Handling

```typescript
import { 
  ConfigurationError,
  ConnectionError,
  PermissionError,
  SessionError 
} from '@orga-ai/core/errors';

try {
  OrgaAI.init({ /* invalid config */ });
} catch (error) {
  if (error instanceof ConfigurationError) {
    console.error('Config error:', error.message, error.code);
  }
}
```

### Implementing a Platform Adapter

```typescript
import type { WebRTCPort, PeerConnection } from '@orga-ai/core/ports';

class MyPlatformWebRTCAdapter implements WebRTCPort {
  createPeerConnection(iceServers) {
    // Platform-specific implementation
    return new MyPeerConnection(iceServers);
  }
  
  getUserMedia(constraints) {
    // Platform-specific media access
    return MyPlatform.getMedia(constraints);
  }
  
  isGetUserMediaSupported() {
    return MyPlatform.hasMediaSupport();
  }
}
```

## 📦 Available Exports

### Main Entry (`@orga-ai/core`)
- `OrgaAI` - Core client class
- All types, errors, utils (re-exported)

### Types (`@orga-ai/core/types`)
- `OrgaAIConfig`, `SessionConfig`
- `OrgaAIModel`, `OrgaAIVoice`, `Modality`
- `ConnectionState`, `ConversationItem`
- Constants: `ORGAAI_MODELS`, `ORGAAI_VOICES`, etc.

### Errors (`@orga-ai/core/errors`)
- `OrgaAIError` - Base error
- `ConfigurationError`
- `ConnectionError`
- `PermissionError`
- `SessionError`

### Utilities (`@orga-ai/core/utils`)
- `logger` - Logging utility
- `fetchSessionConfig` - Fetch session config
- `connectToRealtime` - Connect to WebRTC
- `getMediaConstraints` - Build media constraints

### Ports (`@orga-ai/core/ports`)
- `WebRTCPort` - WebRTC adapter interface
- `PeerConnection`, `DataChannel`, `MediaStream`
- `LoggerPort`, `FetchPort`

## 🛠️ Development Commands

```bash
# Build the package
pnpm build

# Type check
pnpm type-check

# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Watch mode for tests
pnpm test:watch

# Clean build artifacts
pnpm clean
```

## 📝 TypeScript Configuration

The package is built with strict TypeScript:

```json
{
  "compilerOptions": {
    "strict": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

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


