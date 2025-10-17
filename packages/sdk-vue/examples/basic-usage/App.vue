<template>
  <div id="app">
    <header>
      <h1>Orga AI Vue Demo</h1>
      <p>Real-time multimodal AI that hears, sees, and speaks</p>
    </header>

    <main>
      <!-- Video Stream -->
      <div class="video-container">
        <h3>Your Video</h3>
        <OrgaVideo 
          :userVideoStream="userVideoStream" 
          @loadedmetadata="onVideoLoaded"
          class="video-stream"
        />
        <p v-if="!userVideoStream" class="placeholder">
          Camera will appear here when enabled
        </p>
      </div>

      <!-- Audio (hidden, plays AI responses) -->
      <OrgaAudio 
        :aiAudioStream="aiAudioStream" 
        @play="onAudioPlay"
        style="display: none;"
      />

      <!-- Controls -->
      <div class="controls">
        <button 
          @click="startSession" 
          :disabled="connectionState !== 'closed'"
          class="btn btn-primary"
        >
          {{ connectionState === 'closed' ? 'Start Session' : 'Session Active' }}
        </button>
        
        <button 
          @click="endSession" 
          :disabled="connectionState === 'closed'"
          class="btn btn-secondary"
        >
          End Session
        </button>
        
        <button 
          @click="toggleMic" 
          :disabled="connectionState !== 'connected'"
          class="btn"
          :class="{ 'btn-active': isMicOn }"
        >
          {{ isMicOn ? '🎤 Mute' : '🎤 Unmute' }}
        </button>
        
        <button 
          @click="toggleCamera" 
          :disabled="connectionState !== 'connected'"
          class="btn"
          :class="{ 'btn-active': isCameraOn }"
        >
          {{ isCameraOn ? '📹 Turn Off Camera' : '📹 Turn On Camera' }}
        </button>
      </div>

      <!-- Configuration -->
      <div class="config-section">
        <h3>Configuration</h3>
        <div class="config-grid">
          <div class="config-item">
            <label>Model:</label>
            <select :value="model" @change="setModel($event.target.value)">
              <option value="orga-1-beta">Orga 1 Beta</option>
              <option value="orga-1-pro">Orga 1 Pro</option>
            </select>
          </div>
          
          <div class="config-item">
            <label>Voice:</label>
            <select :value="voice" @change="setVoice($event.target.value)">
              <option value="alloy">Alloy</option>
              <option value="echo">Echo</option>
              <option value="fable">Fable</option>
              <option value="onyx">Onyx</option>
              <option value="nova">Nova</option>
              <option value="shimmer">Shimmer</option>
            </select>
          </div>
          
          <div class="config-item">
            <label>Temperature: {{ temperature }}</label>
            <input 
              type="range" 
              min="0" 
              max="2" 
              step="0.1" 
              :value="temperature" 
              @input="setTemperature(Number($event.target.value))"
              class="slider"
            />
          </div>
        </div>
      </div>

      <!-- Status -->
      <div class="status-section">
        <h3>Status</h3>
        <div class="status-grid">
          <div class="status-item">
            <strong>Connection:</strong> 
            <span :class="`status-${connectionState}`">{{ connectionState }}</span>
          </div>
          <div class="status-item" v-if="conversationId">
            <strong>Conversation ID:</strong> {{ conversationId }}
          </div>
          <div class="status-item">
            <strong>Messages:</strong> {{ conversationItems.length }}
          </div>
        </div>
      </div>

      <!-- Conversation -->
      <div class="conversation-section" v-if="conversationItems.length > 0">
        <h3>Conversation</h3>
        <div class="conversation">
          <div 
            v-for="(item, index) in conversationItems" 
            :key="index" 
            class="message"
            :class="`message-${item.sender}`"
          >
            <div class="message-header">
              <strong>{{ item.sender === 'user' ? 'You' : 'Orga AI' }}</strong>
              <span class="timestamp">{{ formatTime(item.timestamp) }}</span>
            </div>
            <div class="message-content">{{ item.content.message }}</div>
          </div>
        </div>
      </div>
    </main>

    <footer>
      <p>Built with Vue 3 and Orga AI SDK</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useOrgaAI, OrgaAudio, OrgaVideo } from '@orga-ai/vue';
import { OrgaAI } from '@orga-ai/core';

// Initialize OrgaAI (in a real app, this would be in your main.ts or app setup)
OrgaAI.init({
  apiKey: 'your-api-key-here', // Replace with your actual API key
  fetchSessionConfig: async () => {
    // This is a placeholder - replace with your actual session config endpoint
    return {
      ephemeralToken: 'demo-token',
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    };
  }
});

// Use the OrgaAI provider context
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

// Event handlers
const onVideoLoaded = () => {
  console.log('Video stream loaded and ready');
};

const onAudioPlay = () => {
  console.log('AI audio response is playing');
};

// Utility function to format timestamps
const formatTime = (timestamp?: string) => {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleTimeString();
};
</script>

<style scoped>
#app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

header {
  text-align: center;
  margin-bottom: 30px;
}

header h1 {
  color: #333;
  margin-bottom: 10px;
}

header p {
  color: #666;
  font-size: 1.1em;
}

main {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.video-container {
  text-align: center;
}

.video-stream {
  width: 100%;
  max-width: 400px;
  height: 300px;
  border: 2px solid #ddd;
  border-radius: 8px;
  background: #f8f9fa;
}

.placeholder {
  color: #999;
  font-style: italic;
  margin-top: 10px;
}

.controls {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #545b62;
}

.btn-active {
  background: #28a745 !important;
  color: white;
}

.config-section,
.status-section,
.conversation-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 15px;
}

.config-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.config-item label {
  font-weight: 500;
  color: #333;
}

.config-item select,
.config-item input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.slider {
  width: 100%;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.status-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.status-closed { color: #6c757d; }
.status-connecting { color: #ffc107; }
.status-connected { color: #28a745; }
.status-failed { color: #dc3545; }

.conversation {
  max-height: 400px;
  overflow-y: auto;
  margin-top: 15px;
}

.message {
  margin: 15px 0;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid;
}

.message-user {
  background: #e3f2fd;
  border-left-color: #2196f3;
}

.message-assistant {
  background: #f3e5f5;
  border-left-color: #9c27b0;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.timestamp {
  font-size: 0.85em;
  color: #666;
}

.message-content {
  line-height: 1.5;
}

footer {
  text-align: center;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  color: #666;
}

@media (max-width: 768px) {
  #app {
    padding: 15px;
  }
  
  .controls {
    flex-direction: column;
    align-items: center;
  }
  
  .config-grid,
  .status-grid {
    grid-template-columns: 1fr;
  }
}
</style>
