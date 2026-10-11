import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/common/Header';
import Avatar from '../../components/common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import client from '../../api/client';

export default function TeamDetailsScreen({ route, navigation }) {
  const { teamId } = route.params || {};
  const { currentUser } = useAuth();
  const { colors, isDarkMode } = useTheme();

  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    fetchTeamDetails();
  }, [teamId]);

  const fetchTeamDetails = async () => {
    try {
      const { data } = await client.get(`/teams/${teamId}`);
      setTeam(data.team || data);
    } catch (err) {
      console.log('Error fetching team', err?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    setJoining(true);
    try {
      await client.post(`/teams/${teamId}/join`);
      Alert.alert('Request Sent', 'Your request to join this team has been submitted.');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to submit join request.');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Header showBack title="Team Details" />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!team) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Header showBack title="Team Details" />
        <View style={styles.centerContainer}>
          <Text style={{ color: colors.textSecondary }}>Team not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const members = team.members || [];
  const isMember = members.some(
    (m) => (m.user?._id || m._id || m.user) === currentUser?._id
  );
  const isLeader =
    team.leader?._id === currentUser?._id || team.leader === currentUser?._id;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header showBack title="Team Details" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Banner Card */}
        <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.teamIconBox, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="people" size={32} color={colors.primary} />
          </View>

          <Text style={[styles.teamName, { color: colors.text }]}>{team.name}</Text>
          {team.college ? (
            <Text style={[styles.teamCollege, { color: colors.textSecondary }]}>
              {team.college}
            </Text>
          ) : null}

          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.badgeText, { color: colors.primary }]}>
                {members.length}/{team.maxMembers || 4} Members
              </Text>
            </View>
          </View>

          {team.description ? (
            <Text style={[styles.desc, { color: colors.textSecondary }]}>
              {team.description}
            </Text>
          ) : null}
        </View>

        {/* Tags */}
        {team.tags && team.tags.length > 0 ? (
          <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Required Skills & Interests</Text>
            <View style={styles.tagsWrap}>
              {team.tags.map((tag, idx) => (
                <View key={idx} style={[styles.tag, { backgroundColor: isDarkMode ? '#334155' : '#E5E7EB' }]}>
                  <Text style={[styles.tagText, { color: colors.text }]}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* Member Roster */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Team Members ({members.length})
          </Text>

          {members.map((m, idx) => {
            const memberUser = m.user || m;
            const isUserLeader = memberUser._id === (team.leader?._id || team.leader);

            return (
              <TouchableOpacity
                key={idx}
                style={[styles.memberRow, { borderBottomColor: colors.border }]}
                onPress={() =>
                  memberUser.username &&
                  navigation.navigate('Profile', { username: memberUser.username })
                }
              >
                <Avatar
                  uri={memberUser.profilePic}
                  name={memberUser.name}
                  size={42}
                  style={{ marginRight: 12 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.memberName, { color: colors.text }]}>
                    {memberUser.name}
                  </Text>
                  <Text style={[styles.memberRole, { color: colors.textSecondary }]}>
                    {memberUser.profession || memberUser.college || 'Member'}
                  </Text>
                </View>

                {isUserLeader ? (
                  <View style={[styles.leaderBadge, { backgroundColor: '#FEF3C7' }]}>
                    <Text style={[styles.leaderBadgeText, { color: '#B45309' }]}>Leader</Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        {isMember ? (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('Chat')}
          >
            <Ionicons name="chatbubbles" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.actionBtnText}>Team Chat</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.primary }]}
            onPress={handleJoin}
            disabled={joining}
          >
            {joining ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.actionBtnText}>Request to Join Team</Text>
            )}
          </TouchableOpacity>
        )}
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
    padding: 16,
    paddingBottom: 90,
  },
  heroCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 16,
  },
  teamIconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  teamName: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  teamCollege: {
    fontSize: 13,
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  desc: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  sectionCard: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '700',
  },
  memberRole: {
    fontSize: 12,
    marginTop: 2,
  },
  leaderBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  leaderBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  actionBtn: {
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
