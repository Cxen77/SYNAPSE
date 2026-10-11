import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useSocket } from '../../context/SocketContext';
import { useNavigation } from '@react-navigation/native';
import Avatar from './Avatar';
import { Colors } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

export default function InAppToast() {
  const { activeNotification, dismissNotification } = useSocket();
  const navigation = useNavigation();
  const { colors } = useTheme();

  if (!activeNotification) return null;

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <TouchableOpacity
        style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}
        activeOpacity={0.9}
        onPress={() => {
          dismissNotification();
          if (activeNotification.chatId) {
            navigation.navigate('ChatConversation', {
              chatId: activeNotification.chatId,
              title: activeNotification.title,
            });
          }
        }}
      >
        <Avatar
          uri={activeNotification.avatar}
          name={activeNotification.title}
          size={38}
          style={styles.avatar}
        />
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {activeNotification.title}
          </Text>
          <Text style={[styles.body, { color: colors.textSecondary }]} numberOfLines={1}>
            {activeNotification.body}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 8,
  },
  avatar: {
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  body: {
    fontSize: 13,
  },
});
