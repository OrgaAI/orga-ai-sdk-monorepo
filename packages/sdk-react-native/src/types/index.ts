import { RTCPeerConnection, MediaStream } from "react-native-webrtc";
import RTCIceCandidate from "react-native-webrtc/lib/typescript/RTCIceCandidate";
import { SessionConfig } from "../../../shared";

export type CameraPosition = "front" | "back";

export type IceCandidateEvent = {
  candidate: RTCIceCandidate | null;
};

export interface MediaConstraints {
  audio: boolean;
  video: {
    width: number;
    height: number;
    frameRate: number;
    facingMode: "user" | "environment";
  };
}

export type ConnectionState = RTCPeerConnection["connectionState"];

export interface Transcription {
  text: string;
  timestamp: number;
  isFinal: boolean;
  confidence?: number;
}

export interface OrgaAIHookCallbacks {
  onSessionStart?: () => void;
  onSessionEnd?: () => void;
  onTranscription?: (transcription: Transcription) => void;
  onError?: (error: Error) => void;
  onConnectionStateChange?: (
    state: RTCPeerConnection["connectionState"]
  ) => void;
  onSessionConnected?: () => void;
}

export interface OrgaAIHookReturn {
  // Session management
  startSession: (config?: SessionConfig) => Promise<void>;
  endSession: () => Promise<void>;

  // Media controls
  enableMic: () => Promise<void>;
  disableMic: () => Promise<void>;
  toggleMic: () => Promise<void>;
  enableCamera: () => Promise<void>;
  disableCamera: () => Promise<void>;
  toggleCamera: () => Promise<void>;
  flipCamera: () => Promise<void>;

  // Manual control methods (for advanced usage)
  requestPermissions: () => Promise<void>;
  initializeMedia: (config?: Partial<SessionConfig>) => Promise<MediaStream>;
  connect: () => Promise<void>;
  cleanup: () => Promise<void>;

  // State
  connectionState: ConnectionState;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  transcriptions: Transcription[];
  isCameraOn: boolean;
  isMicOn: boolean;
  cameraPosition: CameraPosition;
  videoStream: MediaStream | null;
  audioStream: MediaStream | null;
  conversationId: string | null;
  // Utilities
  hasPermissions: () => Promise<boolean>;
}
