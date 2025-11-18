import React, { createContext, useContext, useState, useCallback } from 'react';
import { ConversationItem } from '@orga-ai/react-native';

interface TranscriptionContextType {
  conversationItems: ConversationItem[];
  addConversationItem: (item: ConversationItem) => void;
  clearConversation: () => void;
  showTranscriptions: boolean;
  toggleTranscriptions: () => void;
}

const TranscriptionContext = createContext<TranscriptionContextType | undefined>(undefined);

export const TranscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [conversationItems, setConversationItems] = useState<ConversationItem[]>([]);
  const [showTranscriptions, setShowTranscriptions] = useState(false);

  const addConversationItem = useCallback((item: ConversationItem) => {
    setConversationItems(prev => [...prev, item]);
  }, []);

  const clearConversation = useCallback(() => {
    setConversationItems([]);
  }, []);

  const toggleTranscriptions = useCallback(() => {
    setShowTranscriptions(prev => !prev);
  }, []);

  return (
    <TranscriptionContext.Provider value={{
      conversationItems,
      addConversationItem,
      clearConversation,
      showTranscriptions,
      toggleTranscriptions,
    }}>
      {children}
    </TranscriptionContext.Provider>
  );
};

export const useTranscription = () => {
  const context = useContext(TranscriptionContext);
  if (context === undefined) {
    throw new Error('useTranscription must be used within a TranscriptionProvider');
  }
  return context;
}; 