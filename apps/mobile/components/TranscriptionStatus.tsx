import React from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface TranscriptionStatusProps {
  isListening: boolean;
  isProcessing: boolean;
  lastTranscription?: string;
}

const TranscriptionStatus: React.FC<TranscriptionStatusProps> = ({
  isListening,
  isProcessing,
  lastTranscription,
}) => {
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.5,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening, pulseAnim]);

  if (!isListening && !isProcessing && !lastTranscription) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Status Indicator */}
      <View style={styles.statusRow}>
        <Animated.View
          style={[
            styles.indicator,
            isListening && styles.listeningIndicator,
            isProcessing && styles.processingIndicator,
            { opacity: pulseAnim },
          ]}
        >
          <Ionicons
            name={isListening ? "mic" : isProcessing ? "ellipsis-horizontal" : "checkmark"}
            size={16}
            color="white"
          />
        </Animated.View>
        <Text style={styles.statusText}>
          {isListening
            ? "Listening..."
            : isProcessing
            ? "Processing..."
            : "Ready"}
        </Text>
      </View>

      {/* Last Transcription */}
      {lastTranscription && (
        <View style={styles.transcriptionContainer}>
          <Text style={styles.transcriptionLabel}>Last heard:</Text>
          <Text style={styles.transcriptionText}>{lastTranscription}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 20,
    left: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 12,
    padding: 12,
    maxWidth: 250,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  indicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  listeningIndicator: {
    backgroundColor: "#10b981", // green-500
  },
  processingIndicator: {
    backgroundColor: "#f59e0b", // amber-500
  },
  statusText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  transcriptionContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
  },
  transcriptionLabel: {
    color: "#94a3b8", // slate-400
    fontSize: 12,
    marginBottom: 2,
  },
  transcriptionText: {
    color: "white",
    fontSize: 13,
    fontStyle: "italic",
  },
});

export default TranscriptionStatus; 