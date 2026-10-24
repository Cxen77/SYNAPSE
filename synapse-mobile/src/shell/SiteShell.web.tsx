import React from 'react';
import { Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

export default function SiteShellWeb() {
  const site = process.env.EXPO_PUBLIC_SITE_URL || 'https://www.fuseon.in';
  return <View style={styles.page}><Image source={require('../../assets/logo.png')} style={styles.logo} /><Text style={styles.title}>Your community, wherever you go.</Text><Text style={styles.body}>Discover events, find your team, and stay connected on Synapse. The installed app adds native alerts and saved pages for offline reading.</Text><Pressable accessibilityRole="link" onPress={() => { void Linking.openURL(site); }} style={styles.button}><Text style={styles.buttonText}>Open Synapse</Text></Pressable></View>;
}
const styles = StyleSheet.create({ page: { flex: 1, minHeight: '100%', backgroundColor: '#F7FAFF', alignItems: 'center', justifyContent: 'center', gap: 24, padding: 32 }, logo: { width: 80, height: 80, resizeMode: 'contain' }, title: { fontSize: 30, fontWeight: '700', color: '#17243A', textAlign: 'center', maxWidth: 500 }, body: { fontSize: 17, lineHeight: 26, color: '#59677D', textAlign: 'center', maxWidth: 460 }, button: { paddingHorizontal: 28, paddingVertical: 16, borderRadius: 14, backgroundColor: '#1877F2' }, buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' } });
