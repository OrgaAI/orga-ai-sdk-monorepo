import TranscriptionPanel from "@/components/TranscriptionPanel";
import {
  useOrgaAI,
  ConversationCreatedEvent,
  SessionCreatedEvent,
} from "@orga-ai/react-native";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranscription } from "@/context/TranscriptionContext";
import { useState, useEffect, useCallback, useRef } from "react";

interface Note {
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

const MCP_SERVER_URL = "https://80dc-84-126-42-0.ngrok-free.app"; // TODO: Update with your MCP server URL

export default function HomeScreen() {
  const {
    connectionState,
    conversationItems,
    isMicOn,
    startSession,
    endSession,
    toggleMic,
  } = useOrgaAI();
  const { showTranscriptions, toggleTranscriptions } = useTranscription();
  const isConnected = connectionState === "connected";

  const [notes, setNotes] = useState<Note[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedNote, setExpandedNote] = useState<string | null>(null);
  
  const pollingInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchNotes = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(`${MCP_SERVER_URL}/notes`);
      if (!response.ok) {
        throw new Error(`Failed to fetch notes: ${response.status}`);
      }
      const data = await response.json();
      console.log("Notes:", data);
      setNotes(data.notes || []);
    } catch (err) {
      console.error("Error fetching notes:", err);
      setError(err instanceof Error ? err.message : "Failed to load notes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Poll for new notes while connected
  useEffect(() => {
    if (isConnected) {
      pollingInterval.current = setInterval(fetchNotes, 3000);
    } else if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }

    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [isConnected, fetchNotes]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotes();
    setRefreshing(false);
  }, [fetchNotes]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };


  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>MCP Notes</Text>
          <Text style={styles.subtitle}>Voice-powered note taking</Text>
        </View>

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

      {/* Notes List */}
      <View style={styles.notesContainer}>
        <View style={styles.notesHeader}>
          <Text style={styles.notesTitle}>Your Notes</Text>
          <Text style={styles.notesCount}>{notes.length} notes</Text>
        </View>

        <ScrollView
          style={styles.notesList}
          contentContainerStyle={styles.notesListContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#3b82f6"
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.emptyState}>
              <Ionicons name="hourglass-outline" size={48} color="#64748b" />
              <Text style={styles.emptyStateText}>Loading notes...</Text>
            </View>
          ) : error ? (
            <View style={styles.emptyState}>
              <Ionicons name="cloud-offline-outline" size={48} color="#ef4444" />
              <Text style={styles.emptyStateText}>Connection Error</Text>
              <Text style={styles.emptyStateSubtext}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchNotes}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : notes.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={48} color="#64748b" />
              <Text style={styles.emptyStateText}>No notes yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Connect and ask Orga to create a note
              </Text>
            </View>
          ) : (
            notes.map((note) => (
              <TouchableOpacity
                key={note.title}
                style={styles.noteCard}
                onPress={() =>
                  setExpandedNote(expandedNote === note.title ? null : note.title)
                }
                activeOpacity={0.7}
              >
                <View style={styles.noteHeader}>
                  <View style={styles.noteTitleContainer}>
                    <Ionicons name="document-text" size={20} color="#3b82f6" />
                    <Text style={styles.noteTitle} numberOfLines={1}>
                      {note.title}
                    </Text>
                  </View>
                  <Ionicons
                    name={expandedNote === note.title ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#64748b"
                  />
                </View>

                {expandedNote === note.title && (
                  <View style={styles.noteContent}>
                    <Text style={styles.noteContentText}>{note.content}</Text>
                    <View style={styles.noteMeta}>
                      <View style={styles.noteMetaItem}>
                        <Ionicons name="time-outline" size={12} color="#64748b" />
                        <Text style={styles.noteMetaText}>
                          Created: {formatDate(note.created_at)}
                        </Text>
                      </View>
                      {note.updated_at !== note.created_at && (
                        <View style={styles.noteMetaItem}>
                          <Ionicons
                            name="refresh-outline"
                            size={12}
                            color="#64748b"
                          />
                          <Text style={styles.noteMetaText}>
                            Updated: {formatDate(note.updated_at)}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}

                {expandedNote !== note.title && (
                  <Text style={styles.notePreview} numberOfLines={2}>
                    {note.content}
                  </Text>
                )}
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>

      {/* Voice Control Bar */}
      <View style={styles.controlBar}>
        {isConnected ? (
          <View style={styles.connectedControls}>
            <TouchableOpacity
              style={[styles.micButton, isMicOn && styles.micButtonActive]}
              onPress={toggleMic}
            >
              <Ionicons
                name={isMicOn ? "mic" : "mic-off"}
                size={24}
                color="white"
              />
            </TouchableOpacity>
            <View style={styles.listeningIndicator}>
              <Text style={styles.listeningText}>
                {isMicOn ? "Listening..." : "Mic muted"}
              </Text>
              <Text style={styles.listeningSubtext}>
                Say "Create a note about..." to add notes
              </Text>
            </View>
            <TouchableOpacity style={styles.endButton} onPress={endSession}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.connectButton}
            onPress={() =>
              startSession({
                onSessionCreated: (event: SessionCreatedEvent) => {
                  console.log("Session created:", event);
                },
                onConversationCreated: (event: ConversationCreatedEvent) => {
                  console.log("Conversation created:", event);
                },
              })
            }
          >
            <Ionicons name="mic" size={24} color="white" />
            <Text style={styles.connectButtonText}>Connect to Orga</Text>
          </TouchableOpacity>
        )}
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
    backgroundColor: "#0f172a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 2,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
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
    backgroundColor: "#dcfce7",
  },
  disconnectedBadge: {
    backgroundColor: "#1e293b",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  connectedText: {
    color: "#166534",
  },
  disconnectedText: {
    color: "#94a3b8",
  },
  notesContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  notesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  notesTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
  },
  notesCount: {
    fontSize: 14,
    color: "#64748b",
  },
  notesList: {
    flex: 1,
  },
  notesListContent: {
    paddingBottom: 20,
    gap: 12,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#94a3b8",
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 4,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: "#3b82f6",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  noteCard: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  noteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  noteTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    flex: 1,
  },
  notePreview: {
    fontSize: 14,
    color: "#94a3b8",
    marginTop: 8,
    lineHeight: 20,
  },
  noteContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#334155",
  },
  noteContentText: {
    fontSize: 14,
    color: "#cbd5e1",
    lineHeight: 22,
  },
  noteMeta: {
    marginTop: 12,
    gap: 4,
  },
  noteMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  noteMetaText: {
    fontSize: 12,
    color: "#64748b",
  },
  controlBar: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 40,
    backgroundColor: "#1e293b",
    borderTopWidth: 1,
    borderTopColor: "#334155",
  },
  connectedControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  micButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#334155",
    justifyContent: "center",
    alignItems: "center",
  },
  micButtonActive: {
    backgroundColor: "#3b82f6",
  },
  listeningIndicator: {
    flex: 1,
  },
  listeningText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  listeningSubtext: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  endButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ef4444",
    justifyContent: "center",
    alignItems: "center",
  },
  connectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3b82f6",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
  },
  connectButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});
