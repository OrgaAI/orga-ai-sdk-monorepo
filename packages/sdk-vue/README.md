# @orga-ai/vue

Vue 3 SDK for Orga AI — real-time multimodal AI that hears, sees, and speaks.

## Installation

```bash
npm install @orga-ai/vue @orga-ai/core
# or
yarn add @orga-ai/vue @orga-ai/core
# or
pnpm add @orga-ai/vue @orga-ai/core
```

## Quick Start

### 1. Initialize OrgaAI

```typescript
import { OrgaAI } from '@orga-ai/core';

// Initialize OrgaAI with your API key and configuration
OrgaAI.init({
  apiKey: 'your-api-key',
  fetchSessionConfig: async () => {
    // Your session configuration logic
    const response = await fetch('/api/orga/session', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${yourToken}` }
    });
    return response.json();
  }
});
```

### 2. Use the Provider Pattern (Recommended)

The provider pattern is the recommended approach for Vue apps as it provides global state management and follows Vue 3 best practices.

#### Root Component (App.vue)

```vue
<template>
  <div id="app">
    <OrgaAIDemo />
  </div>
</template>

<script setup lang="ts">
import { useOrgaAIProvider } from '@orga-ai/vue';
import OrgaAIDemo from './components/OrgaAIDemo.vue';

// Set up the global OrgaAI provider
useOrgaAIProvider({
  callbacks: {
    onSessionStart: () => console.log('Session started'),
    onSessionEnd: () => console.log('Session ended'),
    onError: (error) => console.error('OrgaAI Error:', error)
  }
});
</script>
```

#### Child Component

```vue
<template>
  <div class="orga-demo">
    <h1>Orga AI Vue Demo</h1>
    
    <!-- Video component -->
    <OrgaVideo 
      :userVideoStream="userVideoStream" 
      @loadedmetadata="onVideoLoaded"
      class="video-stream"
    />
    
    <!-- Audio component -->
    <OrgaAudio 
      :aiAudioStream="aiAudioStream" 
      @play="onAudioPlay"
    />
    
    <!-- Controls -->
    <div class="controls">
      <button @click="toggleMic" :disabled="connectionState !== 'connected'">
        {{ isMicOn ? 'Mute' : 'Unmute' }}
      </button>
      <button @click="toggleCamera" :disabled="connectionState !== 'connected'">
        {{ isCameraOn ? 'Turn Off Camera' : 'Turn On Camera' }}
      </button>
      <button @click="startSession" :disabled="connectionState !== 'closed'">
        Start Session
      </button>
      <button @click="endSession" :disabled="connectionState === 'closed'">
        End Session
      </button>
    </div>
    
    <!-- Configuration -->
    <div class="config">
      <label>
        Model:
        <select :value="model" @change="setModel($event.target.value)">
          <option value="orga-1-beta">Orga 1 Beta</option>
          <option value="orga-1-pro">Orga 1 Pro</option>
        </select>
      </label>
      
      <label>
        Voice:
        <select :value="voice" @change="setVoice($event.target.value)">
          <option value="alloy">Alloy</option>
          <option value="echo">Echo</option>
          <option value="fable">Fable</option>
          <option value="onyx">Onyx</option>
          <option value="nova">Nova</option>
          <option value="shimmer">Shimmer</option>
        </select>
      </label>
      
      <label>
        Temperature: {{ temperature }}
        <input 
          type="range" 
          min="0" 
          max="2" 
          step="0.1" 
          :value="temperature" 
          @input="setTemperature(Number($event.target.value))"
        />
      </label>
    </div>
    
    <!-- Status -->
    <div class="status">
      <p><strong>Connection:</strong> {{ connectionState }}</p>
      <p><strong>Conversation ID:</strong> {{ conversationId }}</p>
      <p><strong>Messages:</strong> {{ conversationItems.length }}</p>
    </div>
    
    <!-- Conversation -->
    <div class="conversation" v-if="conversationItems.length > 0">
      <h3>Conversation</h3>
      <div v-for="item in conversationItems" :key="item.conversationId" class="message">
        <strong>{{ item.sender }}:</strong> {{ item.content.message }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useOrgaAI, OrgaAudio, OrgaVideo } from '@orga-ai/vue';

// Use the provider context
const {
  // Session management
  startSession,
  endSession,
  
  // Media controls
  toggleMic,
  toggleCamera,
  
  // State
  connectionState,
  userVideoStream,
  aiAudioStream,
  isMicOn,
  isCameraOn,
  conversationId,
  conversationItems,
  
  // Configuration
  model,
  voice,
  temperature,
  setModel,
  setVoice,
  setTemperature
} = useOrgaAI();

const onVideoLoaded = () => {
  console.log('Video loaded and ready');
};

const onAudioPlay = () => {
  console.log('AI audio is playing');
};
</script>

<style scoped>
.controls {
  display: flex;
  gap: 10px;
  margin: 20px 0;
}

.controls button {
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  background: #007bff;
  color: white;
  cursor: pointer;
}

.controls button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.config {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 20px 0;
}

.config label {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.video-stream {
  width: 300px;
  height: 200px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.conversation {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  max-height: 300px;
  overflow-y: auto;
}

.message {
  margin: 10px 0;
  padding: 5px;
  border-left: 3px solid #007bff;
  background: #f8f9fa;
}
</style>
```

### 3. Alternative: Direct Composable Usage

If you prefer not to use the provider pattern, you can use the composable directly:

```vue
<template>
  <div>
    <button @click="startSession">Start Session</button>
    <button @click="endSession">End Session</button>
    <p>Connection: {{ connectionState }}</p>
  </div>
</template>

<script setup lang="ts">
import { useOrgaAIComposable } from '@orga-ai/vue';

const {
  startSession,
  endSession,
  connectionState,
  // ... other properties
} = useOrgaAIComposable({
  onSessionStart: () => console.log('Session started'),
  onError: (error) => console.error('Error:', error)
});
</script>
```

## API Reference

### Composables

#### `useOrgaAIProvider(options)`

Sets up the global OrgaAI provider. Should be called in your root component.

**Parameters:**
- `options.callbacks?: OrgaAIHookCallbacks` - Event callbacks
- `options.initialModel?: OrgaAIModel` - Initial model (default: "orga-1-beta")
- `options.initialVoice?: OrgaAIVoice` - Initial voice (default: "alloy")
- `options.initialTemperature?: number` - Initial temperature (default: 0.5)

**Returns:** OrgaAIProviderReturn object with all functionality

#### `useOrgaAI()`

Consumes the OrgaAI provider context. Must be used within a component tree that has `useOrgaAIProvider`.

**Returns:** OrgaAIProviderReturn object with all functionality

#### `useOrgaAIComposable(callbacks)`

Direct composable usage without provider pattern.

**Parameters:**
- `callbacks?: OrgaAIHookCallbacks` - Event callbacks

**Returns:** OrgaAIComposableReturn object with core functionality

### Components

#### `<OrgaVideo>`

Displays the user's video stream.

**Props:**
- `userVideoStream: MediaStream | null` - The video stream to display
- `autoplay?: boolean` - Auto-play the video (default: true)
- `muted?: boolean` - Mute the video (default: true)
- `playsinline?: boolean` - Play inline on mobile (default: true)

**Events:**
- `@loadedmetadata` - Video metadata loaded
- `@play` - Video started playing
- `@pause` - Video paused
- `@error` - Video error occurred

#### `<OrgaAudio>`

Plays the AI's audio response.

**Props:**
- `aiAudioStream: MediaStream | null` - The audio stream to play
- `autoplay?: boolean` - Auto-play the audio (default: true)
- `muted?: boolean` - Mute the audio (default: false)

**Events:**
- `@loadedmetadata` - Audio metadata loaded
- `@play` - Audio started playing
- `@pause` - Audio paused
- `@error` - Audio error occurred

### Return Object Properties

#### Session Management
- `startSession(config?: SessionConfig): Promise<void>`
- `endSession(): Promise<void>`

#### Media Controls
- `enableMic(): Promise<void>`
- `disableMic(hardDisable?: boolean): Promise<void>`
- `toggleMic(): Promise<void>`
- `enableCamera(): Promise<void>`
- `disableCamera(hardDisable?: boolean): Promise<void>`
- `toggleCamera(): Promise<void>`

#### State (Reactive Refs)
- `connectionState: Ref<ConnectionState>`
- `aiAudioStream: Ref<MediaStream | null>`
- `userAudioStream: Ref<MediaStream | null>`
- `userVideoStream: Ref<MediaStream | null>`
- `conversationItems: Ref<ConversationItem[]>`
- `isCameraOn: Ref<boolean>`
- `isMicOn: Ref<boolean>`
- `conversationId: Ref<string | null>`

#### Configuration (Provider Pattern Only)
- `model: Ref<OrgaAIModel>`
- `voice: Ref<OrgaAIVoice>`
- `temperature: Ref<number>`
- `setModel(model: OrgaAIModel): void`
- `setVoice(voice: OrgaAIVoice): void`
- `setTemperature(temperature: number): void`

#### Parameter Management
- `updateParams(params: ParameterUpdate): void`

## Vue 3 Best Practices

This SDK follows Vue 3 best practices:

1. **Composition API**: Uses the modern Composition API with `<script setup>`
2. **Reactivity**: All state is reactive using Vue's `ref()` and `computed()`
3. **Dependency Injection**: Uses `provide()` and `inject()` for clean component communication
4. **TypeScript**: Full TypeScript support with proper type inference
5. **Tree Shaking**: Only imports what you use
6. **SSR Compatible**: Works with Nuxt.js and other SSR frameworks

## Migration from React

If you're migrating from the React SDK:

| React | Vue |
|-------|-----|
| `useOrgaAI()` hook | `useOrgaAI()` composable |
| `OrgaAIProvider` | `useOrgaAIProvider()` composable |
| `useState()` | `ref()` |
| `useCallback()` | Regular functions (Vue handles optimization) |
| `useEffect()` | `watch()` or `onMounted()` |

## Examples

Check out the examples directory for complete working examples:

- [Basic Usage](./examples/basic-usage/)
- [With Nuxt.js](./examples/nuxt/)
- [With Vite](./examples/vite/)

## License

Proprietary - See LICENSE file for details.
