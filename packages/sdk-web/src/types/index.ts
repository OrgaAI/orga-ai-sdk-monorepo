// Allowed models and voices (example values, update as needed)
export const ORGAAI_MODELS = ["Orga (1) beta", "Orga (1)"] as const;
export type OrgaAIModel = typeof ORGAAI_MODELS[number];

export const ORGAAI_VOICES = ["Dora", "Sandra"] as const;
export type OrgaAIVoice = typeof ORGAAI_VOICES[number];

export const ORGAAI_TEMPERATURE_RANGE = {
  min: 0.0,
  max: 1.0,
};

export interface OrgaAIConfig {
  logLevel?: "debug" | "info" | "warn" | "error" | "none";
  timeout?: number;
  ephemeralEndpoint?: string; // When provided we fetch from their backend. Assumes that the backend doesnt need a token or additional configuration.
  fetchEphemeralTokenAndIceServers?: () => Promise<{
    ephemeralToken: string;
    iceServers: RTCIceServer[];
  }>;
  //FetchEphemeralToken is a function that fetches a token from the backend.
  //This allows them to setup the call sending the necessary tokens and headers.
  // Optional parameters can be passed to create default values for the session config
  model?: OrgaAIModel; // <-- not OrgaAIModel | string
  voice?: OrgaAIVoice;
  temperature?: number; // TODO: Add temperature options (0.0 - 1.0)
  maxTokens?: number; // TODO: Add maxTokens options (100 - 1000)
}

export type CameraPosition = "front" | "back";

export type IceCandidateEvent = {
  candidate: RTCIceCandidate | null;
};

export interface SessionConfig {
  enableTranscriptions?: boolean;
  videoQuality?: "low" | "medium" | "high";
  timeout?: number;
  facingMode?: "user" | "environment";
  // Optional parameters can be passed in to override the default values
  voice?: string; // TODO: Add voice options
  model?: string; // TODO: Add model options
  temperature?: number; // TODO: Add temperature options (0.0 - 1.0)
  maxTokens?: number; // TODO: Add maxTokens options (100 - 1000)
}

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
