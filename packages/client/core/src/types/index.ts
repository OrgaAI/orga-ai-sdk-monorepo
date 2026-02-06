// ============================================================================
// Constants & Enums
// ============================================================================

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
} as const;

export enum DataChannelEventTypes {
  USER_SPEECH_TRANSCRIPTION = "conversation.item.input_audio_transcription.completed",
  ASSISTANT_RESPONSE_COMPLETE = "response.output_item.done",
  SESSION_UPDATE = "session.update",
  SESSION_CREATED = "session.created",
  CONVERSATION_CREATED = "conversation.created",
}

// ============================================================================
// Platform-Agnostic WebRTC Types
// ============================================================================

// Generic types that work across web and React Native
export type ConnectionState = 
  | 'new'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'failed'
  | 'closed';

export interface RTCIceServer {
  urls: string | string[];
  username?: string;
  credential?: string;
}

export interface RTCIceCandidateInit {
  candidate?: string;
  sdpMLineIndex?: number | null;
  sdpMid?: string | null;
}

// ============================================================================
// Configuration Types
// ============================================================================

export interface OrgaAIConfig {
  logLevel?: "debug" | "info" | "warn" | "error" | "disabled";
  timeout?: number;
  sessionConfigEndpoint?: string;
  fetchSessionConfig?: () => Promise<{
    ephemeralToken: string;
    iceServers: RTCIceServer[];
  }>;
  // Optional parameters for default session configuration
  model?: OrgaAIModel;
  voice?: OrgaAIVoice;
  temperature?: number;
  enableTranscriptions?: boolean;
  instructions?: string;
  modalities?: Modality[];
  history?: boolean;
  baseUrl?: string;
}

export interface SessionConfig {
  enableTranscriptions?: boolean;
  videoQuality?: "low" | "medium" | "high";
  timeout?: number;
  facingMode?: "user" | "environment";
  // Optional parameters to override defaults
  voice?: OrgaAIVoice;
  model?: OrgaAIModel;
  temperature?: number;
  instructions?: string;
  modalities?: Modality[];
  // Callbacks for session events
  onSessionStart?: () => void;
  onSessionEnd?: () => void;
  onError?: (error: Error) => void;
  onConnectionStateChange?: (state: ConnectionState) => void;
  onSessionConnected?: () => void;
  onConversationMessageCreated?: (item: ConversationItem) => void;
  onSessionCreated?: (event: SessionCreatedEvent) => void;
  onConversationCreated?: (event: ConversationCreatedEvent) => void;
}

export interface MediaConstraints {
  audio: boolean;
  video: {
    width: number | { min?: number; ideal?: number; max?: number };
    height: number | { min?: number; ideal?: number; max?: number };
    frameRate: number | { min?: number; ideal?: number; max?: number };
    facingMode?: "user" | "environment";
  };
}

// ============================================================================
// Event Types
// ============================================================================

export interface DataChannelEvent {
  type?: string;
  event?: string;
  transcript?: string;
  text?: string;
  message?: string;
  [key: string]: any;
}

export interface SessionCreatedEvent {
  type: "session.created";
  session: {
    id: string;
    instructions: string | null;
    modalities: Modality[];
    model: OrgaAIModel;
    object: "realtime.session";
    return_transcription: boolean;
    temperature: number;
    voice: OrgaAIVoice;
  };
}

export interface ConversationCreatedEvent {
  type: "conversation.created";
  conversation: {
    id: string;
  };
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

// ============================================================================
// Hook/API Types
// ============================================================================

export interface OrgaAIHookCallbacks {
  onSessionStart?: () => void;
  onSessionEnd?: () => void;
  onSessionConnected?: () => void;
  onError?: (error: Error) => void;
  onConnectionStateChange?: (state: ConnectionState) => void;
  onConversationMessageCreated?: (item: ConversationItem) => void;
  onSessionCreated?: (event: SessionCreatedEvent) => void;
  onConversationCreated?: (event: ConversationCreatedEvent) => void;
}

// ============================================================================
// Session Response Types
// ============================================================================

export interface SessionConfigResponse {
  ephemeralToken: string;
  iceServers: RTCIceServer[];
}

export interface RealtimeConnectionRequest {
  offer: {
    sdp: string | undefined;
    type: string | undefined;
    candidates: RTCIceCandidateInit[];
  };
  params: {
    voice: OrgaAIVoice;
    model: OrgaAIModel;
    temperature: number;
    return_transcription: boolean;
    instructions: string | null;
    modalities: Modality[];
    history: boolean;
  };
}

export interface RealtimeConnectionResponse {
  conversation_id: string;
  answer: {
    sdp: string;
    type: string;
  };
}

// ============================================================================
// Video Quality Constraints
// ============================================================================

export const VIDEO_QUALITY_CONSTRAINTS = {
  low: {
    width: { min: 320, ideal: 640, max: 1280 },
    height: { min: 240, ideal: 480, max: 720 },
    frameRate: { min: 15, ideal: 24, max: 30 },
  },
  medium: {
    width: { min: 640, ideal: 1280, max: 1920 },
    height: { min: 480, ideal: 720, max: 1080 },
    frameRate: { min: 24, ideal: 30, max: 30 },
  },
  high: {
    width: { min: 1280, ideal: 1920, max: 2560 },
    height: { min: 720, ideal: 1080, max: 1440 },
    frameRate: { min: 30, ideal: 30, max: 30 },
  },
} as const;

