import { RTCPeerConnection, MediaStream } from "react-native-webrtc";
import RTCIceCandidate from "react-native-webrtc/lib/typescript/RTCIceCandidate";
import { RTCIceServer } from "../utils";
export declare const ORGAAI_MODELS: readonly ["orga-1-beta"];
export type OrgaAIModel = (typeof ORGAAI_MODELS)[number];
export declare const MODALITIES_ENUM: {
    readonly VIDEO: "video";
    readonly AUDIO: "audio";
};
export type Modality = (typeof MODALITIES_ENUM)[keyof typeof MODALITIES_ENUM];
export declare const ORGAAI_VOICES: readonly ["alloy", "ash", "ballad", "coral", "echo", "fable", "onyx", "nova", "sage", "shimmer"];
export type OrgaAIVoice = (typeof ORGAAI_VOICES)[number];
export declare const ORGAAI_TEMPERATURE_RANGE: {
    min: number;
    max: number;
};
export interface OrgaAIConfig {
    logLevel?: "debug" | "info" | "warn" | "error" | "disabled";
    timeout?: number;
    sessionConfigEndpoint?: string;
    fetchSessionConfig?: () => Promise<{
        ephemeralToken: string;
        iceServers: RTCIceServer[];
    }>;
    model?: OrgaAIModel;
    voice?: OrgaAIVoice;
    temperature?: number;
    enableTranscriptions?: boolean;
    instructions?: string;
    modalities?: Modality[];
}
export type CameraPosition = "front" | "back";
export type IceCandidateEvent = {
    candidate: RTCIceCandidate | null;
};
export interface SessionConfig {
    enableTranscriptions?: boolean;
    videoQuality?: "low" | "medium" | "high";
    timeout?: number;
    facingMode?: "user" | "environment";
    voice?: OrgaAIVoice;
    model?: OrgaAIModel;
    temperature?: number;
    instructions?: string;
    modalities?: Modality[];
    onSessionStart?: () => void;
    onSessionEnd?: () => void;
    onError?: (error: Error) => void;
    onConnectionStateChange?: (state: RTCPeerConnection["connectionState"]) => void;
    onSessionConnected?: () => void;
    onConversationMessageCreated?: (item: ConversationItem) => void;
}
export interface MediaConstraints {
    audio: boolean;
    video: {
        width: number;
        height: number;
        frameRate: number;
        facingMode: "user" | "environment";
    };
}
export type ConnectionState = RTCPeerConnection["connectionState"];
export interface DataChannelEvent {
    event: string;
    message?: string;
    [key: string]: any;
}
export declare enum DataChannelEventTypes {
    USER_SPEECH_TRANSCRIPTION = "conversation.item.input_audio_transcription.completed",
    ASSISTANT_RESPONSE_COMPLETE = "response.output_item.done",
    SESSION_UPDATE = "session.update"
}
export interface ConversationItem {
    conversationId: string;
    sender: "user" | "assistant";
    content: {
        type: "text";
        message: string;
    };
    voiceType?: OrgaAIVoice;
    modelVersion?: OrgaAIModel;
    timestamp?: string;
}
export interface OrgaAIHookCallbacks {
    onSessionStart?: () => void;
    onSessionEnd?: () => void;
    onSessionConnected?: () => void;
    onError?: (error: Error) => void;
    onConnectionStateChange?: (state: ConnectionState) => void;
    onConversationMessageCreated?: (item: ConversationItem) => void;
}
export interface OrgaAIHookReturn {
    startSession: (config?: SessionConfig) => Promise<void>;
    endSession: () => Promise<void>;
    enableMic: () => Promise<void>;
    disableMic: () => Promise<void>;
    toggleMic: () => Promise<void>;
    enableCamera: () => Promise<void>;
    disableCamera: () => Promise<void>;
    toggleCamera: () => Promise<void>;
    flipCamera: () => Promise<void>;
    peerConnection: RTCPeerConnection | null;
    connectionState: ConnectionState;
    aiAudioStream: MediaStream | null;
    userVideoStream: MediaStream | null;
    conversationItems: ConversationItem[];
    isCameraOn: boolean;
    isMicOn: boolean;
    cameraPosition: CameraPosition;
    conversationId: string | null;
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
