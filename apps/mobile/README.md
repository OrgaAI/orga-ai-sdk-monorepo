# OrgaAI Mobile SDK Playground

A React Native application for testing and exploring the OrgaAI SDK capabilities. This playground demonstrates real-time AI conversations, transcription management, and SDK configuration.

## Features

### 🎥 Camera & Audio Controls
- **Camera Toggle**: Enable/disable video stream
- **Microphone Toggle**: Enable/disable audio input
- **Camera Flip**: Switch between front and back cameras
- **Connection Management**: Start/stop AI sessions

### 💬 Conversation Management
- **Real-time Transcription**: View live conversation items
- **Message History**: Scrollable conversation panel
- **Status Indicators**: Visual feedback for listening/processing states
- **Message Metadata**: Timestamps and sender information

### ⚙️ SDK Configuration
- **AI Model Selection**: Choose between available models
- **Voice Selection**: Select AI response voice
- **Temperature Control**: Adjust response creativity (0.0 - 1.0)
- **Custom Instructions**: Set AI behavior instructions
- **Real-time Updates**: Configuration changes apply immediately

### 🎨 UI/UX Features
- **Dark Theme**: Modern dark interface design
- **Status Badges**: Connection and session status indicators
- **Animated Indicators**: Pulsing animations for active states
- **Responsive Layout**: Optimized for mobile screens
- **Modal Settings**: Slide-up configuration panel

## Getting Started

1. **Install Dependencies**
   ```bash
   cd apps/mobile
   npm install
   ```

2. **Start the Development Server**
   ```bash
   npx expo start
   ```

3. **Run on Device/Simulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app

## SDK Integration

The app demonstrates key SDK features:

```typescript
import { useOrgaAIContext } from "@orga-ai/sdk-react-native";

const {
  startSession,
  endSession,
  toggleCamera,
  toggleMic,
  conversationItems,
  connectionState,
  // ... more SDK features
} = useOrgaAIContext();
```

### Session Management
- Start AI sessions with custom callbacks
- Handle connection state changes
- Manage media streams (audio/video)

### Real-time Features
- Live transcription display
- Conversation item tracking
- Status monitoring and feedback

### Configuration
- Model and voice selection
- Temperature adjustment
- Custom instruction setting

## Architecture

### Components
- **HomeScreen**: Main application interface
- **OrgaControls**: Media and session controls
- **TranscriptionPanel**: Conversation display
- **TranscriptionStatus**: Real-time status indicators
- **Settings Modal**: SDK configuration

### State Management
- Connection state tracking
- Conversation item management
- Configuration parameter updates
- UI state synchronization

## Development

### Adding New Features
1. Create new components in `components/`
2. Update main screen in `app/index.tsx`
3. Add configuration options in `app/(modal)/settings.tsx`
4. Test with different SDK parameters

### Styling
- Uses consistent color palette (slate theme)
- Responsive design patterns
- Dark theme optimization
- Touch-friendly interface elements

## Troubleshooting

### Common Issues
- **Camera Permissions**: Ensure camera/microphone access
- **Connection Issues**: Check network connectivity
- **SDK Errors**: Verify configuration parameters
- **Performance**: Monitor device resources

### Debug Features
- Console logging for SDK events
- Visual status indicators
- Error handling and user feedback
- Configuration validation

## Contributing

1. Follow TypeScript best practices
2. Maintain consistent styling
3. Add proper error handling
4. Test on both iOS and Android
5. Update documentation for new features

## License

Part of the OrgaAI SDK monorepo - see main README for license information.
