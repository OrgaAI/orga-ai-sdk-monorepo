<template>
  <video
    v-if="userVideoStream"
    ref="videoElement"
    :srcObject="userVideoStream"
    :autoplay="autoplay"
    :muted="muted"
    :playsinline="playsinline"
    @loadedmetadata="onLoadedMetadata"
    @play="onPlay"
    @pause="onPause"
    @error="onError"
  />
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';

interface Props {
  userVideoStream: MediaStream | null;
  autoplay?: boolean;
  muted?: boolean;
  playsinline?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  autoplay: true,
  muted: true,
  playsinline: true,
});

const emit = defineEmits<{
  loadedmetadata: [];
  play: [];
  pause: [];
  error: [error: Event];
}>();

const videoElement = ref<HTMLVideoElement | null>(null);

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
watch(() => props.userVideoStream, (newStream) => {
  if (videoElement.value && newStream) {
    videoElement.value.srcObject = newStream;
  }
}, { immediate: true });
</script>
