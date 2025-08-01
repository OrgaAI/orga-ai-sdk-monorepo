import {
  ORGAAI_MODELS,
  ORGAAI_VOICES,
  ORGAAI_TEMPERATURE_RANGE,
  useOrgaAIContext,
} from "@orga-ai/sdk-react-native";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const settings = () => {
  const {
    temperature,
    updateModel,
    updateVoice,
    updateTemperature,
    currentModel,
    currentVoice,
    updateInstructions,
    connectionState,
  } = useOrgaAIContext();
  
  const [temperatureValue, setTemperatureValue] = useState(
    temperature.toString()
  );
  const [instructionsValue, setInstructionsValue] = useState("");
  const [instructionsUpdated, setInstructionsUpdated] = useState(false);

  const voices = Object.values(ORGAAI_VOICES);
  const models = Object.values(ORGAAI_MODELS);
  const isConnected = connectionState === "connected";

  // Debounce temperature update
  useEffect(() => {
    const handler = setTimeout(() => {
      let value = parseFloat(temperatureValue);
      if (isNaN(value)) value = 0.0;
      if (value < 0.0) value = 0.0;
      if (value > 1.0) value = 1.0;
      updateTemperature(value);
    }, 300);
    return () => clearTimeout(handler);
  }, [temperatureValue, updateTemperature]);

  // Sync local state if context temperature changes externally
  useEffect(() => {
    setTemperatureValue(temperature.toString());
  }, [temperature]);

  // Handler for temperature input
  const handleTemperatureChange = (text: string) => {
    setTemperatureValue(text);
  };

  const handleSaveInstructions = () => {
    updateInstructions(instructionsValue);
    setInstructionsUpdated(true);
    // Reset the success state after 3 seconds
    setTimeout(() => setInstructionsUpdated(false), 3000);
  };

  const handleModelChange = (model: string) => {
    if (isConnected) {
      Alert.alert(
        "Model Change",
        "Changing the model will affect the current session. Continue?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Continue", onPress: () => updateModel(model as any) },
        ]
      );
    } else {
      updateModel(model as any);
    }
  };

  const handleVoiceChange = (voice: string) => {
    if (isConnected) {
      Alert.alert(
        "Voice Change",
        "Changing the voice will affect the current session. Continue?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Continue", onPress: () => updateVoice(voice as any) },
        ]
      );
    } else {
      updateVoice(voice as any);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>SDK Configuration</Text>
            <Text style={styles.subtitle}>
              Configure OrgaAI SDK parameters
            </Text>
          </View>

          {/* Connection Status */}
          <View style={styles.statusSection}>
            <View style={[
              styles.statusBadge,
              isConnected ? styles.connectedBadge : styles.disconnectedBadge
            ]}>
              <Ionicons 
                name={isConnected ? "checkmark-circle" : "close-circle"} 
                size={16} 
                color={isConnected ? "#166534" : "#dc2626"} 
              />
              <Text style={[
                styles.statusText,
                isConnected ? styles.connectedText : styles.disconnectedText
              ]}>
                {isConnected ? "Connected" : "Disconnected"}
              </Text>
            </View>
          </View>

          {/* Model Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AI Model</Text>
            <Text style={styles.sectionDescription}>
              Choose the AI model for conversation
            </Text>
            <View style={styles.optionsGrid}>
              {models.map((model) => (
                <TouchableOpacity
                  key={model}
                  onPress={() => handleModelChange(model)}
                  style={[
                    styles.optionCard,
                    model === currentModel ? styles.selectedOptionCard : styles.unselectedOptionCard
                  ]}
                >
                  <Text style={[
                    styles.optionText,
                    model === currentModel ? styles.selectedOptionText : styles.unselectedOptionText
                  ]}>
                    {model}
                  </Text>
                  {model === currentModel && (
                    <Ionicons name="checkmark" size={16} color="#10b981" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Voice Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Voice</Text>
            <Text style={styles.sectionDescription}>
              Select the voice for AI responses
            </Text>
            <View style={styles.optionsGrid}>
              {voices.map((voice) => (
                <TouchableOpacity
                  key={voice}
                  onPress={() => handleVoiceChange(voice)}
                  style={[
                    styles.optionCard,
                    voice === currentVoice ? styles.selectedOptionCard : styles.unselectedOptionCard
                  ]}
                >
                  <Text style={[
                    styles.optionText,
                    voice === currentVoice ? styles.selectedOptionText : styles.unselectedOptionText
                  ]}>
                    {voice}
                  </Text>
                  {voice === currentVoice && (
                    <Ionicons name="checkmark" size={16} color="#10b981" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Temperature Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Temperature</Text>
            <Text style={styles.sectionDescription}>
              Controls response creativity (0.0 - 1.0)
            </Text>
            <View style={styles.temperatureContainer}>
              <TextInput
                style={styles.temperatureInput}
                value={temperatureValue}
                onChangeText={handleTemperatureChange}
                keyboardType="numeric"
                maxLength={4}
                placeholder="0.0 - 1.0"
              />
              <View style={styles.temperatureRange}>
                <Text style={styles.rangeLabel}>Conservative</Text>
                <Text style={styles.rangeLabel}>Creative</Text>
              </View>
            </View>
          </View>

          {/* Instructions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            <Text style={styles.sectionDescription}>
              Custom instructions for the AI behavior
            </Text>
            <TextInput
              style={styles.instructionsInput}
              value={instructionsValue}
              onChangeText={setInstructionsValue}
              keyboardType="default"
              maxLength={1000}
              placeholder="Enter custom instructions..."
              multiline
              numberOfLines={4}
            />
            <TouchableOpacity 
              onPress={handleSaveInstructions}
              style={styles.saveButton}
              disabled={!instructionsValue.trim()}
            >
              <Ionicons name="save" size={16} color="white" />
              <Text style={styles.saveButtonText}>Save Instructions</Text>
              {instructionsUpdated && (
                <View style={styles.updatedIndicator}>
                  <Ionicons name="checkmark" size={12} color="#10b981" />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Info Section */}
          <View style={styles.infoSection}>
            <Ionicons name="information-circle" size={20} color="#64748b" />
            <Text style={styles.infoText}>
              Changes to model and voice will take effect immediately if connected.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default settings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1e293b", // slate-800
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#94a3b8", // slate-400
  },
  statusSection: {
    marginBottom: 24,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: "flex-start",
    gap: 6,
  },
  connectedBadge: {
    backgroundColor: "#dcfce7", // green-100
  },
  disconnectedBadge: {
    backgroundColor: "#fef2f2", // red-100
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  connectedText: {
    color: "#166534", // green-800
  },
  disconnectedText: {
    color: "#dc2626", // red-600
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#94a3b8", // slate-400
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionCard: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minWidth: 100,
  },
  selectedOptionCard: {
    backgroundColor: "#10b981", // green-500
  },
  unselectedOptionCard: {
    backgroundColor: "#334155", // slate-700
  },
  optionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  selectedOptionText: {
    color: "white",
  },
  unselectedOptionText: {
    color: "#cbd5e1", // slate-300
  },
  temperatureContainer: {
    alignItems: "center",
  },
  temperatureInput: {
    backgroundColor: "#334155", // slate-700
    color: "white",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: 120,
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 8,
  },
  temperatureRange: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 200,
  },
  rangeLabel: {
    fontSize: 12,
    color: "#64748b", // slate-500
  },
  instructionsInput: {
    backgroundColor: "#334155", // slate-700
    color: "white",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 100,
    textAlignVertical: "top",
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: "#3b82f6", // blue-500
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  updatedIndicator: {
    position: "absolute",
    right: 12,
  },
  infoSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#334155", // slate-700
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginTop: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#94a3b8", // slate-400
    lineHeight: 20,
  },
});
