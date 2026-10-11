import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabNavigator from './BottomTabNavigator';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import VerifyEmailScreen from '../screens/auth/VerifyEmailScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import EventDetailsScreen from '../screens/events/EventDetailsScreen';
import TeamDetailsScreen from '../screens/teams/TeamDetailsScreen';
import ThreadDetailsScreen from '../screens/forums/ThreadDetailsScreen';
import ChatConversationScreen from '../screens/chat/ChatConversationScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import InAppToast from '../components/common/InAppToast';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { loading, isAuthenticated } = useAuth();
  const { colors, isDarkMode } = useTheme();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {isAuthenticated ? (
          <>
            {/* Authenticated Root */}
            <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
            <Stack.Screen name="EventDetails" component={EventDetailsScreen} />
            <Stack.Screen name="TeamDetails" component={TeamDetailsScreen} />
            <Stack.Screen name="ThreadDetails" component={ThreadDetailsScreen} />
            <Stack.Screen name="ChatConversation" component={ChatConversationScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
          </>
        ) : (
          <>
            {/* Auth Flow */}
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            {/* Can also preview public feed */}
            <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
          </>
        )}
      </Stack.Navigator>

      {/* Global In-App Banner for socket messages */}
      <InAppToast />
    </NavigationContainer>
  );
}
