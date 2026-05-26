// Pastki tab navigatsiya — 4 ta ekran.
import { Tabs } from "expo-router";
import { StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C } from "../../src/theme";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: C.accent,
        tabBarInactiveTintColor: C.muted,
        tabBarStyle: { backgroundColor: C.card, borderTopColor: C.border, borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600", letterSpacing: 0.2 },
        tabBarItemStyle: { paddingVertical: 4 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Markaz",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ishlab"
        options={{
          title: "Ishlab chiqarish",
          tabBarLabel: "Ishlab",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "cube" : "cube-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="xodimlar"
        options={{
          title: "Xodimlar",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "people" : "people-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ombor"
        options={{
          title: "Ombor",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "server" : "server-outline"} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
