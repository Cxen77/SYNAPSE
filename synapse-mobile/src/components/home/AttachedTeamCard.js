import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';

export default function AttachedTeamCard({ team }) {
  const navigation = useNavigation();
  const { colors, isDarkMode } = useTheme();

  if (!team) return null;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: isDarkMode ? '#1E293B' : '#F3F4F6', borderColor: colors.border }]}
      activeOpacity={0.85}
      onPress={() => navigation.navigate('TeamDetails', { teamId: team._id || team.id })}
    >
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: colors.primaryLight }]}>
          <Ionicons name="people" size={20} color={colors.primary} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {team.name}
          </Text>
          <Text style={[styles.members, { color: colors.textSecondary }]}>
            {team.members?.length || 1} members • {team.college || 'Open Team'}
          </Text>
        </View>
      </View>

      {team.description ? (
        <Text style={[styles.desc, { color: colors.textSecondary }]} numberOfLines={2}>
          {team.description}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginTop: 10,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
  },
  members: {
    fontSize: 12,
    marginTop: 2,
  },
  desc: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8,
  },
});
