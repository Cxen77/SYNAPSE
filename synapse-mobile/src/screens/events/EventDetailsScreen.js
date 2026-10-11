import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/common/Header';
import { useTheme } from '../../context/ThemeContext';
import client from '../../api/client';

export default function EventDetailsScreen({ route, navigation }) {
  const { eventId } = route.params || {};
  const { colors, isDarkMode } = useTheme();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      const { data } = await client.get(`/events/${eventId}`);
      setEvent(data.event || data);
      setIsRegistered(!!data.isRegistered);
    } catch (err) {
      console.log('Failed to fetch event', err?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (event.externalUrl) {
      // External event -> Open official link
      Linking.openURL(event.externalUrl).catch(() => {
        Alert.alert('Error', 'Unable to open link.');
      });
      return;
    }

    setRegistering(true);
    try {
      await client.post(`/events/${eventId}/register`);
      setIsRegistered(true);
      Alert.alert('Registered!', 'You are registered for this event.');
    } catch (err) {
      Alert.alert('Registration Error', err.response?.data?.message || 'Failed to register.');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Header showBack title="Event Details" />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Header showBack title="Event Details" />
        <View style={styles.centerContainer}>
          <Text style={{ color: colors.textSecondary }}>Event not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isExternal = event.isExternal || !!event.externalUrl;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header showBack title="Event Details" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Banner */}
        {event.banner || event.imageUrl ? (
          <Image
            source={{ uri: event.banner || event.imageUrl }}
            style={styles.banner}
            contentFit="cover"
          />
        ) : null}

        <View style={styles.content}>
          {/* Platform & Status */}
          <View style={styles.tagRow}>
            <View style={[styles.platformBadge, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.platformText, { color: colors.primary }]}>
                {event.platform || (isExternal ? 'External' : 'Campus')}
              </Text>
            </View>
            {event.category ? (
              <View style={[styles.categoryBadge, { backgroundColor: isDarkMode ? '#1E293B' : '#F3F4F6' }]}>
                <Text style={[styles.categoryText, { color: colors.textSecondary }]}>
                  {event.category}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>{event.title}</Text>

          {/* Key Details Grid */}
          <View style={[styles.metaCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.metaRow}>
              <View style={[styles.iconBox, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="calendar" size={18} color={colors.primary} />
              </View>
              <View style={styles.metaInfo}>
                <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Date & Time</Text>
                <Text style={[styles.metaVal, { color: colors.text }]}>
                  {event.date || event.startDate
                    ? new Date(event.date || event.startDate).toLocaleDateString()
                    : 'TBA'}
                </Text>
              </View>
            </View>

            <View style={styles.metaRow}>
              <View style={[styles.iconBox, { backgroundColor: '#D1FAE5' }]}>
                <Ionicons name="location" size={18} color="#059669" />
              </View>
              <View style={styles.metaInfo}>
                <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Location / Mode</Text>
                <Text style={[styles.metaVal, { color: colors.text }]}>
                  {event.venue || event.location || (isExternal ? 'Online' : 'Campus')}
                </Text>
              </View>
            </View>

            <View style={styles.metaRow}>
              <View style={[styles.iconBox, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="people" size={18} color="#D97706" />
              </View>
              <View style={styles.metaInfo}>
                <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Team Size</Text>
                <Text style={[styles.metaVal, { color: colors.text }]}>
                  {event.minTeamSize || 1} - {event.maxTeamSize || event.teamSize || 4} Members
                </Text>
              </View>
            </View>

            {event.prizePool || event.prizes ? (
              <View style={styles.metaRow}>
                <View style={[styles.iconBox, { backgroundColor: '#FEE2E2' }]}>
                  <Ionicons name="trophy" size={18} color="#DC2626" />
                </View>
                <View style={styles.metaInfo}>
                  <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Prize Pool</Text>
                  <Text style={[styles.metaVal, { color: colors.text }]}>
                    {event.prizePool || event.prizes}
                  </Text>
                </View>
              </View>
            ) : null}
          </View>

          {/* Description */}
          {event.description ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>About Event</Text>
              <Text style={[styles.sectionBody, { color: colors.textSecondary }]}>
                {event.description}
              </Text>
            </View>
          ) : null}

          {/* Rules / Eligibility */}
          {event.eligibility || event.rules ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Eligibility & Rules</Text>
              <Text style={[styles.sectionBody, { color: colors.textSecondary }]}>
                {event.eligibility || event.rules}
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.registerBtn,
            { backgroundColor: isRegistered ? colors.success : colors.primary },
          ]}
          onPress={handleRegister}
          disabled={registering}
          activeOpacity={0.85}
        >
          {registering ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.registerBtnText}>
              {isRegistered
                ? 'Registered ✓'
                : isExternal
                ? 'Apply on Official Website ↗'
                : 'Register Now'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  banner: {
    width: '100%',
    height: 200,
    backgroundColor: '#E5E7EB',
  },
  content: {
    padding: 16,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  platformBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  platformText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
    marginBottom: 16,
  },
  metaCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 14,
    marginBottom: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  metaInfo: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  metaVal: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionBody: {
    fontSize: 14,
    lineHeight: 22,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  registerBtn: {
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
