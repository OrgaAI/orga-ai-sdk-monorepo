import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ConversationItem } from "@orga-ai/react-native";

interface TranscriptionButtonProps {
  conversationItems: ConversationItem[];
  onPress: () => void;
}

const TranscriptionButton: React.FC<TranscriptionButtonProps> = ({
  conversationItems,
  onPress,
}) => {
  const latestMessage = conversationItems[conversationItems.length - 1];

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <Ionicons
          name="chatbubbles-outline"
          size={20}
          color="#94a3b8"
          style={styles.icon}
        />
        <Text style={styles.text} numberOfLines={1}>
          {latestMessage
            ? latestMessage.content.message
            : "No transcription yet"}
        </Text>
      </View>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{conversationItems.length}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1e293b",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 8,
  },
  text: {
    color: "#e2e8f0",
    fontSize: 14,
    flex: 1,
  },
  badge: {
    backgroundColor: "#3b82f6",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
    paddingHorizontal: 8,
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
});

export default TranscriptionButton;