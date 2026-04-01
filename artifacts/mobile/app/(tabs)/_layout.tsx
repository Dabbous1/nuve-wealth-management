import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { BlurView } from "expo-blur";
import Colors from "@/constants/colors";

function TabDotIndicator({ focused }: { focused: boolean }) {
  if (!focused) return null;
  return (
    <View style={{
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: Colors.teal,
      marginTop: 2,
    }} />
  );
}

export default function TabLayout() {
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.teal,
        tabBarInactiveTintColor: Colors.slate,
        tabBarLabelStyle: {
          fontFamily: 'DMSans_500Medium',
          fontSize: 11,
          marginBottom: 0,
        },
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : Colors.white,
          borderTopWidth: 1,
          borderTopColor: Colors.borderLight,
          height: isWeb ? 72 : 88,
          paddingTop: 12,
          paddingBottom: isWeb ? 8 : undefined,
          elevation: 0,
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView intensity={95} tint="light" style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: Colors.white }]} />
          ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <Feather name="home" size={size ?? 22} color={color} />
              <TabDotIndicator focused={focused} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: "Wallet",
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <Feather name="credit-card" size={size ?? 22} color={color} />
              <TabDotIndicator focused={focused} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="spend"
        options={{
          title: "Spend",
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <Feather name="shopping-bag" size={size ?? 22} color={color} />
              <TabDotIndicator focused={focused} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="save"
        options={{
          title: "Save",
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <Feather name="target" size={size ?? 22} color={color} />
              <TabDotIndicator focused={focused} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="invest"
        options={{
          title: "Invest",
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <Feather name="trending-up" size={size ?? 22} color={color} />
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
