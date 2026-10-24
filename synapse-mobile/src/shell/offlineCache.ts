import AsyncStorage from '@react-native-async-storage/async-storage';
import { Directory, File, Paths } from 'expo-file-system';
import { createOfflineCache } from './offlineCacheCore.mjs';

export type SavedPage = { version: number; uri: string; url: string; title: string; savedAt: string; userId: string | null };
export type Snapshot = { html: string; url: string; title: string; userId: string | null; assets?: { marker: string; url: string }[] };

const cache = createOfflineCache({ Directory, File, Paths, AsyncStorage, fetcher: fetch });
export const readSavedPage = cache.readSavedPage as () => Promise<SavedPage | null>;
export const clearSavedPages = cache.clearSavedPages;
export const savePage = cache.savePage as (snapshot: Snapshot, origin: string) => Promise<SavedPage | null>;
export const offlineReadDirectory = cache.offlineReadDirectory;
