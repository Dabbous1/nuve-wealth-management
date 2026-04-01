import {
  CormorantGaramond_300Light,
  CormorantGaramond_400Regular,
  CormorantGaramond_500Medium,
  CormorantGaramond_600SemiBold,
  CormorantGaramond_700Bold,
} from "@expo-google-fonts/cormorant-garamond";
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";
import {
  SpaceMono_400Regular,
  SpaceMono_700Bold,
} from "@expo-google-fonts/space-mono";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { AppProvider, useApp } from "@/context/AppContext";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isOnboarded } = useApp();
  const { isDark } = useTheme();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const publicRoutes = ['onboarding', 'risk-profiler', 'register', 'verify-phone', 'kyc', 'kyc-success', 'sign-in'];
    const inPublicRoute = publicRoutes.includes(segments[0] as string);
    if (!isOnboarded && !inPublicRoute) {
      router.replace('/onboarding');
    } else if (isOnboarded && inPublicRoute) {
      router.replace('/(tabs)');
    }
  }, [isOnboarded, segments]);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="risk-profiler" />
        <Stack.Screen name="register" />
        <Stack.Screen name="verify-phone" />
        <Stack.Screen name="kyc" />
        <Stack.Screen name="kyc-success" />
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="create-goal" />
        <Stack.Screen name="goal/[id]" />
        <Stack.Screen name="deposit" />
        <Stack.Screen name="withdraw" />
        <Stack.Screen name="recurring" />
        <Stack.Screen name="scenario" />
        <Stack.Screen name="compliance" />
        <Stack.Screen name="audit-trail" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="learning" />
        <Stack.Screen name="zakat" />
        <Stack.Screen name="tax" />
        <Stack.Screen name="family" />
        <Stack.Screen name="allocation-breakdown" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    // Cormorant Garamond — Display / Headings
    CormorantGaramond_300Light,
    CormorantGaramond_400Regular,
    CormorantGaramond_500Medium,
    CormorantGaramond_600SemiBold,
    CormorantGaramond_700Bold,
    // DM Sans — Body
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    // Space Mono — Data & Labels
    SpaceMono_400Regular,
    SpaceMono_700Bold,
  });

  // Unregister any Expo-registered service workers so the dev server
  // always serves the freshest bundle (web only, development mode).
  useEffect(() => {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((reg) => reg.unregister());
      });
      if (typeof caches !== 'undefined') {
        caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
      }
    }
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <AppProvider>
            <RootLayoutNav />
          </AppProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
