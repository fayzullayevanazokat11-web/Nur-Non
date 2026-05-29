// Pastki tab navigatsiya — 4 ta ekran. Ikonkalar — maxsus rasmlar (tintColor bilan bo'yaladi).
import { Tabs } from "expo-router";
import { Image, StyleSheet } from "react-native";
import { C } from "../../src/theme";

const ICONS = {
  markaz: require("../../assets/tabicons/markaz.png"),
  ishlab: require("../../assets/tabicons/ishlab.png"),
  xodimlar: require("../../assets/tabicons/xodimlar.png"),
  ombor: require("../../assets/tabicons/ombor.png"),
};

const tabIcon = (key) => ({ color, size }) => (
  <Image source={ICONS[key]} style={{ width: size, height: size, tintColor: color }} resizeMode="contain" />
);

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: C.accent,
        tabBarInactiveTintColor: C.muted,
        tabBarStyle: { backgroundColor: "#FFFFFF", borderTopColor: C.borderSoft, borderTopWidth: StyleSheet.hairlineWidth, height: 64, paddingTop: 8, paddingBottom: 8 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600", letterSpacing: 0.3 },
        tabBarItemStyle: { paddingVertical: 4 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Markaz", tabBarIcon: tabIcon("markaz") }} />
      <Tabs.Screen name="ishlab" options={{ title: "Ishlab chiqarish", tabBarLabel: "Ishlab", tabBarIcon: tabIcon("ishlab") }} />
      <Tabs.Screen name="xodimlar" options={{ title: "Xodimlar", tabBarIcon: tabIcon("xodimlar") }} />
      <Tabs.Screen name="ombor" options={{ title: "Ombor", tabBarIcon: tabIcon("ombor") }} />
    </Tabs>
  );
}
