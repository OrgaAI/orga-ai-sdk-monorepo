import { SessionConfig } from "../types";
export declare const getMediaConstraints: (config?: SessionConfig) => MediaStreamConstraints;
/**
 * Fetches an ephemeral token and ICE servers from the developer's backend proxy.
 * @param ephemeralEndpoint - The URL to the developer's backend proxy endpoint.
 * Returns: { ephemeralToken: string, iceServers: RTCIceServer[] }
 */
export declare const fetchSessionConfig: (ephemeralEndpoint: string) => Promise<{
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
