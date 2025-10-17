// Vue-specific types that extend the core types
import type { Ref } from "vue";
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
  
  // Vue-specific types
  export type IceCandidateEvent = {
    candidate: RTCIceCandidate | null;
  };
  
  export interface OrgaAIComposableReturn {
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
    connectionState: Ref<ConnectionState>;
    aiAudioStream: Ref<MediaStream | null>;
    userAudioStream: Ref<MediaStream | null>;
    userVideoStream: Ref<MediaStream | null>;
    conversationItems: Ref<ConversationItem[]>;
    isCameraOn: Ref<boolean>;
    isMicOn: Ref<boolean>;
    conversationId: Ref<string | null>;
  
    // Parameter management
    model: Ref<OrgaAIModel | null>;
    voice: Ref<OrgaAIVoice | null>;
    temperature: Ref<number | null>;
    instructions: Ref<string | null>;
    modalities: Ref<Modality[]>;
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