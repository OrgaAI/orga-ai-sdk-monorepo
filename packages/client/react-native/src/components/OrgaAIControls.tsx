import React from "react";
import {
  StyleProp,
  View,
  ViewStyle,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  TextStyle,
} from "react-native";
import { ConnectionState } from "../types/index";

// Cast to any when passing to RN View/TouchableOpacity to avoid React 19 vs RN @types/react ReactNode conflict
const rn = (node: React.ReactNode) => node as any;

const DefaultMicOn = () => (
  <Text style={{ fontSize: 24, color: "white" }}>🎤</Text>
);
const DefaultMicOff = () => (
  <Text style={{ fontSize: 24, color: "white" }}>🔇</Text>
);
const DefaultCameraOn = () => (
  <Text style={{ fontSize: 24, color: "white" }}>📹</Text>
);
const DefaultCameraOff = () => (
  <Text style={{ fontSize: 24, color: "white" }}>📷</Text>
);

export interface OrgaAIControlsProps {
  // Required props from useOrgaAI
  connectionState: ConnectionState;
  isCameraOn: boolean;
  isMicOn: boolean;

  // Control functions
  onStartSession: () => void;
  onEndSession: () => void;
  onToggleCamera: () => void;
  onToggleMic: () => void;
  onFlipCamera: () => void;

  // Basic customization
  containerStyle?: StyleProp<ViewStyle>;

  // Styling customization
  controlsOverlayStyle?: StyleProp<ViewStyle>;
  controlButtonStyle?: StyleProp<ViewStyle>;
  controlLabelStyle?: StyleProp<TextStyle>; //TODO: check if this is TextStyle and not ViewStyle
  connectButtonStyle?: StyleProp<ViewStyle>;
  disconnectButtonStyle?: StyleProp<ViewStyle>;

  // Icon customization
  cameraOnIcon?: React.ReactNode;
  cameraOffIcon?: React.ReactNode;
  micOnIcon?: React.ReactNode;
  micOffIcon?: React.ReactNode;
  flipIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  startIcon?: React.ReactNode;

  // Text customization
  startButtonText?: string;
  connectingText?: string;
  disconnectText?: string;
  cameraOnText?: string;
  cameraOffText?: string;
  micOnText?: string;
  micOffText?: string;
  flipText?: string;
  endText?: string;
  connectSubtext?: string;

  // Control visibility
  showCameraControl?: boolean;
  showMicControl?: boolean;
  showFlipCameraControl?: boolean;
  showEndSessionControl?: boolean;

  // Loading customization
  loadingIndicator?: React.ReactNode;
  loadingIndicatorColor?: string;
}

export const OrgaAIControls = ({
  connectionState,
  isCameraOn,
  isMicOn,
  onStartSession,
  onEndSession,
  onToggleCamera,
  onToggleMic,
  onFlipCamera,

  containerStyle,

  controlsOverlayStyle,
  controlButtonStyle,
  controlLabelStyle,
  connectButtonStyle,
  disconnectButtonStyle,

  cameraOnIcon,
  cameraOffIcon,
  micOnIcon,
  micOffIcon,
  flipIcon,
  endIcon,
  startIcon,

  startButtonText,
  connectingText = "Connecting...",
  disconnectText = "Disconnect",
  cameraOnText = "Camera On",
  cameraOffText = "Camera Off",
  micOnText = "Mic On",
  micOffText = "Mic Off",
  flipText = "Flip",
  endText = "End",
  connectSubtext = "Tap to begin AI conversation",

  showCameraControl = true,
  showMicControl = true,
  showFlipCameraControl = true,
  showEndSessionControl = true,

  loadingIndicator,
  loadingIndicatorColor = "white",
}: OrgaAIControlsProps) => {
  const isConnected = connectionState === "connected";
  const isConnecting = connectionState === "connecting";

  const getButtonText = () => {
    if (isConnected) {
      return disconnectText;
    } else if (isConnecting) {
      return connectingText;
    } else {
      return startButtonText || "Start Conversation";
    }
  };

  const ConnectingIndicator = () => (
    <View style={styles.connectingContainer}>
      {rn(loadingIndicator ?? (
        <ActivityIndicator size="small" color={loadingIndicatorColor} />
      ))}
      <Text style={[styles.connectingText]}>{connectingText}</Text>
    </View>
  );

  return (
    <View style={[styles.container, containerStyle]}>
      {isConnected ? (
        <View
          style={[
            styles.controlsOverlay,
            !isCameraOn && { backgroundColor: "rgba(200, 200, 200, 0.2)" },
            controlsOverlayStyle,
          ]}
        >
          {/* Camera Control */}
          {showCameraControl && (
            <TouchableOpacity
              onPress={onToggleCamera}
              style={[styles.controlButton, controlButtonStyle]}
            >
              {rn(isCameraOn
                ? cameraOnIcon ?? <DefaultCameraOn />
                : cameraOffIcon ?? <DefaultCameraOff />)}
              <Text style={[styles.controlLabel, controlLabelStyle]}>
                {isCameraOn ? cameraOnText : cameraOffText}
              </Text>
            </TouchableOpacity>
          )}

          {/* Microphone Control */}
          {showMicControl && (
            <TouchableOpacity
              onPress={onToggleMic}
              style={[styles.controlButton, controlButtonStyle]}
            >
              {rn(isMicOn
                ? micOnIcon ?? <DefaultMicOn />
                : micOffIcon ?? <DefaultMicOff />)}
              <Text style={[styles.controlLabel, controlLabelStyle]}>
                {isMicOn ? micOnText : micOffText}
              </Text>
            </TouchableOpacity>
          )}

          {/* Flip Camera */}
          {showFlipCameraControl && (
            <TouchableOpacity
              onPress={onFlipCamera}
              style={[styles.controlButton, controlButtonStyle]}
            >
              {rn(flipIcon ?? (
                <Text style={{ fontSize: 24, color: "white" }}>🔄</Text>
              ))}
              <Text style={[styles.controlLabel, controlLabelStyle]}>
                {flipText}
              </Text>
            </TouchableOpacity>
          )}

          {/* Disconnect */}
          {showEndSessionControl && (
            <TouchableOpacity
              onPress={onEndSession}
              style={[
                styles.controlButton,
                styles.disconnectButton,
                controlButtonStyle,
                disconnectButtonStyle,
              ]}
            >
              {rn(endIcon ?? (
                <Text style={{ fontSize: 24, color: "white" }}>❌</Text>
              ))}
              <Text style={[styles.controlLabel, controlLabelStyle]}>
                {endText}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <TouchableOpacity
          style={[
            styles.connectContainer,
            connectionState === "connecting" &&
              styles.connectingButtonContainer,
            connectButtonStyle,
          ]}
          onPress={() =>
            connectionState === "connecting" ? null : onStartSession()
          }
          disabled={connectionState === "connecting"}
        >
          {connectionState === "connecting" ? (
            <ConnectingIndicator />
          ) : (
            <View style={styles.connectContent}>
              <View style={styles.connectIconContainer}>
                {rn(startIcon ?? (
                  <>
                    <Text style={{ fontSize: 28, color: "white" }}>🎤</Text>
                    <Text
                      style={[
                        styles.connectPlusIcon,
                        { fontSize: 16, color: "white" },
                      ]}
                    >
                      ➕
                    </Text>
                  </>
                ))}
              </View>
              <Text style={styles.connectText}>{getButtonText()}</Text>
              <Text style={styles.connectSubtext}>{connectSubtext}</Text>
            </View>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
