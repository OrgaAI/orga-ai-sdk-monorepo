/**
 * @orga-ai/core
 * 
 * Framework-agnostic core library for Orga AI SDK
 * 
 * This package provides the shared types, client logic, and utilities
 * used by all Orga AI framework adapters (React, React Native, Vue, etc.)
 */

// ============================================================================
// Core Client
// ============================================================================

export { OrgaAI } from './client/OrgaAI';
export {
  ORGAAI_VOICES,
  DEFAULT_ORGAAI_VOICE,
  getVoiceDetails,
  type OrgaAIVoice,
  type OrgaAIVoiceEntry,
} from './types/OrgaVoices';

// ============================================================================
// Types
// ============================================================================

export type {
  // Models & Voices
  OrgaAIModel,
  Modality,
  
  // Configuration
  OrgaAIConfig,
  SessionConfig,
  
  // WebRTC Types
  ConnectionState,
  RTCIceServer,
  RTCIceCandidateInit,
  MediaConstraints,
  
  // Events
  DataChannelEvent,
  SessionCreatedEvent,
  ConversationCreatedEvent,
  ConversationItem,
  
  // Hook Types
  OrgaAIHookCallbacks,
  
  // API Types
  SessionConfigResponse,
  RealtimeConnectionRequest,
  RealtimeConnectionResponse,
} from './types';

export {
  // Constants
  ORGAAI_MODELS,
  ORGAAI_TEMPERATURE_RANGE,
  MODALITIES_ENUM,
  VIDEO_QUALITY_CONSTRAINTS,
  
  // Enums
  DataChannelEventTypes,
} from './types';

// ============================================================================
// Errors
// ============================================================================

export {
  OrgaAIError,
  ConfigurationError,
  ConnectionError,
  PermissionError,
  SessionError,
} from './errors';

// ============================================================================
// Utilities
// ============================================================================

export {
  logger,
  fetchSessionConfig,
  connectToRealtime,
  getMediaConstraints,
  stripEmotionTags,
} from './utils';

// ============================================================================
// Ports (for platform implementations)
// ============================================================================

export type {
  // WebRTC Ports
  PeerConnection,
  DataChannel,
  MediaStream,
  MediaStreamTrack,
  WebRTCPort,
  
  // Other Ports
  LoggerPort,
  LogLevel,
  FetchPort,
  RequestInit,
  Response,
} from './ports';

