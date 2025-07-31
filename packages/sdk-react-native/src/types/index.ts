import { RTCPeerConnection, MediaStream } from "react-native-webrtc";
import RTCDataChannel from "react-native-webrtc/lib/typescript/RTCDataChannel";
import RTCIceCandidate from "react-native-webrtc/lib/typescript/RTCIceCandidate";
import { RTCIceServer } from "../utils";

// Allowed models and voices (example values, update as needed)
export const ORGAAI_MODELS = ["orga-1-beta"] as const;
export type OrgaAIModel = (typeof ORGAAI_MODELS)[number];
export const MODALITIES_ENUM = {
  VIDEO: "video",
  AUDIO: "audio",
} as const;
export type Modality = (typeof MODALITIES_ENUM)[keyof typeof MODALITIES_ENUM];

export const ORGAAI_VOICES = [
  "alloy",
  "ash",
  "ballad",
  "coral",
  "echo",
  "fable",
  "onyx",
  "nova",
  "sage",
  "shimmer",
] as const;
export type OrgaAIVoice = (typeof ORGAAI_VOICES)[number];

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
  history?: boolean;
  return_transcription?: boolean;
  instructions?: string;
  modalities?: Modality[];
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
  voice?: OrgaAIVoice; // Updated to use proper type
  model?: OrgaAIModel; // Updated to use proper type
  temperature?: number; // TODO: Add temperature options (0.0 - 1.0)
  maxTokens?: number; // TODO: Add maxTokens options (100 - 1000)
  instructions?: string; // Added for session instructions
  modalities?: Modality[]; // Added for session modalities
  // Callbacks for session events
  onSessionStart?: () => void;
  onSessionEnd?: () => void;
  onError?: (error: Error) => void;
  onConnectionStateChange?: (
    state: RTCPeerConnection["connectionState"]
  ) => void;
  onSessionConnected?: () => void;
  // Data channel event callbacks
  onDataChannelOpen?: () => void;
  onDataChannelMessage?: (event: DataChannelEvent) => void;
  onTranscriptionInput?: (event: DataChannelEvent) => void;
  onTranscriptionInputCompleted?: (event: DataChannelEvent) => void;
  onResponseOutputDone?: (event: DataChannelEvent) => void;
  onConversationItemCreated?: (item: ConversationItem) => void;
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

// Data channel event types
export interface DataChannelEvent {
  event: string;
  message?: string;
  [key: string]: any;
}

export interface ConversationItem {
  conversationId: string;
  sender: "user" | "assistant";
  content: {
    type: "text";
    message: string;
  };
  voiceType?: OrgaAIVoice;
  modelVersion?: OrgaAIModel;
  timestamp?: string;
}

export interface OrgaAIHookCallbacks {
  onSessionStart?: () => void;
  onSessionEnd?: () => void;
  // onTranscription?: (transcription: Transcription) => void;
  onError?: (error: Error) => void;
  onConnectionStateChange?: (
    state: RTCPeerConnection["connectionState"]
  ) => void;
  onSessionConnected?: () => void;
  // Data channel event callbacks
  onDataChannelOpen?: () => void;
  onDataChannelMessage?: (event: DataChannelEvent) => void;
  onTranscriptionInput?: (event: DataChannelEvent) => void;
  onTranscriptionInputCompleted?: (event: DataChannelEvent) => void;
  onResponseOutputDone?: (event: DataChannelEvent) => void;
  onConversationItemCreated?: (item: ConversationItem) => void;
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
  dataChannel: RTCDataChannel | null;
  
  // Parameter management
  currentModel: OrgaAIModel | null;
  currentVoice: OrgaAIVoice | null;
  currentTemperature: number | null;
  currentInstructions: string | null;
  currentModalities: Modality[];
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  updateModel: (model: OrgaAIModel) => void;
  updateVoice: (voice: OrgaAIVoice) => void;
  updateTemperature: (temperature: number) => void;
  updateInstructions: (instructions: string) => void;
  updateModalities: (modalities: Modality[]) => void;
  updateParams: (params: {
    model?: OrgaAIModel;
    voice?: OrgaAIVoice;
    temperature?: number;
    instructions?: string;
    modalities?: Modality[];
  }) => void;
  initializeParams: (config: SessionConfig) => void;
  sendUpdatedParams: () => void;
  
  // Utilities
  hasPermissions: () => Promise<boolean>;
}
