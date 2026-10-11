import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Avatar from '../common/Avatar';
import { useTheme } from '../../context/ThemeContext';

export default function ForumThreadCard({ thread }) {
  const navigation = useNavigation();
  const { colors, isDarkMode } = useTheme();

  const author = thread.author || thread.user || {};
  const upvotes = (thread.upvotes || []).length || thread.votes || 0;
  const replyCount = (thread.replies || []).length || thread.replyCount || 0;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      activeOpacity={0.88}
      onPress={() => navigation.navigate('ThreadDetails', { threadId: thread._id || thread.id })}
    >
      {/* Category & Date */}
      <View style={styles.topRow}>
        <View style={[styles.categoryBadge, { backgroundColor: colors.primaryLight }]}>
          <Text style={[styles.categoryText, { color: colors.primary }]}>
            {thread.category || 'General'}
          </Text>
        </View>

        <Text style={[styles.timeText, { color: colors.textMuted }]}>
          {thread.createdAt ? new Date(thread.createdAt).toLocaleDateString() : ''}
        </Text>
      </View>

      {/* Title */}
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
        {thread.title}
      </Text>

      {/* Snippet */}
      {thread.content ? (
        <Text style={[styles.snippet, { color: colors.textSecondary }]} numberOfLines={2}>
          {thread.content}
        </Text>
      ) : null}

      {/* Footer */}
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <View style={styles.authorRow}>
          <Avatar
            uri={author.profilePic}
            name={author.name}
            size={24}
            style={{ marginRight: 8 }}
          />
          <Text style={[styles.authorName, { color: colors.textSecondary }]} numberOfLines={1}>
            {author.name || 'Member'}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="arrow-up" size={14} color={colors.primary} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>{upvotes}</Text>
          </View>

          <View style={styles.statItem}>
            <Ionicons name="chatbubble-outline" size={13} color={colors.textSecondary} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>{replyCount}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  timeText: {
    fontSize: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 6,
  },
  snippet: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  authorName: {
    fontSize: 12,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
