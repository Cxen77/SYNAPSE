import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, AppState, BackHandler, Image, Linking, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { StatusBar } from 'expo-status-bar';
import * as Network from 'expo-network';
import * as Notifications from 'expo-notifications';
import * as WebBrowser from 'expo-web-browser';
import Ionicons from '@expo/vector-icons/Ionicons';
import { canCachePage, externalUrl, isInternalUrl, isOnline, navigationAction, notificationUrl, parseBridgeMessage, siteOrigin } from './policy.mjs';
import { captureSnapshotScript, createBootstrapScript } from './snapshotScript.mjs';
import { clearSavedPages, offlineReadDirectory, readSavedPage, savePage, type SavedPage, type Snapshot } from './offlineCache';
import { installationId, registerNotifications } from './notifications';

const ORIGIN = siteOrigin(process.env.EXPO_PUBLIC_SITE_URL || 'https://www.fuseon.in');
const HOME = `${ORIGIN}/`;
const BLUE = '#1877F2';

export default function SiteShell() {
  const web = useRef<WebView>(null);
  const [deviceId, setDeviceId] = useState('');
  const [booted, setBooted] = useState(false);
  const [online, setOnline] = useState(true);
  const [failed, setFailed] = useState(false);
  const [saved, setSaved] = useState<SavedPage | null>(null);
  const [url, setUrl] = useState(HOME);
  const [title, setTitle] = useState('Synapse');
  const [canGoBack, setCanGoBack] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [pushBusy, setPushBusy] = useState(false);
  const [pushRegistered, setPushRegistered] = useState(false);
  const token = useRef<string | null>(null);
  const account = useRef<string | null | undefined>(undefined);
  const saving = useRef(false);
  const mounted = useRef(true);
  const pendingNotification = useRef<string | null>(null);
  const lastResponse = useRef<string | null>(null);
  const cachedMode = !online || failed;
  const activeUrl = useRef(HOME);
  const nativeBack = useRef(false);
  const live = useRef(false);

  const sendPushToken = useCallback(() => {
    if (!token.current || !deviceId || !account.current) return;
    const payload = { token: token.current, deviceId, platform: Platform.OS };
    web.current?.injectJavaScript(`window.dispatchEvent(new CustomEvent('synapse:native-push',{detail:${JSON.stringify(payload)}})); true;`);
  }, [deviceId]);

  const enablePush = useCallback(async (prompt: boolean) => {
    if (!online || !account.current) {
      if (prompt) Alert.alert('Sign in to get alerts', 'Connect to the internet and sign in to enable notifications.');
      return;
    }
    if (!prompt && token.current) { sendPushToken(); return; }
    setPushBusy(true);
    try {
      const result = await registerNotifications(prompt);
      token.current = result.token;
      if (result.token) sendPushToken();
      else if (prompt) Alert.alert('Notifications are off', 'You can enable Synapse alerts in your device settings.', [{ text: 'Not now', style: 'cancel' }, { text: 'Open settings', onPress: () => { void Linking.openSettings(); } }]);
    } catch (error) {
      if (prompt) Alert.alert('Notifications unavailable', error instanceof Error ? error.message : 'Please try again when you are connected.');
    } finally { if (mounted.current) setPushBusy(false); }
  }, [online, sendPushToken]);

  useEffect(() => {
    mounted.current = true;
    Promise.allSettled([installationId(), readSavedPage(), Network.getNetworkStateAsync()]).then(([identity, stored, connection]) => {
      if (!mounted.current) return;
      const id = identity.status === 'fulfilled' ? identity.value : '';
      const page = stored.status === 'fulfilled' ? stored.value : null;
      const network = connection.status === 'fulfilled' ? connection.value : {};
      setDeviceId(id); setSaved(page && isInternalUrl(page.url, ORIGIN) ? page : null); setOnline(isOnline(network));
      if (page && isInternalUrl(page.url, ORIGIN)) { setUrl(page.url); activeUrl.current = page.url; }
      setBooted(true);
    }).catch(() => { if (mounted.current) { setBooted(true); setLoading(false); } });
    const subscription = Network.addNetworkStateListener(network => {
      if (mounted.current) { setOnline(isOnline(network)); if (isOnline(network)) setFailed(false); }
    });
    const appState = AppState.addEventListener('change', state => {
      if (state === 'active') void Network.getNetworkStateAsync().then(network => { if (mounted.current) { setOnline(isOnline(network)); if (isOnline(network)) setFailed(false); } });
    });
    return () => { mounted.current = false; subscription.remove(); appState.remove(); };
  }, []);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!cachedMode && canGoBack) { web.current?.goBack(); return true; }
      return false;
    });
    return () => subscription.remove();
  }, [cachedMode, canGoBack]);

  const handleNotification = useCallback((response: Notifications.NotificationResponse | null) => {
    if (!response || lastResponse.current === response.notification.request.identifier) return;
    lastResponse.current = response.notification.request.identifier;
    const target = notificationUrl(response.notification.request.content.data, ORIGIN);
    if (!live.current) pendingNotification.current = target;
    else { setUrl(target); activeUrl.current = target; setFailed(false); }
    void Notifications.clearLastNotificationResponseAsync();
  }, []);

  useEffect(() => {
    void Notifications.getLastNotificationResponseAsync().then(handleNotification);
    const response = Notifications.addNotificationResponseReceivedListener(handleNotification);
    const rotation = Notifications.addPushTokenListener(() => { void enablePush(false); });
    return () => { response.remove(); rotation.remove(); };
  }, [enablePush, handleNotification]);

  useEffect(() => {
    live.current = booted && !cachedMode;
    if (live.current && pendingNotification.current) {
      setUrl(pendingNotification.current); activeUrl.current = pendingNotification.current; pendingNotification.current = null;
    }
  }, [booted, cachedMode]);

  useEffect(() => {
    if (!booted || cachedMode) return;
    const capture = setInterval(() => { if (!saving.current && !loading) web.current?.injectJavaScript(captureSnapshotScript); }, 15000);
    return () => clearInterval(capture);
  }, [booted, cachedMode, loading]);

  useEffect(() => {
    if (cachedMode) {
      setUrl(activeUrl.current);
      void readSavedPage().then(page => {
        if (mounted.current) setSaved(page && isInternalUrl(page.url, ORIGIN) && (account.current === undefined || page.userId === account.current) ? page : null);
      });
    }
  }, [cachedMode]);

  const onMessage = async (event: WebViewMessageEvent) => {
    const message = parseBridgeMessage(event.nativeEvent.data, event.nativeEvent.url, ORIGIN);
    if (!message || cachedMode) return;
    if (message.type === 'session') {
      const next = typeof message.userId === 'string' ? message.userId : null;
      const previous = account.current === undefined ? saved?.userId || null : account.current;
      account.current = next;
      setUserId(next);
      if (previous !== next) { setSaved(null); setPushRegistered(false); await clearSavedPages(); }
      if (next) void enablePush(false);
      else { token.current = null; setPushRegistered(false); }
      web.current?.injectJavaScript(captureSnapshotScript);
    } else if (message.type === 'snapshot' && !saving.current && message.userId === account.current && canCachePage(message.url, ORIGIN)) {
      saving.current = true;
      try {
        const page = await savePage(message as Snapshot, ORIGIN);
        if (page && mounted.current && page.userId === account.current) setSaved(page);
      } catch { /* A full disk must not prevent online browsing. */ }
      finally { saving.current = false; }
    } else if (message.type === 'push-registered' && message.userId === account.current) {
      setPushRegistered(true);
    } else if (message.type === 'push-error' && message.userId === account.current) {
      setPushRegistered(false);
    } else if (message.type === 'page') {
      if (isInternalUrl(message.url, ORIGIN)) { activeUrl.current = message.url; setTitle(message.title || 'Synapse'); setCanGoBack(message.canGoBack === true || nativeBack.current); }
    } else if (message.type === 'content-ready' && !saving.current) {
      web.current?.injectJavaScript(captureSnapshotScript);
    }
  };

  const openExternal = async (value: string) => {
    const safe = externalUrl(value);
    if (!safe) return;
    try {
      if (/^https?:/.test(safe)) await WebBrowser.openBrowserAsync(safe);
      else await Linking.openURL(safe);
    } catch { Alert.alert('Could not open this link', 'Please try again later.'); }
  };

  const retry = async () => {
    const network = await Network.getNetworkStateAsync().catch(() => ({ isConnected: false }));
    setOnline(isOnline(network));
    if (!isOnline(network)) { setLoading(false); setRefreshing(false); return; }
    setFailed(false); setLoading(true); setRefreshing(true);
    if (cachedMode) setUrl(activeUrl.current);
    else web.current?.reload();
  };

  const fail = () => { setFailed(true); setLoading(false); setRefreshing(false); };
  if (!booted) return <View style={styles.empty}><Image source={require('../../assets/logo.png')} style={styles.logo} /><ActivityIndicator color={BLUE} accessibilityLabel="Starting Synapse" /></View>;

  return <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
    <StatusBar style="dark" />
    <View style={styles.toolbar}>
      <Pressable accessibilityRole="button" accessibilityLabel="Go back" disabled={!canGoBack || cachedMode} onPress={() => web.current?.goBack()} style={styles.iconButton}><Ionicons name="chevron-back" size={23} color={canGoBack && !cachedMode ? '#17243A' : '#C8D0DC'} /></Pressable>
      <View style={styles.heading}><Text numberOfLines={1} style={styles.brand}>Synapse</Text><Text numberOfLines={1} style={styles.subtitle}>{cachedMode ? 'Saved for offline reading' : title === 'Synapse' ? 'Your campus. Your community.' : title}</Text></View>
      <Pressable accessibilityRole="button" accessibilityLabel={pushRegistered ? 'Notification settings' : 'Enable push notifications'} onPress={() => { if (pushRegistered) void Linking.openSettings(); else void enablePush(true); }} disabled={pushBusy || !online} style={styles.iconButton}>{pushBusy ? <ActivityIndicator color={BLUE} /> : <Ionicons name={pushRegistered ? 'notifications' : 'notifications-outline'} size={21} color={userId ? BLUE : '#68758B'} />}</Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Refresh page" onPress={retry} disabled={!online} style={styles.iconButton}><Ionicons name="refresh" size={21} color={online ? '#17243A' : '#C8D0DC'} /></Pressable>
    </View>
    {cachedMode && <View accessibilityRole="alert" style={styles.banner}><Ionicons name="cloud-offline-outline" size={19} color="#8B5200" /><Text style={styles.bannerText}>{!online ? 'You’re offline.' : 'Connection interrupted.'} {saved ? `Showing a saved copy from ${new Date(saved.savedAt).toLocaleString()}. Read only.` : 'Connect to load your community.'}</Text></View>}
    {!cachedMode && loading && <View accessibilityLabel="Page loading progress" style={styles.track}><View style={[styles.progress, { width: `${Math.max(5, progress * 100)}%` }]} /></View>}
    {cachedMode ? saved ? <WebView key={saved.uri} source={{ uri: saved.uri }} style={styles.web} javaScriptEnabled={false} originWhitelist={['file://*']} allowFileAccess allowFileAccessFromFileURLs={false} allowUniversalAccessFromFileURLs={false} allowingReadAccessToURL={offlineReadDirectory()} onShouldStartLoadWithRequest={request => request.url === saved.uri} /> : <View style={styles.empty}><Ionicons name="cloud-offline-outline" color={BLUE} size={54} /><Text style={styles.emptyTitle}>Your community will be here</Text><Text style={styles.emptyText}>Open Synapse while connected once. The last page you read will be saved on this device for next time.</Text><Pressable accessibilityRole="button" onPress={retry} style={styles.retry}><Text style={styles.retryText}>Try again</Text></Pressable></View> : <ScrollView style={styles.web} contentContainerStyle={styles.webContainer} scrollEnabled={Platform.OS === 'android' && atTop} refreshControl={Platform.OS === 'android' ? <RefreshControl enabled={atTop && !loading} refreshing={refreshing} onRefresh={retry} tintColor={BLUE} colors={[BLUE]} /> : undefined}>
      <WebView ref={web} source={{ uri: url }} style={styles.web} containerStyle={styles.web} originWhitelist={['*']} sharedCookiesEnabled thirdPartyCookiesEnabled={false} domStorageEnabled cacheEnabled cacheMode="LOAD_DEFAULT" mixedContentMode="never" allowFileAccess={false} javaScriptCanOpenWindowsAutomatically={false} setSupportMultipleWindows pullToRefreshEnabled={Platform.OS === 'ios'} allowsBackForwardNavigationGestures injectedJavaScriptBeforeContentLoaded={createBootstrapScript(deviceId)} injectedJavaScriptBeforeContentLoadedForMainFrameOnly onMessage={event => { void onMessage(event); }}
        onLoadStart={() => { setLoading(true); setProgress(0); }} onLoadProgress={event => setProgress(event.nativeEvent.progress)}
        onLoadEnd={() => { setLoading(false); setRefreshing(false); sendPushToken(); web.current?.injectJavaScript(`${createBootstrapScript(deviceId)} setTimeout(function(){${captureSnapshotScript}},1200); true;`); }}
        onNavigationStateChange={navigation => { if (isInternalUrl(navigation.url, ORIGIN)) { activeUrl.current = navigation.url; nativeBack.current = navigation.canGoBack; setCanGoBack(navigation.canGoBack); setTitle(navigation.title || 'Synapse'); } }}
        onScroll={event => setAtTop(event.nativeEvent.contentOffset.y <= 0)} nestedScrollEnabled
        onShouldStartLoadWithRequest={request => { const action = navigationAction(request, ORIGIN); if (action === 'external') void openExternal(request.url); return action === 'internal'; }}
        onOpenWindow={event => { const target = event.nativeEvent.targetUrl; if (isInternalUrl(target, ORIGIN)) setUrl(target); else void openExternal(target); }}
        onError={fail} onHttpError={event => { if (event.nativeEvent.url === activeUrl.current && event.nativeEvent.statusCode >= 400) fail(); }} onRenderProcessGone={fail} onContentProcessDidTerminate={fail}
        renderError={() => <View />} />
    </ScrollView>}
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' }, web: { flex: 1 }, webContainer: { flexGrow: 1 },
  toolbar: { height: 64, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#DFE5EE' },
  iconButton: { width: 44, height: 48, alignItems: 'center', justifyContent: 'center' }, heading: { flex: 1, paddingHorizontal: 4 },
  brand: { color: '#17243A', fontWeight: '700', fontSize: 19, letterSpacing: -0.4 }, subtitle: { color: '#68758B', fontSize: 12, marginTop: 2 },
  banner: { backgroundColor: '#FFF3DA', flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 12 }, bannerText: { flex: 1, color: '#734900', fontSize: 13, lineHeight: 19 },
  track: { height: 3, backgroundColor: '#E8F0FD' }, progress: { height: 3, backgroundColor: BLUE },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30, backgroundColor: '#F7FAFF', gap: 18 }, logo: { width: 76, height: 76, resizeMode: 'contain' },
  emptyTitle: { fontSize: 23, fontWeight: '700', color: '#17243A', textAlign: 'center' }, emptyText: { fontSize: 16, lineHeight: 24, color: '#59677D', textAlign: 'center', maxWidth: 340 },
  retry: { borderRadius: 14, backgroundColor: BLUE, paddingHorizontal: 28, paddingVertical: 15, minHeight: 48 }, retryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
