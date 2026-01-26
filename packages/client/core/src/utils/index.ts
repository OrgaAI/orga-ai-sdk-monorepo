import type {
  SessionConfig,
  MediaConstraints,
  SessionConfigResponse,
  RealtimeConnectionResponse,
  RTCIceCandidateInit,
} from '../types';
import { OrgaAI } from '../client/OrgaAI';

// ============================================================================
// Logger Utility
// ============================================================================

export const logger = {
  debug: (message: string, ...args: any[]): void => {
    const logLevel = globalThis.OrgaAI?.config?.logLevel || 'disabled';
    if (logLevel === 'debug') {
      console.log(`[OrgaAI Debug] ${message}`, ...args);
    }
  },
  
  info: (message: string, ...args: any[]): void => {
    const logLevel = globalThis.OrgaAI?.config?.logLevel || 'disabled';
    if (['debug', 'info'].includes(logLevel)) {
      console.info(`[OrgaAI Info] ${message}`, ...args);
    }
  },
  
  warn: (message: string, ...args: any[]): void => {
    const logLevel = globalThis.OrgaAI?.config?.logLevel || 'disabled';
    if (['debug', 'info', 'warn'].includes(logLevel)) {
      console.warn(`[OrgaAI Warn] ${message}`, ...args);
    }
  },
  
  error: (message: string, ...args: any[]): void => {
    const logLevel = globalThis.OrgaAI?.config?.logLevel || 'disabled';
    if (logLevel !== 'disabled') {
      console.error(`[OrgaAI Error] ${message}`, ...args);
    }
  },
};

// ============================================================================
// Text Processing Utility
// ============================================================================

/**
 * Removes emotion tags and other XML-like tags from transcription text
 * 
 * Removes tags like:
 * - <emotion value="happy"/>
 * - <emotion value="content"/>
 * 
 * @param text - The text to clean
 * @returns The text with emotion tags removed
 */
/**
 * Parses transcription tags and replaces them with emojis
 * e.g., [laughter] -> 😂
 */
const parseTranscriptionTags = (text: string): string => {
  return text.replace(/\[laughter\]/gi, '😂');
};

export const stripEmotionTags = (text: string): string => {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  // First, parse transcription tags like [laughter] -> 😂
  let cleaned = parseTranscriptionTags(text);
  
  // Remove emotion tags (self-closing XML tags)
  // Matches: <emotion value="..."/> or <emotion value='...'/>
  cleaned = cleaned.replace(/<emotion\s+value=["'][^"']*["']\s*\/?>/gi, '');
  
  // Clean up any extra whitespace (multiple spaces, spaces at start/end of lines)
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  return cleaned;
};

// ============================================================================
// Media Constraints Utility
// ============================================================================

/**
 * Get media constraints based on session configuration
 * 
 * @param config - Session configuration
 * @returns Media constraints for getUserMedia
 */
export const getMediaConstraints = (
  config: SessionConfig = {}
): MediaConstraints => {
  const videoQuality = config.videoQuality || 'medium';
  const facingMode = config.facingMode || 'user';

  const { VIDEO_QUALITY_CONSTRAINTS } = require('../types');
  
  const video = {
    facingMode,
    ...VIDEO_QUALITY_CONSTRAINTS[videoQuality],
  };

  return {
    audio: false,
    video,
  };
};

// ============================================================================
// Session Config Fetcher
// ============================================================================

/**
 * Fetches session configuration (ephemeral token and ICE servers) from the developer's backend proxy
 * 
 * @param sessionConfigEndpoint - The URL to the developer's backend proxy endpoint
 * @returns Session configuration with ephemeral token and ICE servers
 * @throws Error if the fetch fails or response is invalid
 */
export const fetchSessionConfig = async (
  sessionConfigEndpoint: string
): Promise<SessionConfigResponse> => {
  const response = await fetch(sessionConfigEndpoint);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch session config: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json() as { ephemeralToken?: string; iceServers?: any[] };
  
  if (!data?.ephemeralToken || !data?.iceServers) {
    throw new Error('Invalid response from session config endpoint');
  }

  return {
    ephemeralToken: data.ephemeralToken,
    iceServers: data.iceServers,
  };
};

// ============================================================================
// Realtime Connection
// ============================================================================

/**
 * Generic peer connection interface for the connectToRealtime function
 */
interface GenericPeerConnection {
  localDescription?: {
    sdp?: string;
    type?: string;
  } | null;
}

/**
 * Sends the offer and ICE candidates to the backend and receives the answer
 * 
 * @param params - Connection parameters
 * @param params.ephemeralToken - Ephemeral authentication token
 * @param params.peerConnection - The WebRTC peer connection
 * @param params.gathered - Array of gathered ICE candidates
 * @returns Response with conversation ID and SDP answer
 * @throws Error if the connection fails or response is invalid
 */
export const connectToRealtime = async ({
  ephemeralToken,
  peerConnection,
  gathered,
}: {
  ephemeralToken: string;
  peerConnection: GenericPeerConnection;
  gathered: RTCIceCandidateInit[];
}): Promise<RealtimeConnectionResponse> => {
  const config = OrgaAI.getConfig();
  const {
    voice,
    model,
    temperature,
    enableTranscriptions,
    instructions,
    modalities,
    history,
  } = config;

  const realtimeUrl = 'https://api.orga-ai.com/v1/realtime/calls';

  logger.debug(
    `[OrgaAI] Connecting to realtime with config: ${JSON.stringify(config)}`
  );
  logger.debug(`[OrgaAI] Voice: ${voice}`);
  logger.debug(`[OrgaAI] Model: ${model}`);
  logger.debug(`[OrgaAI] Temperature: ${temperature}`);
  logger.debug(`[OrgaAI] Enable Transcriptions: ${enableTranscriptions}`);
  logger.debug(`[OrgaAI] Instructions: ${instructions}`);
  logger.debug(`[OrgaAI] Modalities: ${modalities}`);
  logger.debug(`[OrgaAI] History: ${history}`);

  const requestBody = {
    offer: {
      sdp: peerConnection.localDescription?.sdp,
      type: peerConnection.localDescription?.type,
      candidates: gathered,
    },
    params: {
      voice: voice || 'alloy',
      model: model || 'orga-1-beta',
      temperature: temperature ?? 0.5,
      return_transcription: enableTranscriptions || false,
      instructions: instructions || null,
      modalities: modalities || ['audio', 'video'],
      history: history ?? true,
    },
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(realtimeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ephemeralToken}`,
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(
        `Failed to connect to realtime: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json() as { 
      answer?: { sdp: string; type: string }; 
      conversation_id?: string 
    };
    const { answer, conversation_id } = data;

    if (!answer || !conversation_id) {
      throw new Error('Invalid response: missing answer or conversation_id');
    }

    return { conversation_id, answer };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(
        'Request timeout: Failed to connect to realtime within 10 seconds'
      );
    }
    throw error;
  }
};

