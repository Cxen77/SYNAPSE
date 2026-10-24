import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

void SplashScreen.preventAutoHideAsync().catch(() => {});
export default function RootLayout() {
  useEffect(() => { void SplashScreen.hideAsync(); }, []);
  return <Stack screenOptions={{ headerShown: false }} />;
}
