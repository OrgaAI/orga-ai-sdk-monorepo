# Orga React Native SDK

The Orga React Native SDK brings real-time AI-powered audio and video features to your React Native mobile applications using a context and hook-based API.

---

## Project Overview

- **Purpose:** Integrate Orga AI for real-time audio and video interaction in React Native apps.
- **Platform:** React Native (mobile).

---

## Installation

Install the SDK from npm:

```sh
npm install @orga-ai/sdk-react-native
```

> **Note:** If you are using Expo this will not work with Expo Go. You must create a development build first and run on a physical device.

### Peer Dependencies

You must also install the following peer dependencies:

```sh
npm install axios react-native-webrtc react-native-incallmanager
```

---

## Quick Start

### 1. Initialize the SDK

You **must** initialize the SDK before use, providing a `fetchEphemeralTokenAndIceServers` function. This function should securely fetch an ephemeral token and ICE servers from your backend using your API key.

**Never expose your API key in client code.**

```ts
import { OrgaAI } from '@orga-ai/sdk-react-native';

OrgaAI.init({
  fetchEphemeralTokenAndIceServers: async () => {
    // Call your backend to get ephemeralToken and iceServers
    const response = await fetch('https://your-backend.com/api/orga-ephemeral');
    const { ephemeralToken, iceServers } = await response.json();
    return { ephemeralToken, iceServers };
  },
});
```

### 2. Wrap Your App with the Provider

```tsx
import { OrgaAIProvider } from '@orga-ai/sdk-react-native';

function App() {
  return (
    <OrgaAIProvider>
      {/* ...your app... */}
    </OrgaAIProvider>
  );
}
```

### 3. Use the Hook in Your Components

```tsx
import { useOrgaAI } from '@orga-ai/sdk-react-native';

function MyComponent() {
  const {
    startSession,
    endSession,
    videoStream,
    toggleCamera,
    // ...other methods and state
  } = useOrgaAIContext();

  // ...
}
```

---

## Configuration

- **API Key:** Required for your backend endpoint that provides ephemeral tokens. Never expose in client code.
- **fetchEphemeralTokenAndIceServers:**
  - Signature: `() => Promise<{ ephemeralToken: string; iceServers: RTCIceServer[] }>`
  - Must be provided to `OrgaAI.init`.
- **Other Config Options:** See SDK documentation for available options (logLevel, model, etc.).

---

## Secure Backend Example for Ephemeral Token & ICE Servers

**Never expose your OrgaAI API key in client code. Always use a secure backend to fetch ephemeral tokens and ICE servers.**

### Mobile Frontend Example (React Native)

```ts
// In your app, call your own backend proxy endpoint
const fetchEphemeralTokenAndIceServers = async () => {
  const response = await fetch('https://your-backend.com/api/orga-ephemeral', {
    method: 'GET',
    // Optionally include auth headers for your backend
  });
  const { ephemeralToken, iceServers } = await response.json();
  return { ephemeralToken, iceServers };
};
```
### Mobile Backend Proxy Example 

```ts
// your-backend.com/api/orga-ephemeral
// From our app, we hit this which will then hit Orga's backend
const USER_EMAIL = process.env.ORGA_DEV_EMAIL;
const ORGA_API_KEY = process.env.ORGA_API_KEY;

const fetchIceServers = async (ephemeralToken: string) => {
  const URL = `https://api.orga-ai.com/ice-config`;
  try {
    const iceServersResponse = await fetch(URL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${ephemeralToken}`,
      },
    });
    const data = await iceServersResponse.json();
    return data;
  } catch (error) {
    console.error("Error fetching ice servers:", error);
  }
};

export const getEphemeralTokenAndIceServers = async () => {
  try {
    const apiUrl = `https://api.orga-ai.com/ephemeral-token?email=${encodeURIComponent(USER_EMAIL)}`;

    const ephemeralResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ORGA_API_KEY}`
      },
    });
    if (!ephemeralResponse.ok) throw new Error('Failed to fetch ephemeral token');

    const { ephemeral_token } = await ephemeralResponse.json();
    const { iceServers } = await fetchIceServers(ephemeral_token);
    res.status(200).json({ ephemeralToken: ephemeral_token, iceServers });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

**Your backend proxy should:**
- Store the OrgaAI API key and developer email securely (never in the app).
- Make the call to the OrgaAI backend.
- Return only the ephemeral token and ICE servers to the app.

### Expo (SDK 50+)

If using Expo SDK 50 or greater, you can use [Expo Router API routes](https://docs.expo.dev/router/reference/api-routes/) to securely proxy requests, similar to Next.js.

> **Note:** Confirm your version of Expo supports API routes and follow their documentation to implement them properly.

---

> **Summary:**
> - Always keep your OrgaAI API key and developer email on a secure backend.
> - Never expose them in your app or client-side code.
> - Use a backend proxy pattern for both web and mobile.

## OrgaAI.init Configuration Options

The `OrgaAI.init(config)` method accepts the following options:

| Option                          | Type      | Description                                                                                 | Default      | Required? |
|----------------------------------|-----------|---------------------------------------------------------------------------------------------|--------------|-----------|
| `logLevel`                      | `"debug" \| "info" \| "warn" \| "error" \| "none"` | Logging verbosity.                                    | `"warn"`     | No        |
| `timeout`                       | `number`  | Timeout for requests, in milliseconds.                                                      | `30000`      | No        |
| `ephemeralEndpoint`             | `string`  | URL to your backend endpoint for fetching ephemeral tokens and ICE servers.                 | —            | Yes*      |
| `fetchEphemeralTokenAndIceServers` | `() => Promise<{ ephemeralToken: string; iceServers: RTCIceServer[] }>` | Custom function to fetch ephemeral token and ICE servers. | —            | Yes*      |
| `model`                         | `OrgaAIModel` | Model to use (see SDK for allowed values).                                                 | —            | No        |
| `voice`                         | `OrgaAIVoice` | Voice to use (see SDK for allowed values).                                                 | —            | No        |
| `temperature`                   | `number`  | Sampling temperature (randomness). Must be between allowed min/max.                         | —            | No        |
| `maxTokens`                     | `number`  | Maximum tokens for responses. Must be between 100 and 1000.                                 | —            | No        |

> **Note:** Either `ephemeralEndpoint` **or** `fetchEphemeralTokenAndIceServers` is required.

### Example

```ts
OrgaAI.init({
  logLevel: 'debug',
  timeout: 30000,
  fetchEphemeralTokenAndIceServers: async () => {
    // Your backend call here
    return { ephemeralToken: '...', iceServers: [] };
  },
  model: 'Orga (1) beta',
  voice: 'default',
  temperature: 0.7,
  maxTokens: 500,
});
```

#### Descriptions

- **logLevel:** Controls the verbosity of SDK logs. Use `"debug"` for development, `"warn"` or `"error"` for production.
- **timeout:** How long (in ms) the SDK will wait for backend responses before timing out.
- **ephemeralEndpoint:** If provided, the SDK will call this endpoint to fetch tokens/ICE servers. Should be a backend endpoint you control.
- **fetchEphemeralTokenAndIceServers:** If provided, the SDK will use this function to fetch tokens/ICE servers. This gives you full control.
- **model:** The AI model to use. See SDK for allowed values.
- **voice:** The voice to use for audio output. See SDK for allowed values.
- **temperature:** Controls randomness in AI responses. Must be within allowed range.
- **maxTokens:** Maximum number of tokens in responses. Must be between 100 and 1000.

---

## Features

- Real-time audio and video streaming
- React context provider and hook-based API
- Easy integration with React Native apps
- Flexible configuration for custom backend authentication

---

## API Reference

### Components

- **OrgaAIProvider**
  - Provides Orga context to your React Native app. Wrap your app with this provider.
  - _Import:_
    ```tsx
    import { OrgaAIProvider } from '@orga-ai/sdk-react-native';
    ```
  - _Usage:_
    ```tsx
    <OrgaAIProvider>
      {/* ...your app... */}
    </OrgaAIProvider>
    ```

### Hooks

- **useOrgaAIContext**
  - Access Orga SDK methods and state in your components.
  - _Import:_
    ```tsx
    import { useOrgaAIContext } from '@orga-ai/sdk-react-native';
    ```
  - _Returns:_
    - `startSession`, `endSession`, `enableMic`, `disableMic`, `toggleMic`, `enableCamera`, `disableCamera`, `toggleCamera`, `requestPermissions`, `initializeMedia`, `connect`, `cleanup`
    - State: `connectionState`, `localStream`, `remoteStream`, `transcriptions`, `cameraPosition`, `isCameraOn`, `isMicOn`, `videoStream`, `audioStream`, `conversationId`, `hasPermissions`
  - _Usage:_
    ```tsx
    const { startSession, endSession, videoStream } = useOrgaAIContext();
    ```

### Core

- **OrgaAI**
  - Static class for SDK initialization and configuration.
  - _Import:_
    ```ts
    import { OrgaAI } from '@orga-ai/sdk-react-native';
    ```
  - _Usage:_
    ```ts
    OrgaAI.init({
      fetchEphemeralTokenAndIceServers: async () => { /* ... */ },
      // ...other config
    });
    ```

### Types

- **SessionConfig, Transcription, ConnectionState, CameraPosition, ...**
  - TypeScript types for configuration and state.
  - _Import:_
    ```ts
    import type { SessionConfig, Transcription } from '@orga-ai/sdk-react-native';
    ```

---

## Constants & Types

### Constants

- **ORGAAI_MODELS**
  - `readonly string[]`
  - List of allowed model names for the `model` config option.
  - _Import:_
    ```ts
    import { ORGAAI_MODELS } from '@orga-ai/sdk-react-native';
    ```
  - _Usage:_
    ```ts
    model: ORGAAI_MODELS[0]
    ```

- **ORGAAI_VOICES**
  - `readonly string[]`
  - List of allowed voice names for the `voice` config option.
  - _Import:_
    ```ts
    import { ORGAAI_VOICES } from '@orga-ai/sdk-react-native';
    ```

- **ORGAAI_TEMPERATURE_RANGE**
  - `{ min: number; max: number }`
  - Allowed range for the `temperature` config option.
  - _Import:_
    ```ts
    import { ORGAAI_TEMPERATURE_RANGE } from '@orga-ai/sdk-react-native';
    ```

### Types & Interfaces

- **SessionConfig**
  - Configuration object for `OrgaAI.init`.
  - _Import:_
    ```ts
    import type { SessionConfig } from '@orga-ai/sdk-react-native';
    ```

- **Transcription, ConnectionState, CameraPosition, ...**
  - Types for SDK state and events.
  - _Import:_
    ```ts
    import type { Transcription, ConnectionState, CameraPosition } from '@orga-ai/sdk-react-native';
    ```

---

## Exports

| Export                        | Type/Class/Const | Description                                               |
|-------------------------------|------------------|-----------------------------------------------------------|
| `ORGAAI_MODELS`               | `const`          | Allowed model names for the `model` config option         |
| `ORGAAI_VOICES`               | `const`          | Allowed voice names for the `voice` config option         |
| `ORGAAI_TEMPERATURE_RANGE`    | `const`          | Allowed temperature range for the `temperature` config    |
| `OrgaAI`                      | `class`          | Static class for SDK initialization/config                |
| `OrgaAIProvider`              | `component`      | React context provider for your app                       |
| `useOrgaAI`                   | `hook`           | Hook to access SDK methods and state                      |
| `useOrgaAIContext`            | `hook`           | Alias for `useOrgaAI` (if both are exported)              |
| `OrgaAIConfig`                | `type`           | Config for `OrgaAI.init`                                  |
| `OrgaAIModel`, `OrgaAIVoice`  | `type`           | Allowed values for model/voice                            |
| `SessionConfig`               | `type`           | Session configuration                                     |
| `OrgaAIHookCallbacks`         | `type`           | Callbacks for the hook                                    |
| `OrgaAIHookReturn`            | `type`           | Return type for the hook                                  |
| `Transcription`               | `type`           | Transcription result type                                 |
| `CameraPosition`              | `type`           | Camera position enum/type                                 |
| `ConnectionState`             | `type`           | Connection state enum/type                                |
| `IceCandidateEvent`           | `type`           | ICE candidate event type                                  |
| `OrgaAIError`                 | `class`          | Base error class                                          |
| `ConfigurationError`          | `class`          | Thrown for invalid config                                 |
| `ConnectionError`             | `class`          | Thrown for connection issues                              |
| `PermissionError`             | `class`          | Thrown for permission issues                              |

**Import Example:**
```ts
import { OrgaAI, OrgaAIProvider, useOrgaAI, ORGAAI_MODELS, OrgaAIConfig, ConnectionError } from '@orga-ai/sdk-react-native';
```

> **Note:** The available exports may change in future releases. Always reference the SDK for the latest values.

---

## Support

For questions or support, please contact your Orga platform representative or support channel.

---

## License

Proprietary. All rights reserved. 