import { useState, useEffect, useCallback, useRef } from "react";

import {
  OrgaAIHookReturn,
  OrgaAIHookCallbacks,
  SessionConfig,
  Transcription,
  ConnectionState,
  CameraPosition,
  IceCandidateEvent,
} from "../types";
import {
  PermissionError,
  ConnectionError,
  SessionError,
  ConfigurationError,
} from "../errors";
import { OrgaAI } from "../core/OrgaAI";
import {
  getMediaConstraints,
  logger,
  connectToRealtime,
  RTCIceServer,
  RTCIceCandidateInit,
} from "../utils";

// Rename the original hook for internal use
export function useOrgaAI(
  callbacks: OrgaAIHookCallbacks = {}
): OrgaAIHookReturn {
  const [connectionState, setConnectionState] = useState<ConnectionState>("closed");
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const currentConfigRef = useRef<SessionConfig>({});

  // Add refs for transceivers
  const audioTransceiverRef = useRef<any>(null);
  const videoTransceiverRef = useRef<any>(null);

  // Add state for camera, mic, and video
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [cameraPosition, setCameraPosition] = useState<CameraPosition>(
    "front"
  );
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);

  const {
    onSessionStart,
    onSessionEnd,
    onTranscription,
    onError,
    onConnectionStateChange,
    onSessionConnected,
  } = callbacks;

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
    } catch (error) {
      logger.error("Error during cleanup:", error);
    }
  }, []);

  // Check permissions
  const hasPermissions = useCallback(async (): Promise<boolean> => {
    // TODO: Implement permissions check
    return true; // iOS permissions are handled by getUserMedia
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
      // No-op: do not call getUserMedia here
      return new MediaStream();
    },
    []
  );

  // Refactor buildPeerConnection to use localStream
  const buildPeerConnection = useCallback(
    async (iceServers: RTCIceServer[]): Promise<RTCPeerConnection> => {
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
      dc.addEventListener("open", () => {
        logger.debug("Data channel opened");
      });
      dc.addEventListener("message", (event) => {
        onTranscription?.(event.data as unknown as Transcription); //TODO: Update when known
        setTranscriptions((prev) => [...prev, event.data as unknown as Transcription]);
        logger.debug("Data channel message received:", event.data);
      });
      dc.addEventListener("close", () => {
        logger.debug("Data channel closed");
      });

      pc.ontrack = (event) => {
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
      const { answer, conversation_id } = await connectToRealtime({
        ephemeralToken,
        peerConnection: pc,
        gathered,
      });
      if (!answer || !conversation_id) {
        throw new Error("Failed to connect to backend");
      }
      setConversationId(conversation_id);

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

        currentConfigRef.current = config;
        setConnectionState("connecting");

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
    [connectionState, requestPermissions, initializeMedia, connect, onError]
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

  const disableMic = useCallback(async (hardDisable = false) => {
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
        audioStream.getAudioTracks().forEach((track) => (track.enabled = false));
      }
    }
    setIsMicOn(false);
    logger.debug("Mic disabled");
  }, [audioStream]);

  const toggleMic = useCallback(async () => {
    if (isMicOn) {
      await disableMic();
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

  const disableCamera = useCallback(async (hardDisable = false) => {
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
        videoStream.getVideoTracks().forEach((track) => (track.enabled = false));
      }
    }
    setIsCameraOn(false);
    logger.debug("Camera disabled");
  }, [videoStream]);

  const toggleCamera = useCallback(async () => {
    if (isCameraOn) {
      await disableCamera();
    } else {
      await enableCamera();
    }
    logger.debug("Camera toggled", !isCameraOn);
  }, [isCameraOn, enableCamera, disableCamera]);

  const updateVideoStream = useCallback(async (newPosition: CameraPosition) => {
    // Stop current video track
    if (videoStream) {
      videoStream.getVideoTracks().forEach((track) => track.stop());
      setVideoStream(null);
    }
    const config = OrgaAI.getConfig();
    // const facingMode = newPosition === "front" ? "user" : "environment";
    const constraints = getMediaConstraints({...config, facingMode: newPosition === "front" ? "user" : "environment"});
    logger.debug("Updating video stream with constraints:", constraints);
    try {
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      // Replace track in peer connection
      if (videoTransceiverRef.current && newStream) {
        const videoTrack = newStream.getVideoTracks()[0];
        await videoTransceiverRef.current.sender.replaceTrack(videoTrack);
        videoTrack.enabled = true;
      }
      setVideoStream(newStream);
    } catch (error) {
      console.error("Error updating video stream:", error);
    }
  }, [videoStream, videoTransceiverRef]);


  const flipCamera = useCallback(async (): Promise<void> => {
    if (!isCameraOn) return;
    setCameraPosition((current) => {
      const newPosition = current === "front" ? "back" : "front";
      if (isCameraOn) {
        updateVideoStream(newPosition);
      }
      logger.debug("Camera flipped (transceiver)");
      return newPosition;
    });
  }, [isCameraOn, cameraPosition, updateVideoStream]);

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
    flipCamera,

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
    cameraPosition, 
    isCameraOn,
    isMicOn,
    videoStream,
    audioStream,
    conversationId,

    // Utilities
    hasPermissions,
  };
}