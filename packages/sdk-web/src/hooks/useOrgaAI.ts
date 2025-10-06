import { useState, useEffect, useCallback, useRef } from "react";
import {
  OrgaAIHookReturn,
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
import { ConnectionError, SessionError, ConfigurationError } from "../errors";
import { OrgaAI } from "../core/OrgaAI";
import {
  getMediaConstraints,
  logger,
  connectToRealtime,
} from "../utils";

export function useOrgaAI(
  callbacks: OrgaAIHookCallbacks = {}
): OrgaAIHookReturn {
  const [userVideoStream, setUserVideoStream] = useState<MediaStream | null>(null);
  const [userAudioStream, setUserAudioStream] = useState<MediaStream | null>(null);
  const [aiAudioStream, setAiAudioStream] = useState<MediaStream | null>(null); //Contains orgas response audio
  const [conversationItems, setConversationItems] = useState<ConversationItem[]>([]);
  const [connectionState, setConnectionState] = useState<ConnectionState>("closed");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const conversationIdRef = useRef<string | null>(null);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const currentConfigRef = useRef<SessionConfig>({});

  const audioTransceiverRef = useRef<any>(null);
  const videoTransceiverRef = useRef<any>(null);

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);

  const [model, setModel] = useState<OrgaAIModel | null>(null);
  const [voice, setVoice] = useState<OrgaAIVoice | null>(null);
  const [temperature, setTemperature] = useState<number | null>(null);
  const [instructions, setInstructions] = useState<string | null>(null);
  const [modalities, setModalities] = useState<Modality[]>([]);

  // Use a ref to store current callbacks so they can be updated
  const callbacksRef = useRef(callbacks);

  // Function to send updated parameters to the session
  const sendUpdatedParams = useCallback(() => {
    const dataChannel = dataChannelRef.current;
    if (!dataChannel || dataChannel.readyState !== "open") {
      logger.warn("⚠️ Cannot send updated params: data channel not open");
      return;
    }

    const payload = {
      event: DataChannelEventTypes.SESSION_UPDATE,
      data: {
        ...(model && { model: model }),
        ...(voice && { voice: voice }),
        ...(temperature !== null && { temperature: temperature }),
        ...(instructions && { instructions: instructions }),
        modalities: modalities,
      },
    };

    logger.debug("📤 Sending updated parameters via data channel:", payload);
    logger.info("⚙️ Sending updated parameters:", { model, voice, temperature });
    dataChannel.send(JSON.stringify(payload));
  }, [
    model,
    voice,
    temperature,
    instructions,
    modalities,
  ]);

  // Parameter update function
  const updateParams = useCallback(
    (params: {
      model?: OrgaAIModel;
      voice?: OrgaAIVoice;
      temperature?: number;
      instructions?: string;
      modalities?: Modality[];
    }) => {
      logger.debug("🔄 Updating parameters:", params);
      if (params.model !== undefined) setModel(params.model);
      if (params.voice !== undefined) setVoice(params.voice);
      if (params.temperature !== undefined) setTemperature(params.temperature);
      if (params.instructions !== undefined) setInstructions(params.instructions);
      if (params.modalities !== undefined) {
        setModalities(params.modalities);
      }

      if (connectionState === "connected") {
        sendUpdatedParams();
      }
    },
    [connectionState, sendUpdatedParams]
  );

  // Initialize parameters from config when session starts
  const initializeParams = useCallback((config: SessionConfig) => {
    logger.debug("🔧 Initializing parameters from config:", config);
    const orgaConfig = OrgaAI.getConfig();

    const model = config.model || orgaConfig.model;
    const voice = config.voice || orgaConfig.voice;
    const temperature = config.temperature || orgaConfig.temperature;
    const instructions = config.instructions || orgaConfig.instructions;
    const modalities = config.modalities || orgaConfig.modalities || [];

    setModel(model || null);
    setVoice(voice || null);
    setTemperature(temperature || null);
    setInstructions(instructions || null);
    setModalities(modalities);
  }, []);

  // Cleanup function
  const cleanup = useCallback(async (): Promise<void> => {
    logger.info("🧹 Cleaning up resources");
    logger.debug("🔄 Stopping all media tracks and closing connections");
    // Best-effort cleanup: never bail early; log errors and continue
    try {
      [userVideoStream, userAudioStream, aiAudioStream].forEach((stream) => {
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
    setConversationId(null);
    setAiAudioStream(null);
    setConnectionState("closed");
    setIsCameraOn(false);
    setIsMicOn(false);
    setUserVideoStream(null);
    setUserAudioStream(null);
  }, []);

  // Initialize media
  const initializeMedia = useCallback(
    async (config: Partial<SessionConfig> = {}): Promise<MediaStream> => {
      logger.debug("🎬 Initializing media with config:", config);
      return new MediaStream();
    },
    []
  );

  // Build peer connection
  const buildPeerConnection = useCallback(
    async (iceServers: RTCIceServer[]): Promise<RTCPeerConnection> => {
      logger.debug("🔧 Building peer connection with ICE servers:", iceServers);
      const { voice, model } = OrgaAI.getConfig();
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
            const currentConversationId = conversationIdRef.current || conversationId;
            logger.debug("🎤 Processing user speech transcription");
            if (currentConversationId) {
              const conversationItem: ConversationItem = {
                conversationId: currentConversationId,
                sender: "user",
                content: {
                  type: "text",
                  message: dataChannelEvent.transcript || dataChannelEvent.text || dataChannelEvent.message || "",
                },
                modelVersion: model,
              };
              logger.debug("💬 Creating user conversation item:", conversationItem);
              setConversationItems((prev) => [...prev, conversationItem]);
              callbacksRef.current.onConversationMessageCreated?.(conversationItem);
            }
          }

          if (dataChannelEvent.type === DataChannelEventTypes.ASSISTANT_RESPONSE_COMPLETE) {
            const currentConversationId = conversationIdRef.current || conversationId;
            logger.debug("🤖 Processing assistant response");
            if (currentConversationId) {
              const conversationItem: ConversationItem = {
                conversationId: currentConversationId,
                sender: "assistant",
                content: {
                  type: "text",
                  message: dataChannelEvent.text || dataChannelEvent.message || "",
                },
                voiceType: voice,
                modelVersion: model,
                timestamp: new Date().toISOString(),
              };
              logger.debug("💬 Creating assistant conversation item:", conversationItem);
              setConversationItems((prev) => [...prev, conversationItem]);
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
        setAiAudioStream(event.streams[0]);
      };
      return pc;
    },
    []
  );

  // Helper to gather ICE candidates
  const gatherIceCandidates = (
    pc: RTCPeerConnection
  ): Promise<RTCIceCandidateInit[]> => {
    return new Promise((resolve) => {
      const candidates: RTCIceCandidateInit[] = [];
      const controller = new AbortController(); //TODO: check if this is needed

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
          controller.abort(); //TODO: check if this is needed
          pc.removeEventListener("icecandidate", onIceCandidate);
          resolve(candidates);
        }
      };
      pc.addEventListener("icecandidate", onIceCandidate);
      setTimeout(() => {
        if (!controller.signal.aborted) { //TODO: check if this is needed
          controller.abort();
          pc.removeEventListener("icecandidate", onIceCandidate);
          resolve(candidates);
        }
      }, 5000);
    });
  };

  // Connect to backend
  const connect = useCallback(async (): Promise<void> => {
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
      setConversationId(conversation_id);
      conversationIdRef.current = conversation_id;

      logger.debug("📥 Setting remote description");
      await pc.setRemoteDescription(
        new RTCSessionDescription({
          sdp: answer.sdp,
          type: answer.type as RTCSdpType,
        })
      );

      setConnectionState("connected");
      pc.addEventListener("connectionstatechange", (event) => {
        const newState = (event.target as RTCPeerConnection).connectionState;
        logger.debug("🔄 Connection state changed:", newState);
        logger.info("🔄 Connection state:", newState);
        
        setConnectionState(newState);
        
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
      // Improve error message for better debugging
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
      setConnectionState("failed");
      setConversationId(null);
      callbacksRef.current.onError?.(error as Error);
      throw error;
    }
  }, [buildPeerConnection]);

  // Start session
  const startSession = useCallback(
    async (config: SessionConfig = {}): Promise<void> => {
      logger.info("🚀 Starting OrgaAI session...");
      logger.debug("📋 Session config:", config);

      try {
        if (!OrgaAI.isInitialized()) {
          throw new ConfigurationError(
            "OrgaAI must be initialized before starting a session"
          );
        }

        if (connectionState !== "closed") {
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

        // Update the callbacks ref with session-specific callbacks
        callbacksRef.current = { ...callbacksRef.current, ...sessionCallbacks };
        

        currentConfigRef.current = config;
        setConnectionState("connecting");

        setConversationItems([]);
        initializeParams(config);

        await initializeMedia(config);
        await connect();
      } catch (error) {
        // Re-throw specific error types as-is
        if (error instanceof ConfigurationError || error instanceof SessionError) {
          logger.error("❌", error.message, error);
          setConnectionState("failed");
          callbacksRef.current.onError?.(error as Error);
          throw error;
        }

        // Improve error message for better debugging
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
        setConnectionState("failed");
        callbacksRef.current.onError?.(error as Error);
        throw new ConnectionError("Failed to start session");
      }
    },
    [
      connectionState,
      initializeMedia,
      connect,
    ]
  );

  // End session
  const endSession = useCallback(async (): Promise<void> => {
    logger.info("🔚 Ending session");

    try {
      if (userVideoStream) {
        logger.debug("🛑 Stopping video stream tracks");
        userVideoStream.getTracks().forEach((track) => {
          track.stop();
        });
        setUserVideoStream(null);
      }

      if (userAudioStream) {
        logger.debug("🛑 Stopping audio stream tracks");
        userAudioStream.getTracks().forEach((track) => {
          track.stop();
        });
        setUserAudioStream(null);
      }

      try {
        logger.debug("🛑 Cleaning up any additional active streams");
        const activeStreams = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        activeStreams.getTracks().forEach((track) => {
          track.stop();
        });
      } catch (e) {
        logger.debug("✅ No additional streams to clean up");
      }

      await cleanup();
      setConnectionState("closed");
      callbacksRef.current.onSessionEnd?.();
    } catch (error) {
      logger.error("❌ Error ending session:", error);
      callbacksRef.current.onError?.(error as Error);
    }
  }, [userVideoStream, userAudioStream, cleanup]);

  // Mic Controls
  const enableMic = useCallback(async () => {
    logger.info("🎤 Enabling microphone");
    logger.debug("🔄 Requesting microphone permissions");
    if (userAudioStream) {
      logger.debug("🛑 Stopping previous audio stream");
      userAudioStream.getTracks().forEach((track) => {
        track.stop();
      });
      setUserAudioStream(null);
    }
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
    logger.debug("✅ Microphone stream obtained:", stream.getTracks().map(t => ({ id: t.id, kind: t.kind })));
    setUserAudioStream(stream);
    setIsMicOn(true);
    
    setModalities(prev => {
      const newModalities = prev.includes("audio") ? prev : [...prev, "audio" as Modality];
      logger.debug("🎤 Updated modalities for mic enable:", newModalities);
      return newModalities;
    });
    
    if (connectionState === "connected") {
      sendUpdatedParams();
    }
    
    if (audioTransceiverRef.current) {
      const audioTrack = stream.getAudioTracks()[0];
      logger.debug("🔄 Replacing audio sender track:", audioTrack.id);
      await audioTransceiverRef.current.sender.replaceTrack(audioTrack);
      audioTrack.enabled = true;
    }
    logger.info("✅ Microphone enabled");
  }, [userAudioStream, connectionState, sendUpdatedParams]);

  const disableMic = useCallback(
    async (hardDisable = false) => {
      logger.info("🎤 Disabling microphone");
      logger.debug("🔄 Disabling mic with hardDisable:", hardDisable);
      if (userAudioStream) {
        if (hardDisable) {
          logger.debug("🛑 Hard disabling - stopping audio tracks");
          userAudioStream.getTracks().forEach((track) => {
            track.stop();
          });
          setUserAudioStream(null);
          if (audioTransceiverRef.current) {
            logger.debug("🔄 Replacing audio sender with null track");
            await audioTransceiverRef.current.sender.replaceTrack(null);
          }
        } else {
          logger.debug("🔄 Soft disabling - disabling audio tracks");
          userAudioStream.getAudioTracks().forEach((track) => (track.enabled = false));
        }
      }
      setIsMicOn(false);
      
      setModalities(prev => {
        const newModalities = prev.filter(modality => modality !== "audio");
        logger.debug("🎤 Updated modalities for mic disable:", newModalities);
        return newModalities;
      });
      
      if (connectionState === "connected") {
        sendUpdatedParams();
      }
      
      logger.info("✅ Microphone disabled");
    },
    [userAudioStream, connectionState, sendUpdatedParams]
  );

  const toggleMic = useCallback(async () => {
    logger.debug("🔄 Toggling microphone, current state:", isMicOn);
    if (isMicOn) {
      await disableMic(true);
    } else {
      await enableMic();
    }
  }, [isMicOn, enableMic, disableMic]);

  // Camera Controls
  const enableCamera = useCallback(async () => {
    logger.info("📹 Enabling camera");
    logger.debug("🔄 Requesting camera permissions");
    if (userVideoStream) {
      logger.debug("🛑 Stopping previous video stream");
      userVideoStream.getTracks().forEach((track) => {
        track.stop();
      });
      setUserVideoStream(null);
    }
    const sessionConfig = currentConfigRef.current;
    const globalConfig = OrgaAI.getConfig();
    const config = {
      ...globalConfig,
      ...sessionConfig, //Override global config with session config
    };
    // TODO: Add a method to update video quality realtime?

    const constraints = getMediaConstraints(config);
    logger.debug("📹 Camera constraints:", constraints);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      logger.debug("✅ Camera stream obtained:", stream.getTracks().map(t => ({ id: t.id, kind: t.kind })));
      setUserVideoStream(stream);
      setIsCameraOn(true);
      
      setModalities(prev => {
        const newModalities = prev.includes("video") ? prev : [...prev, "video" as Modality];
        logger.debug("📹 Updated modalities for camera enable:", newModalities);
        return newModalities;
      });
      
      if (connectionState === "connected") {
        sendUpdatedParams();
      }
      
      if (videoTransceiverRef.current) {
        const videoTrack = stream.getVideoTracks()[0];
        logger.debug("🔄 Replacing video sender track:", videoTrack.id);
        await videoTransceiverRef.current.sender.replaceTrack(videoTrack);
        videoTrack.enabled = true;
      }
      logger.info("✅ Camera enabled");
    } catch (error) {
      logger.error("❌ Failed to enable camera:", error);
      throw error;
    }
  }, [userVideoStream, connectionState, sendUpdatedParams]);

  const disableCamera = useCallback(
    async (hardDisable = false) => {
      logger.info("📹 Disabling camera");
      logger.debug("🔄 Disabling camera with hardDisable:", hardDisable);
      if (userVideoStream) {
        if (hardDisable) {
          logger.debug("🛑 Hard disabling - stopping video tracks");
          userVideoStream.getTracks().forEach((track) => {
            track.stop();
          });
          setUserVideoStream(null);
          if (videoTransceiverRef.current) {
            logger.debug("🔄 Replacing video sender with null track");
            await videoTransceiverRef.current.sender.replaceTrack(null);
          }
        } else {
          logger.debug("🔄 Soft disabling - disabling video tracks");
          userVideoStream.getVideoTracks().forEach((track) => (track.enabled = false));
        }
      }
      setIsCameraOn(false);
      
      setModalities(prev => {
        const newModalities = prev.filter(modality => modality !== "video");
        logger.debug("📹 Updated modalities for camera disable:", newModalities);
        return newModalities;
      });
      
      if (connectionState === "connected") {
        sendUpdatedParams();
      }
      
      logger.info("✅ Camera disabled");
    },
    [userVideoStream, connectionState, sendUpdatedParams]
  );

  const toggleCamera = useCallback(async () => {
    logger.debug("🔄 Toggling camera, current state:", isCameraOn);
    if (isCameraOn) {
      await disableCamera(true);
    } else {
      await enableCamera();
    }
  }, [isCameraOn, enableCamera, disableCamera]);

  // Cleanup on unmount
  useEffect(() => {
    logger.debug("🔄 Component unmounting, calling cleanup");
    return () => {
      cleanup();
    };
  }, [cleanup]);

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
