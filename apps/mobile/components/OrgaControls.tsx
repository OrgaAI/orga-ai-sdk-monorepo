import { Ionicons } from "@expo/vector-icons";
import { useOrgaAIContext } from "@orga-ai/sdk-react-native";
// import { useOrgaAIContext } from "orga-ai-sdk/react-native";
// import { useOrgaAIContext } from "orga-ai-react-native-sdk";
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
  } = useOrgaAIContext();

  const ConnectingWithOrga = () => {
    return (
      <View style={styles.connectingWithOrgaContainer}>
        <Text style={styles.connectingWithOrgaText}>Connecting</Text>
        <ActivityIndicator size="small" color="white" />
      </View>
    );
  };

  const handleSessionStart = () => {
    startSession({
      onConnectionStateChange: (state) => {
        console.log("connectionState", state);
      },
      onConversationItemCreated(item) {
        console.log("conversationItemCreated", item);
      },
      onTranscriptionInput: (transcription) => {
        console.log("transcription", transcription);
      },
      onTranscriptionInputCompleted: (transcription) => {
        console.log("transcriptionInputCompleted", transcription);
      },
      onResponseOutputDone: (response) => {
        console.log("responseOutputDone", response);
      },
    });
  };

  return (
    <View style={styles.controlsContainer}>
      {connectionState === "connected" ? (
        <View
          style={[
            styles.controlsOverlay,
            !isCameraOn && { backgroundColor: "rgba(200, 200, 200, 0.2)" },
          ]}
        >
          <TouchableOpacity onPress={() => toggleCamera()}>
            {isCameraOn ? <CameraOn /> : <CameraOff />}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => toggleMic()}>
            {isMicOn ? <MicOn /> : <MicOff />}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => flipCamera()}>
            <Ionicons name="camera-reverse" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => endSession()}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.connectWithOrgaContainer}
          onPress={() =>
            connectionState === "connecting" ? null : handleSessionStart()
          }
        >
          {connectionState === "connecting" ? (
            <ConnectingWithOrga />
          ) : (
            <Text style={styles.connectWithOrga}>Speak with Orga</Text>
          )}
        </TouchableOpacity>
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
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "space-around",
    alignItems: "center",
    borderRadius: 8,
    padding: 16,
  },
  connectingWithOrgaContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  connectWithOrgaContainer: {
    position: "absolute",
    bottom: 50,
    width: "100%",
    backgroundColor: "rgba(200, 200, 200, 0.2)",
    padding: 16,
    borderRadius: 8,
  },
  connectWithOrga: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
  },
  connectingWithOrgaText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
  },
});
