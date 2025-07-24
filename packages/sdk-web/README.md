# Orga Web SDK

The Orga Web SDK enables real-time AI-powered audio and video features in your React web applications using a simple context and hook-based API.

---

## Project Overview

- **Purpose:** Integrate Orga AI for real-time audio and video interaction in React web apps.
- **Platform:** React Web (supports React context, works with most React-based web projects).

---

## Installation

Install the SDK from npm:

```sh
npm install @orga-ai/sdk-web
```

---

## Quick Start

### 1. Initialize the SDK

You **must** initialize the SDK before use, providing a `fetchEphemeralTokenAndIceServers` function. This function should securely fetch an ephemeral token and ICE servers from your backend using your API key.

**Never expose your API key in client code.**

```ts
import { OrgaAI } from '@orga-ai/sdk-web';

OrgaAI.init({
  fetchEphemeralTokenAndIceServers: async () => {
    // Call your backend to get ephemeralToken and iceServers
    const response = await fetch('/api/orga-ephemeral');
    const { ephemeralToken, iceServers } = await response.json();
    return { ephemeralToken, iceServers };
  },
});
```

### 2. Wrap Your App with the Provider

```tsx
import { OrgaAIProvider } from '@orga-ai/sdk-web';

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
import { useOrgaAI } from '@orga-ai/sdk-web';

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

> **Note:** For Next.js or SSR projects, ensure the provider and hooks are only used in client components.

---

## Configuration

- **API Key:** Required for your backend endpoint that provides ephemeral tokens. Never expose in client code.
- **fetchEphemeralTokenAndIceServers:**
  - Signature: `() => Promise<{ ephemeralToken: string; iceServers: RTCIceServer[] }>`
  - Must be provided to `OrgaAI.init`.
- **Other Config Options:** See SDK documentation for available options (logLevel, model, etc.).
- **SSR Caveats:** The provider and hooks must only be used in client-side components (not on the server).

---

## Secure Backend Example for Ephemeral Token & ICE Servers

**Never expose your OrgaAI API key in client code. Always use a secure backend to fetch ephemeral tokens and ICE servers.**

### Web Example (Next.js API Route)

```ts
// app/api/orga-ephemeral.ts
import { NextResponse } from "next/server";

const ORGA_API_KEY = process.env.ORGA_API_KEY;
const USER_EMAIL = process.env.ORGA_DEV_EMAIL

const fetchIceServers = async (ephemeralToken: string) => {
    const URL = `https://api.orga-ai.com/ice-config`;
    try {
      const iceServersResponse = await fetch(URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${ephemeralToken}`,
        },
      });
      if (!iceServersResponse.ok) {
        return NextResponse.json({ error: "Failed to fetch ICE servers" }, { status: 500 });
      }
      const data = await iceServersResponse.json();
      return data.iceServers;
    } catch (error) {
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  };

export const GET = async () => {
    const apiUrl = `https://staging.orga-ai.com/ephemeral-token?email=${encodeURIComponent(USER_EMAIL)}`;
    const ephemeralResponse = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ORGA_API_KEY}`,
        },
      });
      
      if (!ephemeralResponse.ok) throw new Error('Failed to fetch ephemeral token');

      const data = await ephemeralResponse.json();
      const iceServers = await fetchIceServers(data.ephemeral_token);
      const returnData = {
        iceServers,
        ephemeralToken: data.ephemeral_token
      }
    return NextResponse.json(returnData);
}
```

---

> **Summary:**
> - Always keep your OrgaAI API key and developer email on a secure backend.
> - Never expose them in your app or client-side code.
> - The client (web or mobile) should only call your backend, never OrgaAI directly.

---

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
- Easy integration with React web apps
- Flexible configuration for custom backend authentication

---

## API Reference

### Components

- **OrgaAIProvider**
  - Provides Orga context to your React app. Wrap your app with this provider.
  - _Import:_
    ```tsx
    import { OrgaAIProvider } from '@orga-ai/sdk-web';
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
    import { useOrgaAIContext } from '@orga-ai/sdk-web';
    ```
  - _Returns:_
    - `startSession`, `endSession`, `enableMic`, `disableMic`, `toggleMic`, `enableCamera`, `disableCamera`, `toggleCamera`, `requestPermissions`, `initializeMedia`, `connect`, `cleanup`