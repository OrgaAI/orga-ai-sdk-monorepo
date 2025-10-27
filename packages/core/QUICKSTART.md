# @orga-ai/core - Quick Start Guide

## 🚀 Using the Core Package

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

## 🎯 Design Principles

1. **Framework Agnostic** - No framework dependencies
2. **Platform Independent** - Uses port interfaces for platform code
3. **Type Safe** - Full TypeScript support
4. **Well Tested** - 90%+ coverage
5. **Modern** - ESM + CJS, conditional exports

## 📚 More Information

- See `README.md` for detailed package information
- See `PHASE1_SUMMARY.md` for technical deep-dive
- See `../../../PHASE1_COMPLETE.md` for executive summary

