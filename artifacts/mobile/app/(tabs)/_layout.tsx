import { Tabs } from "expo-router";
import {
  House,
  Wallet,
  CreditCard,
  PiggyBank,
  TrendUp,
} from "phosphor-react-native";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { BlurView } from "expo-blur";
import { useColors } from "@/hooks/useColors";
import { useTheme } from "@/context/ThemeContext";

function TabDotIndicator({ focused }: { focused: boolean }) {
  const C = useColors();
  if (!focused) return null;
  return (
    <View style={{
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: C.teal,
      marginTop: 2,
    }} />
  );
}

export default function TabLayout() {
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";
  const C = useColors();
  const { isDark } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: C.teal,
        tabBarInactiveTintColor: C.slate,
        tabBarLabelStyle: {
          fontFamily: 'DMSans_500Medium',
          fontSize: 11,
          marginBottom: 0,
        },
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : (isDark ? C.surface : C.white),
          borderTopWidth: 1,
          borderTopColor: C.borderLight,
          height: isWeb ? 72 : 88,
          paddingTop: 12,
          paddingBottom: isWeb ? 8 : undefined,
          elevation: 0,
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView intensity={95} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? C.surface : C.white }]} />
          ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <House size={22} color={color} weight="light" />
              <TabDotIndicator focused={focused} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: "Wallet",
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <Wallet size={22} color={color} weight="light" />
              <TabDotIndicator focused={focused} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="spend"
        options={{
          title: "Spend",
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <CreditCard size={22} color={color} weight="light" />
              <TabDotIndicator focused={focused} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="save"
        options={{
          title: "Save",
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <PiggyBank size={22} color={color} weight="light" />
              <TabDotIndicator focused={focused} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="invest"
        options={{
          title: "Invest",
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <TrendUp size={22} color={color} weight="light" />
              <TabDotIndicator focused={focused} />
            </View>
          ),
        }}
      />
      {/* Hidden from nav */}
      <Tabs.Screen name="portfolio" options={{ href: null }} />
      <Tabs.Screen name="insights" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="advisor" options={{ href: null }} />
    </Tabs>
  );
}
