import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Avatar from '../common/Avatar';
import { useTheme } from '../../context/ThemeContext';

export default function TeamCard({ team, onJoinPress, isOpenTeam = false }) {
  const navigation = useNavigation();
  const { colors, isDarkMode } = useTheme();

  const members = team.members || [];
  const maxMembers = team.maxMembers || 4;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      activeOpacity={0.88}
      onPress={() => navigation.navigate('TeamDetails', { teamId: team._id || team.id })}
    >
      <View style={styles.header}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {team.name}
          </Text>
          {team.college ? (
            <View style={[styles.collegeBadge, { backgroundColor: isDarkMode ? '#1E293B' : '#F3F4F6' }]}>
              <Text style={[styles.collegeText, { color: colors.textSecondary }]} numberOfLines={1}>
                {team.college}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={[styles.statusBadge, { backgroundColor: colors.primaryLight }]}>
          <Text style={[styles.statusText, { color: colors.primary }]}>
            {isOpenTeam ? 'Open' : `${members.length}/${maxMembers}`}
          </Text>
        </View>
      </View>

      {team.description ? (
        <Text style={[styles.desc, { color: colors.textSecondary }]} numberOfLines={2}>
          {team.description}
        </Text>
      ) : null}

      {/* Skills / Tags */}
      {team.tags && team.tags.length > 0 ? (
        <View style={styles.tagsRow}>
          {team.tags.slice(0, 3).map((tag, idx) => (
            <View key={idx} style={[styles.tag, { backgroundColor: isDarkMode ? '#334155' : '#E5E7EB' }]}>
              <Text style={[styles.tagText, { color: colors.text }]}>{tag}</Text>
            </View>
          ))}
          {team.tags.length > 3 ? (
            <Text style={[styles.moreTags, { color: colors.textMuted }]}>
              +{team.tags.length - 3}
            </Text>
          ) : null}
        </View>
      ) : null}

      {/* Footer */}
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        {/* Avatars */}
        <View style={styles.avatarsRow}>
          {members.slice(0, 4).map((m, idx) => (
            <Avatar
              key={idx}
              uri={m.user?.profilePic || m.profilePic}
              name={m.user?.name || m.name}
              size={28}
              style={[styles.memberAvatar, { marginLeft: idx > 0 ? -8 : 0 }]}
            />
          ))}
          <Text style={[styles.memberCountText, { color: colors.textSecondary }]}>
            {members.length} member{members.length === 1 ? '' : 's'}
          </Text>
        </View>

        {isOpenTeam ? (
          <TouchableOpacity
            style={[styles.joinBtn, { backgroundColor: colors.primary }]}
            onPress={() => onJoinPress && onJoinPress(team)}
          >
            <Text style={styles.joinBtnText}>Join Team</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.chevron}>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </View>
        )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    flexShrink: 1,
  },
  collegeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 8,
    maxWidth: 120,
  },
  collegeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  desc: {
    fontSize: 13.5,
    lineHeight: 19,
    marginBottom: 10,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  moreTags: {
    fontSize: 11,
    alignSelf: 'center',
    marginLeft: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  avatarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  memberCountText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 10,
  },
  joinBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  joinBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  chevron: {
    padding: 4,
  },
});
