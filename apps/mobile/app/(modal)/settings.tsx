import {
  ORGAAI_MODELS,
  ORGAAI_VOICES,
  useOrgaAIContext,
} from "@orga-ai/sdk-react-native";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const settings = () => {
  const {
    // voice,
    // model,
    temperature,
    updateModel,
    updateVoice,
    updateTemperature,
    currentModel,
    currentVoice,
    updateInstructions,
  } = useOrgaAIContext();
  const [temperatureValue, setTemperatureValue] = useState(
    temperature.toString()
  );
  const [instructionsValue, setInstructionsValue] = useState("");

  const voices = Object.values(ORGAAI_VOICES);
  const models = Object.values(ORGAAI_MODELS);

  // Debounce temperature update
  useEffect(() => {
    const handler = setTimeout(() => {
      let value = parseFloat(temperatureValue);
      if (isNaN(value)) value = 0.0;
      if (value < 0.0) value = 0.0;
      if (value > 1.0) value = 1.0;
      console.log("value", value);
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
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.contentTitle}>Settings</Text>
        {/* Voice Selector */}
        <View style={styles.selectorGroup}>
          <Text style={styles.contentItemTitle}>Voice</Text>
          <View style={[styles.optionsRow, {flexWrap: "wrap", gap: 10}]}>
            {voices.map((v) => (
              <TouchableOpacity
                key={v}
                onPress={() => updateVoice(v)}
                style={v === currentVoice ? styles.selectedOption : styles.option}
              >
                <Text
                  style={
                    v === currentVoice ? styles.selectedOptionText : styles.optionText
                  }
                >
                  {v}
                </Text>
              </TouchableOpacity>
            ))}
            </View>
          {/* </ScrollView> */}
        </View>
        {/* Model Selector */}
        <View style={styles.selectorGroup}>
          <Text style={styles.contentItemTitle}>Model</Text>
          <View style={styles.optionsRow}>
            {models.map((m) => (
              <TouchableOpacity
                key={m}
                onPress={() => updateModel(m)}
                style={m === currentModel ? styles.selectedOption : styles.option}
              >
                <Text
                  style={
                    m === currentModel ? styles.selectedOptionText : styles.optionText
                  }
                >
                  {m}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {/* Temperature Input */}
        <View style={styles.contentItem}>
          <Text style={styles.contentItemTitle}>Temperature</Text>
          <TextInput
            style={styles.temperatureInput}
            value={temperatureValue}
            onChangeText={handleTemperatureChange}
            keyboardType="numeric"
            maxLength={4}
            placeholder="0.0 - 1.0"
          />
        </View>
        <View style={styles.instructionsContainer}>
          <Text style={[styles.contentItemTitle, {marginBottom: 10}]}>Instructions</Text>
          <TextInput
            style={styles.instructionsInput}
            value={instructionsValue}
            onChangeText={setInstructionsValue}
            keyboardType="default"
            maxLength={1000}
            placeholder="Enter instructions..."
          />
          <TouchableOpacity onPress={handleSaveInstructions}>
            <Text style={styles.saveButton}>Save Instructions</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default settings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "slate",
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  content: {
    flex: 1,
    backgroundColor: "slate",
    padding: 20,
    width: "100%",
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
    alignSelf: "center",
  },
  selectorGroup: {
    marginBottom: 16,
  },
  optionsRow: {
    flexDirection: "row",
    marginTop: 8,
    marginBottom: 8,
  },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 6,
    backgroundColor: "#333",
  },
  selectedOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 6,
    backgroundColor: "#fff",
  },
  optionText: {
    color: "#fff",
    fontWeight: "normal",
  },
  selectedOptionText: {
    color: "#333",
    fontWeight: "bold",
  },
  contentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  contentItemTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  contentItemValue: {
    fontSize: 16,
    color: "white",
  },
  temperatureInput: {
    backgroundColor: "#fff",
    color: "#333",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    width: 60,
    textAlign: "center",
    fontWeight: "bold",
  },
  instructionsContainer:{
    flexDirection: "column",
  },
  instructionsInput: {
    backgroundColor: "#fff",
    color: "#333",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    height: 100,
  },
  saveButton: {
    color: "#fff",
    fontWeight: "bold",
    backgroundColor: "#333",
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderRadius: 6,
    textAlign: "center",
    marginTop: 10,
  },
});
