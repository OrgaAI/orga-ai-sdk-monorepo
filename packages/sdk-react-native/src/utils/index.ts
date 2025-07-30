import { SessionConfig } from '../types';
import { RTCPeerConnection } from 'react-native-webrtc';
import { MediaTrackConstraints } from 'react-native-webrtc/lib/typescript/Constraints';
import { Constraints } from 'react-native-webrtc/lib/typescript/getUserMedia';
import axios from 'axios';
import { OrgaAI } from '../core/OrgaAI';

export const MIN_MAX_IDEAL_VIDEO_CONSTRAINTS = {
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
  }
}

export const getMediaConstraints = (config: SessionConfig = {}): Constraints => {
  const videoQuality = config.videoQuality || 'medium';
  const facingMode = config.facingMode || 'user';

  const video: MediaTrackConstraints = {
    facingMode,
    ...MIN_MAX_IDEAL_VIDEO_CONSTRAINTS[videoQuality]
  }
  return {
    audio: false,
    video
  };
};

// TODO: Replace with correct import if available from react-native-webrtc or DOM types
// export type RTCPeerConnection = any; // Replace with actual type if available
export type RTCIceCandidateInit = {
  candidate: string;
  sdpMid?: string;
  sdpMLineIndex?: number;
};
export type RTCIceServer = {
  urls: string | string[];
  username?: string;
  credential?: string;
};

/**
 * Fetches an ephemeral token and ICE servers from the developer's backend proxy.
 * @param ephemeralEndpoint - The URL to the developer's backend proxy endpoint.
 * Returns: { ephemeralToken: string, iceServers: RTCIceServer[] }
 */
export const fetchEphemeralTokenAndIceServers = async (ephemeralEndpoint: string): Promise<{
  ephemeralToken: string;
  iceServers: RTCIceServer[];
}> => {
  const response = await axios.get(ephemeralEndpoint);
  if (!response.data?.ephemeralToken || !response.data?.iceServers) {
    throw new Error('Invalid response from ephemeral token endpoint');
  }
  return {
    ephemeralToken: response.data.ephemeralToken,
    iceServers: response.data.iceServers,
  };
};

/**
 * Sends the offer and ICE candidates to the backend and receives the answer.
 * Returns: { conversation_id, answer }
 */
export const connectToRealtime = async ({
  ephemeralToken,
  peerConnection,
  gathered,
}: {
  ephemeralToken: string;
  peerConnection: RTCPeerConnection;
  gathered: RTCIceCandidateInit[];
}): Promise<{ conversation_id: string; answer: { sdp: string; type: string } }> => {
  const config = OrgaAI.getConfig();
  const { voice, model, temperature, maxTokens, history, return_transcription, instructions, modalities } = config;
  const realtimeUrl = 'https://staging.orga-ai.com/realtime';
  logger.debug(`[OrgaAI] Connecting to realtime with config: ${JSON.stringify(config)}`);
  logger.debug(`[OrgaAI] Voice: ${voice}`);
  logger.debug(`[OrgaAI] Model: ${model}`);
  logger.debug(`[OrgaAI] Temperature: ${temperature}`);
  logger.debug(`[OrgaAI] Max Tokens: ${maxTokens}`);
  logger.debug(`[OrgaAI] History: ${history}`);
  logger.debug(`[OrgaAI] Return Transcription: ${return_transcription}`);
  logger.debug(`[OrgaAI] Instructions: ${instructions}`);
  logger.debug(`[OrgaAI] Modalities: ${modalities}`);
  const response = await axios.post(
    realtimeUrl,
    {
      offer: {
        sdp: peerConnection.localDescription?.sdp,
        type: peerConnection.localDescription?.type,
        candidates: gathered,
      },
      params: {
        voice: voice || 'alloy',
        model: model || 'orga-1-beta',
        temperature: temperature || 0.5,
        max_tokens: maxTokens || 50,
        history: history || false,
        return_transcription: return_transcription || false,
        instructions: instructions || '',
        modalities: modalities || ['audio', 'video'],
      }
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ephemeralToken}`,
      },
      timeout: 10000,
    }
  );
  const { answer, conversation_id } = response.data;
  if (!answer) throw new Error('No answer in response');
  return { conversation_id, answer };
};

export const logger = {
  debug: (message: string, ...args: any[]) => {
    if (globalThis.OrgaAI?.config?.logLevel === 'debug') {
      console.log(`[OrgaAI Debug] ${message}`, ...args);
    }
  },
  info: (message: string, ...args: any[]) => {
    if (globalThis.OrgaAI?.config?.logLevel && ['debug', 'info'].includes(globalThis.OrgaAI.config.logLevel)) {
      console.info(`[OrgaAI Info] ${message}`, ...args);
    }
  },
  warn: (message: string, ...args: any[]) => {
    if (globalThis.OrgaAI?.config?.logLevel && ['debug', 'info', 'warn'].includes(globalThis.OrgaAI.config.logLevel)) {
      console.warn(`[OrgaAI Warn] ${message}`, ...args);
    }
  },
  error: (message: string, ...args: any[]) => {
    if (globalThis.OrgaAI?.config?.logLevel !== 'none') {
      console.error(`[OrgaAI Error] ${message}`, ...args);
    }
  }
};