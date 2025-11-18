import { MediaStream } from "react-native-webrtc";
import RTCIceCandidate from "react-native-webrtc/lib/typescript/RTCIceCandidate";
import {
  OrgaAIModel,
  Modality,
  OrgaAIVoice,
  ConversationItem,
  SessionConfig,
  ConnectionState,
} from "@orga-ai/core";

export type CameraPosition = "front" | "back";

export type IceCandidateEvent = {
  candidate: RTCIceCandidate | null;
};

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

  // State
  connectionState: ConnectionState;
  aiAudioStream: MediaStream | null;
  userAudioStream: MediaStream | null; // User's microphone audio stream for visualization and analysis
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