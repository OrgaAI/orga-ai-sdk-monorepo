import { RTCPeerConnection, MediaStream } from "react-native-webrtc";
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
  logLevel?: "debug" | "info" | "warn" | "error" | "disabled";
  timeout?: number;
  sessionConfigEndpoint?: string; // When provided we fetch from their backend. Assumes that the backend doesnt need a token or additional configuration.
  fetchSessionConfig?: () => Promise<{
    ephemeralToken: string;
    iceServers: RTCIceServer[];
  }>;
  //fetchSessionConfig is a function that fetches session configuration from the backend.
  //This allows them to setup the call sending the necessary tokens and headers.
  // Optional parameters can be passed to create default values for the session config
  model?: OrgaAIModel;
  voice?: OrgaAIVoice;
  temperature?: number; 
  enableTranscriptions?: boolean;
  instructions?: string;
  modalities?: Modality[];
  history?: boolean;
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
  voice?: OrgaAIVoice; 
  model?: OrgaAIModel;  
  temperature?: number; 
  instructions?: string; 
  modalities?: Modality[];
  // Callbacks for session events
  onSessionStart?: () => void;
  onSessionEnd?: () => void;
  onError?: (error: Error) => void;
  onConnectionStateChange?: (
    state: RTCPeerConnection["connectionState"]
  ) => void;
  onSessionConnected?: () => void;
  onConversationMessageCreated?: (item: ConversationItem) => void;
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

export interface DataChannelEvent {
  type: string;
  [key: string]: any;
}

export enum DataChannelEventTypes {
  USER_SPEECH_TRANSCRIPTION = "conversation.item.input_audio_transcription.completed",
  ASSISTANT_RESPONSE_COMPLETE = "response.output_item.done",
  SESSION_UPDATE = "session.update",
  AGENT_REQUEST = "orga_agent.request",
  AGENT_RESULT = "orga_agent.result",
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
  onSessionConnected?: () => void;
  onError?: (error: Error) => void;
  onConnectionStateChange?: (state: ConnectionState) => void;
  onConversationMessageCreated?: (item: ConversationItem) => void;
  onOrgaAgentMessage: (data: {
    tool: string;
    parameters: { [key: string]: string };
  }, sendResult: (message: string) => void) => void;
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

  // requestPermissions: () => Promise<void>; //TODO: Review this

  // State
  connectionState: ConnectionState;
  aiAudioStream: MediaStream | null;
  userVideoStream: MediaStream | null;
  conversationItems: ConversationItem[];
  isCameraOn: boolean;
  isMicOn: boolean;
  cameraPosition: CameraPosition;
  conversationId: string | null;
  
  // Parameter management
  model: OrgaAIModel | null;
  voice: OrgaAIVoice | null;
  temperature: number | null;
  instructions: string | null;
  modalities: Modality[];
  updateParams: (params: {
    model?: OrgaAIModel;
    voice?: OrgaAIVoice;
    temperature?: number;
    instructions?: string;
    modalities?: Modality[];
  }) => void;
  
  // Utilities
  // hasPermissions: () => Promise<boolean>; //TODO: Review this

  // Utils
  sendOrgaAgentResult: (message: string) => void;
}
