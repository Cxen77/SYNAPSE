import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Avatar from '../common/Avatar';
import VerifiedBadge from '../common/VerifiedBadge';
import AttachedEventCard from './AttachedEventCard';
import AttachedTeamCard from './AttachedTeamCard';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import client from '../../api/client';

export default function PostCard({ post, onCommentPress }) {
  const navigation = useNavigation();
  const { currentUser } = useAuth();
  const { colors, isDarkMode } = useTheme();

  const author = post.author || post.user || {};
  const isLikedInitial = (post.likes || []).some(
    (id) => id === currentUser?._id || id?._id === currentUser?._id
  );

  const [isLiked, setIsLiked] = useState(isLikedInitial);
  const [likesCount, setLikesCount] = useState((post.likes || []).length);

  const handleLike = async () => {
    const nextState = !isLiked;
    setIsLiked(nextState);
    setLikesCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    try {
      await client.post(`/posts/${post._id}/like`);
    } catch (err) {
      // Revert if failed
      setIsLiked(!nextState);
      setLikesCount((prev) => (!nextState ? prev + 1 : Math.max(0, prev - 1)));
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${author.name || 'Synapse'}: "${post.content || ''}" on Synapse`,
      });
    } catch (e) {
      console.log('Share error', e);
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Author Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.authorRow}
          onPress={() => navigation.navigate('Profile', { username: author.username })}
        >
          <Avatar
            uri={author.profilePic}
            name={author.name}
            size={42}
            style={styles.avatar}
          />
          <View style={styles.authorInfo}>
            <View style={styles.nameRow}>
              <Text style={[styles.authorName, { color: colors.text }]} numberOfLines={1}>
                {author.name || 'Community Member'}
              </Text>
              {author.isVerified ? <VerifiedBadge size={14} /> : null}
            </View>
            <Text style={[styles.authorMeta, { color: colors.textSecondary }]}>
              @{author.username || 'user'} • {formatTime(post.createdAt)}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="ellipsis-horizontal" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Post Text */}
      {post.content ? (
        <Text style={[styles.content, { color: colors.text }]}>{post.content}</Text>
      ) : null}

      {/* Media Image */}
      {post.mediaUrl || post.image ? (
        <Image
          source={{ uri: post.mediaUrl || post.image }}
          style={styles.mediaImage}
          contentFit="cover"
          transition={200}
        />
      ) : null}

      {/* Embedded Event */}
      {post.attachedEvent ? <AttachedEventCard event={post.attachedEvent} /> : null}

      {/* Embedded Team */}
      {post.attachedTeam ? <AttachedTeamCard team={post.attachedTeam} /> : null}

      {/* Actions Row */}
      <View style={[styles.actionsRow, { borderTopColor: colors.border }]}>
        {/* Like */}
        <TouchableOpacity style={styles.actionBtn} onPress={handleLike} activeOpacity={0.7}>
          <Ionicons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={20}
            color={isLiked ? '#EF4444' : colors.textSecondary}
          />
          <Text
            style={[
              styles.actionCount,
              { color: isLiked ? '#EF4444' : colors.textSecondary },
            ]}
          >
            {likesCount}
          </Text>
        </TouchableOpacity>

        {/* Comment */}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onCommentPress && onCommentPress(post)}
          activeOpacity={0.7}
        >
          <Ionicons name="chatbubble-outline" size={19} color={colors.textSecondary} />
          <Text style={[styles.actionCount, { color: colors.textSecondary }]}>
            {(post.comments || []).length}
          </Text>
        </TouchableOpacity>

        {/* Share */}
        <TouchableOpacity style={styles.actionBtn} onPress={handleShare} activeOpacity={0.7}>
          <Ionicons name="share-social-outline" size={19} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* Bookmark */}
        <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
          <Ionicons name="bookmark-outline" size={19} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    marginRight: 10,
  },
  authorInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorName: {
    fontSize: 15,
    fontWeight: '700',
  },
  authorMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  content: {
    fontSize: 14.5,
    lineHeight: 22,
    marginBottom: 12,
  },
  mediaImage: {
    width: '100%',
    height: 220,
    borderRadius: 14,
    marginBottom: 10,
    backgroundColor: '#E5E7EB',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  actionCount: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
});
