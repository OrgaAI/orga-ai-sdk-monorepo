import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ConversationItem } from "@orga-ai/sdk-react-native";

interface TranscriptionPanelProps {
  conversationItems: ConversationItem[];
  onClose: () => void;
}

const TranscriptionPanel: React.FC<TranscriptionPanelProps> = ({
  conversationItems,
  onClose,
}) => {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Conversation</Text>
          <Text style={styles.subtitle}>
            Real-time conversation items from SDK
          </Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView style={styles.messagesContainer} showsVerticalScrollIndicator={false}>
        {conversationItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles" size={48} color="#64748b" />
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptySubtitle}>
              Start talking to see the conversation here
            </Text>
          </View>
        ) : (
          conversationItems.map((item, index) => (
            <View
              key={`${item.conversationId}-${index}`}
              style={[
                styles.messageContainer,
                item.sender === "user" ? styles.userMessage : styles.assistantMessage,
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  item.sender === "user" ? styles.userBubble : styles.assistantBubble,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    item.sender === "user" ? styles.userText : styles.assistantText,
                  ]}
                >
                  {item.content.message}
                </Text>
                <View style={styles.messageMeta}>
                  <Text
                    style={[
                      styles.senderText,
                      item.sender === "user" ? styles.userMetaText : styles.assistantMetaText,
                    ]}
                  >
                    {item.sender === "user" ? "You" : "Assistant"}
                  </Text>
                  {item.timestamp && (
                    <Text
                      style={[
                        styles.timestampText,
                        item.sender === "user" ? styles.userMetaText : styles.assistantMetaText,
                      ]}
                    >
                      {formatTime(item.timestamp)}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "60%",
    backgroundColor: "#1e293b", // slate-800
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#334155", // slate-700
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  subtitle: {
    fontSize: 12,
    color: "#94a3b8", // slate-400
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748b", // slate-500
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#64748b", // slate-500
    marginTop: 4,
    textAlign: "center",
  },
  messageContainer: {
    marginBottom: 12,
  },
  userMessage: {
    alignItems: "flex-end",
  },
  assistantMessage: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: width * 0.75,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: "#3b82f6", // blue-500
  },
  assistantBubble: {
    backgroundColor: "#334155", // slate-700
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: "white",
  },
  assistantText: {
    color: "white",
  },
  messageMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  senderText: {
    fontSize: 12,
    fontWeight: "500",
  },
  timestampText: {
    fontSize: 12,
  },
  userMetaText: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  assistantMetaText: {
    color: "rgba(255, 255, 255, 0.6)",
  },
});

export default TranscriptionPanel; 