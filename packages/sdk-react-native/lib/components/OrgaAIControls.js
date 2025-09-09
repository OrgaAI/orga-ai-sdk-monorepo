"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrgaAIControls = void 0;
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const DefaultMicOn = () => (react_1.default.createElement(react_native_1.Text, { style: { fontSize: 24, color: "white" } }, "\uD83C\uDFA4"));
const DefaultMicOff = () => (react_1.default.createElement(react_native_1.Text, { style: { fontSize: 24, color: "white" } }, "\uD83D\uDD07"));
const DefaultCameraOn = () => (react_1.default.createElement(react_native_1.Text, { style: { fontSize: 24, color: "white" } }, "\uD83D\uDCF9"));
const DefaultCameraOff = () => (react_1.default.createElement(react_native_1.Text, { style: { fontSize: 24, color: "white" } }, "\uD83D\uDCF7"));
const OrgaAIControls = ({ connectionState, isCameraOn, isMicOn, onStartSession, onEndSession, onToggleCamera, onToggleMic, onFlipCamera, containerStyle, controlsOverlayStyle, controlButtonStyle, controlLabelStyle, connectButtonStyle, disconnectButtonStyle, cameraOnIcon, cameraOffIcon, micOnIcon, micOffIcon, flipIcon, endIcon, startIcon, startButtonText, connectingText = "Connecting...", disconnectText = "Disconnect", cameraOnText = "Camera On", cameraOffText = "Camera Off", micOnText = "Mic On", micOffText = "Mic Off", flipText = "Flip", endText = "End", connectSubtext = "Tap to begin AI conversation", showCameraControl = true, showMicControl = true, showFlipCameraControl = true, showEndSessionControl = true, loadingIndicator, loadingIndicatorColor = "white", }) => {
    const isConnected = connectionState === "connected";
    const isConnecting = connectionState === "connecting";
    const getButtonText = () => {
        if (isConnected) {
            return disconnectText;
        }
        else if (isConnecting) {
            return connectingText;
        }
        else {
            return startButtonText || "Start Conversation";
        }
    };
    const ConnectingIndicator = () => (react_1.default.createElement(react_native_1.View, { style: styles.connectingContainer },
        loadingIndicator || (react_1.default.createElement(react_native_1.ActivityIndicator, { size: "small", color: loadingIndicatorColor })),
        react_1.default.createElement(react_native_1.Text, { style: [styles.connectingText] }, connectingText)));
    return (react_1.default.createElement(react_native_1.View, { style: [styles.container, containerStyle] }, isConnected ? (react_1.default.createElement(react_native_1.View, { style: [
            styles.controlsOverlay,
            !isCameraOn && { backgroundColor: "rgba(200, 200, 200, 0.2)" },
            controlsOverlayStyle,
        ] },
        showCameraControl && (react_1.default.createElement(react_native_1.TouchableOpacity, { onPress: onToggleCamera, style: [styles.controlButton, controlButtonStyle] },
            isCameraOn
                ? cameraOnIcon || react_1.default.createElement(DefaultCameraOn, null)
                : cameraOffIcon || react_1.default.createElement(DefaultCameraOff, null),
            react_1.default.createElement(react_native_1.Text, { style: [styles.controlLabel, controlLabelStyle] }, isCameraOn ? cameraOnText : cameraOffText))),
        showMicControl && (react_1.default.createElement(react_native_1.TouchableOpacity, { onPress: onToggleMic, style: [styles.controlButton, controlButtonStyle] },
            isMicOn
                ? micOnIcon || react_1.default.createElement(DefaultMicOn, null)
                : micOffIcon || react_1.default.createElement(DefaultMicOff, null),
            react_1.default.createElement(react_native_1.Text, { style: [styles.controlLabel, controlLabelStyle] }, isMicOn ? micOnText : micOffText))),
        showFlipCameraControl && (react_1.default.createElement(react_native_1.TouchableOpacity, { onPress: onFlipCamera, style: [styles.controlButton, controlButtonStyle] },
            flipIcon || (react_1.default.createElement(react_native_1.Text, { style: { fontSize: 24, color: "white" } }, "\uD83D\uDD04")),
            react_1.default.createElement(react_native_1.Text, { style: [styles.controlLabel, controlLabelStyle] }, flipText))),
        showEndSessionControl && (react_1.default.createElement(react_native_1.TouchableOpacity, { onPress: onEndSession, style: [
                styles.controlButton,
                styles.disconnectButton,
                controlButtonStyle,
                disconnectButtonStyle,
            ] },
            endIcon || (react_1.default.createElement(react_native_1.Text, { style: { fontSize: 24, color: "white" } }, "\u274C")),
            react_1.default.createElement(react_native_1.Text, { style: [styles.controlLabel, controlLabelStyle] }, endText))))) : (react_1.default.createElement(react_native_1.TouchableOpacity, { style: [
            styles.connectContainer,
            connectionState === "connecting" &&
                styles.connectingButtonContainer,
            connectButtonStyle,
        ], onPress: () => connectionState === "connecting" ? null : onStartSession(), disabled: connectionState === "connecting" }, connectionState === "connecting" ? (react_1.default.createElement(ConnectingIndicator, null)) : (react_1.default.createElement(react_native_1.View, { style: styles.connectContent },
        react_1.default.createElement(react_native_1.View, { style: styles.connectIconContainer }, startIcon || (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(react_native_1.Text, { style: { fontSize: 28, color: "white" } }, "\uD83C\uDFA4"),
            react_1.default.createElement(react_native_1.Text, { style: [
                    styles.connectPlusIcon,
                    { fontSize: 16, color: "white" },
                ] }, "\u2795")))),
        react_1.default.createElement(react_native_1.Text, { style: styles.connectText }, getButtonText()),
        react_1.default.createElement(react_native_1.Text, { style: styles.connectSubtext }, connectSubtext)))))));
};
exports.OrgaAIControls = OrgaAIControls;
const styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: 16,
    },
    controlsOverlay: {
        position: "absolute",
        bottom: 50,
        width: "100%",
        flexDirection: "row",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        justifyContent: "space-around",
        alignItems: "center",
        borderRadius: 16,
        padding: 16,
    },
    controlButton: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    controlLabel: {
        color: "white",
        fontSize: 10,
        marginTop: 4,
        textAlign: "center",
    },
    disconnectButton: {
        backgroundColor: "rgba(239, 68, 68, 0.8)",
    },
    connectContainer: {
        position: "absolute",
        bottom: 50,
        width: "100%",
        backgroundColor: "#3b82f6",
        padding: 20,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    connectingButtonContainer: {
        backgroundColor: "#64748b",
    },
    connectContent: {
        alignItems: "center",
        justifyContent: "center",
    },
    connectIconContainer: {
        position: "relative",
        marginBottom: 8,
    },
    connectPlusIcon: {
        position: "absolute",
        bottom: -2,
        right: -2,
        backgroundColor: "#3b82f6",
        borderRadius: 8,
    },
    connectText: {
        color: "white",
        textAlign: "center",
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 4,
    },
    connectSubtext: {
        color: "rgba(255, 255, 255, 0.8)",
        textAlign: "center",
        fontSize: 14,
    },
    connectingContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
    },
    connectingText: {
        color: "white",
        textAlign: "center",
        fontSize: 16,
        fontWeight: "600",
    },
});
