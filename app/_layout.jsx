// Ildiz layout: AppDataProvider butun ilovani o'rab turadi.
// Ionicons shrifti app.json'dagi expo-font plugin orqali APK ichiga embed
// qilingan — natija qaytishini kutmasdan render qilamiz (production'da
// useFonts ba'zan true qaytarmasdi → oppoq ekran muammosi).
import { useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import Ionicons from "@expo/vector-icons/Ionicons";
import { AppDataProvider } from "../src/store/AppData";
import { Splash } from "../src/components/Splash";
import { ErrorBoundary } from "../src/components/ErrorBoundary";

export default function RootLayout() {
  const [splash, setSplash] = useState(true);
  useFonts(Ionicons.font); // best-effort; render'ni bloklamaydi

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AppDataProvider>
          <StatusBar style={splash ? "light" : "dark"} />
          <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="qarzlar" />
            <Stack.Screen name="optom" />
            <Stack.Screen name="karta" />
            <Stack.Screen name="brak" />
            <Stack.Screen name="xarajat" />
            <Stack.Screen name="qop" />
            <Stack.Screen name="tarix" />
            <Stack.Screen name="ochirilganlar" />
            <Stack.Screen name="akkaunt" />
          </Stack>
          {splash && <Splash onDone={() => setSplash(false)} />}
        </AppDataProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
