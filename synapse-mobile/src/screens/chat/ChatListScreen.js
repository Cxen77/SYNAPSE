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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/common/Header';
import Avatar from '../../components/common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useTheme } from '../../context/ThemeContext';
import client from '../../api/client';

export default function ChatListScreen({ navigation }) {
  const { currentUser } = useAuth();
  const { onlineUsers } = useSocket();
  const { colors, isDarkMode } = useTheme();

  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('all'); // all | direct | teams

  const fetchChats = useCallback(async () => {
    try {
      const { data } = await client.get('/chats');
      setChats(Array.isArray(data) ? data : data.chats || []);
    } catch (err) {
      console.log('Error fetching chats', err?.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchChats();
  };

  const getChatDetails = (chat) => {
    if (chat.isGroupChat) {
      return {
        name: chat.chatName || 'Team Group',
        avatar: null,
        isOnline: false,
      };
    }

    const otherUser =
      (chat.users || []).find((u) => (u._id || u.id) !== currentUser?._id) || {};

    const isOnline = otherUser._id ? onlineUsers.has(otherUser._id) : false;

    return {
      name: otherUser.name || 'Chat',
      avatar: otherUser.profilePic,
      isOnline,
    };
  };

  const filteredChats = chats.filter((c) => {
    const details = getChatDetails(c);
    const matchesSearch = details.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filterTab === 'direct') return !c.isGroupChat;
    if (filterTab === 'teams') return c.isGroupChat;
    return true;
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Messages" />

      {/* Search Input */}
      <View style={styles.searchSection}>
        <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="search" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search conversations..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={[styles.tabsRow, { borderBottomColor: colors.border }]}>
        {[
          { id: 'all', label: 'All Chats' },
          { id: 'direct', label: 'Direct' },
          { id: 'teams', label: 'Teams' },
        ].map((tab) => {
          const isActive = filterTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tabBtn,
                isActive && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
              ]}
              onPress={() => setFilterTab(tab.id)}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: isActive ? colors.primary : colors.textMuted },
                  isActive && { fontWeight: '700' },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Chat List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredChats}
          keyExtractor={(item) => item._id || item.id || String(Math.random())}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          renderItem={({ item }) => {
            const details = getChatDetails(item);
            const lastMsg = item.latestMessage;

            return (
              <TouchableOpacity
                style={[styles.chatItem, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
                activeOpacity={0.8}
                onPress={() =>
                  navigation.navigate('ChatConversation', {
                    chatId: item._id,
                    title: details.name,
                    isGroup: item.isGroupChat,
                  })
                }
              >
                <Avatar
                  uri={details.avatar}
                  name={details.name}
                  size={50}
                  isOnline={details.isOnline}
                  style={styles.avatar}
                />

                <View style={styles.chatInfo}>
                  <View style={styles.chatTopRow}>
                    <Text style={[styles.chatName, { color: colors.text }]} numberOfLines={1}>
                      {details.name}
                    </Text>
                    {lastMsg?.createdAt ? (
                      <Text style={[styles.timeText, { color: colors.textMuted }]}>
                        {new Date(lastMsg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    ) : null}
                  </View>

                  <View style={styles.chatBottomRow}>
                    <Text
                      style={[
                        styles.latestMessage,
                        { color: item.unreadCount > 0 ? colors.text : colors.textSecondary },
                        item.unreadCount > 0 && { fontWeight: '600' },
                      ]}
                      numberOfLines={1}
                    >
                      {lastMsg ? lastMsg.text || 'Sent an attachment' : 'Start a conversation'}
                    </Text>

                    {item.unreadCount > 0 ? (
                      <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
                        <Text style={styles.unreadCountText}>{item.unreadCount}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={48} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No Conversations Yet</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Connect with team members or match in hackathons to start chatting!
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    marginTop: 10,
  },
  tabBtn: {
    paddingVertical: 10,
    marginRight: 20,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 24,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatar: {
    marginRight: 14,
  },
  chatInfo: {
    flex: 1,
  },
  chatTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  timeText: {
    fontSize: 11,
  },
  chatBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  latestMessage: {
    fontSize: 13,
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadCountText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
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
});
