import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { Platform, StyleSheet } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { useEffect } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    throw new Error('Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY');
  }

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }
    const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
    NavigationBar.setBackgroundColorAsync(theme.background);
    NavigationBar.setButtonStyleAsync(colorScheme === 'dark' ? 'light' : 'dark');
  }, [colorScheme]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <ThemeProvider
          value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
        >
          <Stack>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="modal"
              options={{ presentation: 'modal', title: 'Modal' }}
            />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
