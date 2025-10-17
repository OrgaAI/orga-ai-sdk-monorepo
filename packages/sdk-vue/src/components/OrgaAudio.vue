<template>
  <audio
    v-if="aiAudioStream"
    ref="audioElement"
    :srcObject="aiAudioStream"
    :autoplay="autoplay"
    :muted="muted"
    @loadedmetadata="onLoadedMetadata"
    @play="onPlay"
    @pause="onPause"
    @error="onError"
  />
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';

interface Props {
  aiAudioStream: MediaStream | null;
  autoplay?: boolean;
  muted?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  autoplay: true,
  muted: false,
});

const emit = defineEmits<{
  loadedmetadata: [];
  play: [];
  pause: [];
  error: [error: Event];
}>();

const audioElement = ref<HTMLAudioElement | null>(null);

const onLoadedMetadata = () => {
  emit('loadedmetadata');
};

const onPlay = () => {
  emit('play');
};

const onPause = () => {
  emit('pause');
};

const onError = (error: Event) => {
  emit('error', error);
};

// Watch for stream changes
watch(() => props.aiAudioStream, (newStream) => {
  if (audioElement.value && newStream) {
    audioElement.value.srcObject = newStream;
  }
}, { immediate: true });
</script>
