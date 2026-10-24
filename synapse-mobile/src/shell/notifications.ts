import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({ handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }) });

export async function installationId() {
  const stored = await SecureStore.getItemAsync('synapse-installation-id');
  if (stored) return stored;
  const id = Crypto.randomUUID();
  await SecureStore.setItemAsync('synapse-installation-id', id);
  return id;
}

export async function registerNotifications(requestPermission: boolean) {
  if (!Device.isDevice || Constants.executionEnvironment === 'storeClient') throw new Error('Notifications need an installed app on a physical device.');
  if (Platform.OS === 'android') await Notifications.setNotificationChannelAsync('community', { name: 'Community updates', importance: Notifications.AndroidImportance.HIGH, sound: 'default' });
  let permission = await Notifications.getPermissionsAsync();
  if (!permission.granted && requestPermission && permission.canAskAgain) permission = await Notifications.requestPermissionsAsync();
  if (!permission.granted) return { token: null, canAskAgain: permission.canAskAgain };
  const projectId = Constants.easConfig?.projectId || Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) throw new Error('Notifications are not available in this version yet.');
  const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
  return { token: data, canAskAgain: permission.canAskAgain };
}
