import React, { createContext, useContext, useState } from 'react';

interface TranscriptionContextType {
  isTranscriptionOpen: boolean;
  toggleTranscription: () => void;
  setIsTranscriptionOpen: (open: boolean) => void;
}

const TranscriptionContext = createContext<TranscriptionContextType | undefined>(undefined);

export const TranscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isTranscriptionOpen, setIsTranscriptionOpen] = useState(false);

  const toggleTranscription = () => {
    setIsTranscriptionOpen(!isTranscriptionOpen);
  };

  return (
    <TranscriptionContext.Provider value={{
      isTranscriptionOpen,
      toggleTranscription,
      setIsTranscriptionOpen,
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