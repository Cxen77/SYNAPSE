import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/common/Header';
import Avatar from '../../components/common/Avatar';
import VerifiedBadge from '../../components/common/VerifiedBadge';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import client from '../../api/client';

export default function ProfileScreen({ route, navigation }) {
  const { username } = route.params || {};
  const { currentUser } = useAuth();
  const { colors, isDarkMode } = useTheme();

  const isMe = !username || username === currentUser?.username;
  const [profile, setProfile] = useState(isMe ? currentUser : null);
  const [loading, setLoading] = useState(!profile);
  const [activeTab, setActiveTab] = useState('Overview'); // Overview | Projects | Teams | Posts

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    try {
      const endpoint = isMe ? '/users/profile' : `/users/${username}`;
      const { data } = await client.get(endpoint);
      setProfile(data.user || data);
    } catch (err) {
      console.log('Error fetching profile', err?.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Header showBack={!isMe} title="Profile" />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const user = profile || currentUser || {};
  const skills = user.skills || [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header showBack={!isMe} title="Profile" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Hero Card */}
        <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Avatar
            uri={user.profilePic}
            name={user.name}
            size={80}
            style={styles.avatar}
          />

          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: colors.text }]}>{user.name}</Text>
            {user.isVerified ? <VerifiedBadge size={18} /> : null}
          </View>

          <Text style={[styles.username, { color: colors.textSecondary }]}>
            @{user.username || 'user'} • {user.profession || 'Community Member'}
          </Text>

          {user.college ? (
            <View style={[styles.collegeBadge, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="school" size={13} color={colors.primary} style={{ marginRight: 4 }} />
              <Text style={[styles.collegeText, { color: colors.primary }]}>{user.college}</Text>
            </View>
          ) : null}

          {user.bio ? (
            <Text style={[styles.bio, { color: colors.textSecondary }]}>{user.bio}</Text>
          ) : null}

          {/* Action Buttons */}
          <View style={styles.heroActions}>
            {isMe ? (
              <TouchableOpacity
                style={[styles.editBtn, { borderColor: colors.border }]}
                onPress={() => navigation.navigate('Settings')}
              >
                <Ionicons name="settings-outline" size={16} color={colors.text} style={{ marginRight: 6 }} />
                <Text style={[styles.editBtnText, { color: colors.text }]}>Settings & Edit</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.followBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.followBtnText}>Follow</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Profile Completeness Gauge */}
        <View style={[styles.scoreCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.scoreHeader}>
            <View>
              <Text style={[styles.scoreTitle, { color: colors.text }]}>Profile Score</Text>
              <Text style={[styles.scoreSubtitle, { color: colors.textSecondary }]}>
                Completeness & Activity
              </Text>
            </View>
            <View style={[styles.scoreCircle, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.scoreNumber, { color: colors.primary }]}>
                {user.profileScore || 85}%
              </Text>
            </View>
          </View>
        </View>

        {/* Navigation Tabs */}
        <View style={[styles.tabsRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {['Overview', 'Teams', 'Projects'].map((tab) => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tabItem,
                  isActive && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
                ]}
                onPress={() => setActiveTab(tab)}
              >
                <Text
                  style={[
                    styles.tabItemText,
                    { color: isActive ? colors.primary : colors.textMuted },
                    isActive && { fontWeight: '700' },
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Tab Content */}
        {activeTab === 'Overview' ? (
          <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Skills & Expertise</Text>
            <View style={styles.skillsWrap}>
              {skills.length > 0 ? (
                skills.map((s, idx) => (
                  <View key={idx} style={[styles.skillBadge, { backgroundColor: isDarkMode ? '#334155' : '#F3F4F6' }]}>
                    <Text style={[styles.skillText, { color: colors.text }]}>{s}</Text>
                  </View>
                ))
              ) : (
                <Text style={{ color: colors.textMuted }}>No skills added yet.</Text>
              )}
            </View>
          </View>
        ) : null}
      </ScrollView>
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
    padding: 16,
    paddingBottom: 24,
  },
  heroCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    marginBottom: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
  },
  username: {
    fontSize: 13,
    marginBottom: 8,
  },
  collegeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  collegeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  bio: {
    fontSize: 13.5,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  heroActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  editBtn: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  followBtn: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  followBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  scoreCard: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 16,
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scoreTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  scoreSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  scoreCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: 15,
    fontWeight: '800',
  },
  tabsRow: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabItemText: {
    fontSize: 13,
    fontWeight: '500',
  },
  sectionCard: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  skillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  skillText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
