import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// In-memory fallback
let currentAccessToken = null;

export const setMemoryToken = (token) => {
  currentAccessToken = token;
};

export const getMemoryToken = () => currentAccessToken;

// Detect best host for local dev:
// 192.168.1.7 works for both physical devices on Wi-Fi and emulators!
const DEV_LAN_URL = 'http://192.168.1.7:5000/api/v1';
const DEV_EMULATOR_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api/v1' : 'http://localhost:5000/api/v1';

export const API_BASE_URL = DEV_LAN_URL;
export const SOCKET_URL = 'http://192.168.1.7:5000';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// REQUEST INTERCEPTOR: Attach Bearer token from memory or AsyncStorage
client.interceptors.request.use(
  async (config) => {
    let token = currentAccessToken;
    if (!token) {
      token = await AsyncStorage.getItem('@synapse_access_token');
      if (token) currentAccessToken = token;
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR: Handle 401s gracefully
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._skipAuthRedirect) {
      // Token expired or invalid
      console.warn('[API] 401 Unauthorized encountered');
    }
    return Promise.reject(error);
  }
);

export default client;
