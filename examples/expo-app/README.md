# OrgaAI Mobile SDK Playground

A React Native application for testing and exploring the OrgaAI SDK capabilities in a mobile environment. Built with Expo and React Native, this playground demonstrates real-time AI conversations, transcription management, and SDK configuration.

---

## Project Overview

- **Purpose:** Demonstrate and test OrgaAI SDK features in a mobile environment
- **Platform:** React Native with Expo
- **Key Features:** Real-time AI conversations, video/audio streaming, transcription

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **Bun** (for package management)
- **EAS CLI** (`npm install --global eas-cli`)
- **Physical device** (for camera/audio testing)

### Required Accounts

- **OrgaAI Account** - Get your API key from the [OrgaAI Dashboard](https://platform.orga-ai.com)
- **Expo Account** - For EAS builds and development builds
- **NPM Account** - For testing private packages (if applicable)

## Quick Start

### 1. Clone and Install

```bash
# From the monorepo root
cd examples/expo-app
bun install
```

### 2. Environment Setup

Currently this app hits a separate backend to proxy the realtime API call. To configure clone the mobile backend and run locally. Setup ngrok to forward the traffic and copy the url provided. With the copied url add it to `services/fetch.ts`

### 3. Install Development build on Device

- **Physical Device:** Visit Orga AI's expo dashboard and look for the most recent build for both iOS and Android. Scan the QR to install.

- **New Build:** If you need to create a new build
```bash
cd examples/expo-app 
eas build --platform all --profile development
```
Scan the QR once build has been completed.

### 4. Run the App

```bash
# Start the development server with clean cache (recommended for testing)
bunx expo -c
```

Scan the QR code to run the development build.

---

## Testing Different SDK Features

This playground includes several test scenarios you can explore:

### 🎥 Camera and Audio Testing

1. **Camera Toggle:** Test switching between front and back cameras
2. **Microphone Toggle:** Test audio input on/off functionality
3. **Session Management:** Test session start/stop and connection states
4. **Video Streaming:** Verify real-time video preview

### 💬 Transcription Testing

1. **Real-time Transcription:** Enable transcriptions and test speech-to-text
2. **Conversation History:** Test conversation item management
3. **Event Callbacks:** Test transcription and response event handling

### ⚙️ Configuration Testing

1. **Model Selection:** Test different AI models
2. **Voice Selection:** Test different voice options
3. **Custom Instructions:** Test custom prompt configurations

### 🔧 SDK Integration Testing

1. **Hook Usage:** Test `useOrgaAI` hook functionality
2. **Provider Setup:** Test `OrgaAIProvider` context
3. **Error Handling:** Test various error scenarios

---

## Setup Requirements

### 1. Development Build Required

The SDK requires a development build and won't work in Expo Go due to native dependencies. Create a development build:

```sh
npx expo prebuild
```

### 2. Configure app.json

Add required permissions and plugins:

```json
{
  "expo": {
    "plugins": [
      "react-native-webrtc",
      [
        "expo-build-properties",
        {
          "ios": {
            "useFrameworks": "static"
          }
        }
      ]
    ],
    "ios": {
      "infoPlist": {
        "NSCameraUsageDescription": "Allow $(PRODUCT_NAME) to access your camera",
        "NSMicrophoneUsageDescription": "Allow $(PRODUCT_NAME) to access your microphone",
        "UIBackgroundModes": ["audio"]
      }
    },
    "android": {
      "permissions": [
        "android.permission.CAMERA",
        "android.permission.RECORD_AUDIO",
      ]
    }
  }
}
```

---

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

## Development Tips

### Performance Optimization

- Use `bunx expo -c` to clear cache when testing SDK changes
- Restart the development server after major SDK updates
- Test on physical devices for accurate camera/audio behavior

### Debugging

- Enable debug logging in SDK initialization
- Use React Native Debugger for state inspection
- Check Expo logs for native module issues

### Common Development Patterns

- Test one feature at a time to isolate issues
- Use TypeScript for better development experience
- Leverage the monorepo structure for efficient SDK development

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

3. **Build Issues**
   - Clear Expo cache: `bunx expo -c`
   - Rebuild SDK: `cd packages/react-native && bun run build`
   - Check native dependencies: `bunx expo install`

4. **Permission Issues**
   - Reset app permissions on device
   - Check `app.json` configuration
   - Verify development build installation

### Debugging

Enable debug logging:

```ts
OrgaAI.init({
  logLevel: 'debug',
  // ... other config
});
```

### Getting Help

- Check the [OrgaAI SDK Documentation](https://docs.orga-ai.com)
- Review the [Expo Documentation](https://docs.expo.dev)
- Open an issue in the SDK repository

---

## Support

For issues, questions, or contributions, please refer to the SDK documentation or contact the OrgaAI team.

## License

Proprietary. All rights reserved.
