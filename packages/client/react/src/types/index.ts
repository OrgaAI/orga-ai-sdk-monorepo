// React-specific types that extend the core types
import type {
  ConnectionState,
  OrgaAIModel,
  OrgaAIVoice,
  Modality,
  ConversationItem,
  SessionConfig,
  OrgaAIHookCallbacks,
  SessionCreatedEvent,
  ConversationCreatedEvent,
} from "@orga-ai/core";

// React-specific types
export type IceCandidateEvent = {
  candidate: RTCIceCandidate | null;
};

export interface OrgaAIHookReturn {
  // Session management
  startSession: (config?: SessionConfig) => Promise<void>;
  endSession: () => Promise<void>;

  // Media controls
  enableMic: () => Promise<void>;
  disableMic: (hardDisable?: boolean) => Promise<void>;
  toggleMic: () => Promise<void>;
  enableCamera: () => Promise<void>;
  disableCamera: (hardDisable?: boolean) => Promise<void>;
  toggleCamera: () => Promise<void>;

  // State
  connectionState: ConnectionState;
  aiAudioStream: MediaStream | null;
  userAudioStream: MediaStream | null;
  userVideoStream: MediaStream | null;
  conversationItems: ConversationItem[];
  isCameraOn: boolean;
  isMicOn: boolean;
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
}

// Re-export core types for convenience
export type {
  ConnectionState,
  OrgaAIModel,
  OrgaAIVoice,
  Modality,
  ConversationItem,
  SessionConfig,
  OrgaAIHookCallbacks,
  SessionCreatedEvent,
  ConversationCreatedEvent,
  DataChannelEvent,
} from "@orga-ai/core";

// Re-export enum as value
export { DataChannelEventTypes } from "@orga-ai/core";