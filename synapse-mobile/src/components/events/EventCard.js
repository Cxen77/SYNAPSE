import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';

export default function EventCard({ event }) {
  const navigation = useNavigation();
  const { colors, isDarkMode } = useTheme();

  const isExternal = event.isExternal || !!event.externalUrl;
  const platform = event.platform || (isExternal ? 'External' : 'Campus');

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      activeOpacity={0.9}
      onPress={() => navigation.navigate('EventDetails', { eventId: event._id })}
    >
      {/* Banner */}
      <View style={styles.bannerContainer}>
        {event.banner || event.imageUrl ? (
          <Image
            source={{ uri: event.banner || event.imageUrl }}
            style={styles.banner}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={[styles.placeholderBanner, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="calendar" size={40} color={colors.primary} />
          </View>
        )}

        {/* Platform Badge */}
        <View style={styles.platformBadge}>
          <Text style={styles.platformText}>{platform}</Text>
        </View>

        {/* Prize Badge if present */}
        {event.prizePool || event.prizes ? (
          <View style={styles.prizeBadge}>
            <Ionicons name="trophy" size={12} color="#D97706" style={{ marginRight: 4 }} />
            <Text style={styles.prizeText}>{event.prizePool || event.prizes}</Text>
          </View>
        ) : null}
      </View>

      {/* Content */}
      <View style={styles.body}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {event.title}
        </Text>

        {/* Meta Details */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              {event.date || event.startDate
                ? new Date(event.date || event.startDate).toLocaleDateString()
                : 'TBA'}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]} numberOfLines={1}>
              {event.venue || event.location || (isExternal ? 'Online' : 'Campus')}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <View style={styles.teamSizeRow}>
            <Ionicons name="people-outline" size={15} color={colors.textMuted} />
            <Text style={[styles.teamSizeText, { color: colors.textSecondary }]}>
              Team: {event.minTeamSize || 1} - {event.maxTeamSize || event.teamSize || 4}
            </Text>
          </View>

          <View style={[styles.viewBtn, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.viewBtnText, { color: colors.primary }]}>View Details</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.primary} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  bannerContainer: {
    width: '100%',
    height: 160,
    backgroundColor: '#E5E7EB',
  },
  banner: {
    width: '100%',
    height: '100%',
  },
  placeholderBanner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  platformBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  platformText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  prizeBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  prizeText: {
    color: '#B45309',
    fontSize: 12,
    fontWeight: '800',
  },
  body: {
    padding: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 23,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 14,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 13,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  teamSizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  teamSizeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 2,
  },
  viewBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
