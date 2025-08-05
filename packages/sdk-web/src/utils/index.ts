import { SessionConfig } from "../types";
import { OrgaAI } from "../core/OrgaAI";

const MIN_MAX_IDEAL_VIDEO_CONSTRAINTS = {
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
};

export const getMediaConstraints = (
  config: SessionConfig = {}
): MediaStreamConstraints => {
  const videoQuality = config.videoQuality || "medium";

  const video: MediaTrackConstraints = {
    ...MIN_MAX_IDEAL_VIDEO_CONSTRAINTS[videoQuality],
  };
  return {
    audio: false,
    video,
  };
};

/**
 * Fetches an ephemeral token and ICE servers from the developer's backend proxy.
 * @param ephemeralEndpoint - The URL to the developer's backend proxy endpoint.
 * Returns: { ephemeralToken: string, iceServers: RTCIceServer[] }
 */
export const fetchEphemeralTokenAndIceServers = async (
  ephemeralEndpoint: string
): Promise<{
  ephemeralToken: string;
  iceServers: RTCIceServer[];
}> => {
  const response = await fetch(ephemeralEndpoint);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch ephemeral token: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  if (!data?.ephemeralToken || !data?.iceServers) {
    throw new Error("Invalid response from ephemeral token endpoint");
  }
  
  return {
    ephemeralToken: data.ephemeralToken,
    iceServers: data.iceServers,
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
}): Promise<{
  conversation_id: string;
  answer: { sdp: string; type: string };
}> => {
  const config = OrgaAI.getConfig();
  const {
    voice,
    model,
    temperature,
    maxTokens,
    enableTranscriptions,
    instructions,
    modalities,
    // history,
  } = config;
  const realtimeUrl = "https://staging.orga-ai.com/realtime";
  
  logger.debug(
    `[OrgaAI] Connecting to realtime with config: ${JSON.stringify(config)}`
  );
  logger.debug(`[OrgaAI] Voice: ${voice}`);
  logger.debug(`[OrgaAI] Model: ${model}`);
  logger.debug(`[OrgaAI] Temperature: ${temperature}`);
  logger.debug(`[OrgaAI] Max Tokens: ${maxTokens}`);
  // logger.debug(`[OrgaAI] History: ${history}`);
  logger.debug(`[OrgaAI] Return Transcription: ${enableTranscriptions}`);
  logger.debug(`[OrgaAI] Instructions: ${instructions}`);
  logger.debug(`[OrgaAI] Modalities: ${modalities}`);
  
  const requestBody = {
    offer: {
      sdp: peerConnection.localDescription?.sdp,
      type: peerConnection.localDescription?.type,
      candidates: gathered,
    },
    params: {
      voice: voice || "alloy",
      model: model || "orga-1-beta",
      temperature: temperature || 0.5,
      return_transcription: enableTranscriptions || false,
      instructions: instructions || null,
      modalities: modalities || ['audio', 'video'],
      // history: history || false,
      // max_tokens: maxTokens || 50,
    },
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(realtimeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ephemeralToken}`,
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to connect to realtime: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const { answer, conversation_id } = data;
    
    if (!answer) {
      throw new Error("No answer in response");
    }
    
    return { conversation_id, answer };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout: Failed to connect to realtime within 10 seconds');
    }
    throw error;
  }
};

export const logger = {
  debug: (message: string, ...args: any[]) => {
    const logLevel = globalThis.OrgaAI?.config?.logLevel || "disabled";
    if (logLevel === "debug") {
      console.log(`[OrgaAI Debug] ${message}`, ...args);
    }
  },
  info: (message: string, ...args: any[]) => {
    const logLevel = globalThis.OrgaAI?.config?.logLevel || "disabled";
    if (["debug", "info"].includes(logLevel)) {
      console.info(`[OrgaAI Info] ${message}`, ...args);
    }
  },
  warn: (message: string, ...args: any[]) => {
    const logLevel = globalThis.OrgaAI?.config?.logLevel || "disabled";
    if (["debug", "info", "warn"].includes(logLevel)) {
      console.warn(`[OrgaAI Warn] ${message}`, ...args);
    }
  },
  error: (message: string, ...args: any[]) => {
    const logLevel = globalThis.OrgaAI?.config?.logLevel || "disabled";
    if (logLevel !== "disabled") {
      console.error(`[OrgaAI Error] ${message}`, ...args);
    }
  },
};
