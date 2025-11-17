import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function ThemedView({ children }: { children: React.ReactNode }) {
  const backgroundColor = useThemeColor({}, 'background');
  return <View style={[styles.container, { backgroundColor }]}>{children}</View>;
}

export function ThemedText({ children }: { children: React.ReactNode }) {
  const color = useThemeColor({}, 'text');
  return <Text style={[styles.text, { color }]}>{children}</Text>;
}

const styles = StyleSheet.create({
  container: { flex: 1, },
  text: { fontSize: 18 },
});
