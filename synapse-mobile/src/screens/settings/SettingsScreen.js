import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/common/Header';
import Avatar from '../../components/common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function SettingsScreen({ navigation }) {
  const { currentUser, logout } = useAuth();
  const { colors, isDarkMode, toggleTheme } = useTheme();

  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of Synapse?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Settings" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Card */}
        <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Avatar
            uri={currentUser?.profilePic}
            name={currentUser?.name}
            size={56}
            style={{ marginRight: 14 }}
          />
          <View style={{ flex: 1 }}>
            <Text style={[styles.name, { color: colors.text }]}>
              {currentUser?.name || 'Synapse User'}
            </Text>
            <Text style={[styles.email, { color: colors.textSecondary }]}>
              {currentUser?.email || 'user@college.edu'}
            </Text>
          </View>
        </View>

        {/* Section: Interface & Theme */}
        <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>PREFERENCES</Text>
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
            <View style={styles.settingLabelRow}>
              <View style={[styles.iconBox, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name={isDarkMode ? 'moon' : 'sunny'} size={18} color={colors.primary} />
              </View>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Mode</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: '#D1D5DB', true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLabelRow}>
              <View style={[styles.iconBox, { backgroundColor: '#D1FAE5' }]}>
                <Ionicons name="notifications" size={18} color="#059669" />
              </View>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Push Notifications</Text>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              trackColor={{ false: '#D1D5DB', true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Section: Account & Privacy */}
        <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>ACCOUNT & PRIVACY</Text>
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity style={[styles.settingRow, { borderBottomColor: colors.border }]}>
            <View style={styles.settingLabelRow}>
              <View style={[styles.iconBox, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="lock-closed" size={18} color="#D97706" />
              </View>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Security & Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingLabelRow}>
              <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="shield-checkmark" size={18} color="#2563EB" />
              </View>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Privacy Settings</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Section: Support & Legal */}
        <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>ABOUT</Text>
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity style={[styles.settingRow, { borderBottomColor: colors.border }]}>
            <View style={styles.settingLabelRow}>
              <View style={[styles.iconBox, { backgroundColor: '#F3F4F6' }]}>
                <Ionicons name="document-text" size={18} color="#4B5563" />
              </View>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Terms & Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.settingRow}>
            <View style={styles.settingLabelRow}>
              <View style={[styles.iconBox, { backgroundColor: '#F3F4F6' }]}>
                <Ionicons name="code-working" size={18} color="#4B5563" />
              </View>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Version</Text>
            </View>
            <Text style={[styles.versionText, { color: colors.textMuted }]}>1.0.0 (Expo SDK 57)</Text>
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={[styles.logoutBtn, { borderColor: colors.destructive }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.destructive} style={{ marginRight: 8 }} />
          <Text style={[styles.logoutText, { color: colors.destructive }]}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 24,
  },
  name: {
    fontSize: 17,
    fontWeight: '800',
  },
  email: {
    fontSize: 13,
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionCard: {
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 22,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 14.5,
    fontWeight: '600',
  },
  versionText: {
    fontSize: 13,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 10,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
