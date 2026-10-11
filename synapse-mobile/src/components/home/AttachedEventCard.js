import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';

export default function AttachedEventCard({ event }) {
  const navigation = useNavigation();
  const { colors, isDarkMode } = useTheme();

  if (!event) return null;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: isDarkMode ? '#1E293B' : '#F3F4F6', borderColor: colors.border }]}
      activeOpacity={0.85}
      onPress={() => navigation.navigate('EventDetails', { eventId: event._id || event.id })}
    >
      {event.banner || event.imageUrl ? (
        <Image
          source={{ uri: event.banner || event.imageUrl }}
          style={styles.banner}
          contentFit="cover"
        />
      ) : null}

      <View style={styles.body}>
        <View style={styles.tagRow}>
          <View style={[styles.badge, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.badgeText, { color: colors.primary }]}>Event</Text>
          </View>
          {event.platform ? (
            <View style={[styles.badge, { backgroundColor: '#FEF3C7' }]}>
              <Text style={[styles.badgeText, { color: '#D97706' }]}>{event.platform}</Text>
            </View>
          ) : null}
        </View>

        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {event.title || event.name}
        </Text>

        {event.date || event.startDate ? (
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={13} color={colors.textSecondary} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              {new Date(event.date || event.startDate).toLocaleDateString()}
            </Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    marginTop: 10,
    marginBottom: 4,
  },
  banner: {
    width: '100%',
    height: 120,
    backgroundColor: '#E5E7EB',
  },
  body: {
    padding: 12,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 12,
  },
});
