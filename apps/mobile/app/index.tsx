import TranscriptionPanel from "@/components/TranscriptionPanel";
import {
  OrgaAICameraView,
  useOrgaAI,
  OrgaAIControls,
} from "@orga-ai/react-native";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranscription } from "@/context/TranscriptionContext";

export default function HomeScreen() {
  const {
    userVideoStream,
    connectionState,
    conversationItems,
    isMicOn,
    aiAudioStream,
    isCameraOn,
    startSession,
    endSession,
    toggleCamera,
    toggleMic,
    flipCamera,
    cameraPosition,
  } = useOrgaAI();
  const { showTranscriptions, toggleTranscriptions } = useTranscription();
  const isConnected = connectionState === "connected";

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* Title */}
        <Text style={styles.title}>OrgaAI</Text>

        {/* Connection Status */}
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusBadge,
              isConnected ? styles.connectedBadge : styles.disconnectedBadge,
            ]}
          >
            <Ionicons
              name={isConnected ? "checkmark-circle" : "wifi-outline"}
              size={16}
              color={isConnected ? "#166534" : "#64748b"}
            />
            <Text
              style={[
                styles.statusText,
                isConnected ? styles.connectedText : styles.disconnectedText,
              ]}
            >
              {isConnected ? "Connected" : "Ready"}
            </Text>
          </View>
        </View>
      </View>

      {/* Main Camera View */}
      <View style={styles.cameraContainer}>
        <OrgaAICameraView
          streamURL={userVideoStream ? userVideoStream.toURL() : undefined}
          containerStyle={styles.cameraViewContainer}
          style={{ width: "100%", height: "100%" }}
          cameraPosition={cameraPosition}
          placeholder={
            <View style={styles.placeholderContainer}>
              {isConnected ? (
                <>
                  <Ionicons name="mic" size={48} color="white" />
                  <Text
                    style={styles.placeholderSubtext}
                  >{`Mic is ${isMicOn ? "active" : "inactive"}`}</Text>
                </>
              ) : (
                <>
                  <View style={styles.disconnectedIconContainer}>
                    <Ionicons name="mic" size={32} color="#3b82f6" />
                    <Ionicons
                      name="add"
                      size={16}
                      color="#3b82f6"
                      style={styles.plusIcon}
                    />
                  </View>
                  <Text style={styles.placeholderText}>
                    Start Your Conversation
                  </Text>
                  <Text style={styles.placeholderSubtext}>
                    Tap the connect button below to begin
                  </Text>
                  <View style={styles.featureList}>
                    <View style={styles.featureItem}>
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color="#10b981"
                      />
                      <Text style={styles.featureText}>
                        Real-time AI conversations
                      </Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color="#10b981"
                      />
                      <Text style={styles.featureText}>
                        Voice and video support
                      </Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color="#10b981"
                      />
                      <Text style={styles.featureText}>Live transcription</Text>
                    </View>
                  </View>
                </>
              )}
            </View>
          }
        >
          <OrgaAIControls
          // Required props
            connectionState={connectionState}
            isCameraOn={isCameraOn}
            isMicOn={isMicOn}
            onStartSession={startSession}
            onEndSession={endSession}
            onToggleCamera={toggleCamera}
            onToggleMic={toggleMic}
            onFlipCamera={flipCamera}

            // Custom styling
            // containerStyle={}

            cameraOnIcon={<Ionicons name="camera" size={24} color="white" />}
            cameraOffIcon={<Ionicons name="videocam-off" size={24} color="white" />}
            micOnIcon={<Ionicons name="mic" size={24} color="white" />}
            micOffIcon={<Ionicons name="mic-off" size={24} color="white" />}
            flipIcon={<Ionicons name="camera-reverse" size={24} color="white" />}
            endIcon={<Ionicons name="close" size={24} color="white" />}
            startIcon={<Ionicons name="chatbox" size={24} color="white" />}
          />
        </OrgaAICameraView>
      </View>

      {/* Transcription Panel */}
      {isConnected && showTranscriptions && (
        <TranscriptionPanel
          conversationItems={conversationItems}
          onClose={toggleTranscriptions}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1e293b", // slate-800
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  connectedBadge: {
    backgroundColor: "#dcfce7", // green-100
  },
  disconnectedBadge: {
    backgroundColor: "#334155", // slate-700
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  connectedText: {
    color: "#166534", // green-800
  },
  disconnectedText: {
    color: "#cbd5e1", // slate-300
  },
  cameraContainer: {
    flex: 1,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#334155", // slate-700
  },
  cameraViewContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingHorizontal: 40,
  },
  placeholderText: {
    color: "white",
    fontSize: 20,
    fontWeight: "600",
    marginTop: 16,
    textAlign: "center",
  },
  placeholderSubtext: {
    color: "#94a3b8", // slate-400
    fontSize: 16,
    marginTop: 8,
    textAlign: "center",
  },
  disconnectedIconContainer: {
    position: "relative",
    marginBottom: 8,
  },
  plusIcon: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: "white",
    borderRadius: 8,
  },
  featureList: {
    marginTop: 24,
    gap: 8,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  featureText: {
    color: "#cbd5e1", // slate-300
    fontSize: 14,
  },
});
