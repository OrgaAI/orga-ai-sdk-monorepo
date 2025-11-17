import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranscription } from '../context/TranscriptionContext';
import TranscriptionButton from './TranscriptionButton';
import TranscriptionList from './TranscriptionList';

const Transcriptions: React.FC = () => {
  const {
    conversationItems,
    showTranscriptions,
    toggleTranscriptions,
  } = useTranscription();

  return (
    <View style={styles.container}>
      {showTranscriptions ? (
        <TranscriptionList conversationItems={conversationItems} />
      ) : (
        <TranscriptionButton
          conversationItems={conversationItems}
          onPress={toggleTranscriptions}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Transcriptions;