<template>
  <div class="orga-ai-test">
    <h2>Orga AI SDK Test</h2>
    
    <!-- SDK Initialization -->
    <div class="init-section">
      <h3>SDK Initialization</h3>
      <div class="init-controls">
        <div class="input-group">
          <label>
            API Key:
            <input 
              v-model="apiKey" 
              type="password" 
              placeholder="Enter your API key"
              :disabled="isInitialized"
            />
          </label>
        </div>
        <div class="input-group">
          <label>
            Session Endpoint:
            <input 
              v-model="sessionEndpoint" 
              type="url" 
              placeholder="Session endpoint URL"
              :disabled="isInitialized"
            />
          </label>
        </div>
        <button 
          @click="initializeSDK" 
          :disabled="isInitialized || !apiKey.trim()"
          class="init-button"
        >
          {{ isInitialized ? 'SDK Initialized ✓' : 'Initialize SDK' }}
        </button>
      </div>
    </div>

    <!-- Connection Status -->
    <div class="status-section">
      <h3>Connection Status</h3>
      <p>State: <span :class="connectionState">{{ connectionState }}</span></p>
      <p>Conversation ID: {{ conversationId || 'None' }}</p>
    </div>

    <!-- Media Controls -->
    <div class="controls-section">
      <h3>Media Controls</h3>
      <div class="button-group">
        <button 
          @click="toggleMic" 
          :class="{ active: isMicOn }"
          :disabled="connectionState !== 'connected'"
        >
          {{ isMicOn ? 'Mute Mic' : 'Unmute Mic' }}
        </button>
        <button 
          @click="toggleCamera" 
          :class="{ active: isCameraOn }"
          :disabled="connectionState !== 'connected'"
        >
          {{ isCameraOn ? 'Turn Off Camera' : 'Turn On Camera' }}
        </button>
      </div>
    </div>

    <!-- Session Controls -->
    <div class="session-section">
      <h3>Session Controls</h3>
      <div class="button-group">
        <button 
          @click="() => startSession()" 
          :disabled="!isInitialized || connectionState === 'connected' || connectionState === 'connecting'"
        >
          Start Session
        </button>
        <button 
          @click="endSession" 
          :disabled="!isInitialized || connectionState === 'closed'"
        >
          End Session
        </button>
      </div>
    </div>

    <!-- Configuration -->
    <div class="config-section">
      <h3>Configuration</h3>
      <div class="config-group">
        <label>
          Model:
          <select v-model="selectedModel" @change="updateModel">
            <option value="orga-1-beta">orga-1-beta</option>
            <option value="orga-1-pro">orga-1-pro</option>
          </select>
        </label>
        <label>
          Voice:
          <select v-model="selectedVoice" @change="updateVoice">
            <option value="alloy">alloy</option>
            <option value="echo">echo</option>
            <option value="fable">fable</option>
            <option value="onyx">onyx</option>
            <option value="nova">nova</option>
            <option value="shimmer">shimmer</option>
          </select>
        </label>
        <label>
          Temperature:
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.1" 
            v-model="selectedTemperature"
            @input="updateTemperature"
          />
          <span>{{ selectedTemperature }}</span>
        </label>
      </div>
    </div>

    <!-- Media Streams -->
    <div class="media-section">
      <h3>Media Streams</h3>
      <div class="streams">
        <div class="stream-container">
          <h4>User Video</h4>
          <video 
            v-if="userVideoStream" 
            :srcObject="userVideoStream" 
            autoplay 
            muted 
            playsinline
            class="video-stream"
          />
          <div v-else class="no-stream">No video stream</div>
        </div>
        
        <div class="stream-container">
          <h4>AI Audio</h4>
          <audio 
            v-if="aiAudioStream" 
            :srcObject="aiAudioStream" 
            autoplay 
            muted="false"
            @play="onAudioPlay"
            @pause="onAudioPause"
            @error="onAudioError"
            class="audio-stream"
          />
          <div v-if="!aiAudioStream" class="no-stream">No audio stream</div>
        </div>
      </div>
    </div>

    <!-- Conversation Items -->
    <div class="conversation-section">
      <h3>Conversation</h3>
      <div class="conversation-items">
        <div 
          v-for="(item, index) in conversationItems" 
          :key="`${item.conversationId}-${index}`"
          class="conversation-item"
          :class="item.sender"
        >
          <strong>{{ item.sender }}:</strong> {{ item.content.message }}
        </div>
        <div v-if="conversationItems.length === 0" class="no-conversation">
          No conversation items yet
        </div>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="error-section">
      <h3>Error</h3>
      <div class="error-message">{{ error }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useOrgaAIComposable, OrgaAI } from '@orga-ai/vue';
import type { OrgaAIModel, OrgaAIVoice, OrgaAIConfig } from '@orga-ai/vue';

// Reactive state for configuration
const selectedModel = ref<OrgaAIModel>('orga-1-beta');
const selectedVoice = ref<OrgaAIVoice>('alloy');
const selectedTemperature = ref(0.5);
const error = ref<string | null>(null);
const isInitialized = ref(false);
const apiKey = ref('demo-api-key-12345');
const sessionEndpoint = ref('https://api.orga-ai.com/v1/session');

// Use the OrgaAI composable
const {
  // Session management
  startSession,
  endSession,
  
  // Media controls
  enableMic,
  disableMic,
  toggleMic,
  enableCamera,
  disableCamera,
  toggleCamera,
  
  // State
  connectionState,
  aiAudioStream,
  userAudioStream,
  userVideoStream,
  conversationItems,
  isCameraOn,
  isMicOn,
  conversationId,
  
  // Parameters
  model,
  voice,
  temperature,
  updateParams,
} = useOrgaAIComposable({
  onError: (err: any) => {
    console.error('OrgaAI Error:', err);
    error.value = err.message || 'Unknown error occurred';
  },
  onSessionCreated: (session: any) => {
    console.log('Session created:', session);
    error.value = null;
  },
  onConversationCreated: (conversation: any) => {
    console.log('Conversation created:', conversation);
  },
  onConnectionStateChange: (state: any) => {
    console.log('Connection state changed:', state);
  },
});

// Configuration update methods
const updateModel = () => {
  updateParams({ model: selectedModel.value });
};

const updateVoice = () => {
  updateParams({ voice: selectedVoice.value });
};

const updateTemperature = () => {
  updateParams({ temperature: selectedTemperature.value });
};

// Audio event handlers
const onAudioPlay = () => {
  console.log('AI audio started playing');
};

const onAudioPause = () => {
  console.log('AI audio paused');
};

const onAudioError = (err: Event) => {
  console.error('Audio error:', err);
  error.value = 'Audio playback error';
};

// Initialize SDK
const initializeSDK = async () => {
  try {
    error.value = null;
    
    const config: OrgaAIConfig = {
      sessionConfigEndpoint: sessionEndpoint.value,
      logLevel: 'info',
      model: selectedModel.value,
      voice: selectedVoice.value,
      temperature: selectedTemperature.value,
      enableTranscriptions: true,
    };

    // For demo purposes, we'll use a mock fetchSessionConfig
    // In a real app, you'd use your actual API endpoint
    config.fetchSessionConfig = async () => {
      // Mock implementation for testing
      return {
        ephemeralToken: 'demo-token-' + Date.now(),
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' }
        ]
      };
    };

    OrgaAI.init(config);
    isInitialized.value = true;
    
    // Update configuration
    updateModel();
    updateVoice();
    updateTemperature();
    
    console.log('SDK initialized successfully');
  } catch (err: any) {
    error.value = `Initialization failed: ${err.message}`;
    console.error('SDK initialization error:', err);
  }
};

// Initialize configuration on mount
onMounted(() => {
  // Check if already initialized
  if (OrgaAI.isInitialized && OrgaAI.isInitialized()) {
    isInitialized.value = true;
  }
  
  updateModel();
  updateVoice();
  updateTemperature();
});
</script>

<style scoped>
.orga-ai-test {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.init-section,
.status-section,
.controls-section,
.session-section,
.config-section,
.media-section,
.conversation-section,
.error-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.init-section {
  border-color: #ffc107;
  background-color: #fff3cd;
}

.init-controls {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.input-group label {
  font-weight: bold;
  color: #333;
}

.input-group input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.input-group input:disabled {
  background-color: #f5f5f5;
  color: #666;
}

.init-button {
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  background-color: #28a745;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}

.init-button:hover:not(:disabled) {
  background-color: #218838;
}

.init-button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

h2, h3, h4 {
  margin-top: 0;
  color: #333;
}

.button-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover:not(:disabled) {
  background-color: #0056b3;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

button.active {
  background-color: #28a745;
}

.config-group {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.config-group label {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.config-group select,
.config-group input[type="range"] {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.streams {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.stream-container {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 15px;
  background-color: white;
}

.video-stream {
  width: 100%;
  max-width: 300px;
  height: auto;
  border-radius: 4px;
}

.no-stream {
  color: #666;
  font-style: italic;
  text-align: center;
  padding: 20px;
}

.conversation-items {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  background-color: white;
}

.conversation-item {
  margin-bottom: 10px;
  padding: 8px;
  border-radius: 4px;
  border-left: 4px solid #007bff;
}

.conversation-item.user {
  background-color: #e3f2fd;
  border-left-color: #2196f3;
}

.conversation-item.assistant {
  background-color: #f3e5f5;
  border-left-color: #9c27b0;
}

.no-conversation {
  color: #666;
  font-style: italic;
  text-align: center;
  padding: 20px;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #f5c6cb;
}

.connectionState {
  font-weight: bold;
}

.connectionState.connected {
  color: #28a745;
}

.connectionState.connecting {
  color: #ffc107;
}

.connectionState.closed {
  color: #dc3545;
}

@media (max-width: 768px) {
  .streams {
    grid-template-columns: 1fr;
  }
  
  .button-group {
    flex-direction: column;
  }
}
</style>
