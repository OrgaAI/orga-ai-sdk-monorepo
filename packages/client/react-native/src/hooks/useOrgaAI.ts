import { useState, useEffect, useCallback, useRef } from "react";
import {
  RTCPeerConnection,
  RTCSessionDescription,
  mediaDevices,
  MediaStream,
} from "react-native-webrtc";
import RTCDataChannel from "react-native-webrtc/lib/typescript/RTCDataChannel";
import InCallManager from "react-native-incall-manager";
import {
  OrgaAIHookReturn,
  OrgaAIHookCallbacks,
  SessionConfig,
  ConnectionState,
  CameraPosition,
  IceCandidateEvent,
  DataChannelEvent,
  ConversationItem,
  OrgaAIModel,
  OrgaAIVoice,
  Modality,
  DataChannelEventTypes,
} from "../types/index";
import {
  PermissionError,
  ConnectionError,
  SessionError,
  ConfigurationError,
  OrgaAI,
  getMediaConstraints,
  logger,
  connectToRealtime,
  RTCIceServer,
  stripEmotionTags
} from "@orga-ai/core";

interface RTCIceCandidateInit {
  candidate?: string;
  sdpMLineIndex?: number | null;
  sdpMid?: string | null;
}

// Rename the original hook for internal use
export function useOrgaAI(
  callbacks: OrgaAIHookCallbacks = {}
): OrgaAIHookReturn {
  const [userVideoStream, setUserVideoStream] = useState<MediaStream | null>(
    null
  );
  const [userAudioStream, setUserAudioStream] = useState<MediaStream | null>(
    null
  );
  const [aiAudioStream, setAiAudioStream] = useState<MediaStream | null>(null);
  const [conversationItems, setConversationItems] = useState<
    ConversationItem[]
  >([]);
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("closed");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const conversationIdRef = useRef<string | null>(null);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const currentConfigRef = useRef<SessionConfig>({});

  const audioTransceiverRef = useRef<any>(null);
  const videoTransceiverRef = useRef<any>(null);

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [cameraPosition, setCameraPosition] = useState<CameraPosition>("front");

  const [model, setModel] = useState<OrgaAIModel | null>(null);
  const [voice, setVoice] = useState<OrgaAIVoice | null>(null);
  const [temperature, setTemperature] = useState<number | null>(null);
  const [instructions, setInstructions] = useState<string | null>(null);
  const [modalities, setModalities] = useState<Modality[]>([]);

  // Use a ref to store current callbacks so they can be updated
  const callbacksRef = useRef(callbacks);

  // Function to send updated parameters to the session.
  // Accepts an optional merged payload so we send the new values immediately
  // (avoids stale closure when called from updateParams right after setState).
  const sendUpdatedParams = useCallback(
    (merged?: {
      model?: OrgaAIModel | null;
      voice?: OrgaAIVoice | null;
      temperature?: number | null;
      instructions?: string | null;
      modalities?: Modality[];
    }) => {
      const dataChannel = dataChannelRef.current;
      if (!dataChannel || dataChannel.readyState !== "open") {
        logger.warn("Cannot send updated params: data channel not open");
        return;
      }

      const m = merged ?? {
        model,
        voice,
        temperature,
        instructions,
        modalities,
      };
      const payload = {
        event: DataChannelEventTypes.SESSION_UPDATE,
        data: {
          ...(m.model && { model: m.model }),
          ...(m.voice && { voice: m.voice }),
          ...(m.temperature !== null && m.temperature !== undefined && { temperature: m.temperature }),
          ...(m.instructions && { instructions: m.instructions }),
          modalities: m.modalities ?? modalities,
        },
      };

      logger.debug("📤 Sending updated parameters via data channel:", payload);
      logger.info("⚙️ Sending updated parameters:", {
        model: m.model,
        voice: m.voice,
        temperature: m.temperature,
      });
      dataChannel.send(JSON.stringify(payload));
    },
    [model, voice, temperature, instructions, modalities]
  );

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
      if (params.instructions !== undefined)
        setInstructions(params.instructions);
      if (params.modalities !== undefined) {
        setModalities(params.modalities);
      }

      if (connectionState === "connected") {
        // Pass merged params so we send the new values immediately (state not flushed yet)
        sendUpdatedParams({
          model: params.model !== undefined ? params.model : model,
          voice: params.voice !== undefined ? params.voice : voice,
          temperature: params.temperature !== undefined ? params.temperature : temperature,
          instructions: params.instructions !== undefined ? params.instructions : instructions,
          modalities: params.modalities !== undefined ? params.modalities : modalities,
        });
      }
    },
    [connectionState, sendUpdatedParams, model, voice, temperature, instructions, modalities]
  );

  // Initialize parameters from config when session starts
  const initializeParams = useCallback((config: SessionConfig) => {
    logger.debug("🔧 Initializing parameters from config:", config);
    const orgaConfig = OrgaAI.getConfig();

    // Type-safe parameter initialization
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
    try {
      [userVideoStream, userAudioStream, aiAudioStream].forEach((stream) => {
        if (stream) {
          stream.getTracks().forEach((track) => {
            logger.debug(`🛑 Stopping track: ${track.kind} (${track.id})`);
            track.stop();
            track.enabled = false;
          });
        }
      });

      setUserVideoStream(null);
      setUserAudioStream(null);

      if (audioTransceiverRef.current) {
        logger.debug("🔄 Detaching audio transceiver");
        await audioTransceiverRef.current.sender.replaceTrack(null);
      }
      if (videoTransceiverRef.current) {
        logger.debug("🔄 Detaching video transceiver");
        await videoTransceiverRef.current.sender.replaceTrack(null);
      }

      if (peerConnectionRef.current) {
        logger.debug("🔄 Closing peer connection");
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }

      if (dataChannelRef.current) {
        logger.debug("🔄 Closing data channel");
        dataChannelRef.current.close();
        dataChannelRef.current = null;
      }
      setConversationId(null);
      // setRemoteStream(null);
      setConnectionState("closed");
      setIsCameraOn(false);
      setIsMicOn(false);
      setCameraPosition("front");
      // setVideoStream(null);
      // setAudioStream(null);
      InCallManager.stop();
    } catch (error) {
      logger.error("❌ Error during cleanup:", error);
    }
  }, []);

  // Check permissions
  // const hasPermissions = useCallback(async (): Promise<boolean> => {
  //   if (Platform.OS === "android") {
  //     const cameraPermission = await PermissionsAndroid.check(
  //       PermissionsAndroid.PERMISSIONS.CAMERA
  //     );
  //     const microphonePermission = await PermissionsAndroid.check(
  //       PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
  //     );
  //     return cameraPermission && microphonePermission;
  //   }
  //   return true; // iOS permissions are handled by getUserMedia
  // }, []);

  // // Request permissions
  // const requestPermissions = useCallback(async (): Promise<void> => {
  //   logger.debug("Requesting permissions");

  //   if (Platform.OS === "android") {
  //     const grants = await PermissionsAndroid.requestMultiple([
  //       PermissionsAndroid.PERMISSIONS.CAMERA,
  //       PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
  //     ]);

  //     const cameraGranted =
  //       grants[PermissionsAndroid.PERMISSIONS.CAMERA] === "granted";
  //     const microphoneGranted =
  //       grants[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] === "granted";

  //     if (!cameraGranted || !microphoneGranted) {
  //       throw new PermissionError(
  //         "Camera and microphone permissions are required"
  //       );
  //     }
  //   }
  // }, []);

  // Initialize media
  const initializeMedia = useCallback(
    async (config: Partial<SessionConfig> = {}): Promise<MediaStream> => {
      logger.debug("🎬 Initializing media with config:", config);
      try {
        const constraints = getMediaConstraints(config);
        const stream = await mediaDevices.getUserMedia(constraints);
        logger.info("🎬 Media initialized successfully");
        return stream;
      } catch (error) {
        logger.error("Failed to initialize media:", error);
        throw new PermissionError("Failed to access camera and microphone");
      }
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
      // Start with sendrecv for immediate audio capture
      audioTransceiverRef.current = pc.addTransceiver("audio", {
        direction: "sendrecv",
      });
      logger.debug("🎤 Audio transceiver:", audioTransceiverRef.current.direction);
      logger.debug("📹 Adding video transceiver");
      videoTransceiverRef.current = pc.addTransceiver("video", {
        direction: "sendonly",
      });

      // Initialize audio stream for immediate capture
      const audioStream = await mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      const audioTrack = audioStream.getAudioTracks()[0];
      await audioTransceiverRef.current.sender.replaceTrack(audioTrack);
      audioTrack.enabled = true;
      setUserAudioStream(audioStream);
      setIsMicOn(true);
      setModalities(prev => {
        // Ensure we don't add duplicate audio modality
        const newModalities = Array.from(new Set([...prev, "audio" as Modality]));
        logger.debug("🎤 Updated modalities for mic enable:", newModalities);
        return newModalities;
      });

      // Video track starts null - will be enabled on user action
      await videoTransceiverRef.current.sender.replaceTrack(null);
      logger.debug("📡 Creating data channel");
      const dc = pc.createDataChannel("orga-realtime-client-events");
      dataChannelRef.current = dc;

      dc.addEventListener("open", () => {
        logger.info("📡 Data channel opened");
        // Send initial SESSION_UPDATE so the backend knows we have audio modality
        // from the start (mic is on). Without this, the backend may not process
        // audio until the user toggles mic (which sends SESSION_UPDATE).
        const channel = dataChannelRef.current;
        if (channel && channel.readyState === "open") {
          const globalConfig = OrgaAI.getConfig();
          const sessionConfig = currentConfigRef.current;
          const model = sessionConfig.model ?? globalConfig.model;
          const voice = sessionConfig.voice ?? globalConfig.voice;
          const temperature =
            sessionConfig.temperature ?? globalConfig.temperature ?? null;
          const instructions =
            sessionConfig.instructions ?? globalConfig.instructions ?? null;
          const baseModalities =
            sessionConfig.modalities ?? globalConfig.modalities ?? [];
          const initialModalities = Array.from(
            new Set([...baseModalities, "audio" as Modality])
          );
          const payload = {
            event: DataChannelEventTypes.SESSION_UPDATE,
            data: {
              ...(model && { model }),
              ...(voice && { voice }),
              ...(temperature !== null && temperature !== undefined && { temperature }),
              ...(instructions && { instructions }),
              modalities: initialModalities,
            },
          };
          logger.debug(
            "📤 Sending initial session params (audio on):",
            payload
          );
          channel.send(JSON.stringify(payload));
        }
      });

      dc.addEventListener("message", (event) => {
        try {
          const dataChannelEvent = JSON.parse(
            event.data as string
          ) as DataChannelEvent;
          logger.debug(
            "📨 Data channel message received:",
            dataChannelEvent.type
          );

          if (
            dataChannelEvent.type ===
            DataChannelEventTypes.USER_SPEECH_TRANSCRIPTION
          ) {
            const currentConversationId =
              conversationIdRef.current || conversationId;
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
              logger.debug(
                "💬 Creating user conversation item:",
                conversationItem
              );
              setConversationItems((prev) => [...prev, conversationItem]);
              callbacksRef.current.onConversationMessageCreated?.(conversationItem);
            }
          }

          if (
            dataChannelEvent.type ===
            DataChannelEventTypes.ASSISTANT_RESPONSE_COMPLETE
          ) {
            const currentConversationId =
              conversationIdRef.current || conversationId;
            logger.debug("🤖 Processing assistant response");
            if (currentConversationId) {
              const rawMessage = dataChannelEvent.text || dataChannelEvent.message || "";
              const cleanedMessage = stripEmotionTags(rawMessage);
              const conversationItem: ConversationItem = {
                conversationId: currentConversationId,
                sender: "assistant",
                content: {
                  type: "text",
                  message: cleanedMessage,
                },
                voiceType: voice,
                modelVersion: model,
                timestamp: new Date().toISOString(),
              };
              logger.debug(
                "💬 Creating assistant conversation item:",
                conversationItem
              );
              setConversationItems((prev) => [...prev, conversationItem]);
              callbacksRef.current.onConversationMessageCreated?.(conversationItem);
            }
          }

          if (dataChannelEvent.type === DataChannelEventTypes.SESSION_CREATED) {
            logger.debug("🆔 Session created");
            callbacksRef.current.onSessionCreated?.(dataChannelEvent as any);
          }

          if (dataChannelEvent.type === DataChannelEventTypes.CONVERSATION_CREATED) {
            logger.debug("💬 Conversation created");
            callbacksRef.current.onConversationCreated?.(dataChannelEvent as any);
          }
        } catch (error) {
          logger.error("❌ Error parsing data channel message:", error);
          callbacksRef.current.onError?.(
            new Error(`Failed to parse data channel message: ${error}`)
          );
        }
      });

      dc.addEventListener("close", () => {
        logger.info("📡 Data channel closed");
      });

      pc.addEventListener("track", (event) => {
        const trackEvent = event as unknown as any;
        if (trackEvent.track.kind === "audio") {
          trackEvent.track.enabled = true;
          logger.debug("🎵 Audio track received:", {
            id: trackEvent.track.id,
            enabled: trackEvent.track.enabled,
            muted: trackEvent.track.muted,
            readyState: trackEvent.track.readyState,
          });
          logger.info("🎵 AI audio track received");
          trackEvent.track.addEventListener("unmute", () => {
            logger.debug("🎵 Audio track unmuted");
          });
          trackEvent.track.addEventListener("mute", () => {
            logger.debug("🔇 Audio track muted");
          });
          trackEvent.track.addEventListener("ended", () => {
            logger.debug("🔇 Audio track ended");
          });
          setAiAudioStream(event.streams[0]); // TODO: Review if needed with RN
        }
      });
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
          pc.removeEventListener("icecandidate", onIceCandidate);
          resolve(candidates);
        }
      };
      pc.addEventListener("icecandidate", onIceCandidate);
      setTimeout(() => {
        pc.removeEventListener("icecandidate", onIceCandidate);
        resolve(candidates);
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
      // Create adapter for core package compatibility
      const peerConnectionAdapter = {
        localDescription: pc.localDescription ? {
          sdp: pc.localDescription.sdp || undefined,
          type: pc.localDescription.type || undefined,
        } : null,
      };
      const { answer, conversation_id } = await connectToRealtime({
        ephemeralToken,
        peerConnection: peerConnectionAdapter,
        gathered,
      });
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
          type: answer.type,
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
      InCallManager.start({ media: "video" });
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
      
      // Perform full cleanup to reset state back to "closed"
      // This ensures the user can retry connection without reloading
      await cleanup();
      
      callbacksRef.current.onError?.(error as Error);
      throw error;
    }
  }, [buildPeerConnection, cleanup]);

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

        // Extract callbacks from config and merge with existing callbacks
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

        // await requestPermissions(); //TODO: Add permissions check
        // Removed initializeMedia call - media streams will be created when user enables camera/mic
        await connect();
      } catch (error) {
        // Re-throw specific error types as-is
        if (error instanceof ConfigurationError || error instanceof SessionError) {
          logger.error("❌", error.message, error);
          // Perform full cleanup to reset state back to "closed"
          await cleanup();
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
        
        // Perform full cleanup to reset state back to "closed"
        // This ensures the user can retry connection without reloading
        await cleanup();
        
        callbacksRef.current.onError?.(error as Error);
        throw new ConnectionError("Failed to start session");
      }
    },
    [
      connectionState,
      connect,
      initializeParams,
      cleanup,
      // requestPermissions,
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
    
    const stream = await mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
    logger.debug(
      "✅ Microphone stream obtained:",
      stream.getTracks().map((t) => ({ id: t.id, kind: t.kind }))
    );
    
    const audioTrack = stream.getAudioTracks()[0];
    if (!audioTrack) {
      stream.getTracks().forEach((track) => track.stop());
      throw new Error('No audio track found in stream');
    }
    
    // Replace audio track FIRST before updating state
    if (audioTransceiverRef.current && audioTransceiverRef.current.sender) {
      logger.debug("🔄 Replacing audio sender track:", audioTrack.id);
      try {
        await audioTransceiverRef.current.sender.replaceTrack(audioTrack);
        audioTrack.enabled = true;
        logger.debug("✅ Audio track replaced successfully");
      } catch (replaceError) {
        logger.error("❌ Failed to replace audio track:", replaceError);
        stream.getTracks().forEach((track) => track.stop());
        throw new Error(`Failed to replace audio track: ${replaceError instanceof Error ? replaceError.message : 'Unknown error'}`);
      }
    } else {
      logger.error("❌ Audio transceiver or sender not available");
      stream.getTracks().forEach((track) => track.stop());
      throw new Error('Audio transceiver sender not available. Please ensure the session is properly connected.');
    }
    
    // Calculate new modalities BEFORE updating state
    const currentModalities = modalities;
    const newModalities = currentModalities.includes("audio") 
      ? currentModalities 
      : [...currentModalities, "audio" as Modality];
    logger.debug("🎤 Updated modalities for mic enable:", newModalities);
    
    // Update state after successful track replacement
    setUserAudioStream(stream);
    setIsMicOn(true);
    setModalities(newModalities);
    
    // Send updated params with the NEW modalities immediately
    if (connectionState === "connected") {
      const dataChannel = dataChannelRef.current;
      if (dataChannel && dataChannel.readyState === "open") {
        const payload = {
          event: DataChannelEventTypes.SESSION_UPDATE,
          data: {
            ...(model && { model: model }),
            ...(voice && { voice: voice }),
            ...(temperature !== null && { temperature: temperature }),
            ...(instructions && { instructions: instructions }),
            modalities: newModalities, // Use the new modalities directly
          },
        };
        logger.debug("📤 Sending updated parameters with audio modality:", payload);
        logger.info("⚙️ Sending updated parameters with modalities:", { modalities: newModalities });
        dataChannel.send(JSON.stringify(payload));
      } else {
        logger.warn("⚠️ Cannot send updated params: data channel not open");
      }
    }
    
    logger.info("✅ Microphone enabled");
  }, [userAudioStream, connectionState, modalities, model, voice, temperature, instructions]);

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
          // Also remove track from transceiver for soft disable
          if (audioTransceiverRef.current) {
            logger.debug("🔄 Replacing audio sender with null track for soft disable");
            await audioTransceiverRef.current.sender.replaceTrack(null);
          }
        }
      }
      setIsMicOn(false);
      
      // Calculate new modalities BEFORE updating state
      const currentModalities = modalities;
      const newModalities = currentModalities.filter(modality => modality !== "audio");
      logger.debug("🎤 Updated modalities for mic disable:", newModalities);
      setModalities(newModalities);
      
      // Send updated params with the NEW modalities immediately
      if (connectionState === "connected") {
        const dataChannel = dataChannelRef.current;
        if (dataChannel && dataChannel.readyState === "open") {
          const payload = {
            event: DataChannelEventTypes.SESSION_UPDATE,
            data: {
              ...(model && { model: model }),
              ...(voice && { voice: voice }),
              ...(temperature !== null && { temperature: temperature }),
              ...(instructions && { instructions: instructions }),
              modalities: newModalities, // Use the new modalities directly
            },
          };
          logger.debug("📤 Sending updated parameters without audio modality:", payload);
          logger.info("⚙️ Sending updated parameters with modalities:", { modalities: newModalities });
          dataChannel.send(JSON.stringify(payload));
        } else {
          logger.warn("⚠️ Cannot send updated params: data channel not open");
        }
      }

      logger.info("✅ Microphone disabled");
    },
    [userAudioStream, connectionState, modalities, model, voice, temperature, instructions]
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
    try {
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
        facingMode: (cameraPosition === "front" ? "user" : "environment") as "user" | "environment", // Use current camera position
      };
      const constraints = getMediaConstraints(config);
      logger.debug("📹 Camera constraints:", constraints);
      const stream = await mediaDevices.getUserMedia(constraints);
      logger.debug("✅ Camera stream obtained:", stream.getTracks().map(t => ({ id: t.id, kind: t.kind })));
      
      const videoTrack = stream.getVideoTracks()[0];
      if (!videoTrack) {
        stream.getTracks().forEach((track) => track.stop());
        throw new Error('No video track found in stream');
      }
      
      // Replace video track FIRST before updating state
      if (videoTransceiverRef.current && videoTransceiverRef.current.sender) {
        // Ensure transceiver direction is set to sendonly for video
        if (videoTransceiverRef.current.direction !== 'sendonly' && videoTransceiverRef.current.direction !== 'sendrecv') {
          logger.debug("📹 Setting video transceiver direction to sendonly");
          videoTransceiverRef.current.direction = 'sendonly';
        }
        
        logger.debug("🔄 Replacing video sender track:", {
          trackId: videoTrack.id,
          transceiverDirection: videoTransceiverRef.current.direction,
          currentSenderTrack: videoTransceiverRef.current.sender.track?.id || 'null',
        });
        
        try {
          await videoTransceiverRef.current.sender.replaceTrack(videoTrack);
          videoTrack.enabled = true;
          logger.debug("✅ Video track replaced successfully");
        } catch (replaceError) {
          logger.error("❌ Failed to replace video track:", replaceError);
          stream.getTracks().forEach((track) => track.stop());
          throw new Error(`Failed to replace video track: ${replaceError instanceof Error ? replaceError.message : 'Unknown error'}`);
        }
      } else {
        logger.error("❌ Video transceiver or sender not available");
        stream.getTracks().forEach((track) => track.stop());
        throw new Error('Video transceiver sender not available. Please ensure the session is properly connected.');
      }
      
      // Calculate new modalities BEFORE updating state
      const currentModalities = modalities;
      const newModalities = Array.from(new Set([...currentModalities, "video" as Modality]));
      logger.debug("📹 Updated modalities for camera enable:", newModalities);
      
      // Update state after successful track replacement
      setUserVideoStream(stream);
      setIsCameraOn(true);
      setModalities(newModalities);
      
      // Send updated params with the NEW modalities immediately
      if (connectionState === "connected") {
        const dataChannel = dataChannelRef.current;
        if (dataChannel && dataChannel.readyState === "open") {
          const payload = {
            event: DataChannelEventTypes.SESSION_UPDATE,
            data: {
              ...(model && { model: model }),
              ...(voice && { voice: voice }),
              ...(temperature !== null && { temperature: temperature }),
              ...(instructions && { instructions: instructions }),
              modalities: newModalities, // Use the new modalities directly
            },
          };
          logger.debug("📤 Sending updated parameters with video modality:", payload);
          logger.info("⚙️ Sending updated parameters with modalities:", { modalities: newModalities });
          dataChannel.send(JSON.stringify(payload));
        } else {
          logger.warn("⚠️ Cannot send updated params: data channel not open");
        }
      }
      
      logger.info("✅ Camera enabled");
    } catch (error) {
      logger.error("❌ Failed to enable camera:", error);
      throw error;
    }
  }, [userVideoStream, connectionState, modalities, model, voice, temperature, instructions, cameraPosition]);

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
          // Also remove track from transceiver for soft disable
          if (videoTransceiverRef.current) {
            logger.debug("🔄 Replacing video sender with null track for soft disable");
            await videoTransceiverRef.current.sender.replaceTrack(null);
          }
        }
      }
      setIsCameraOn(false);
      
      // Calculate new modalities BEFORE updating state
      const currentModalities = modalities;
      const newModalities = currentModalities.filter(modality => modality !== "video");
      logger.debug("📹 Updated modalities for camera disable:", newModalities);
      setModalities(newModalities);
      
      // Send updated params with the NEW modalities immediately
      if (connectionState === "connected") {
        const dataChannel = dataChannelRef.current;
        if (dataChannel && dataChannel.readyState === "open") {
          const payload = {
            event: DataChannelEventTypes.SESSION_UPDATE,
            data: {
              ...(model && { model: model }),
              ...(voice && { voice: voice }),
              ...(temperature !== null && { temperature: temperature }),
              ...(instructions && { instructions: instructions }),
              modalities: newModalities, // Use the new modalities directly
            },
          };
          logger.debug("📤 Sending updated parameters without video modality:", payload);
          logger.info("⚙️ Sending updated parameters with modalities:", { modalities: newModalities });
          dataChannel.send(JSON.stringify(payload));
        } else {
          logger.warn("⚠️ Cannot send updated params: data channel not open");
        }
      }

      logger.info("✅ Camera disabled");
    },
    [userVideoStream, connectionState, modalities, model, voice, temperature, instructions]
  );

  const toggleCamera = useCallback(async () => {
    logger.debug("🔄 Toggling camera, current state:", isCameraOn);
    if (isCameraOn) {
      await disableCamera(true);
    } else {
      await enableCamera();
    }
  }, [isCameraOn, enableCamera, disableCamera]);

  const updateVideoStream = useCallback(
    async (newPosition: CameraPosition) => {
      logger.info("📹 Updating video stream with constraints:", newPosition);
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
        facingMode: (newPosition === "front" ? "user" : "environment") as "user" | "environment", // Map camera position to facingMode
      };
      const constraints = getMediaConstraints(config);
      logger.debug("📹 Camera constraints:", constraints);
      try {
        const newStream = await mediaDevices.getUserMedia(constraints);
        logger.debug("✅ Camera stream obtained:", newStream.getTracks().map(t => ({ id: t.id, kind: t.kind })));
        setUserVideoStream(newStream);
        // Replace track in peer connection
        if (videoTransceiverRef.current && newStream) {
          const videoTrack = newStream.getVideoTracks()[0];
          await videoTransceiverRef.current.sender.replaceTrack(videoTrack);
          videoTrack.enabled = true;
        }
        // setVideoStream(newStream);
      } catch (error) {
        logger.error("❌ Error updating video stream:", error);
        throw error;
      }
    },
    [userVideoStream, videoTransceiverRef]
  );

  const flipCamera = useCallback(async (): Promise<void> => {
    logger.info("🔄 Flipping camera");
    if (!isCameraOn) {
      logger.warn("🔄 Camera is not enabled");
      return;
    }
    
    const newPosition = cameraPosition === "front" ? "back" : "front";
    logger.info("🔄 Flipping camera from", cameraPosition, "to", newPosition);
    
    try {
      await updateVideoStream(newPosition);
      setCameraPosition(newPosition);
      logger.info("✅ Camera flipped to:", newPosition);
    } catch (error) {
      logger.error("❌ Failed to flip camera:", error);
      throw error;
    }
  }, [isCameraOn, cameraPosition, updateVideoStream]);

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
    flipCamera,

    // Manual control methods
    // requestPermissions,

    // State
    connectionState,
    aiAudioStream,
    userAudioStream,
    userVideoStream,
    conversationItems,
    isCameraOn,
    isMicOn,
    cameraPosition,
    conversationId,
    // localStream,
    // remoteStream,
    // transcriptions,
    // videoStream,
    // audioStream,

    // Utilities
    // hasPermissions,

    // Parameter management
    model,
    voice,
    temperature,
    instructions,
    modalities,
    updateParams,
    // currentVoice,
    // currentTemperature,
    // currentInstructions,
    // currentModalities,
    // isAudioEnabled,
    // isVideoEnabled,
    // updateModel,
    // updateVoice,
    // updateTemperature,
    // updateInstructions,
    // updateModalities,

    // initializeParams,
    // sendUpdatedParams,
  };
}
