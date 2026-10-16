// Pastki tab navigatsiya — 4 ta ekran. Ikonkalar — maxsus rasmlar (tintColor bilan bo'yaladi).
import { Tabs } from "expo-router";
import { Image, StyleSheet } from "react-native";
import { C } from "../../src/theme";
import { useTil } from "../../src/i18n/til";
import { ogir } from "../../src/i18n/translit";

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
  // Tab nomlari kutubxona ichida chiziladi — shuning uchun yozuvga shu yerda o'giramiz
  const til = useTil();
  const t = (s) => ogir(s, til);
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
      <Tabs.Screen name="index" options={{ title: t("Markaz"), tabBarIcon: tabIcon("markaz") }} />
      <Tabs.Screen name="ishlab" options={{ title: t("Ishlab chiqarish"), tabBarLabel: t("Ishlab"), tabBarIcon: tabIcon("ishlab") }} />
      <Tabs.Screen name="xodimlar" options={{ title: t("Xodimlar"), tabBarIcon: tabIcon("xodimlar") }} />
      <Tabs.Screen name="ombor" options={{ title: t("Ombor"), tabBarIcon: tabIcon("ombor") }} />
    </Tabs>
  );
}
