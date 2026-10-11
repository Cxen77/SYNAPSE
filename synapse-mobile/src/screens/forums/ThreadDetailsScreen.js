import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/common/Header';
import Avatar from '../../components/common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import client from '../../api/client';

export default function ThreadDetailsScreen({ route }) {
  const { threadId } = route.params || {};
  const { currentUser } = useAuth();
  const { colors, isDarkMode } = useTheme();

  const [thread, setThread] = useState(null);
  const [replies, setReplies] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [voteCount, setVoteCount] = useState(0);

  useEffect(() => {
    fetchThreadData();
  }, [threadId]);

  const fetchThreadData = async () => {
    try {
      const { data } = await client.get(`/forums/posts/${threadId}`);
      const t = data.post || data;
      setThread(t);
      setReplies(t.replies || []);
      setVoteCount((t.upvotes || []).length || t.votes || 0);
    } catch (err) {
      console.log('Error fetching thread', err?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (delta) => {
    setVoteCount((v) => v + delta);
    try {
      await client.post(`/forums/posts/${threadId}/vote`, { type: delta > 0 ? 'up' : 'down' });
    } catch (e) {
      setVoteCount((v) => v - delta);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;

    setSubmitting(true);
    try {
      const { data } = await client.post(`/forums/posts/${threadId}/reply`, {
        content: replyText.trim(),
      });
      const newReply = data.reply || {
        _id: String(Date.now()),
        content: replyText.trim(),
        author: {
          name: currentUser?.name || 'You',
          profilePic: currentUser?.profilePic,
        },
        createdAt: new Date().toISOString(),
      };
      setReplies((prev) => [...prev, newReply]);
      setReplyText('');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to submit reply.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Header showBack title="Discussion" />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!thread) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Header showBack title="Discussion" />
        <View style={styles.centerContainer}>
          <Text style={{ color: colors.textSecondary }}>Thread not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const author = thread.author || thread.user || {};

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header showBack title="Discussion" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <FlatList
          data={replies}
          keyExtractor={(item) => item._id || String(Math.random())}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={[styles.threadCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {/* Category */}
              <View style={[styles.categoryBadge, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.categoryText, { color: colors.primary }]}>
                  {thread.category || 'General'}
                </Text>
              </View>

              <Text style={[styles.threadTitle, { color: colors.text }]}>{thread.title}</Text>

              {/* Author */}
              <View style={styles.authorRow}>
                <Avatar uri={author.profilePic} name={author.name} size={32} style={{ marginRight: 8 }} />
                <View>
                  <Text style={[styles.authorName, { color: colors.text }]}>{author.name}</Text>
                  <Text style={[styles.postDate, { color: colors.textMuted }]}>
                    {new Date(thread.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              {/* Body */}
              <Text style={[styles.threadBody, { color: colors.textSecondary }]}>
                {thread.content}
              </Text>

              {/* Voting Bar */}
              <View style={[styles.voteBar, { borderTopColor: colors.border }]}>
                <TouchableOpacity style={styles.voteBtn} onPress={() => handleVote(1)}>
                  <Ionicons name="arrow-up" size={18} color={colors.primary} />
                </TouchableOpacity>
                <Text style={[styles.voteNumber, { color: colors.text }]}>{voteCount}</Text>
                <TouchableOpacity style={styles.voteBtn} onPress={() => handleVote(-1)}>
                  <Ionicons name="arrow-down" size={18} color={colors.textMuted} />
                </TouchableOpacity>

                <View style={styles.repliesCountWrap}>
                  <Ionicons name="chatbubbles-outline" size={16} color={colors.textSecondary} />
                  <Text style={[styles.repliesCountText, { color: colors.textSecondary }]}>
                    {replies.length} Replies
                  </Text>
                </View>
              </View>
            </View>
          }
          renderItem={({ item }) => {
            const replyAuthor = item.author || item.user || {};
            return (
              <View style={[styles.replyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.replyAuthorRow}>
                  <Avatar uri={replyAuthor.profilePic} name={replyAuthor.name} size={28} style={{ marginRight: 8 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.replyAuthorName, { color: colors.text }]}>{replyAuthor.name}</Text>
                    <Text style={[styles.replyTime, { color: colors.textMuted }]}>
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Just now'}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.replyContent, { color: colors.textSecondary }]}>
                  {item.content}
                </Text>
              </View>
            );
          }}
        />

        {/* Reply Input Bar */}
        <View style={[styles.replyInputBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <TextInput
            style={[styles.replyInput, { backgroundColor: isDarkMode ? '#1E293B' : '#F9FAFB', borderColor: colors.border, color: colors.text }]}
            placeholder="Write a helpful reply..."
            placeholderTextColor={colors.textMuted}
            value={replyText}
            onChangeText={setReplyText}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, { backgroundColor: colors.primary }]}
            onPress={handleSendReply}
            disabled={submitting || !replyText.trim()}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Ionicons name="send" size={16} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  listContent: {
    padding: 16,
    paddingBottom: 20,
  },
  threadCard: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 10,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  threadTitle: {
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 26,
    marginBottom: 12,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  authorName: {
    fontSize: 13,
    fontWeight: '700',
  },
  postDate: {
    fontSize: 11,
    marginTop: 1,
  },
  threadBody: {
    fontSize: 14.5,
    lineHeight: 22,
    marginBottom: 16,
  },
  voteBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  voteBtn: {
    padding: 6,
  },
  voteNumber: {
    fontSize: 14,
    fontWeight: '800',
    marginHorizontal: 4,
  },
  repliesCountWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    gap: 4,
  },
  repliesCountText: {
    fontSize: 13,
    fontWeight: '600',
  },
  replyCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  replyAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  replyAuthorName: {
    fontSize: 13,
    fontWeight: '700',
  },
  replyTime: {
    fontSize: 11,
  },
  replyContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  replyInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  replyInput: {
    flex: 1,
    maxHeight: 90,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
