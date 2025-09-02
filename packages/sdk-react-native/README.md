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
npm install react-native-webrtc react-native-incallmanager
```

## Configure app.json

Add required permissions and plugins:

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSCameraUsageDescription": "Allow $(PRODUCT_NAME) to access your camera",
        "NSMicrophoneUsageDescription": "Allow $(PRODUCT_NAME) to access your microphone"
      }
    },
    "android": {
      "permissions": [
        "android.permission.CAMERA",
        "android.permission.RECORD_AUDIO"
      ]
    }
  }
}
```
### Development Build Required

The SDK requires a development build and won't work in Expo Go due to native dependencies. Create a development build:

```sh
npx expo prebuild
```
```sh
eas build --platform all --profile development
```

---

## Quick Start

### 1. Set Up Backend Proxy

You need a secure backend proxy to protect your API key. The location of your environment variables depends on your chosen approach:

#### Option A: Using Expo API Routes (SDK 50+)

If using Expo API Routes, create a `.env` file in your Expo project root:

```env
ORGA_API_KEY=your_orga_api_key_here
ORGA_DEV_EMAIL=your_developer_email@example.com
```

> **Note:** Get your API key from the OrgaAI dashboard. Never commit this file to version control.
> **Security:** Expo API Routes keep your environment variables secure by only exposing them server-side.

#### Option B: Custom Backend Server

If using a separate backend server, store your environment variables in your backend project:

1. Create a `.env` file in your backend project (NOT in your React Native app):
```env
ORGA_API_KEY=your_orga_api_key_here
ORGA_DEV_EMAIL=your_developer_email@example.com
```

2. Your React Native app should only contain the backend URL:
```env
# In your React Native app's .env
API_URL=https://your-backend-url.com
```

> **Important:** Never store the ORGA_API_KEY in your mobile app's environment variables. It should always be kept secure on the server side.

Now let's set up the proxy endpoint based on your chosen approach:

#### Option A: Using Expo API Routes (SDK 50+)

If you're using Expo SDK 50+ with API routes:

```ts
// app/orga-ephemeral+api.ts

const ORGA_API_KEY = process.env.ORGA_API_KEY;
const USER_EMAIL = process.env.ORGA_DEV_EMAIL;

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
    return data.iceServers;
  } catch (error) {
    console.error("Error fetching ice servers:", error);
    throw error;
  }
};

export async function GET(request: Request) {
  if (!USER_EMAIL || !ORGA_API_KEY) {
    return Response.json({error: "Missing environment variables"}, { status: 500 });
  }

  try {
    const apiUrl = `https://api.orga-ai.com/ephemeral-token?email=${encodeURIComponent(USER_EMAIL)}`;
    const ephemeralResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ORGA_API_KEY}`
      },
    });
    
    if (!ephemeralResponse.ok) {
      throw new Error('Failed to fetch ephemeral token');
    }

    const { ephemeral_token } = await ephemeralResponse.json();
    const iceServers = await fetchIceServers(ephemeral_token);
    
    return Response.json({ ephemeralToken: ephemeral_token, iceServers }, {status: 200})
  } catch (error) {
    return Response.json({error: "Internal server error"}, { status: 500 });
  }
}
```

#### Option B: Custom Backend (For Bare React Native or Expo without API Routes)

For bare React Native projects or if not using Expo API routes, set up a custom backend server:

```ts
// Example using Express with proper TypeScript types
import express, { Request, Response } from 'express';
import cors from 'cors';

// Note: RTCIceServer is available in modern browsers and Node.js environments
// If you get type errors, you may need to install @types/webrtc or define the type:
// interface RTCIceServer { urls: string | string[]; username?: string; credential?: string; }

// Define types for OrgaAI API responses
interface OrgaEphemeralTokenResponse {
  ephemeral_token: string;
}

interface OrgaIceConfigResponse {
  iceServers: RTCIceServer[];
}

interface OrgaEphemeralResponse {
  ephemeralToken: string;
  iceServers: RTCIceServer[];
}

// Extend Express Request to include user (if using authentication)
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

const app = express();
app.use(cors());  // Configure appropriately for production

// Add your authentication middleware
app.use(authMiddleware);

app.get('/api/orga-ephemeral', async (req: AuthenticatedRequest, res: Response) => {
  // Your user authentication/session validation here
  const userId = req.user?.id;  // Example: Get from your auth system
  
  if (!process.env.ORGA_API_KEY || !process.env.ORGA_DEV_EMAIL) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const ephemeralResponse = await fetch(
      `https://api.orga-ai.com/ephemeral-token?email=${encodeURIComponent(process.env.ORGA_DEV_EMAIL)}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.ORGA_API_KEY}`
        },
      }
    );

    if (!ephemeralResponse.ok) {
      throw new Error('Failed to fetch ephemeral token');
    }

    const ephemeralData = await ephemeralResponse.json() as OrgaEphemeralTokenResponse;
    const { ephemeral_token } = ephemeralData;
    
    // Fetch ICE servers
    const iceResponse = await fetch('https://api.orga-ai.com/ice-config', {
      headers: { Authorization: `Bearer ${ephemeral_token}` }
    });
    
    if (!iceResponse.ok) {
      throw new Error('Failed to fetch ICE servers');
    }
    
    const iceData = await iceResponse.json() as OrgaIceConfigResponse;
    const { iceServers } = iceData;

    const response: OrgaEphemeralResponse = {
      ephemeralToken: ephemeral_token,
      iceServers
    };

    res.json(response);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(5000, () => console.log('Server running on port 5000'));
```

> **Security Note:** Your backend proxy should:
> - Store the OrgaAI API key securely (use environment variables)
> - Implement proper authentication/authorization
> - Add rate limiting and request validation
> - Use HTTPS in production
> - Configure CORS appropriately

### 3. Initialize the SDK

```tsx
// app/_layout.tsx
import { OrgaAI, OrgaAIProvider } from '@orga-ai/sdk-react-native';

OrgaAI.init({
  logLevel: 'debug',
  fetchSessionConfig: async () => {
    const response = await fetch('/api/orga-ephemeral');
    const { ephemeralToken, iceServers } = await response.json();
    return { ephemeralToken, iceServers };
  },
  model: 'orga-1-beta',
  voice: 'alloy',
});

export default function RootLayout() {
  return (
    <OrgaAIProvider>
      <Stack />
    </OrgaAIProvider>
  );
}
```

### 4. Use in Your Components

```tsx
// app/index.tsx
import { StyleSheet, Text, View } from "react-native";
import {
  OrgaAICameraView,
  OrgaAIControls,
  useOrgaAI
} from "@orga-ai/sdk-react-native";

export default function HomeScreen() {
  const {
    userVideoStream,
    connectionState,
    isMicOn,
    isCameraOn,
    startSession,
    endSession,
    toggleCamera,
    toggleMic,
    flipCamera,
  } = useOrgaAI();

  const handleStart = async () => {
    await startSession({
      onSessionConnected: () => {
        console.log("Connected!");
      },
    });
  };

  return (
    <View style={styles.container}>
      <OrgaAICameraView
        streamURL={userVideoStream ? userVideoStream.toURL() : undefined}
        containerStyle={styles.cameraViewContainer}
        style={{ width: "100%", height: "100%" }}
      >
        <OrgaAIControls
          connectionState={connectionState}
          isCameraOn={isCameraOn}
          isMicOn={isMicOn}
          onStartSession={startSession}
          onEndSession={endSession}
          onToggleCamera={toggleCamera}
          onToggleMic={toggleMic}
          onFlipCamera={flipCamera}
        />
      </OrgaAICameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1e293b",
  },
  cameraViewContainer: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "white",
    fontSize: 16,
    marginTop: 12,
  },
});
```


> **Note:** For Expo, you must create a development build to use camera and audio features. These won't work in Expo Go.

## Features

### 🎥 Camera & Audio Controls
- Camera toggle (front/back)
- Microphone toggle
- Session management
- Real-time streaming

### 💬 Transcription Features
- Real-time speech-to-text transcription (when enabled via `enableTranscriptions`)
- Conversation items for both user speech and AI responses
- Conversation state tracking via `conversationId`
- Event callbacks for transcription and response updates

### ⚙️ Configuration
- AI model selection
- Voice selection
- Temperature control
- Custom instructions

---

## Troubleshooting

### Common Issues

1. **"Camera/Microphone Unavailable"**
   - Ensure you're using a development build
   - Check device permissions
   - Verify physical device access

2. **Connection Failures**
   - Check network connectivity
   - Verify ephemeral token endpoint
   - Confirm ICE server configuration

### Debugging

Enable debug logging:

```ts
OrgaAI.init({
  logLevel: 'debug',
  // ... other config
});
```

---

## Configuration

- **API Key:** Required for your backend endpoint that provides ephemeral tokens. Never expose in client code.
- **fetchSessionConfig:**
  - Signature: `() => Promise<{ ephemeralToken: string; iceServers: RTCIceServer[] }>`
  - Must be provided to `OrgaAI.init`.
- **Other Config Options:** See SDK documentation for available options (logLevel, model, etc.).

---

## Secure Backend Example for Ephemeral Token & ICE Servers

**Never expose your OrgaAI API key in client code. Always use a secure backend to fetch ephemeral tokens and ICE servers.**

### Mobile Frontend Example (React Native)

```ts
// In your app, call your own backend proxy endpoint
const fetchSessionConfig = async () => {
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

// Note: RTCIceServer is available in modern browsers and Node.js environments
// If you get type errors, you may need to install @types/webrtc or define the type:
// interface RTCIceServer { urls: string | string[]; username?: string; credential?: string; }

// Define types for OrgaAI API responses
interface OrgaEphemeralTokenResponse {
  ephemeral_token: string;
}

interface OrgaIceConfigResponse {
  iceServers: RTCIceServer[];
}

interface OrgaEphemeralResponse {
  ephemeralToken: string;
  iceServers: RTCIceServer[];
}

const USER_EMAIL = process.env.ORGA_DEV_EMAIL;
const ORGA_API_KEY = process.env.ORGA_API_KEY;

const fetchIceServers = async (ephemeralToken: string): Promise<RTCIceServer[]> => {
  const URL = `https://api.orga-ai.com/ice-config`;
  try {
    const iceServersResponse = await fetch(URL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${ephemeralToken}`,
      },
    });
    
    if (!iceServersResponse.ok) {
      throw new Error('Failed to fetch ICE servers');
    }
    
    const data = await iceServersResponse.json() as OrgaIceConfigResponse;
    return data.iceServers;
  } catch (error) {
    console.error("Error fetching ice servers:", error);
    throw error;
  }
};

export const getEphemeralTokenAndIceServers = async (req: Request, res: Response) => {
  try {
    if (!USER_EMAIL || !ORGA_API_KEY) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const apiUrl = `https://api.orga-ai.com/ephemeral-token?email=${encodeURIComponent(USER_EMAIL)}`;

    const ephemeralResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ORGA_API_KEY}`
      },
    });
    
    if (!ephemeralResponse.ok) {
      throw new Error('Failed to fetch ephemeral token');
    }

    const ephemeralData = await ephemeralResponse.json() as OrgaEphemeralTokenResponse;
    const { ephemeral_token } = ephemeralData;
    
    const iceServers = await fetchIceServers(ephemeral_token);
    
    const response: OrgaEphemeralResponse = {
      ephemeralToken: ephemeral_token,
      iceServers
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Error:', error);
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
| `fetchSessionConfig` | `() => Promise<{ ephemeralToken: string; iceServers: RTCIceServer[] }>` | Custom function to fetch ephemeral token and ICE servers. | —            | Yes*      |
| `model`                         | `OrgaAIModel` | Model to use (see SDK for allowed values).                                                 | —            | No        |
| `voice`                         | `OrgaAIVoice` | Voice to use (see SDK for allowed values).                                                 | —            | No        |
| `temperature`                   | `number`  | Sampling temperature (randomness). Must be between allowed min/max.                         | —            | No        |
| `maxTokens`                     | `number`  | Maximum tokens for responses. Must be between 100 and 1000.                                 | —            | No        |

> **Note:** Either `ephemeralEndpoint` **or** `fetchSessionConfig` is required.

### Example

```ts
OrgaAI.init({
  logLevel: 'debug',
  timeout: 30000,
  fetchSessionConfig: async () => {
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
- **fetchSessionConfig:** If provided, the SDK will use this function to fetch tokens/ICE servers. This gives you full control.
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

- **OrgaAICameraView**
  - Displays the user's camera feed with optional flip camera functionality and placeholder support.
  - _Import:_
    ```tsx
    import { OrgaAICameraView } from '@orga-ai/sdk-react-native';
    ```
  - _Usage:_
    ```tsx
    <OrgaAICameraView
      streamURL={userVideoStream?.toURL()}
      containerStyle={styles.cameraContainer}
      style={{ width: "100%", height: "100%" }}
      onFlipCamera={flipCamera}
      placeholder={<Text>Camera not available</Text>}
    />
    ```

- **OrgaAIControls**
  - Provides a complete UI for controlling camera, microphone, and session management.
  - _Import:_
    ```tsx
    import { OrgaAIControls } from '@orga-ai/sdk-react-native';
    ```
  - _Usage:_
    ```tsx
    <OrgaAIControls
      connectionState={connectionState}
      isCameraOn={isCameraOn}
      isMicOn={isMicOn}
      onStartSession={startSession}
      onEndSession={endSession}
      onToggleCamera={toggleCamera}
      onToggleMic={toggleMic}
      onFlipCamera={flipCamera}
    />
    ```

### Hooks

- **useOrgaAIContext**
  - Access Orga SDK methods and state in your components.
  - _Import:_
    ```tsx
    import { useOrgaAI } from '@orga-ai/sdk-react-native';
    ```
  - _Returns:_
    - `startSession`, `endSession`, `enableMic`, `disableMic`, `toggleMic`, `enableCamera`, `disableCamera`, `toggleCamera`, `requestPermissions`, `initializeMedia`, `connect`, `cleanup`
    - State: `connectionState`, `localStream`, `remoteStream`, `transcriptions`, `cameraPosition`, `isCameraOn`, `isMicOn`, `videoStream`, `audioStream`, `conversationId`, `hasPermissions`
  - _Usage:_
    ```tsx
    const { startSession, endSession, videoStream } = useOrgaAI();
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
      fetchSessionConfig: async () => { /* ... */ },
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
| `OrgaAICameraView`            | `component`      | Camera view component with flip functionality              |
| `OrgaAIControls`              | `component`      | Complete UI controls for camera, mic, and session        |
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
import { 
  OrgaAI, 
  OrgaAIProvider, 
  OrgaAICameraView, 
  OrgaAIControls, 
  useOrgaAI, 
  ORGAAI_MODELS, 
  OrgaAIConfig, 
  ConnectionError 
} from '@orga-ai/sdk-react-native';
```

> **Note:** The available exports may change in future releases. Always reference the SDK for the latest values.

---

## Component Documentation

### OrgaAICameraView

The `OrgaAICameraView` component displays the user's camera feed with optional flip camera functionality and placeholder support when no stream is available.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `streamURL` | `string` | Yes | - | The URL of the video stream to display |
| `onFlipCamera` | `() => void` | No | - | Callback function when flip camera button is pressed |
| `flipCameraButtonStyle` | `StyleProp<ViewStyle>` | No | - | Custom styles for the flip camera button |
| `icon` | `React.ReactNode` | No | - | Custom icon for the flip camera button |
| `text` | `string` | No | - | Custom text for the flip camera button |
| `containerStyle` | `StyleProp<ViewStyle>` | No | - | Custom styles for the container |
| `placeholder` | `React.ReactNode` | No | `null` | Content to display when no stream is available |
| `cameraPosition` | `"front" \| "back"` | No | `"front"` | Current camera position (affects mirroring) |
| `children` | `React.ReactNode` | No | - | Child components to render inside the camera view |

#### Features

- **Automatic Mirroring**: Front camera is automatically mirrored for natural selfie experience
- **Placeholder Support**: Shows custom content when no video stream is available
- **Flip Camera Button**: Optional button to switch between front and back cameras
- **Customizable Styling**: Full control over appearance through style props
- **RTCView Integration**: Built on top of `react-native-webrtc` for optimal performance

#### Example Usage

```tsx
import { OrgaAICameraView } from '@orga-ai/sdk-react-native';
import { View, Text, StyleSheet } from 'react-native';

export default function CameraScreen() {
  const { userVideoStream, flipCamera } = useOrgaAI();

  return (
    <View style={styles.container}>
      <OrgaAICameraView
        streamURL={userVideoStream?.toURL()}
        containerStyle={styles.cameraContainer}
        style={styles.videoStyle}
        onFlipCamera={flipCamera}
        flipCameraButtonStyle={styles.flipButton}
        icon={<Text style={styles.flipIcon}>🔄</Text>}
        text="Flip"
        placeholder={
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>Camera not available</Text>
          </View>
        }
        cameraPosition="front"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  videoStyle: {
    width: '100%',
    height: '100%',
  },
  flipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 20,
  },
  flipIcon: {
    fontSize: 20,
    color: 'white',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e293b',
  },
  placeholderText: {
    color: 'white',
    fontSize: 16,
  },
});
```

### OrgaAIControls

The `OrgaAIControls` component provides a complete UI for controlling camera, microphone, and session management with extensive customization options.

#### Props

##### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `connectionState` | `ConnectionState` | Current connection state ("disconnected", "connecting", "connected") |
| `isCameraOn` | `boolean` | Whether the camera is currently enabled |
| `isMicOn` | `boolean` | Whether the microphone is currently enabled |
| `onStartSession` | `() => void` | Function to start a new session |
| `onEndSession` | `() => void` | Function to end the current session |
| `onToggleCamera` | `() => void` | Function to toggle camera on/off |
| `onToggleMic` | `() => void` | Function to toggle microphone on/off |
| `onFlipCamera` | `() => void` | Function to flip between front/back cameras |

##### Styling Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `containerStyle` | `StyleProp<ViewStyle>` | - | Custom styles for the main container |
| `controlsOverlayStyle` | `StyleProp<ViewStyle>` | - | Custom styles for the controls overlay |
| `controlButtonStyle` | `StyleProp<ViewStyle>` | - | Custom styles for individual control buttons |
| `controlLabelStyle` | `StyleProp<ViewStyle>` | - | Custom styles for button labels |
| `connectButtonStyle` | `StyleProp<ViewStyle>` | - | Custom styles for the connect button |
| `disconnectButtonStyle` | `StyleProp<ViewStyle>` | - | Custom styles for the disconnect button |

##### Icon Customization

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `cameraOnIcon` | `React.ReactNode` | 📹 | Icon for camera on state |
| `cameraOffIcon` | `React.ReactNode` | 📷 | Icon for camera off state |
| `micOnIcon` | `React.ReactNode` | 🎤 | Icon for microphone on state |
| `micOffIcon` | `React.ReactNode` | 🔇 | Icon for microphone off state |
| `flipIcon` | `React.ReactNode` | 🔄 | Icon for flip camera button |
| `endIcon` | `React.ReactNode` | ❌ | Icon for end session button |
| `startIcon` | `React.ReactNode` | 🎤+ | Icon for start session button |

##### Text Customization

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `startButtonText` | `string` | "Start Conversation" | Text for the start button |
| `connectingText` | `string` | "Connecting..." | Text shown while connecting |
| `disconnectText` | `string` | "Disconnect" | Text for disconnect button |
| `cameraOnText` | `string` | "Camera On" | Label for camera on state |
| `cameraOffText` | `string` | "Camera Off" | Label for camera off state |
| `micOnText` | `string` | "Mic On" | Label for microphone on state |
| `micOffText` | `string` | "Mic Off" | Label for microphone off state |
| `flipText` | `string` | "Flip" | Label for flip camera button |
| `endText` | `string` | "End" | Label for end session button |
| `connectSubtext` | `string` | "Tap to begin AI conversation" | Subtitle for connect button |

##### Control Visibility

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showCameraControl` | `boolean` | `true` | Whether to show camera toggle button |
| `showMicControl` | `boolean` | `true` | Whether to show microphone toggle button |
| `showFlipCameraControl` | `boolean` | `true` | Whether to show flip camera button |
| `showEndSessionControl` | `boolean` | `true` | Whether to show end session button |

##### Loading Customization

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `loadingIndicator` | `React.ReactNode` | `<ActivityIndicator>` | Custom loading indicator |
| `loadingIndicatorColor` | `string` | `"white"` | Color for the default loading indicator |

#### Features

- **State-Aware UI**: Automatically adapts based on connection state and device status
- **Complete Customization**: Every aspect can be customized through props
- **Responsive Design**: Adapts to different screen sizes and orientations
- **Accessibility**: Built with accessibility in mind
- **Loading States**: Proper loading indicators during connection
- **Conditional Rendering**: Shows/hides controls based on connection state

#### UI States

1. **Disconnected State**: Shows a prominent "Start Conversation" button
2. **Connecting State**: Shows loading indicator with "Connecting..." text
3. **Connected State**: Shows control overlay with camera, mic, flip, and end buttons

#### Example Usage

```tsx
import { OrgaAIControls } from '@orga-ai/sdk-react-native';
import { View, StyleSheet } from 'react-native';

export default function ControlsScreen() {
  const {
    connectionState,
    isCameraOn,
    isMicOn,
    startSession,
    endSession,
    toggleCamera,
    toggleMic,
    flipCamera,
  } = useOrgaAI();

  return (
    <View style={styles.container}>
      <OrgaAIControls
        // Required props
        connectionState={connectionState}
        isCameraOn={isCameraOn}
        isMicOn={isMicOn}
        onStartSession={startSession}
        onEndSession={endSession}
        onToggleCamera={toggleCamera}
        onToggleMic={toggleMic}
        onFlipCamera={flipCamera}
        
        // Custom styling
        containerStyle={styles.controlsContainer}
        controlsOverlayStyle={styles.controlsOverlay}
        controlButtonStyle={styles.controlButton}
        connectButtonStyle={styles.connectButton}
        
        // Custom icons
        cameraOnIcon={<Text style={styles.icon}>📹</Text>}
        cameraOffIcon={<Text style={styles.icon}>📷</Text>}
        micOnIcon={<Text style={styles.icon}>🎤</Text>}
        micOffIcon={<Text style={styles.icon}>🔇</Text>}
        flipIcon={<Text style={styles.icon}>🔄</Text>}
        endIcon={<Text style={styles.icon}>❌</Text>}
        
        // Custom text
        startButtonText="Begin AI Chat"
        connectingText="Establishing connection..."
        disconnectText="End Chat"
        cameraOnText="Camera Active"
        cameraOffText="Camera Disabled"
        micOnText="Mic Active"
        micOffText="Mic Disabled"
        flipText="Switch Camera"
        endText="End Session"
        connectSubtext="Start your AI conversation now"
        
        // Control visibility
        showCameraControl={true}
        showMicControl={true}
        showFlipCameraControl={true}
        showEndSessionControl={true}
        
        // Loading customization
        loadingIndicatorColor="#3b82f6"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  controlsOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 20,
    margin: 16,
  },
  controlButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
  },
  connectButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 25,
  },
  icon: {
    fontSize: 24,
    color: 'white',
  },
});
```

#### Advanced Customization Example

```tsx
// Custom loading indicator
const CustomLoadingIndicator = () => (
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <ActivityIndicator size="small" color="#3b82f6" />
    <Text style={{ marginLeft: 8, color: 'white' }}>Connecting to AI...</Text>
  </View>
);

// Custom start icon
const CustomStartIcon = () => (
  <View style={{ alignItems: 'center' }}>
    <Text style={{ fontSize: 32, color: 'white' }}>🤖</Text>
    <Text style={{ fontSize: 12, color: 'white', marginTop: 2 }}>AI</Text>
  </View>
);

<OrgaAIControls
  // ... other props
  loadingIndicator={<CustomLoadingIndicator />}
  startIcon={<CustomStartIcon />}
  showCameraControl={false} // Hide camera control
  showFlipCameraControl={false} // Hide flip camera control
/>
```

---

## Support

For questions or support, please contact your Orga platform representative or support channel.

---

## License

**Proprietary License** - Copyright (c) 2025 Orga AI. All rights reserved.

### Key Terms

- **Free to Use**: The SDK is free to use for developing applications that integrate with Orga AI services
- **API Key Required**: A valid Orga AI account and API key are required for functionality
- **Credits Required**: Purchased credits are needed to enable SDK features
- **Non-Transferable**: This license is non-transferable and non-sublicensable

### Restrictions

- **No Reverse Engineering**: You may not reverse-engineer, decompile, disassemble, or modify the SDK
- **No Redistribution**: Redistribution, sharing, or resale is strictly prohibited without written consent
- **Platform Use Only**: Use is limited to purposes expressly permitted by this license and platform documentation

### Beta Status

Beta versions are subject to change, including licensing terms and APIs. Updates will be communicated via the [documentation site](https://docs.orga-ai.com).

### Data Protection

Use of the SDK is subject to Orga AI's [Privacy Policy](https://orga-ai.com/en/privacy-policy), which complies with GDPR and other applicable data protection laws.

### Contact

For commercial use inquiries, questions about credits, or additional permissions, contact Orga AI at **licensing@orga-ai.com**.

### Full License

See the complete [LICENSE](LICENSE) file for detailed terms and conditions, or visit [https://docs.orga-ai.com/license](https://docs.orga-ai.com/license) for the most up-to-date license information. 