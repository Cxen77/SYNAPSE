import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/common/Header';
import TeamCard from '../../components/teams/TeamCard';
import CreateTeamModal from '../../components/teams/CreateTeamModal';
import Avatar from '../../components/common/Avatar';
import { useTheme } from '../../context/ThemeContext';
import client from '../../api/client';

export default function TeamsScreen({ navigation }) {
  const { colors, isDarkMode } = useTheme();

  const [activeTab, setActiveTab] = useState('My Teams'); // 'My Teams' | 'Open Teams' | 'Invites'
  const [teams, setTeams] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

  const fetchTeamsData = useCallback(async () => {
    try {
      if (activeTab === 'My Teams') {
        const { data } = await client.get('/teams');
        setTeams(Array.isArray(data) ? data : data.teams || []);
      } else if (activeTab === 'Open Teams') {
        const { data } = await client.get('/teams/open');
        setTeams(Array.isArray(data) ? data : data.teams || []);
      } else if (activeTab === 'Invites') {
        const { data } = await client.get('/teams/invites');
        setInvites(Array.isArray(data) ? data : data.invites || []);
      }
    } catch (err) {
      console.log('Error fetching teams', err?.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab]);

  useEffect(() => {
    setLoading(true);
    fetchTeamsData();
  }, [fetchTeamsData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTeamsData();
  };

  const handleJoinTeam = async (team) => {
    try {
      await client.post(`/teams/${team._id}/join`);
      Alert.alert('Request Sent', `Your request to join ${team.name} has been submitted.`);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to submit join request.');
    }
  };

  const handleAcceptInvite = async (inviteId) => {
    try {
      await client.post(`/teams/invites/${inviteId}/accept`);
      setInvites((prev) => prev.filter((i) => i._id !== inviteId));
      Alert.alert('Joined!', 'You have joined the team.');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to accept invitation.');
    }
  };

  const handleDeclineInvite = async (inviteId) => {
    try {
      await client.post(`/teams/invites/${inviteId}/decline`);
      setInvites((prev) => prev.filter((i) => i._id !== inviteId));
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to decline invitation.');
    }
  };

  const handleTeamCreated = (newTeam) => {
    setTeams((prev) => [newTeam, ...prev]);
  };

  const filteredTeams = teams.filter((t) =>
    (t.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Teams & Collaboration" />

      {/* Tabs */}
      <View style={[styles.tabsRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {['My Teams', 'Open Teams', 'Invites'].map((tab) => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabBtn,
                isActive && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: isActive ? colors.primary : colors.textSecondary },
                  isActive && { fontWeight: '700' },
                ]}
              >
                {tab}
                {tab === 'Invites' && invites.length > 0 ? ` (${invites.length})` : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Search Input (For My Teams and Open Teams) */}
      {activeTab !== 'Invites' ? (
        <View style={styles.searchSection}>
          <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="search" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search teams by name, skill..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
      ) : null}

      {/* Content */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : activeTab === 'Invites' ? (
        <FlatList
          data={invites}
          keyExtractor={(item) => item._id || String(Math.random())}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          renderItem={({ item }) => (
            <View style={[styles.inviteCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.inviteHeader}>
                <Avatar uri={item.team?.avatar} name={item.team?.name} size={42} style={{ marginRight: 10 }} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.inviteTeamName, { color: colors.text }]}>{item.team?.name}</Text>
                  <Text style={[styles.inviteFrom, { color: colors.textSecondary }]}>
                    Invited by {item.inviter?.name || 'Leader'}
                  </Text>
                </View>
              </View>

              <View style={styles.inviteActions}>
                <TouchableOpacity
                  style={[styles.inviteBtn, { backgroundColor: colors.primary }]}
                  onPress={() => handleAcceptInvite(item._id)}
                >
                  <Text style={styles.inviteBtnText}>Accept</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.inviteBtn, { backgroundColor: isDarkMode ? '#334155' : '#E5E7EB' }]}
                  onPress={() => handleDeclineInvite(item._id)}
                >
                  <Text style={[styles.inviteBtnText, { color: colors.text }]}>Decline</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="mail-outline" size={48} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No Pending Invites</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                When leaders invite you to a team, invitations will appear here.
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={filteredTeams}
          keyExtractor={(item) => item._id || item.id || String(Math.random())}
          renderItem={({ item }) => (
            <TeamCard
              team={item}
              isOpenTeam={activeTab === 'Open Teams'}
              onJoinPress={handleJoinTeam}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={48} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                {activeTab === 'Open Teams' ? 'No Open Teams Found' : 'No Teams Yet'}
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                {activeTab === 'Open Teams'
                  ? 'All teams are currently full or private.'
                  : 'Create your first team using the button below to get started!'}
              </Text>
            </View>
          }
        />
      )}

      {/* Floating Action Button (Create Team) */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        activeOpacity={0.85}
        onPress={() => setIsCreateModalVisible(true)}
      >
        <Ionicons name="add" size={26} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Create Team Modal */}
      <CreateTeamModal
        visible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
        onTeamCreated={handleTeamCreated}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  listContent: {
    padding: 16,
    paddingBottom: 90,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: 14,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  inviteCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  inviteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  inviteTeamName: {
    fontSize: 16,
    fontWeight: '700',
  },
  inviteFrom: {
    fontSize: 12,
    marginTop: 2,
  },
  inviteActions: {
    flexDirection: 'row',
    gap: 10,
  },
  inviteBtn: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inviteBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
});
