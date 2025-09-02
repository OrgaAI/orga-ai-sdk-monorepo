"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.connectToRealtime = exports.fetchSessionConfig = exports.getMediaConstraints = void 0;
const OrgaAI_1 = require("../core/OrgaAI");
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
const getMediaConstraints = (config = {}) => {
    const videoQuality = config.videoQuality || "medium";
    const video = {
        ...MIN_MAX_IDEAL_VIDEO_CONSTRAINTS[videoQuality],
    };
    return {
        audio: false,
        video,
    };
};
exports.getMediaConstraints = getMediaConstraints;
/**
 * Fetches an ephemeral token and ICE servers from the developer's backend proxy.
 * @param ephemeralEndpoint - The URL to the developer's backend proxy endpoint.
 * Returns: { ephemeralToken: string, iceServers: RTCIceServer[] }
 */
const fetchSessionConfig = async (ephemeralEndpoint) => {
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
exports.fetchSessionConfig = fetchSessionConfig;
/**
 * Sends the offer and ICE candidates to the backend and receives the answer.
 * Returns: { conversation_id, answer }
 */
const connectToRealtime = async ({ ephemeralToken, peerConnection, gathered, }) => {
    const config = OrgaAI_1.OrgaAI.getConfig();
    const { voice, model, temperature, enableTranscriptions, instructions, modalities,
    // history,
     } = config;
    const realtimeUrl = "https://staging.orga-ai.com/realtime";
    exports.logger.debug(`[OrgaAI] Connecting to realtime with config: ${JSON.stringify(config)}`);
    exports.logger.debug(`[OrgaAI] Voice: ${voice}`);
    exports.logger.debug(`[OrgaAI] Model: ${model}`);
    exports.logger.debug(`[OrgaAI] Temperature: ${temperature}`);
    exports.logger.debug(`[OrgaAI] Return Transcription: ${enableTranscriptions}`);
    exports.logger.debug(`[OrgaAI] Instructions: ${instructions}`);
    exports.logger.debug(`[OrgaAI] Modalities: ${modalities}`);
    // logger.debug(`[OrgaAI] History: ${history}`);
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
    }
    catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error('Request timeout: Failed to connect to realtime within 10 seconds');
        }
        throw error;
    }
};
exports.connectToRealtime = connectToRealtime;
exports.logger = {
    debug: (message, ...args) => {
        const logLevel = globalThis.OrgaAI?.config?.logLevel || "disabled";
        if (logLevel === "debug") {
            console.log(`[OrgaAI Debug] ${message}`, ...args);
        }
    },
    info: (message, ...args) => {
        const logLevel = globalThis.OrgaAI?.config?.logLevel || "disabled";
        if (["debug", "info"].includes(logLevel)) {
            console.info(`[OrgaAI Info] ${message}`, ...args);
        }
    },
    warn: (message, ...args) => {
        const logLevel = globalThis.OrgaAI?.config?.logLevel || "disabled";
        if (["debug", "info", "warn"].includes(logLevel)) {
            console.warn(`[OrgaAI Warn] ${message}`, ...args);
        }
    },
    error: (message, ...args) => {
        const logLevel = globalThis.OrgaAI?.config?.logLevel || "disabled";
        if (logLevel !== "disabled") {
            console.error(`[OrgaAI Error] ${message}`, ...args);
        }
    },
};
