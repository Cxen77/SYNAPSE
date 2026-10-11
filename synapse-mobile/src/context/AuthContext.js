import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client, { setMemoryToken } from '../api/client';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredSession();
  }, []);

  const loadStoredSession = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('@synapse_access_token');
      const storedUser = await AsyncStorage.getItem('@synapse_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setMemoryToken(storedToken);
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);

        // Verify with /users/me in background
        client.get('/users/me', { _skipAuthRedirect: true })
          .then(({ data }) => {
            setCurrentUser(data);
            AsyncStorage.setItem('@synapse_user', JSON.stringify(data));
          })
          .catch((err) => {
            console.log('[Auth] Session check failed, retaining offline cache or logging out', err?.message);
          });
      }
    } catch (e) {
      console.error('Error restoring auth session', e);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { data } = await client.post('/auth/login', { email, password });
    if (data.accessToken) {
      setToken(data.accessToken);
      setMemoryToken(data.accessToken);
      setCurrentUser(data);
      await AsyncStorage.setItem('@synapse_access_token', data.accessToken);
      await AsyncStorage.setItem('@synapse_user', JSON.stringify(data));
    }
    return data;
  };

  const signup = async (formData) => {
    const { data } = await client.post('/auth/signup', formData);
    return data;
  };

  const verifyOtp = async (email, otp) => {
    const { data } = await client.post('/auth/verify-email', { email, otp });
    if (data.accessToken) {
      setToken(data.accessToken);
      setMemoryToken(data.accessToken);
      setCurrentUser(data);
      await AsyncStorage.setItem('@synapse_access_token', data.accessToken);
      await AsyncStorage.setItem('@synapse_user', JSON.stringify(data));
    }
    return data;
  };

  const logout = async () => {
    try {
      await client.post('/auth/logout', {}).catch(() => {});
    } finally {
      setToken(null);
      setMemoryToken(null);
      setCurrentUser(null);
      await AsyncStorage.removeItem('@synapse_access_token');
      await AsyncStorage.removeItem('@synapse_user');
    }
  };

  const refreshUser = async () => {
    try {
      const { data } = await client.get('/users/me');
      setCurrentUser(data);
      await AsyncStorage.setItem('@synapse_user', JSON.stringify(data));
      return data;
    } catch (e) {
      console.error('Failed to refresh user', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        loading,
        login,
        signup,
        verifyOtp,
        logout,
        refreshUser,
        isAuthenticated: !!currentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
