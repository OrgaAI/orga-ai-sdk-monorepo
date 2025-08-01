import { Ionicons } from "@expo/vector-icons";
import { useOrgaAIContext } from "@orga-ai/sdk-react-native";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CameraOff, CameraOn, MicOff, MicOn } from "./ui/ControlIcons";

const OrgaControls = () => {
  const {
    connectionState,
    startSession,
    endSession,
    toggleCamera,
    toggleMic,
    isMicOn,
    isCameraOn,
    flipCamera,
    conversationItems,
  } = useOrgaAIContext();

  const ConnectingWithOrga = () => {
    return (
      <View style={styles.connectingWithOrgaContainer}>
        <ActivityIndicator size="small" color="white" />
        <Text style={styles.connectingWithOrgaText}>Connecting...</Text>
      </View>
    );
  };

  const handleSessionStart = () => {
    startSession({
      onConnectionStateChange: (state) => {
        console.log("connectionState", state);
      },
      onConversationMessageCreated(message) {
        console.log("conversationMessageCreated", message);
      },
      onUserSpeechTranscription: (transcription) => {
        console.log("transcription", transcription);
      },
      onUserSpeechComplete: (transcription) => {
        console.log("transcriptionInputCompleted", transcription);
      },
      onAssistantResponseComplete: (response) => {
        console.log("responseOutputDone", response);
      },
    });
  };

  const getButtonText = () => {
    if (connectionState === "connected") {
      return "Disconnect";
    } else if (connectionState === "connecting") {
      return "Connecting...";
    } else {
      return "Start Conversation";
    }
  };

  const isConnected = connectionState === "connected";

  return (
    <View style={styles.controlsContainer}>
      {isConnected ? (
        <View
          style={[
            styles.controlsOverlay,
            !isCameraOn && { backgroundColor: "rgba(200, 200, 200, 0.2)" },
          ]}
        >
          {/* Camera Control */}
          <TouchableOpacity 
            onPress={() => toggleCamera()}
            style={styles.controlButton}
          >
            {isCameraOn ? <CameraOn /> : <CameraOff />}
            <Text style={styles.controlLabel}>
              {isCameraOn ? "Camera On" : "Camera Off"}
            </Text>
          </TouchableOpacity>

          {/* Microphone Control */}
          <TouchableOpacity 
            onPress={() => toggleMic()}
            style={styles.controlButton}
          >
            {isMicOn ? <MicOn /> : <MicOff />}
            <Text style={styles.controlLabel}>
              {isMicOn ? "Mic On" : "Mic Off"}
            </Text>
          </TouchableOpacity>

          {/* Flip Camera */}
          <TouchableOpacity 
            onPress={() => flipCamera()}
            style={styles.controlButton}
          >
            <Ionicons name="camera-reverse" size={24} color="white" />
            <Text style={styles.controlLabel}>Flip</Text>
          </TouchableOpacity>

          {/* Disconnect */}
          <TouchableOpacity 
            onPress={() => endSession()}
            style={[styles.controlButton, styles.disconnectButton]}
          >
            <Ionicons name="close" size={24} color="white" />
            <Text style={styles.controlLabel}>End</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[
            styles.connectWithOrgaContainer,
            connectionState === "connecting" && styles.connectingContainer
          ]}
          onPress={() =>
            connectionState === "connecting" ? null : handleSessionStart()
          }
          disabled={connectionState === "connecting"}
        >
          {connectionState === "connecting" ? (
            <ConnectingWithOrga />
          ) : (
            <View style={styles.connectContent}>
              <View style={styles.connectIconContainer}>
                <Ionicons name="mic" size={28} color="white" />
                <Ionicons name="add" size={16} color="white" style={styles.connectPlusIcon} />
              </View>
              <Text style={styles.connectWithOrga}>{getButtonText()}</Text>
              <Text style={styles.connectSubtext}>Tap to begin AI conversation</Text>
            </View>
          )}
        </TouchableOpacity>
      )}

      {/* Conversation Status */}
      {isConnected && conversationItems.length > 0 && (
        <View style={styles.conversationStatus}>
          <Ionicons name="chatbubbles" size={16} color="#10b981" />
          <Text style={styles.conversationStatusText}>
            {conversationItems.length} message{conversationItems.length !== 1 ? 's' : ''}
          </Text>
        </View>
      )}
    </View>
  );
};

export default OrgaControls;

const styles = StyleSheet.create({
  controlsContainer: {
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
    backgroundColor: "rgba(239, 68, 68, 0.8)", // red-500 with opacity
  },
  connectWithOrgaContainer: {
    position: "absolute",
    bottom: 50,
    width: "100%",
    backgroundColor: "#3b82f6", // blue-500
    padding: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  connectingContainer: {
    backgroundColor: "#64748b", // slate-500
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
  connectWithOrga: {
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
  connectingWithOrgaContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  connectingWithOrgaText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  conversationStatus: {
    position: "absolute",
    top: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  conversationStatusText: {
    color: "#10b981", // green-500
    fontSize: 12,
    fontWeight: "500",
  },
});
