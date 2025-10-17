<template>
  <div class="sdk-test">
    <h2>SDK Import Test</h2>
    <div class="test-results">
      <p><strong>Status:</strong> {{ status }}</p>
      <p><strong>Composable Available:</strong> {{ composableAvailable ? 'Yes' : 'No' }}</p>
      <p><strong>Core Exports:</strong> {{ coreExports.length }} items</p>
      <div v-if="coreExports.length > 0" class="exports-list">
        <h4>Available Exports:</h4>
        <ul>
          <li v-for="exportName in coreExports.slice(0, 10)" :key="exportName">
            {{ exportName }}
          </li>
          <li v-if="coreExports.length > 10">... and {{ coreExports.length - 10 }} more</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useOrgaAIComposable } from '@orga-ai/vue';
import * as CoreExports from '@orga-ai/vue';

const status = ref('Initializing...');
const composableAvailable = ref(false);
const coreExports = ref<string[]>([]);

onMounted(() => {
  try {
    // Test if the composable is available
    if (typeof useOrgaAIComposable === 'function') {
      composableAvailable.value = true;
    }
    
    // Get all available exports
    const exports = Object.keys(CoreExports);
    coreExports.value = exports;
    
    status.value = 'SDK successfully imported and working!';
  } catch (error) {
    status.value = `Error: ${error}`;
    console.error('SDK import error:', error);
  }
});
</script>

<style scoped>
.sdk-test {
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
  border: 2px solid #42b883;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.test-results {
  margin-top: 15px;
}

.exports-list {
  margin-top: 15px;
  padding: 10px;
  background-color: white;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.exports-list ul {
  margin: 10px 0;
  padding-left: 20px;
}

.exports-list li {
  margin: 5px 0;
  font-family: monospace;
  font-size: 0.9em;
}
</style>
