// Ildiz layout: AppDataProvider butun ilovani o'rab turadi.
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
  // Ionicons shriftini fonда oldindan yuklaymiz (render'ни bloklamaymiz —
  // aks holda shrift yuklanmasa oq ekran bo'lib qoladi).
  useFonts(Ionicons.font);

  return (
    <SafeAreaProvider>
      <AppDataProvider>
        <StatusBar style={splash ? "light" : "dark"} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
        {splash && <Splash onDone={() => setSplash(false)} />}
      </AppDataProvider>
    </SafeAreaProvider>
  );
}
