// Ildiz layout: AppDataProvider butun ilovani o'rab turadi.
// Ikonka shriftlari (Ionicons) to'liq yuklanmaguncha asosiy navigator render
// qilinmaydi — shu tariqa har bir ikonka kafolatlangan ko'rinadi.
import { useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import Ionicons from "@expo/vector-icons/Ionicons";
import { AppDataProvider } from "../src/store/AppData";
import { Splash } from "../src/components/Splash";

export default function RootLayout() {
  const [splash, setSplash] = useState(true);
  const [fontsLoaded] = useFonts(Ionicons.font);
  const tayyor = fontsLoaded && !splash;

  return (
    <SafeAreaProvider>
      <AppDataProvider>
        <StatusBar style={tayyor ? "dark" : "light"} />
        {tayyor && (
          <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="qarzlar" />
            <Stack.Screen name="optom" />
            <Stack.Screen name="karta" />
            <Stack.Screen name="brak" />
            <Stack.Screen name="xarajat" />
            <Stack.Screen name="qop" />
          </Stack>
        )}
        {!tayyor && <Splash onDone={() => setSplash(false)} />}
      </AppDataProvider>
    </SafeAreaProvider>
  );
}
