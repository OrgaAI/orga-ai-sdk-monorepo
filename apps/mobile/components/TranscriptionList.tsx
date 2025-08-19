import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
} from "react-native";
import { ConversationItem } from "@orga-ai/sdk-react-native";

interface TranscriptionListProps {
  conversationItems: ConversationItem[];
}

const TranscriptionList: React.FC<TranscriptionListProps> = ({
  conversationItems,
}) => {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderItem = ({ item }: { item: ConversationItem }) => (
    <View
      style={[
        styles.messageContainer,
        item.sender === "user" ? styles.userMessage : styles.assistantMessage,
      ]}
    >
      <Text style={styles.messageText}>{item.content.message}</Text>
      <View style={styles.messageFooter}>
        <Text style={styles.senderText}>
          {item.sender === "user" ? "You" : "Assistant"}
        </Text>
        {item.timestamp && (
          <Text style={styles.timeText}>{formatTime(item.timestamp)}</Text>
        )}
      </View>
    </View>
  );

  return (
    <FlatList
      data={conversationItems}
      renderItem={renderItem}
      keyExtractor={(item, index) => `${item.conversationId}-${index}`}
      contentContainerStyle={styles.container}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No transcriptions yet</Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    maxWidth: "85%",
  },
  userMessage: {
    backgroundColor: "#3b82f6",
    alignSelf: "flex-end",
  },
  assistantMessage: {
    backgroundColor: "#334155",
    alignSelf: "flex-start",
  },
  messageText: {
    color: "white",
    fontSize: 14,
    lineHeight: 20,
  },
  messageFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  senderText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 12,
  },
  timeText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyText: {
    color: "#64748b",
    fontSize: 14,
  },
});

export default TranscriptionList;