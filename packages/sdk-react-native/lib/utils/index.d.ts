import { SessionConfig } from "../types";
import { RTCPeerConnection } from "react-native-webrtc";
import { Constraints } from "react-native-webrtc/lib/typescript/getUserMedia";
interface RTCIceCandidateInit {
    candidate?: string;
    sdpMLineIndex?: number | null;
    sdpMid?: string | null;
}
export declare const MIN_MAX_IDEAL_VIDEO_CONSTRAINTS: {
    low: {
        width: {
            min: number;
            ideal: number;
            max: number;
        };
        height: {
            min: number;
            ideal: number;
            max: number;
        };
        frameRate: {
            min: number;
            ideal: number;
            max: number;
        };
    };
    medium: {
        width: {
            min: number;
            ideal: number;
            max: number;
        };
        height: {
            min: number;
            ideal: number;
            max: number;
        };
        frameRate: {
            min: number;
            ideal: number;
            max: number;
        };
    };
    high: {
        width: {
            min: number;
            ideal: number;
            max: number;
        };
        height: {
            min: number;
            ideal: number;
            max: number;
        };
        frameRate: {
            min: number;
            ideal: number;
            max: number;
        };
    };
};
export declare const getMediaConstraints: (config?: SessionConfig) => Constraints;
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
export declare const fetchEphemeralTokenAndIceServers: (ephemeralEndpoint: string) => Promise<{
    ephemeralToken: string;
    iceServers: RTCIceServer[];
}>;
/**
 * Sends the offer and ICE candidates to the backend and receives the answer.
 * Returns: { conversation_id, answer }
 */
export declare const connectToRealtime: ({ ephemeralToken, peerConnection, gathered, }: {
    ephemeralToken: string;
    peerConnection: RTCPeerConnection;
    gathered: RTCIceCandidateInit[];
}) => Promise<{
    conversation_id: string;
    answer: {
        sdp: string;
        type: string;
    };
}>;
export declare const logger: {
    debug: (message: string, ...args: any[]) => void;
    info: (message: string, ...args: any[]) => void;
    warn: (message: string, ...args: any[]) => void;
    error: (message: string, ...args: any[]) => void;
};
export {};
