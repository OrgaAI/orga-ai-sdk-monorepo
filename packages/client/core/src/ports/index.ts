/**
 * Port interfaces for platform-specific implementations
 * 
 * These ports abstract away platform differences between web and React Native.
 * Each platform SDK must provide implementations of these interfaces.
 */

import type {
  RTCIceServer,
  RTCIceCandidateInit,
  MediaConstraints,
  ConnectionState,
} from '../types';

// ============================================================================
// WebRTC Port
// ============================================================================

/**
 * Generic peer connection interface that abstracts web and React Native implementations
 */
export interface PeerConnection {
  localDescription: { sdp?: string; type?: string } | null;
  connectionState: ConnectionState;
  
  createOffer(): Promise<{ sdp?: string; type?: string }>;
  createAnswer(): Promise<{ sdp?: string; type?: string }>;
  setLocalDescription(description: { sdp?: string; type?: string }): Promise<void>;
  setRemoteDescription(description: { sdp: string; type: string }): Promise<void>;
  addIceCandidate(candidate: RTCIceCandidateInit): Promise<void>;
  addTrack(track: MediaStreamTrack, stream: MediaStream): void;
  createDataChannel(label: string, options?: any): DataChannel;
  close(): void;
  
  // Event handlers
  onicecandidate: ((event: { candidate: RTCIceCandidateInit | null }) => void) | null;
  ontrack: ((event: { streams: MediaStream[] }) => void) | null;
  onconnectionstatechange: (() => void) | null;
  ondatachannel: ((event: { channel: DataChannel }) => void) | null;
}

/**
 * Generic data channel interface
 */
export interface DataChannel {
  readyState: 'connecting' | 'open' | 'closing' | 'closed';
  send(data: string): void;
  close(): void;
  
  // Event handlers
  onopen: (() => void) | null;
  onmessage: ((event: { data: string }) => void) | null;
  onerror: ((error: any) => void) | null;
  onclose: (() => void) | null;
}

/**
 * Generic media stream interface
 */
export interface MediaStream {
  id: string;
  active: boolean;
  getTracks(): MediaStreamTrack[];
  getAudioTracks(): MediaStreamTrack[];
  getVideoTracks(): MediaStreamTrack[];
  addTrack(track: MediaStreamTrack): void;
  removeTrack(track: MediaStreamTrack): void;
}

/**
 * Generic media stream track interface
 */
export interface MediaStreamTrack {
  id: string;
  kind: 'audio' | 'video';
  enabled: boolean;
  readyState: 'live' | 'ended';
  stop(): void;
}

/**
 * WebRTC adapter port - must be implemented by each platform
 */
export interface WebRTCPort {
  /**
   * Create a new peer connection with the given ICE servers
   */
  createPeerConnection(iceServers: RTCIceServer[]): PeerConnection;
  
  /**
   * Get user media (camera/microphone) with the given constraints
   */
  getUserMedia(constraints: MediaConstraints): Promise<MediaStream>;
  
  /**
   * Check if getUserMedia is available on this platform
   */
  isGetUserMediaSupported(): boolean;
}

// ============================================================================
// Logger Port
// ============================================================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'disabled';

/**
 * Logger port for platform-specific logging
 */
export interface LoggerPort {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}

// ============================================================================
// Fetch Port (for platforms without global fetch)
// ============================================================================

/**
 * Fetch port for HTTP requests
 */
export interface FetchPort {
  fetch(url: string, options?: RequestInit): Promise<Response>;
}

export interface RequestInit {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  signal?: AbortSignal;
}

export interface Response {
  ok: boolean;
  status: number;
  statusText: string;
  json(): Promise<any>;
  text(): Promise<string>;
}

