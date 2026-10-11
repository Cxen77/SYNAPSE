import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function VerifiedBadge({ size = 16, style }) {
  return (
    <View style={[styles.container, style]}>
      <Ionicons name="checkmark-circle" size={size} color="#2563EB" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginLeft: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
