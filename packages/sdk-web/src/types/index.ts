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
  ephemeralEndpoint?: string; // When provided we fetch from their backend. Assumes that the backend doesn't need a token or additional configuration.
  fetchEphemeralTokenAndIceServers?: () => Promise<{
    ephemeralToken: string;
    iceServers: RTCIceServer[];
  }>;
  //FetchEphemeralToken is a function that fetches a token from the backend.
  //This allows them to setup the call sending the necessary tokens and headers.
  // Optional parameters can be passed to create default values for the session config
  model?: OrgaAIModel;
  voice?: OrgaAIVoice;
  temperature?: number; 
  enableTranscriptions?: boolean;
  instructions?: string;
  modalities?: Modality[];
  // history?: boolean; //TODO: Add history support
}

export type IceCandidateEvent = {
  candidate: RTCIceCandidate | null; //TODO: Potentially remove this
};

//For use in 'startSession' 
export interface SessionConfig {
  enableTranscriptions?: boolean;
  videoQuality?: "low" | "medium" | "high";
  timeout?: number;
  // Optional parameters can be passed in to override the default values
  voice?: OrgaAIVoice; // Updated to use proper type
  model?: OrgaAIModel; // Updated to use proper type
  temperature?: number; 
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
  event: string;
  message?: string;
  [key: string]: any;
}

export enum DataChannelEventTypes {
  USER_SPEECH_TRANSCRIPTION = "conversation.item.input_audio_transcription.completed",
  ASSISTANT_RESPONSE_COMPLETE = "response.output_item.done",
  SESSION_UPDATE = "session.update",
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
}

export interface OrgaAIHookReturn {
  // Session management
  startSession: (config?: SessionConfig) => Promise<void>;
  endSession: () => Promise<void>;

  // Media controls
  enableMic: () => Promise<void>;
  disableMic: (hardDisable?: boolean) => Promise<void>;
  toggleMic: () => Promise<void>;
  enableCamera: () => Promise<void>;
  disableCamera: (hardDisable?: boolean) => Promise<void>; //TODO: Review and add to the docs
  toggleCamera: () => Promise<void>;

  // State
  connectionState: ConnectionState;
  aiAudioStream: MediaStream | null;
  userVideoStream: MediaStream | null;
  conversationItems: ConversationItem[];
  isCameraOn: boolean;
  isMicOn: boolean;
  conversationId: string | null;

  // Parameter management (simplified)
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
}
