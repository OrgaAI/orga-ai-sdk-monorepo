"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useOrgaAI = useOrgaAI;
const react_1 = require("react");
const react_native_webrtc_1 = require("react-native-webrtc");
// import RTCIceCandidateInit from "react-native-webrtc/lib/typescript/RTCIceCandidate";
const react_native_incall_manager_1 = __importDefault(require("react-native-incall-manager"));
const types_1 = require("../types");
const errors_1 = require("../errors");
const OrgaAI_1 = require("../core/OrgaAI");
const utils_1 = require("../utils");
// Rename the original hook for internal use
function useOrgaAI(callbacks = {}) {
    const [userVideoStream, setUserVideoStream] = (0, react_1.useState)(null);
    const [userAudioStream, setUserAudioStream] = (0, react_1.useState)(null);
    const [aiAudioStream, setAiAudioStream] = (0, react_1.useState)(null);
    const [conversationItems, setConversationItems] = (0, react_1.useState)([]);
    const [connectionState, setConnectionState] = (0, react_1.useState)("closed");
    const [conversationId, setConversationId] = (0, react_1.useState)(null);
    const conversationIdRef = (0, react_1.useRef)(null);
    // const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    // const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const peerConnectionRef = (0, react_1.useRef)(null);
    const dataChannelRef = (0, react_1.useRef)(null);
    const currentConfigRef = (0, react_1.useRef)({});
    const audioTransceiverRef = (0, react_1.useRef)(null);
    const videoTransceiverRef = (0, react_1.useRef)(null);
    const [isCameraOn, setIsCameraOn] = (0, react_1.useState)(false);
    const [isMicOn, setIsMicOn] = (0, react_1.useState)(false);
    const [cameraPosition, setCameraPosition] = (0, react_1.useState)("front");
    const [model, setModel] = (0, react_1.useState)(null);
    const [voice, setVoice] = (0, react_1.useState)(null);
    const [temperature, setTemperature] = (0, react_1.useState)(null);
    const [instructions, setInstructions] = (0, react_1.useState)(null);
    const [modalities, setModalities] = (0, react_1.useState)([]);
    const { onSessionStart, onSessionEnd, onError, onConnectionStateChange, onSessionConnected, onConversationMessageCreated, } = callbacks;
    // Function to send updated parameters to the session
    const sendUpdatedParams = (0, react_1.useCallback)(() => {
        const dataChannel = dataChannelRef.current;
        if (!dataChannel || dataChannel.readyState !== "open") {
            utils_1.logger.warn("Cannot send updated params: data channel not open");
            return;
        }
        const payload = {
            event: types_1.DataChannelEventTypes.SESSION_UPDATE,
            data: {
                ...(model && { model: model }),
                ...(voice && { voice: voice }),
                ...(temperature !== null && { temperature: temperature }),
                ...(instructions && { instructions: instructions }),
                modalities: modalities,
            },
        };
        utils_1.logger.debug("📤 Sending updated parameters via data channel:", payload);
        utils_1.logger.info("⚙️ Sending updated parameters:", {
            model,
            voice,
            temperature,
        });
        dataChannel.send(JSON.stringify(payload));
    }, [model, voice, temperature, instructions, modalities]);
    // Parameter update function
    const updateParams = (0, react_1.useCallback)((params) => {
        utils_1.logger.debug("🔄 Updating parameters:", params);
        if (params.model !== undefined)
            setModel(params.model);
        if (params.voice !== undefined)
            setVoice(params.voice);
        if (params.temperature !== undefined)
            setTemperature(params.temperature);
        if (params.instructions !== undefined)
            setInstructions(params.instructions);
        if (params.modalities !== undefined) {
            setModalities(params.modalities);
        }
        if (connectionState === "connected") {
            sendUpdatedParams();
        }
    }, [connectionState, sendUpdatedParams]);
    // Initialize parameters from config when session starts
    const initializeParams = (0, react_1.useCallback)((config) => {
        utils_1.logger.debug("🔧 Initializing parameters from config:", config);
        const orgaConfig = OrgaAI_1.OrgaAI.getConfig();
        // Type-safe parameter initialization
        const model = config.model || orgaConfig.model;
        const voice = config.voice || orgaConfig.voice;
        const temperature = config.temperature || orgaConfig.temperature;
        const instructions = config.instructions || orgaConfig.instructions;
        const modalities = config.modalities || orgaConfig.modalities || [];
        setModel(model || null);
        setVoice(voice || null);
        setTemperature(temperature || null);
        setInstructions(instructions || null);
        setModalities(modalities);
    }, []);
    // Cleanup function
    const cleanup = (0, react_1.useCallback)(async () => {
        utils_1.logger.info("🧹 Cleaning up resources");
        utils_1.logger.debug("🔄 Stopping all media tracks and closing connections");
        try {
            // if (localStream) {
            //   localStream.getTracks().forEach((track) => track.stop());
            // }
            // if (videoStream) {
            //   videoStream.getTracks().forEach((track) => track.stop());
            // }
            // if (audioStream) {
            //   audioStream.getTracks().forEach((track) => track.stop());
            // }
            [userVideoStream, userAudioStream, aiAudioStream].forEach((stream) => {
                if (stream) {
                    stream.getTracks().forEach((track) => {
                        utils_1.logger.debug(`🛑 Stopping track: ${track.kind} (${track.id})`);
                        track.stop();
                        track.enabled = false;
                    });
                }
            });
            setUserVideoStream(null);
            setUserAudioStream(null);
            if (audioTransceiverRef.current) {
                utils_1.logger.debug("🔄 Detaching audio transceiver");
                await audioTransceiverRef.current.sender.replaceTrack(null);
            }
            if (videoTransceiverRef.current) {
                utils_1.logger.debug("🔄 Detaching video transceiver");
                await videoTransceiverRef.current.sender.replaceTrack(null);
            }
            if (peerConnectionRef.current) {
                utils_1.logger.debug("🔄 Closing peer connection");
                peerConnectionRef.current.close();
                peerConnectionRef.current = null;
            }
            if (dataChannelRef.current) {
                utils_1.logger.debug("🔄 Closing data channel");
                dataChannelRef.current.close();
                dataChannelRef.current = null;
            }
            setConversationId(null);
            // setRemoteStream(null);
            setConnectionState("closed");
            setIsCameraOn(false);
            setIsMicOn(false);
            setCameraPosition("front");
            // setVideoStream(null);
            // setAudioStream(null);
            react_native_incall_manager_1.default.stop();
        }
        catch (error) {
            utils_1.logger.error("❌ Error during cleanup:", error);
        }
    }, []);
    // Check permissions
    // const hasPermissions = useCallback(async (): Promise<boolean> => {
    //   if (Platform.OS === "android") {
    //     const cameraPermission = await PermissionsAndroid.check(
    //       PermissionsAndroid.PERMISSIONS.CAMERA
    //     );
    //     const microphonePermission = await PermissionsAndroid.check(
    //       PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
    //     );
    //     return cameraPermission && microphonePermission;
    //   }
    //   return true; // iOS permissions are handled by getUserMedia
    // }, []);
    // // Request permissions
    // const requestPermissions = useCallback(async (): Promise<void> => {
    //   logger.debug("Requesting permissions");
    //   if (Platform.OS === "android") {
    //     const grants = await PermissionsAndroid.requestMultiple([
    //       PermissionsAndroid.PERMISSIONS.CAMERA,
    //       PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    //     ]);
    //     const cameraGranted =
    //       grants[PermissionsAndroid.PERMISSIONS.CAMERA] === "granted";
    //     const microphoneGranted =
    //       grants[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] === "granted";
    //     if (!cameraGranted || !microphoneGranted) {
    //       throw new PermissionError(
    //         "Camera and microphone permissions are required"
    //       );
    //     }
    //   }
    // }, []);
    // Initialize media
    const initializeMedia = (0, react_1.useCallback)(async (config = {}) => {
        utils_1.logger.debug("🎬 Initializing media with config:", config);
        try {
            const constraints = (0, utils_1.getMediaConstraints)(config);
            const stream = await react_native_webrtc_1.mediaDevices.getUserMedia(constraints);
            utils_1.logger.info("🎬 Media initialized successfully");
            return stream;
        }
        catch (error) {
            utils_1.logger.error("Failed to initialize media:", error);
            throw new errors_1.PermissionError("Failed to access camera and microphone");
        }
    }, []);
    // Build peer connection
    const buildPeerConnection = (0, react_1.useCallback)(async (iceServers) => {
        utils_1.logger.debug("🔧 Building peer connection with ICE servers:", iceServers);
        const { voice, model } = OrgaAI_1.OrgaAI.getConfig();
        const pc = new react_native_webrtc_1.RTCPeerConnection({
            iceServers,
            iceTransportPolicy: "all",
            iceCandidatePoolSize: 0,
        });
        utils_1.logger.debug("🎤 Adding audio transceiver");
        // Start with sendrecv for immediate audio capture
        audioTransceiverRef.current = pc.addTransceiver("audio", {
            direction: "sendrecv",
        });
        utils_1.logger.debug("🎤 Audio transceiver:", audioTransceiverRef.current.direction);
        utils_1.logger.debug("📹 Adding video transceiver");
        videoTransceiverRef.current = pc.addTransceiver("video", {
            direction: "sendonly",
        });
        // Initialize audio stream for immediate capture
        const audioStream = await react_native_webrtc_1.mediaDevices.getUserMedia({
            audio: true,
            video: false,
        });
        const audioTrack = audioStream.getAudioTracks()[0];
        await audioTransceiverRef.current.sender.replaceTrack(audioTrack);
        audioTrack.enabled = true;
        setUserAudioStream(audioStream);
        setIsMicOn(true);
        setModalities(prev => {
            // Ensure we don't add duplicate audio modality
            const newModalities = Array.from(new Set([...prev, "audio"]));
            utils_1.logger.debug("🎤 Updated modalities for mic enable:", newModalities);
            return newModalities;
        });
        // Video track starts null - will be enabled on user action
        await videoTransceiverRef.current.sender.replaceTrack(null);
        utils_1.logger.debug("📡 Creating data channel");
        const dc = pc.createDataChannel("orga-realtime-client-events");
        dataChannelRef.current = dc;
        dc.addEventListener("open", () => {
            utils_1.logger.info("📡 Data channel opened");
        });
        dc.addEventListener("message", (event) => {
            try {
                const dataChannelEvent = JSON.parse(event.data);
                utils_1.logger.debug("📨 Data channel message received:", dataChannelEvent.event);
                if (dataChannelEvent.event ===
                    types_1.DataChannelEventTypes.USER_SPEECH_TRANSCRIPTION) {
                    const currentConversationId = conversationIdRef.current || conversationId;
                    utils_1.logger.debug("🎤 Processing user speech transcription");
                    if (currentConversationId) {
                        const conversationItem = {
                            conversationId: currentConversationId,
                            sender: "user",
                            content: {
                                type: "text",
                                message: dataChannelEvent.message || "",
                            },
                            modelVersion: model,
                        };
                        utils_1.logger.debug("💬 Creating user conversation item:", conversationItem);
                        setConversationItems((prev) => [...prev, conversationItem]);
                        onConversationMessageCreated?.(conversationItem);
                    }
                }
                if (dataChannelEvent.event ===
                    types_1.DataChannelEventTypes.ASSISTANT_RESPONSE_COMPLETE) {
                    const currentConversationId = conversationIdRef.current || conversationId;
                    utils_1.logger.debug("🤖 Processing assistant response");
                    if (currentConversationId) {
                        const conversationItem = {
                            conversationId: currentConversationId,
                            sender: "assistant",
                            content: {
                                type: "text",
                                message: dataChannelEvent.message || "",
                            },
                            voiceType: voice,
                            modelVersion: model,
                            timestamp: new Date().toISOString(),
                        };
                        utils_1.logger.debug("💬 Creating assistant conversation item:", conversationItem);
                        setConversationItems((prev) => [...prev, conversationItem]);
                        onConversationMessageCreated?.(conversationItem);
                    }
                }
            }
            catch (error) {
                utils_1.logger.error("❌ Error parsing data channel message:", error);
                onError?.(new Error(`Failed to parse data channel message: ${error}`));
            }
        });
        dc.addEventListener("close", () => {
            utils_1.logger.info("📡 Data channel closed");
        });
        pc.addEventListener("track", (event) => {
            const trackEvent = event;
            if (trackEvent.track.kind === "audio") {
                trackEvent.track.enabled = true;
                utils_1.logger.debug("🎵 Audio track received:", {
                    id: trackEvent.track.id,
                    enabled: trackEvent.track.enabled,
                    muted: trackEvent.track.muted,
                    readyState: trackEvent.track.readyState,
                });
                utils_1.logger.info("🎵 AI audio track received");
                trackEvent.track.addEventListener("unmute", () => {
                    utils_1.logger.debug("🎵 Audio track unmuted");
                });
                trackEvent.track.addEventListener("mute", () => {
                    utils_1.logger.debug("🔇 Audio track muted");
                });
                trackEvent.track.addEventListener("ended", () => {
                    utils_1.logger.debug("🔇 Audio track ended");
                });
                setAiAudioStream(event.streams[0]); // TODO: Review if needed with RN
            }
        });
        return pc;
    }, []);
    // Helper to gather ICE candidates
    const gatherIceCandidates = (pc) => {
        return new Promise((resolve) => {
            const candidates = [];
            const onIceCandidate = (event) => {
                if (event.candidate) {
                    utils_1.logger.debug("🧊 ICE candidate gathered:", event.candidate.candidate);
                    candidates.push({
                        candidate: event.candidate.candidate,
                        sdpMid: event.candidate.sdpMid ?? undefined,
                        sdpMLineIndex: event.candidate.sdpMLineIndex ?? undefined,
                    });
                }
                else if (pc.iceGatheringState === "complete") {
                    utils_1.logger.info("🧊 ICE gathering complete");
                    utils_1.logger.debug("🧊 Total ICE candidates gathered:", candidates.length);
                    pc.removeEventListener("icecandidate", onIceCandidate);
                    resolve(candidates);
                }
            };
            pc.addEventListener("icecandidate", onIceCandidate);
            setTimeout(() => {
                pc.removeEventListener("icecandidate", onIceCandidate);
                resolve(candidates);
            }, 5000);
        });
    };
    // Connect to backend
    const connect = (0, react_1.useCallback)(async () => {
        utils_1.logger.info("🌐 Connecting to OrgaAI backend...");
        try {
            const config = OrgaAI_1.OrgaAI.getConfig();
            const fetchFn = config.fetchEphemeralTokenAndIceServers;
            if (!fetchFn) {
                throw new Error("fetchEphemeralTokenAndIceServers is not defined");
            }
            utils_1.logger.debug("🔑 Fetching ephemeral token and ICE servers");
            const { ephemeralToken, iceServers } = await fetchFn();
            const pc = await buildPeerConnection(iceServers);
            peerConnectionRef.current = pc;
            utils_1.logger.debug("📝 Creating offer");
            const offer = await pc.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: false,
            });
            await pc.setLocalDescription(offer);
            utils_1.logger.debug("🧊 Gathering ICE candidates");
            const gathered = await gatherIceCandidates(pc);
            utils_1.logger.debug("📤 Sending offer to backend");
            const { answer, conversation_id } = await (0, utils_1.connectToRealtime)({
                ephemeralToken,
                peerConnection: pc,
                gathered,
            });
            if (!answer || !conversation_id) {
                throw new Error("Failed to connect to backend");
            }
            utils_1.logger.info("🆔 Conversation ID:", conversation_id);
            setConversationId(conversation_id);
            conversationIdRef.current = conversation_id;
            utils_1.logger.debug("📥 Setting remote description");
            await pc.setRemoteDescription(new react_native_webrtc_1.RTCSessionDescription({
                sdp: answer.sdp,
                type: answer.type,
            }));
            setConnectionState("connected");
            pc.addEventListener("connectionstatechange", (event) => {
                const newState = event.target.connectionState;
                utils_1.logger.debug("🔄 Connection state changed:", newState);
                utils_1.logger.info("🔄 Connection state:", newState);
                setConnectionState(newState);
                if (newState === "connected") {
                    onSessionConnected?.();
                }
                else if (newState === "failed" || newState === "disconnected") {
                    utils_1.logger.warn("⚠️ Connection lost, cleaning up...");
                    cleanup();
                }
                onConnectionStateChange?.(newState);
            });
            pc.addEventListener("iceconnectionstatechange", () => {
                const iceState = pc.iceConnectionState;
                utils_1.logger.debug("🧊 ICE connection state:", iceState);
                if (iceState === "failed" || iceState === "disconnected") {
                    utils_1.logger.warn("⚠️ ICE connection failed");
                }
            });
            onSessionStart?.();
            react_native_incall_manager_1.default.start({ media: "video" });
        }
        catch (error) {
            // Improve error message for better debugging
            let errorMessage = "Failed to connect";
            if (error instanceof Error) {
                if (error.message.includes('JSON') && error.message.includes('Unexpected character')) {
                    errorMessage = "Failed to connect: The server returned HTML instead of JSON. Please check your endpoint configuration.";
                }
                else if (error.message.includes('fetch')) {
                    errorMessage = `Failed to connect: Network error - ${error.message}`;
                }
                else {
                    errorMessage = `Failed to connect: ${error.message}`;
                }
            }
            utils_1.logger.error("❌", errorMessage, error);
            setConnectionState("failed");
            setConversationId(null);
            onError?.(error);
            throw error;
        }
    }, [buildPeerConnection, onSessionStart, onError]);
    // Start session
    const startSession = (0, react_1.useCallback)(async (config = {}) => {
        utils_1.logger.info("🚀 Starting OrgaAI session...");
        utils_1.logger.debug("📋 Session config:", config);
        try {
            if (!OrgaAI_1.OrgaAI.isInitialized()) {
                throw new errors_1.ConfigurationError("OrgaAI must be initialized before starting a session");
            }
            if (connectionState !== "closed") {
                throw new errors_1.SessionError("Session is already active");
            }
            // Extract callbacks from config and merge with existing callbacks
            const sessionCallbacks = {
                onSessionStart: config.onSessionStart || callbacks.onSessionStart,
                onSessionEnd: config.onSessionEnd || callbacks.onSessionEnd,
                onError: config.onError || callbacks.onError,
                onConnectionStateChange: config.onConnectionStateChange || callbacks.onConnectionStateChange,
                onSessionConnected: config.onSessionConnected || callbacks.onSessionConnected,
                onConversationMessageCreated: config.onConversationMessageCreated ||
                    callbacks.onConversationMessageCreated,
            };
            Object.assign(callbacks, sessionCallbacks);
            currentConfigRef.current = config;
            setConnectionState("connecting");
            setConversationItems([]);
            initializeParams(config);
            // await requestPermissions(); //TODO: Add permissions check
            // Removed initializeMedia call - media streams will be created when user enables camera/mic
            await connect();
        }
        catch (error) {
            // Improve error message for better debugging
            let errorMessage = "Failed to start session";
            if (error instanceof Error) {
                if (error.message.includes('JSON') && error.message.includes('Unexpected character')) {
                    errorMessage = "Failed to start session: The server returned HTML instead of JSON. Please check your endpoint configuration.";
                }
                else if (error.message.includes('fetch')) {
                    errorMessage = `Failed to start session: Network error - ${error.message}`;
                }
                else {
                    errorMessage = `Failed to start session: ${error.message}`;
                }
            }
            utils_1.logger.error("❌", errorMessage, error);
            setConnectionState("failed");
            onError?.(error);
            throw new errors_1.ConnectionError("Failed to start session");
        }
    }, [
        connectionState,
        connect,
        onError,
        callbacks,
        initializeParams, //Needed ?
        // requestPermissions,
    ]);
    // End session
    const endSession = (0, react_1.useCallback)(async () => {
        utils_1.logger.info("🔚 Ending session");
        try {
            if (userVideoStream) {
                utils_1.logger.debug("🛑 Stopping video stream tracks");
                userVideoStream.getTracks().forEach((track) => {
                    track.stop();
                });
                setUserVideoStream(null);
            }
            if (userAudioStream) {
                utils_1.logger.debug("🛑 Stopping audio stream tracks");
                userAudioStream.getTracks().forEach((track) => {
                    track.stop();
                });
                setUserAudioStream(null);
            }
            await cleanup();
            setConnectionState("closed");
            onSessionEnd?.();
        }
        catch (error) {
            utils_1.logger.error("❌ Error ending session:", error);
            onError?.(error);
        }
    }, [userVideoStream, userAudioStream, cleanup, onSessionEnd, onError]);
    // Mic Controls
    const enableMic = (0, react_1.useCallback)(async () => {
        utils_1.logger.info("🎤 Enabling microphone");
        utils_1.logger.debug("🔄 Requesting microphone permissions");
        if (userAudioStream) {
            utils_1.logger.debug("🛑 Stopping previous audio stream");
            userAudioStream.getTracks().forEach((track) => {
                track.stop();
            });
            setUserAudioStream(null);
        }
        const stream = await react_native_webrtc_1.mediaDevices.getUserMedia({
            audio: true,
            video: false,
        });
        utils_1.logger.debug("✅ Microphone stream obtained:", stream.getTracks().map((t) => ({ id: t.id, kind: t.kind })));
        setUserAudioStream(stream);
        setIsMicOn(true);
        setModalities(prev => {
            const newModalities = prev.includes("audio") ? prev : [...prev, "audio"];
            utils_1.logger.debug("🎤 Updated modalities for mic enable:", newModalities);
            return newModalities;
        });
        if (connectionState === "connected") {
            sendUpdatedParams();
        }
        if (audioTransceiverRef.current) {
            const audioTrack = stream.getAudioTracks()[0];
            utils_1.logger.debug("🔄 Replacing audio sender track:", audioTrack.id);
            await audioTransceiverRef.current.sender.replaceTrack(audioTrack);
            audioTrack.enabled = true;
        }
        utils_1.logger.info("✅ Microphone enabled");
    }, [userAudioStream, connectionState, sendUpdatedParams]);
    const disableMic = (0, react_1.useCallback)(async (hardDisable = false) => {
        utils_1.logger.info("🎤 Disabling microphone");
        utils_1.logger.debug("🔄 Disabling mic with hardDisable:", hardDisable);
        if (userAudioStream) {
            if (hardDisable) {
                utils_1.logger.debug("🛑 Hard disabling - stopping audio tracks");
                userAudioStream.getTracks().forEach((track) => {
                    track.stop();
                });
                setUserAudioStream(null);
                if (audioTransceiverRef.current) {
                    utils_1.logger.debug("🔄 Replacing audio sender with null track");
                    await audioTransceiverRef.current.sender.replaceTrack(null);
                }
            }
            else {
                utils_1.logger.debug("🔄 Soft disabling - disabling audio tracks");
                userAudioStream.getAudioTracks().forEach((track) => (track.enabled = false));
                // Also remove track from transceiver for soft disable
                if (audioTransceiverRef.current) {
                    utils_1.logger.debug("🔄 Replacing audio sender with null track for soft disable");
                    await audioTransceiverRef.current.sender.replaceTrack(null);
                }
            }
        }
        setIsMicOn(false);
        setModalities(prev => {
            const newModalities = prev.filter(modality => modality !== "audio");
            utils_1.logger.debug("🎤 Updated modalities for mic disable:", newModalities);
            return newModalities;
        });
        if (connectionState === "connected") {
            sendUpdatedParams();
        }
        utils_1.logger.info("✅ Microphone disabled");
    }, [userAudioStream, connectionState, sendUpdatedParams]);
    const toggleMic = (0, react_1.useCallback)(async () => {
        utils_1.logger.debug("🔄 Toggling microphone, current state:", isMicOn);
        if (isMicOn) {
            await disableMic(true);
        }
        else {
            await enableMic();
        }
    }, [isMicOn, enableMic, disableMic]);
    // Camera Controls
    const enableCamera = (0, react_1.useCallback)(async () => {
        utils_1.logger.info("📹 Enabling camera");
        utils_1.logger.debug("🔄 Requesting camera permissions");
        try {
            if (userVideoStream) {
                utils_1.logger.debug("🛑 Stopping previous video stream");
                userVideoStream.getTracks().forEach((track) => {
                    track.stop();
                });
                setUserVideoStream(null);
            }
            const sessionConfig = currentConfigRef.current;
            const globalConfig = OrgaAI_1.OrgaAI.getConfig();
            const config = {
                ...globalConfig,
                ...sessionConfig, //Override global config with session config
                facingMode: (cameraPosition === "front" ? "user" : "environment"), // Use current camera position
            };
            const constraints = (0, utils_1.getMediaConstraints)(config);
            utils_1.logger.debug("📹 Camera constraints:", constraints);
            const stream = await react_native_webrtc_1.mediaDevices.getUserMedia(constraints);
            utils_1.logger.debug("✅ Camera stream obtained:", stream.getTracks().map(t => ({ id: t.id, kind: t.kind })));
            setUserVideoStream(stream);
            setIsCameraOn(true);
            setModalities(prev => {
                // Ensure we don't add duplicate video modality
                const newModalities = Array.from(new Set([...prev, "video"]));
                utils_1.logger.debug("📹 Updated modalities for camera enable:", newModalities);
                return newModalities;
            });
            if (connectionState === "connected") {
                sendUpdatedParams();
            }
            if (videoTransceiverRef.current) {
                const videoTrack = stream.getVideoTracks()[0];
                utils_1.logger.debug("🔄 Replacing video sender track:", videoTrack.id);
                await videoTransceiverRef.current.sender.replaceTrack(videoTrack);
                videoTrack.enabled = true;
            }
            utils_1.logger.info("✅ Camera enabled");
        }
        catch (error) {
            utils_1.logger.error("❌ Failed to enable camera:", error);
            throw error;
        }
    }, [userVideoStream, connectionState, sendUpdatedParams]);
    const disableCamera = (0, react_1.useCallback)(async (hardDisable = false) => {
        utils_1.logger.info("📹 Disabling camera");
        utils_1.logger.debug("🔄 Disabling camera with hardDisable:", hardDisable);
        if (userVideoStream) {
            if (hardDisable) {
                utils_1.logger.debug("🛑 Hard disabling - stopping video tracks");
                userVideoStream.getTracks().forEach((track) => {
                    track.stop();
                });
                setUserVideoStream(null);
                if (videoTransceiverRef.current) {
                    utils_1.logger.debug("🔄 Replacing video sender with null track");
                    await videoTransceiverRef.current.sender.replaceTrack(null);
                }
            }
            else {
                utils_1.logger.debug("🔄 Soft disabling - disabling video tracks");
                userVideoStream.getVideoTracks().forEach((track) => (track.enabled = false));
                // Also remove track from transceiver for soft disable
                if (videoTransceiverRef.current) {
                    utils_1.logger.debug("🔄 Replacing video sender with null track for soft disable");
                    await videoTransceiverRef.current.sender.replaceTrack(null);
                }
            }
        }
        setIsCameraOn(false);
        setModalities(prev => {
            const newModalities = prev.filter(modality => modality !== "video");
            utils_1.logger.debug("📹 Updated modalities for camera disable:", newModalities);
            return newModalities;
        });
        if (connectionState === "connected") {
            sendUpdatedParams();
        }
        utils_1.logger.info("✅ Camera disabled");
    }, [userVideoStream, connectionState, sendUpdatedParams]);
    const toggleCamera = (0, react_1.useCallback)(async () => {
        utils_1.logger.debug("🔄 Toggling camera, current state:", isCameraOn);
        if (isCameraOn) {
            await disableCamera(true);
        }
        else {
            await enableCamera();
        }
    }, [isCameraOn, enableCamera, disableCamera]);
    const updateVideoStream = (0, react_1.useCallback)(async (newPosition) => {
        utils_1.logger.info("📹 Updating video stream with constraints:", newPosition);
        if (userVideoStream) {
            utils_1.logger.debug("🛑 Stopping previous video stream");
            userVideoStream.getTracks().forEach((track) => {
                track.stop();
            });
            setUserVideoStream(null);
        }
        const sessionConfig = currentConfigRef.current;
        const globalConfig = OrgaAI_1.OrgaAI.getConfig();
        const config = {
            ...globalConfig,
            ...sessionConfig, //Override global config with session config
            facingMode: (newPosition === "front" ? "user" : "environment"), // Map camera position to facingMode
        };
        const constraints = (0, utils_1.getMediaConstraints)(config);
        utils_1.logger.debug("📹 Camera constraints:", constraints);
        try {
            const newStream = await react_native_webrtc_1.mediaDevices.getUserMedia(constraints);
            utils_1.logger.debug("✅ Camera stream obtained:", newStream.getTracks().map(t => ({ id: t.id, kind: t.kind })));
            setUserVideoStream(newStream);
            // Replace track in peer connection
            if (videoTransceiverRef.current && newStream) {
                const videoTrack = newStream.getVideoTracks()[0];
                await videoTransceiverRef.current.sender.replaceTrack(videoTrack);
                videoTrack.enabled = true;
            }
            // setVideoStream(newStream);
        }
        catch (error) {
            utils_1.logger.error("❌ Error updating video stream:", error);
            throw error;
        }
    }, [userVideoStream, videoTransceiverRef]);
    const flipCamera = (0, react_1.useCallback)(async () => {
        utils_1.logger.info("🔄 Flipping camera");
        if (!isCameraOn) {
            utils_1.logger.warn("🔄 Camera is not enabled");
            return;
        }
        const newPosition = cameraPosition === "front" ? "back" : "front";
        utils_1.logger.info("🔄 Flipping camera from", cameraPosition, "to", newPosition);
        try {
            await updateVideoStream(newPosition);
            setCameraPosition(newPosition);
            utils_1.logger.info("✅ Camera flipped to:", newPosition);
        }
        catch (error) {
            utils_1.logger.error("❌ Failed to flip camera:", error);
            throw error;
        }
    }, [isCameraOn, cameraPosition, updateVideoStream]);
    // Cleanup on unmount
    (0, react_1.useEffect)(() => {
        utils_1.logger.debug("🔄 Component unmounting, calling cleanup");
        return () => {
            cleanup();
        };
    }, [cleanup]);
    return {
        // Session management
        startSession,
        endSession,
        // Media controls
        enableMic,
        disableMic,
        toggleMic,
        enableCamera,
        disableCamera,
        toggleCamera,
        flipCamera,
        // Manual control methods
        // requestPermissions,
        // State
        connectionState,
        aiAudioStream,
        userVideoStream,
        conversationItems,
        isCameraOn,
        isMicOn,
        cameraPosition,
        conversationId,
        // localStream,
        // remoteStream,
        // transcriptions,
        // videoStream,
        // audioStream,
        // Utilities
        // hasPermissions,
        // Parameter management
        model,
        voice,
        temperature,
        instructions,
        modalities,
        updateParams,
        // currentVoice,
        // currentTemperature,
        // currentInstructions,
        // currentModalities,
        // isAudioEnabled,
        // isVideoEnabled,
        // updateModel,
        // updateVoice,
        // updateTemperature,
        // updateInstructions,
        // updateModalities,
        // initializeParams,
        // sendUpdatedParams,
    };
}
