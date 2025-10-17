import { ref, onUnmounted } from 'vue';
import {
  OrgaAIComposableReturn,
  OrgaAIHookCallbacks,
  SessionConfig,
  ConnectionState,
  IceCandidateEvent,
  OrgaAIModel,
  OrgaAIVoice,
  Modality,
  DataChannelEvent,
  ConversationItem,
  DataChannelEventTypes,
} from "../types";
import {
  ConnectionError,
  SessionError,
  ConfigurationError,
  OrgaAI,
  getMediaConstraints,
  logger,
  connectToRealtime,
  RTCIceServer,
  RTCIceCandidateInit,
} from "@orga-ai/core";

export function useOrgaAI(
  callbacks: OrgaAIHookCallbacks = {}
): OrgaAIComposableReturn {
  // Reactive state
  const userVideoStream = ref<MediaStream | null>(null);
  const userAudioStream = ref<MediaStream | null>(null);
  const aiAudioStream = ref<MediaStream | null>(null);
  const conversationItems = ref<ConversationItem[]>([]);
  const connectionState = ref<ConnectionState>("closed");
  const conversationId = ref<string | null>(null);
  const conversationIdRef = { current: null as string | null };

  const peerConnectionRef = { current: null as RTCPeerConnection | null };
  const dataChannelRef = { current: null as RTCDataChannel | null };
  const currentConfigRef = { current: {} as SessionConfig };

  const audioTransceiverRef = { current: null as any };
  const videoTransceiverRef = { current: null as any };

  const isCameraOn = ref(false);
  const isMicOn = ref(false);

  const model = ref<OrgaAIModel | null>(null);
  const voice = ref<OrgaAIVoice | null>(null);
  const temperature = ref<number | null>(null);
  const instructions = ref<string | null>(null);
  const modalities = ref<Modality[]>([]);

  // Use a ref to store current callbacks so they can be updated
  const callbacksRef = { current: callbacks };

  // Function to send updated parameters to the session
  const sendUpdatedParams = () => {
    const dataChannel = dataChannelRef.current;
    if (!dataChannel || dataChannel.readyState !== "open") {
      logger.warn("⚠️ Cannot send updated params: data channel not open");
      return;
    }

    const payload = {
      event: DataChannelEventTypes.SESSION_UPDATE,
      data: {
        ...(model.value && { model: model.value }),
        ...(voice.value && { voice: voice.value }),
        ...(temperature.value !== null && { temperature: temperature.value }),
        ...(instructions.value && { instructions: instructions.value }),
        modalities: modalities.value,
      },
    };

    logger.debug("📤 Sending updated parameters via data channel:", payload);
    logger.info("⚙️ Sending updated parameters:", { 
      model: model.value, 
      voice: voice.value, 
      temperature: temperature.value 
    });
    dataChannel.send(JSON.stringify(payload));
  };

  // Parameter update function
  const updateParams = (params: {
    model?: OrgaAIModel;
    voice?: OrgaAIVoice;
    temperature?: number;
    instructions?: string;
    modalities?: Modality[];
  }) => {
    logger.debug("🔄 Updating parameters:", params);
    if (params.model !== undefined) model.value = params.model;
    if (params.voice !== undefined) voice.value = params.voice;
    if (params.temperature !== undefined) temperature.value = params.temperature;
    if (params.instructions !== undefined) instructions.value = params.instructions;
    if (params.modalities !== undefined) {
      modalities.value = params.modalities;
    }

    if (connectionState.value === "connected") {
      sendUpdatedParams();
    }
  };

  // Initialize parameters from config when session starts
  const initializeParams = (config: SessionConfig) => {
    logger.debug("🔧 Initializing parameters from config:", config);
    const orgaConfig = OrgaAI.getConfig();

    const modelValue = config.model || orgaConfig.model;
    const voiceValue = config.voice || orgaConfig.voice;
    const temperatureValue = config.temperature || orgaConfig.temperature;
    const instructionsValue = config.instructions || orgaConfig.instructions;
    const modalitiesValue = config.modalities || orgaConfig.modalities || [];

    model.value = modelValue || null;
    voice.value = voiceValue || null;
    temperature.value = temperatureValue || null;
    instructions.value = instructionsValue || null;
    modalities.value = modalitiesValue;
  };

  // Cleanup function
  const cleanup = async (): Promise<void> => {
    logger.info("🧹 Cleaning up resources");
    logger.debug("🔄 Stopping all media tracks and closing connections");
    
    try {
      [userVideoStream.value, userAudioStream.value, aiAudioStream.value].forEach((stream) => {
        if (stream) {
          try {
            stream.getTracks().forEach((track) => {
              logger.debug(`🛑 Stopping track: ${track.kind} (${track.id})`);
              try { track.stop(); } catch {}
              try { track.enabled = false; } catch {}
            });
          } catch (e) {
            logger.warn("⚠️ Failed stopping some media tracks", e);
          }
        }
      });
    } catch (e) {
      logger.warn("⚠️ Failed iterating streams during cleanup", e);
    }
    
    try {
      if (audioTransceiverRef.current) {
        logger.debug("🔄 Detaching audio transceiver");
        await audioTransceiverRef.current.sender.replaceTrack(null);
      }
    } catch (e) {
      logger.warn("⚠️ Failed detaching audio transceiver", e);
    }

    try {
      if (videoTransceiverRef.current) {
        logger.debug("🔄 Detaching video transceiver");
        await videoTransceiverRef.current.sender.replaceTrack(null);
      }
    } catch (e) {
      logger.warn("⚠️ Failed detaching video transceiver", e);
    }

    try {
      if (peerConnectionRef.current) {
        logger.debug("🔄 Closing peer connection");
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
    } catch (e) {
      logger.error("❌ Error closing peer connection", e);
      callbacksRef.current.onError?.(e as Error);
    }

    try {
      if (dataChannelRef.current) {
        logger.debug("🔄 Closing data channel");
        dataChannelRef.current.close();
        dataChannelRef.current = null;
      }
    } catch (e) {
      logger.warn("⚠️ Error closing data channel", e);
    }

    // Final state reset regardless of above errors
    conversationId.value = null;
    aiAudioStream.value = null;
    connectionState.value = "closed";
    isCameraOn.value = false;
    isMicOn.value = false;
    userVideoStream.value = null;
    userAudioStream.value = null;
  };

  // Initialize media
  const initializeMedia = async (config: Partial<SessionConfig> = {}): Promise<MediaStream> => {
    logger.debug("🎬 Initializing media with config:", config);
    return new MediaStream();
  };

  // Build peer connection
  const buildPeerConnection = async (iceServers: RTCIceServer[]): Promise<RTCPeerConnection> => {
    logger.debug("🔧 Building peer connection with ICE servers:", iceServers);
    const { voice: voiceValue, model: modelValue } = OrgaAI.getConfig();
    const pc = new RTCPeerConnection({
      iceServers,
      iceTransportPolicy: "all",
      iceCandidatePoolSize: 0,
    });

    logger.debug("🎤 Adding audio transceiver");
    audioTransceiverRef.current = pc.addTransceiver("audio", {
      direction: "sendrecv",
    });
    logger.debug("📹 Adding video transceiver");
    videoTransceiverRef.current = pc.addTransceiver("video", {
      direction: "sendonly",
    });

    await audioTransceiverRef.current.sender.replaceTrack(null);
    await videoTransceiverRef.current.sender.replaceTrack(null);

    logger.debug("📡 Creating data channel");
    const dc = pc.createDataChannel("orga-realtime-client-events");
    dataChannelRef.current = dc;
    
    dc.addEventListener("open", () => {
      logger.info("📡 Data channel opened");
    });
    
    dc.addEventListener("message", (event) => {
      try {
        const dataChannelEvent = JSON.parse(event.data as string) as DataChannelEvent;
        logger.debug("📨 Data channel message received:", dataChannelEvent.type);

        if (dataChannelEvent.type === DataChannelEventTypes.SESSION_CREATED) {
          logger.debug("🆔 Session created");
          callbacksRef.current.onSessionCreated?.(dataChannelEvent as any);
        }

        if (dataChannelEvent.type === DataChannelEventTypes.CONVERSATION_CREATED) {
          logger.debug("💬 Conversation created");
          callbacksRef.current.onConversationCreated?.(dataChannelEvent as any);
        }
        
        if (dataChannelEvent.type === DataChannelEventTypes.USER_SPEECH_TRANSCRIPTION) {
          const currentConversationId = conversationIdRef.current || conversationId.value;
          logger.debug("🎤 Processing user speech transcription");
          if (currentConversationId) {
            const conversationItem: ConversationItem = {
              conversationId: currentConversationId,
              sender: "user",
              content: {
                type: "text",
                message: dataChannelEvent.transcript || dataChannelEvent.text || dataChannelEvent.message || "",
              },
              modelVersion: modelValue,
            };
            logger.debug("💬 Creating user conversation item:", conversationItem);
            conversationItems.value = [...conversationItems.value, conversationItem];
            callbacksRef.current.onConversationMessageCreated?.(conversationItem);
          }
        }

        if (dataChannelEvent.type === DataChannelEventTypes.ASSISTANT_RESPONSE_COMPLETE) {
          const currentConversationId = conversationIdRef.current || conversationId.value;
          logger.debug("🤖 Processing assistant response");
          if (currentConversationId) {
            const conversationItem: ConversationItem = {
              conversationId: currentConversationId,
              sender: "assistant",
              content: {
                type: "text",
                message: dataChannelEvent.text || dataChannelEvent.message || "",
              },
              voiceType: voiceValue,
              modelVersion: modelValue,
              timestamp: new Date().toISOString(),
            };
            logger.debug("💬 Creating assistant conversation item:", conversationItem);
            conversationItems.value = [...conversationItems.value, conversationItem];
            callbacksRef.current.onConversationMessageCreated?.(conversationItem);
          }
        }
      } catch (error) {
        logger.error("❌ Error parsing data channel message:", error);
        callbacksRef.current.onError?.(new Error(`Failed to parse data channel message: ${error}`));
      }
    });
    
    dc.addEventListener("close", () => {
      logger.info("📡 Data channel closed");
    });

    pc.ontrack = (event) => {
      const trackEvent = event as unknown as any;
      if (trackEvent.track.kind === "audio") {
        trackEvent.track.enabled = true;
        logger.debug("🎵 Audio track received:", {
          id: trackEvent.track.id,
          enabled: trackEvent.track.enabled,
          readyState: trackEvent.track.readyState,
        });
        logger.info("🎵 AI audio track received");
      }
      aiAudioStream.value = event.streams[0] || null;
    };
    return pc;
  };

  // Helper to gather ICE candidates
  const gatherIceCandidates = (
    pc: RTCPeerConnection
  ): Promise<RTCIceCandidateInit[]> => {
    return new Promise((resolve) => {
      const candidates: RTCIceCandidateInit[] = [];
      const controller = new AbortController();

      const onIceCandidate = (event: IceCandidateEvent) => {
        if (event.candidate) {
          logger.debug("🧊 ICE candidate gathered:", event.candidate.candidate);
          candidates.push({
            candidate: event.candidate.candidate,
            sdpMid: event.candidate.sdpMid ?? undefined,
            sdpMLineIndex: event.candidate.sdpMLineIndex ?? undefined,
          });
        } else if (pc.iceGatheringState === "complete") {
          logger.info("🧊 ICE gathering complete");
          logger.debug("🧊 Total ICE candidates gathered:", candidates.length);
          controller.abort();
          pc.removeEventListener("icecandidate", onIceCandidate);
          resolve(candidates);
        }
      };
      pc.addEventListener("icecandidate", onIceCandidate);
      setTimeout(() => {
        if (!controller.signal.aborted) {
          controller.abort();
          pc.removeEventListener("icecandidate", onIceCandidate);
          resolve(candidates);
        }
      }, 5000);
    });
  };

  // Connect to backend
  const connect = async (): Promise<void> => {
    logger.info("🌐 Connecting to OrgaAI backend...");
    try {
      const config = OrgaAI.getConfig();
      const fetchFn = config.fetchSessionConfig;
      if (!fetchFn) {
        throw new Error("fetchSessionConfig is not defined");
      }
      logger.debug("🔑 Fetching ephemeral token and ICE servers");
      const { ephemeralToken, iceServers } = await fetchFn();

      const pc = await buildPeerConnection(iceServers);
      peerConnectionRef.current = pc;

      logger.debug("📝 Creating offer");
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: false,
      });
      await pc.setLocalDescription(offer);

      logger.debug("🧊 Gathering ICE candidates");
      const gathered = await gatherIceCandidates(pc);

      logger.debug("📤 Sending offer to backend");
      const response = await connectToRealtime({
        ephemeralToken,
        peerConnection: pc,
        gathered,
      });
      
      const { answer, conversation_id } = response;
      if (!answer || !conversation_id) {
        throw new Error("Failed to connect to backend");
      }
      
      logger.info("🆔 Conversation ID:", conversation_id);
      conversationId.value = conversation_id;
      conversationIdRef.current = conversation_id;

      logger.debug("📥 Setting remote description");
      await pc.setRemoteDescription(
        new RTCSessionDescription({
          sdp: answer.sdp,
          type: answer.type as RTCSdpType,
        })
      );

      connectionState.value = "connected";
      pc.addEventListener("connectionstatechange", (event) => {
        const newState = (event.target as RTCPeerConnection).connectionState;
        logger.debug("🔄 Connection state changed:", newState);
        logger.info("🔄 Connection state:", newState);
        
        connectionState.value = newState;
        
        if (newState === "connected") {
          callbacksRef.current.onSessionConnected?.();
        } else if (newState === "failed" || newState === "disconnected") {
          logger.warn("⚠️ Connection lost, cleaning up...");
          cleanup();
        }
        callbacksRef.current.onConnectionStateChange?.(newState);
      });
      
      pc.addEventListener("iceconnectionstatechange", () => {
        const iceState = pc.iceConnectionState;
        logger.debug("🧊 ICE connection state:", iceState);
        if (iceState === "failed" || iceState === "disconnected") {
          logger.warn("⚠️ ICE connection failed");
        }
      });
      
      callbacksRef.current.onSessionStart?.();
    } catch (error) {
      let errorMessage = "Failed to connect";
      if (error instanceof Error) {
        if (error.message.includes('JSON') && error.message.includes('Unexpected character')) {
          errorMessage = "Failed to connect: The server returned HTML instead of JSON. Please check your endpoint configuration.";
        } else if (error.message.includes('fetch')) {
          errorMessage = `Failed to connect: Network error - ${error.message}`;
        } else {
          errorMessage = `Failed to connect: ${error.message}`;
        }
      }
      logger.error("❌", errorMessage, error);
      connectionState.value = "failed";
      conversationId.value = null;
      callbacksRef.current.onError?.(error as Error);
      throw error;
    }
  };

  // Start session
  const startSession = async (config: SessionConfig = {}): Promise<void> => {
    logger.info("🚀 Starting OrgaAI session...");
    logger.debug("📋 Session config:", config);

    try {
      if (!OrgaAI.isInitialized()) {
        throw new ConfigurationError(
          "OrgaAI must be initialized before starting a session"
        );
      }

      if (connectionState.value !== "closed") {
        throw new SessionError("Session is already active");
      }

      const sessionCallbacks = {
        onSessionStart: config.onSessionStart || callbacksRef.current.onSessionStart,
        onSessionEnd: config.onSessionEnd || callbacksRef.current.onSessionEnd,
        onError: config.onError || callbacksRef.current.onError,
        onConnectionStateChange:
          config.onConnectionStateChange || callbacksRef.current.onConnectionStateChange,
        onSessionConnected:
          config.onSessionConnected || callbacksRef.current.onSessionConnected,
        onConversationMessageCreated:
          config.onConversationMessageCreated ||
          callbacksRef.current.onConversationMessageCreated,
        onSessionCreated: config.onSessionCreated || callbacksRef.current.onSessionCreated,
        onConversationCreated: config.onConversationCreated || callbacksRef.current.onConversationCreated,
      };

      callbacksRef.current = { ...callbacksRef.current, ...sessionCallbacks };
      
      currentConfigRef.current = config;
      connectionState.value = "connecting";

      conversationItems.value = [];
      initializeParams(config);

      await initializeMedia(config);
      await connect();
    } catch (error) {
      if (error instanceof ConfigurationError || error instanceof SessionError) {
        logger.error("❌", error.message, error);
        connectionState.value = "failed";
        callbacksRef.current.onError?.(error as Error);
        throw error;
      }

      let errorMessage = "Failed to start session";
      if (error instanceof Error) {
        if (error.message.includes('JSON') && error.message.includes('Unexpected character')) {
          errorMessage = "Failed to start session: The server returned HTML instead of JSON. Please check your endpoint configuration.";
        } else if (error.message.includes('fetch')) {
          errorMessage = `Failed to start session: Network error - ${error.message}`;
        } else {
          errorMessage = `Failed to start session: ${error.message}`;
        }
      }
      logger.error("❌", errorMessage, error);
      connectionState.value = "failed";
      callbacksRef.current.onError?.(error as Error);
      throw new ConnectionError("Failed to start session");
    }
  };

  // End session
  const endSession = async (): Promise<void> => {
    logger.info("🔚 Ending session");

    try {
      if (userVideoStream.value) {
        logger.debug("🛑 Stopping video stream tracks");
        userVideoStream.value.getTracks().forEach((track) => {
          track.stop();
        });
        userVideoStream.value = null;
      }

      if (userAudioStream.value) {
        logger.debug("🛑 Stopping audio stream tracks");
        userAudioStream.value.getTracks().forEach((track) => {
          track.stop();
        });
        userAudioStream.value = null;
      }

      try {
        logger.debug("🛑 Cleaning up any additional active streams");
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const activeStreams = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
          });
          activeStreams.getTracks().forEach((track) => {
            track.stop();
          });
        }
      } catch (e) {
        logger.debug("✅ No additional streams to clean up");
      }

      await cleanup();
      connectionState.value = "closed";
      callbacksRef.current.onSessionEnd?.();
    } catch (error) {
      logger.error("❌ Error ending session:", error);
      callbacksRef.current.onError?.(error as Error);
    }
  };

  // Mic Controls
  const enableMic = async () => {
    logger.info("🎤 Enabling microphone");
    logger.debug("🔄 Requesting microphone permissions");
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('getUserMedia is not supported in this environment. Please ensure you are using HTTPS and a modern browser.');
    }
    
    if (userAudioStream.value) {
      logger.debug("🛑 Stopping previous audio stream");
      userAudioStream.value.getTracks().forEach((track) => {
        track.stop();
      });
      userAudioStream.value = null;
    }
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
    logger.debug("✅ Microphone stream obtained:", stream.getTracks().map(t => ({ id: t.id, kind: t.kind })));
    userAudioStream.value = stream;
    isMicOn.value = true;
    
    modalities.value = modalities.value.includes("audio") 
      ? modalities.value 
      : [...modalities.value, "audio" as Modality];
    
    if (connectionState.value === "connected") {
      sendUpdatedParams();
    }
    
    if (audioTransceiverRef.current) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        logger.debug("🔄 Replacing audio sender track:", audioTrack.id);
        await audioTransceiverRef.current.sender.replaceTrack(audioTrack);
        audioTrack.enabled = true;
      }
    }
    logger.info("✅ Microphone enabled");
  };

  const disableMic = async (hardDisable = false) => {
    logger.info("🎤 Disabling microphone");
    logger.debug("🔄 Disabling mic with hardDisable:", hardDisable);
    if (userAudioStream.value) {
      if (hardDisable) {
        logger.debug("🛑 Hard disabling - stopping audio tracks");
        userAudioStream.value.getTracks().forEach((track) => {
          track.stop();
        });
        userAudioStream.value = null;
        if (audioTransceiverRef.current) {
          logger.debug("🔄 Replacing audio sender with null track");
          await audioTransceiverRef.current.sender.replaceTrack(null);
        }
      } else {
        logger.debug("🔄 Soft disabling - disabling audio tracks");
        userAudioStream.value.getAudioTracks().forEach((track) => (track.enabled = false));
      }
    }
    isMicOn.value = false;
    
    modalities.value = modalities.value.filter(modality => modality !== "audio");
    
    if (connectionState.value === "connected") {
      sendUpdatedParams();
    }
    
    logger.info("✅ Microphone disabled");
  };

  const toggleMic = async () => {
    logger.debug("🔄 Toggling microphone, current state:", isMicOn.value);
    if (isMicOn.value) {
      await disableMic(true);
    } else {
      await enableMic();
    }
  };

  // Camera Controls
  const enableCamera = async () => {
    logger.info("📹 Enabling camera");
    logger.debug("🔄 Requesting camera permissions");
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('getUserMedia is not supported in this environment. Please ensure you are using HTTPS and a modern browser.');
    }
    
    if (userVideoStream.value) {
      logger.debug("🛑 Stopping previous video stream");
      userVideoStream.value.getTracks().forEach((track) => {
        track.stop();
      });
      userVideoStream.value = null;
    }
    const sessionConfig = currentConfigRef.current;
    const globalConfig = OrgaAI.getConfig();
    const config = {
      ...globalConfig,
      ...sessionConfig,
    };

    const constraints = getMediaConstraints(config);
    logger.debug("📹 Camera constraints:", constraints);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      logger.debug("✅ Camera stream obtained:", stream.getTracks().map(t => ({ id: t.id, kind: t.kind })));
      userVideoStream.value = stream;
      isCameraOn.value = true;
      
      modalities.value = modalities.value.includes("video") 
        ? modalities.value 
        : [...modalities.value, "video" as Modality];
      
      if (connectionState.value === "connected") {
        sendUpdatedParams();
      }
      
      if (videoTransceiverRef.current) {
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          logger.debug("🔄 Replacing video sender track:", videoTrack.id);
          await videoTransceiverRef.current.sender.replaceTrack(videoTrack);
          videoTrack.enabled = true;
        }
      }
      logger.info("✅ Camera enabled");
    } catch (error) {
      logger.error("❌ Failed to enable camera:", error);
      throw error;
    }
  };

  const disableCamera = async (hardDisable = false) => {
    logger.info("📹 Disabling camera");
    logger.debug("🔄 Disabling camera with hardDisable:", hardDisable);
    if (userVideoStream.value) {
      if (hardDisable) {
        logger.debug("🛑 Hard disabling - stopping video tracks");
        userVideoStream.value.getTracks().forEach((track) => {
          track.stop();
        });
        userVideoStream.value = null;
        if (videoTransceiverRef.current) {
          logger.debug("🔄 Replacing video sender with null track");
          await videoTransceiverRef.current.sender.replaceTrack(null);
        }
      } else {
        logger.debug("🔄 Soft disabling - disabling video tracks");
        userVideoStream.value.getVideoTracks().forEach((track) => (track.enabled = false));
      }
    }
    isCameraOn.value = false;
    
    modalities.value = modalities.value.filter(modality => modality !== "video");
    
    if (connectionState.value === "connected") {
      sendUpdatedParams();
    }
    
    logger.info("✅ Camera disabled");
  };

  const toggleCamera = async () => {
    logger.debug("🔄 Toggling camera, current state:", isCameraOn.value);
    if (isCameraOn.value) {
      await disableCamera(true);
    } else {
      await enableCamera();
    }
  };

  // Cleanup on unmount
  onUnmounted(() => {
    logger.debug("🔄 Component unmounting, calling cleanup");
    cleanup();
  });

  return {
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

    // Parameter management
    model,
    voice,
    temperature,
    instructions,
    modalities,
    updateParams,
  };
}