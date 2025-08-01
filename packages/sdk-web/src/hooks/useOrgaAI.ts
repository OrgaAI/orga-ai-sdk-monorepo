import { useState, useEffect, useCallback, useRef } from "react";
import {
  OrgaAIHookReturn,
  OrgaAIHookCallbacks,
  SessionConfig,
  Transcription,
  ConnectionState,
  CameraPosition,
  IceCandidateEvent,
  OrgaAIModel,
  OrgaAIVoice,
  Modality,
  DataChannelEvent,
  ConversationItem,
} from "../types";
import { ConnectionError, SessionError, ConfigurationError } from "../errors";
import { OrgaAI } from "../core/OrgaAI";
import {
  getMediaConstraints,
  logger,
  connectToRealtime,
  RTCIceServer,
  RTCIceCandidateInit,
} from "../utils";

export function useOrgaAI(
  callbacks: OrgaAIHookCallbacks = {}
): OrgaAIHookReturn {
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("closed");
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [conversationItems, setConversationItems] = useState<ConversationItem[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const conversationIdRef = useRef<string | null>(null);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const currentConfigRef = useRef<SessionConfig>({});

  // Add refs for transceivers
  const audioTransceiverRef = useRef<any>(null);
  const videoTransceiverRef = useRef<any>(null);

  // Add state for camera, mic, and video
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [cameraPosition, setCameraPosition] = useState<CameraPosition>("front"); // TODO: Check if camera position is supported in web
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);

  // Add state for current session parameters
  const [currentModel, setCurrentModel] = useState<OrgaAIModel | null>(null);
  const [currentVoice, setCurrentVoice] = useState<OrgaAIVoice | null>(null);
  const [currentTemperature, setCurrentTemperature] = useState<number | null>(
    null
  );
  const [currentInstructions, setCurrentInstructions] = useState<string | null>(
    null
  );
  const [currentModalities, setCurrentModalities] = useState<Modality[]>([]);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);

  const {
    onSessionStart,
    onSessionEnd,
    onUserSpeechTranscription,
    onError,
    onConnectionStateChange,
    onSessionConnected,
    onDataChannelOpen,
    onDataChannelMessage,
    onUserSpeechComplete,
    onAssistantResponseComplete,
    onConversationMessageCreated,
  } = callbacks;

  // Function to send updated parameters to the session
  const sendUpdatedParams = useCallback(() => {
    const dataChannel = dataChannelRef.current;
    if (!dataChannel || dataChannel.readyState !== "open") {
      logger.warn("Cannot send updated params: data channel not open");
      return;
    }

    const payload = {
      event: "session.update",
      data: {
        ...(currentModel && { model: currentModel }),
        ...(currentVoice && { voice: currentVoice }),
        ...(currentTemperature !== null && { temperature: currentTemperature }),
        ...(currentInstructions && { instructions: currentInstructions }),
        modalities: [
          ...(isAudioEnabled ? ["audio"] : []),
          ...(isVideoEnabled ? ["video"] : []),
        ],
      },
    };

    logger.debug("📤 Sending updated parameters via data channel:", payload);
    dataChannel.send(JSON.stringify(payload));
    // setEvents((prev) => [payload, ...prev]); // This line was not in the new_code, so it's removed.
  }, [
    currentModel,
    currentVoice,
    currentTemperature,
    currentInstructions,
    isAudioEnabled,
    isVideoEnabled,
  ]);

  // Individual parameter update functions (immediate updates)
  const updateModel = useCallback(
    (model: OrgaAIModel) => {
      setCurrentModel(model);
      if (connectionState === "connected") {
        sendUpdatedParams();
      }
    },
    [connectionState, sendUpdatedParams]
  );

  const updateVoice = useCallback(
    (voice: OrgaAIVoice) => {
      setCurrentVoice(voice);
      if (connectionState === "connected") {
        sendUpdatedParams();
      }
    },
    [connectionState, sendUpdatedParams]
  );

  const updateTemperature = useCallback(
    (temperature: number) => {
      setCurrentTemperature(temperature);
      if (connectionState === "connected") {
        sendUpdatedParams();
      }
    },
    [connectionState, sendUpdatedParams]
  );

  const updateInstructions = useCallback(
    (instructions: string) => {
      setCurrentInstructions(instructions);
      if (connectionState === "connected") {
        sendUpdatedParams();
      }
    },
    [connectionState, sendUpdatedParams]
  );

  const updateModalities = useCallback(
    (modalities: Modality[]) => {
      const audioEnabled = modalities.includes("audio");
      const videoEnabled = modalities.includes("video");
      setIsAudioEnabled(audioEnabled);
      setIsVideoEnabled(videoEnabled);
      setCurrentModalities(modalities);
      if (connectionState === "connected") {
        sendUpdatedParams();
      }
    },
    [connectionState, sendUpdatedParams]
  );

  // Batch update function
  const updateParams = useCallback(
    (params: {
      model?: OrgaAIModel;
      voice?: OrgaAIVoice;
      temperature?: number;
      instructions?: string;
      modalities?: Modality[];
    }) => {
      if (params.model !== undefined) setCurrentModel(params.model);
      if (params.voice !== undefined) setCurrentVoice(params.voice);
      if (params.temperature !== undefined)
        setCurrentTemperature(params.temperature);
      if (params.instructions !== undefined)
        setCurrentInstructions(params.instructions);
      if (params.modalities !== undefined) {
        const audioEnabled = params.modalities.includes("audio");
        const videoEnabled = params.modalities.includes("video");
        setIsAudioEnabled(audioEnabled);
        setIsVideoEnabled(videoEnabled);
        setCurrentModalities(params.modalities);
      }

      // Send updates immediately if connected
      if (connectionState === "connected") {
        sendUpdatedParams();
      }
    },
    [connectionState, sendUpdatedParams]
  );

  // Initialize parameters from config when session starts
  const initializeParams = useCallback((config: SessionConfig) => {
    const orgaConfig = OrgaAI.getConfig();

    // Type-safe parameter initialization
    const model = config.model || orgaConfig.model;
    const voice = config.voice || orgaConfig.voice;
    const temperature = config.temperature || orgaConfig.temperature;
    const instructions = config.instructions || orgaConfig.instructions;
    const modalities = config.modalities || orgaConfig.modalities || [];

    setCurrentModel(model || null);
    setCurrentVoice(voice || null);
    setCurrentTemperature(temperature || null);
    setCurrentInstructions(instructions || null);

    const audioEnabled = modalities.includes("audio");
    const videoEnabled = modalities.includes("video");
    setIsAudioEnabled(audioEnabled);
    setIsVideoEnabled(videoEnabled);
    setCurrentModalities(modalities);
  }, []);

  // Cleanup function (update to stop and nullify both streams)
  const cleanup = useCallback(async (): Promise<void> => {
    logger.debug("Cleaning up resources");
    try {
      // Stop and nullify all streams
      [localStream, videoStream, audioStream].forEach((stream) => {
        if (stream) stream.getTracks().forEach((track) => track.stop());
      });
      setLocalStream(null);
      setVideoStream(null);
      setAudioStream(null);

      // Detach tracks from transceivers
      if (audioTransceiverRef.current) {
        await audioTransceiverRef.current.sender.replaceTrack(null);
      }
      if (videoTransceiverRef.current) {
        await videoTransceiverRef.current.sender.replaceTrack(null);
      }

      // Close peer connection
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }

      // Close data channel
      if (dataChannelRef.current) {
        dataChannelRef.current.close();
        dataChannelRef.current = null;
      }

      // Reset states
      setConversationId(null);
      setRemoteStream(null);
      setTranscriptions([]);
      setConnectionState("closed");
      setIsCameraOn(false);
      setIsMicOn(false);
      setCameraPosition("front");
      setVideoStream(null);
      setAudioStream(null);
    } catch (error) {
      logger.error("Error during cleanup:", error);
    }
  }, []);

  // Check permissions
  const hasPermissions = useCallback(async (): Promise<boolean> => {
    // TODO: Implement permissions check
    return true;
  }, []);

  // Request permissions
  const requestPermissions = useCallback(async (): Promise<void> => {
    logger.debug("Requesting permissions");

    // TODO: Implement permissions request
    return;
  }, []);

  // Initialize media
  const initializeMedia = useCallback(
    async (config: Partial<SessionConfig> = {}): Promise<MediaStream> => {
      logger.debug("Initializing media");
      return new MediaStream();
    },
    []
  );

  // Refactor buildPeerConnection to use localStream
  const buildPeerConnection = useCallback(
    async (iceServers: RTCIceServer[]): Promise<RTCPeerConnection> => {
      const { voice, model } = OrgaAI.getConfig();
      const pc = new RTCPeerConnection({
        iceServers,
        iceTransportPolicy: "all",
        iceCandidatePoolSize: 0,
      });

      audioTransceiverRef.current = pc.addTransceiver("audio", {
        direction: "sendrecv",
      });
      videoTransceiverRef.current = pc.addTransceiver("video", {
        direction: "sendonly",
      });

      // Do not attach any tracks yet (leave senders with null)
      await audioTransceiverRef.current.sender.replaceTrack(null);
      await videoTransceiverRef.current.sender.replaceTrack(null);

      const dc = pc.createDataChannel("orga-realtime-client-events");
      dataChannelRef.current = dc;
      dc.addEventListener("open", () => {
        logger.debug("Data channel opened");
        onDataChannelOpen?.();
      });
      dc.addEventListener("message", (event) => {
        try {
          const dataChannelEvent = JSON.parse(
            event.data as string
          ) as DataChannelEvent;
          logger.debug("Data channel message received:", dataChannelEvent);

          // Call the general message handler
          onDataChannelMessage?.(dataChannelEvent);

          logger.debug("Processing data channel event:", dataChannelEvent.event, "Current conversationId:", conversationId);
          if (
            dataChannelEvent.event ===
            "conversation.item.input_audio_transcription.completed"
          ) {
                    onUserSpeechTranscription?.(dataChannelEvent);
        onUserSpeechComplete?.(dataChannelEvent);

            // Create conversation item for user input
            const currentConversationId = conversationIdRef.current || conversationId;
            logger.debug("Checking conversationId for user item:", currentConversationId);
            if (currentConversationId) {
                              const conversationItem: ConversationItem = {
                  conversationId: currentConversationId,
                  sender: "user",
                  content: {
                    type: "text",
                    message: dataChannelEvent.message || "",
                  },
                  modelVersion: model,
                };
              logger.debug("User conversation item created:", conversationItem);
              setConversationItems(prev => {
                const newItems = [...prev, conversationItem];
                logger.debug("Updated conversationItems:", newItems);
                return newItems;
              });
              onConversationMessageCreated?.(conversationItem);
            }
          }

          if (dataChannelEvent.event === "response.output_item.done") {
            logger.debug("Processing assistant response event");
            onAssistantResponseComplete?.(dataChannelEvent);

            // Create conversation item for assistant response
            const currentConversationId = conversationIdRef.current || conversationId;
            logger.debug("Checking conversationId for assistant item:", currentConversationId);
            if (currentConversationId) {
              const conversationItem: ConversationItem = {
                conversationId: currentConversationId,
                sender: "assistant",
                content: {
                  type: "text",
                  message: dataChannelEvent.message || "",
                },
                voiceType: voice,
                modelVersion: model,
                timestamp: new Date().toISOString(),
              };
              logger.debug("Assistant conversation item created:", conversationItem);
              setConversationItems(prev => {
                const newItems = [...prev, conversationItem];
                logger.debug("Updated conversationItems:", newItems);
                return newItems;
              });
              onConversationMessageCreated?.(conversationItem);
            }
          }
        } catch (error) {
          logger.error("Error parsing data channel message:", error);
          onError?.(
            new Error(`Failed to parse data channel message: ${error}`)
          );
        }
      });
      dc.addEventListener("close", () => {
        logger.debug("Data channel closed");
      });

      pc.ontrack = (event) => {
        const trackEvent = event as unknown as any;
        if (trackEvent.track.kind === "audio") {
          // Store reference to remote audio track
          // ✅ CRITICAL: Explicitly enable the track
          trackEvent.track.enabled = true;

          logger.debug("🎵 Audio track received:", {
            id: trackEvent.track.id,
            enabled: trackEvent.track.enabled,
            muted: trackEvent.track.muted,
            readyState: trackEvent.track.readyState
          });

          // This event fires when you receive an audio track from the remote peer
          trackEvent.track.addEventListener("unmute", () => {
            logger.debug("🎵 Audio track unmuted");
            // This fires when the remote peer starts sending audio
            // console.log("Audio track unmuted", event.track);
          });
        }
        logger.debug("Track received:", event.track);
        setRemoteStream(event.streams[0]);
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
      const onIceCandidate = (event: IceCandidateEvent) => {
        if (event.candidate) {
          candidates.push({
            candidate: event.candidate.candidate,
            sdpMid: event.candidate.sdpMid ?? undefined,
            sdpMLineIndex: event.candidate.sdpMLineIndex ?? undefined,
          });
        } else if (pc.iceGatheringState === "complete") {
          logger.debug("ICE gathering complete");
          pc.removeEventListener("icecandidate", onIceCandidate);
          resolve(candidates);
        }
      };
      pc.addEventListener("icecandidate", onIceCandidate);
      // Fallback in case icegatheringstatechange doesn't fire
      setTimeout(() => {
        pc.removeEventListener("icecandidate", onIceCandidate);
        resolve(candidates);
      }, 5000);
    });
  };

  // Refactored connect/session flow
  const connect = useCallback(async (): Promise<void> => {
    logger.debug("Connecting to backend (modular, robust flow)");
    try {
      const config = OrgaAI.getConfig();
      const fetchFn = config.fetchEphemeralTokenAndIceServers;
      if (!fetchFn) {
        throw new Error("fetchEphemeralTokenAndIceServers is not defined");
      }
      const { ephemeralToken, iceServers } = await fetchFn();
      logger.debug("Ephemeral token and ice servers fetched");

      // Use modular buildPeerConnection with localStream
      const pc = await buildPeerConnection(iceServers);
      peerConnectionRef.current = pc;

      // Create offer
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: false,
      });
      await pc.setLocalDescription(offer);

      // Gather ICE candidates
      const gathered = await gatherIceCandidates(pc);

      // Send offer/candidates to backend, receive answer
      const response = await connectToRealtime({
        ephemeralToken,
        peerConnection: pc,
        gathered,
      });
      logger.debug("Full backend response:", response);
      const { answer, conversation_id } = response;
      logger.debug("Backend response:", { answer: !!answer, conversation_id });
      if (!answer) {
        throw new Error("Failed to connect to backend");
      }
      
      // Use conversation_id from backend or generate a local one
      const finalConversationId = conversation_id || `local-${Date.now()}`;
      logger.debug("Setting conversation ID:", finalConversationId);
      setConversationId(finalConversationId);
      conversationIdRef.current = finalConversationId;

      await pc.setRemoteDescription(
        new RTCSessionDescription({
          sdp: answer.sdp,
          type: answer.type as RTCSdpType,
        })
      );

      setConnectionState("connected");
      pc.addEventListener("connectionstatechange", (event) => {
        if (pc.connectionState === "connected") {
          onSessionConnected?.();
        }
        logger.debug(
          "Connection state changed:",
          (event.target as RTCPeerConnection).connectionState
        );
        onConnectionStateChange?.(
          (event.target as RTCPeerConnection).connectionState
        );
      });
      onSessionStart?.();
    } catch (error) {
      logger.error("Failed to connect (modular flow):", error);
      setConnectionState("failed");
      setConversationId(null);
      onError?.(error as Error);
      throw error;
    }
  }, [buildPeerConnection, onSessionStart, onError]);

  // Start session (main method)
  const startSession = useCallback(
    async (config: SessionConfig = {}): Promise<void> => {
      logger.debug("Starting session");

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
          onSessionStart: config.onSessionStart || callbacks.onSessionStart,
          onSessionEnd: config.onSessionEnd || callbacks.onSessionEnd,
          onError: config.onError || callbacks.onError,
          onConnectionStateChange: config.onConnectionStateChange || callbacks.onConnectionStateChange,
          onSessionConnected: config.onSessionConnected || callbacks.onSessionConnected,
          onDataChannelOpen: config.onDataChannelOpen || callbacks.onDataChannelOpen,
          onDataChannelMessage: config.onDataChannelMessage || callbacks.onDataChannelMessage,
          onUserSpeechTranscription: config.onUserSpeechTranscription || callbacks.onUserSpeechTranscription,
          onUserSpeechComplete: config.onUserSpeechComplete || callbacks.onUserSpeechComplete,
          onAssistantResponseComplete: config.onAssistantResponseComplete || callbacks.onAssistantResponseComplete,
          onConversationMessageCreated: config.onConversationMessageCreated || callbacks.onConversationMessageCreated,
        };

        // Update the callbacks for this session
        Object.assign(callbacks, sessionCallbacks);

        currentConfigRef.current = config;
        setConnectionState("connecting");
        
        // Clear conversation items when starting a new session
        setConversationItems([]);

        // Initialize parameters from config
        initializeParams(config);

        // Full flow: permissions → media → connection
        await requestPermissions();
        await initializeMedia(config);
        await connect();
      } catch (error) {
        logger.error("Failed to start session:", error);
        setConnectionState("failed");
        onError?.(error as Error);
        throw new ConnectionError("Failed to start session");
      }
    },
    [
      connectionState,
      requestPermissions,
      initializeMedia,
      connect,
      onError,
      callbacks,
    ]
  );

  // End session
  const endSession = useCallback(async (): Promise<void> => {
    logger.debug("Ending session");

    try {
      await cleanup();
      onSessionEnd?.();
    } catch (error) {
      logger.error("Error ending session:", error);
      onError?.(error as Error);
    }
  }, [cleanup, onSessionEnd, onError]);

  // --- Mic Controls ---
  const enableMic = useCallback(async () => {
    logger.debug("Enabling mic");
    // Stop any previous audio stream
    if (audioStream) {
      audioStream.getTracks().forEach((track) => {
        logger.debug("Stopping previous audio track", track);
        track.stop();
      });
      setAudioStream(null);
    }
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
    setAudioStream(stream);
    setIsMicOn(true);
    if (audioTransceiverRef.current) {
      const audioTrack = stream.getAudioTracks()[0];
      logger.debug("Replacing audio sender track", audioTrack);
      await audioTransceiverRef.current.sender.replaceTrack(audioTrack);
      audioTrack.enabled = true;
    }
    logger.debug("Mic enabled");
  }, [audioStream]);

  const disableMic = useCallback(
    async (hardDisable = false) => {
      logger.debug("Disabling mic", { hardDisable });
      if (audioStream) {
        if (hardDisable) {
          audioStream.getTracks().forEach((track) => {
            logger.debug("Stopping and removing audio track", track);
            track.stop();
          });
          setAudioStream(null);
          if (audioTransceiverRef.current) {
            await audioTransceiverRef.current.sender.replaceTrack(null);
          }
        } else {
          audioStream
            .getAudioTracks()
            .forEach((track) => (track.enabled = false));
        }
      }
      setIsMicOn(false);
      logger.debug("Mic disabled");
    },
    [audioStream]
  );

  const toggleMic = useCallback(async () => {
    if (isMicOn) {
      await disableMic(true); // Use hardDisable to properly stop tracks
    } else {
      await enableMic();
    }
    logger.debug("Mic toggled", !isMicOn);
  }, [isMicOn, enableMic, disableMic]);

  // --- Camera Controls ---
  const enableCamera = useCallback(async () => {
    logger.debug("Enabling camera");
    // Stop any previous video stream
    if (videoStream) {
      videoStream.getTracks().forEach((track) => {
        logger.debug("Stopping previous video track", track);
        track.stop();
      });
      setVideoStream(null);
    }
    const config = OrgaAI.getConfig();
    const constraints = getMediaConstraints(config);
    logger.debug("Camera constraints:", constraints);
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setVideoStream(stream);
      setIsCameraOn(true);
      if (videoTransceiverRef.current) {
        const videoTrack = stream.getVideoTracks()[0];
        logger.debug("Replacing video sender track", videoTrack);
        await videoTransceiverRef.current.sender.replaceTrack(videoTrack);
        videoTrack.enabled = true;
      }
      logger.debug("Camera enabled");
    } catch (error) {
      logger.error("Failed to enable camera:", error);
      throw error;
    }
  }, [cameraPosition, videoStream]);

  const disableCamera = useCallback(
    async (hardDisable = false) => {
      logger.debug("Disabling camera", { hardDisable });
      if (videoStream) {
        if (hardDisable) {
          // Stop and remove the track
          videoStream.getTracks().forEach((track) => {
            logger.debug("Stopping and removing video track", track);
            track.stop();
          });
          setVideoStream(null);
          if (videoTransceiverRef.current) {
            await videoTransceiverRef.current.sender.replaceTrack(null);
          }
        } else {
          // Just disable the track
          videoStream
            .getVideoTracks()
            .forEach((track) => (track.enabled = false));
        }
      }
      setIsCameraOn(false);
      logger.debug("Camera disabled");
    },
    [videoStream]
  );

  const toggleCamera = useCallback(async () => {
    if (isCameraOn) {
      await disableCamera(true); // Use hardDisable to properly stop tracks
    } else {
      await enableCamera();
    }
    logger.debug("Camera toggled", !isCameraOn);
  }, [isCameraOn, enableCamera, disableCamera]);

  // Cleanup on unmount
  useEffect(() => {
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

    // Manual control methods
    requestPermissions,
    initializeMedia,
    connect,
    cleanup,

    // State
    connectionState,
    localStream,
    remoteStream,
    transcriptions,
    conversationItems,
    cameraPosition,
    isCameraOn,
    isMicOn,
    videoStream,
    audioStream,
    conversationId,
    dataChannel: dataChannelRef.current,

    // Utilities
    hasPermissions,

     // Parameter management
     currentModel,
     currentVoice,
     currentTemperature,
     currentInstructions,
     currentModalities,
     isAudioEnabled,
     isVideoEnabled,
     updateModel,
     updateVoice,
     updateTemperature,
     updateInstructions,
     updateModalities,
     updateParams,
     initializeParams,
     sendUpdatedParams,
  };
}
