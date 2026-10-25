// Ildiz layout: AppDataProvider butun ilovani o'rab turadi.
// Ionicons shrifti app.json'dagi expo-font plugin orqali APK ichiga embed
// qilingan — natija qaytishini kutmasdan render qilamiz (production'da
// useFonts ba'zan true qaytarmasdi → oppoq ekran muammosi).
// Mavzu (dizayn) almashganda ekranlar yangi ranglar bilan qayta chiziladi —
// o'tish silliq parda (fade) bilan yashiriladi.
import { useEffect, useMemo, useRef, useState } from "react";
import { View, Animated, Easing, StyleSheet, BackHandler } from "react-native";
import { Stack, router, usePathname } from "expo-router";
import { ThemeProvider, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import Ionicons from "@expo/vector-icons/Ionicons";
import { AppDataProvider } from "../src/store/AppData";
import { Splash } from "../src/components/Splash";
import { ErrorBoundary } from "../src/components/ErrorBoundary";
import { BekorPanel } from "../src/components/BekorPanel";
import { Tanishuv } from "../src/components/Tanishuv";
import { KunOtishi } from "../src/components/KunOtishi";
import { C, TEMALAR, useTema, setTema, temaQorongi, temaAlmashtiruvchi } from "../src/theme";

// Mavzu almashish pardasi: eski fon rangida yopiladi → mavzu almashadi →
// rang yangisiga silliq o'tadi → parda ochiladi
function useTemaParda() {
  const [parda, setParda] = useState(null); // { eski, yangi }
  const ochiq = useRef(new Animated.Value(0)).current;
  const rang = useRef(new Animated.Value(0)).current;

  useEffect(() => temaAlmashtiruvchi((id) => {
    ochiq.setValue(0);
    rang.setValue(0);
    setParda({ eski: C.bg, yangi: TEMALAR[id].ranglar.bg });
    Animated.timing(ochiq, { toValue: 1, duration: 150, easing: Easing.out(Easing.quad), useNativeDriver: true }).start(() => {
      setTema(id); // ekranlar parda ostida qayta chiziladi
      setTimeout(() => {
        Animated.timing(rang, { toValue: 1, duration: 160, easing: Easing.inOut(Easing.quad), useNativeDriver: false }).start(() => {
          Animated.timing(ochiq, { toValue: 0, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(() => setParda(null));
        });
      }, 60);
    });
  }), [ochiq, rang]);

  if (!parda) return null;
  return (
    <Animated.View style={[StyleSheet.absoluteFill, { opacity: ochiq }]}>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: rang.interpolate({ inputRange: [0, 1], outputRange: [parda.eski, parda.yangi] }) }]} />
    </Animated.View>
  );
}

export default function RootLayout() {
  const [splash, setSplash] = useState(true);
  useFonts(Ionicons.font); // best-effort; render'ni bloklamaydi
  const tema = useTema();
  const parda = useTemaParda();

  // Telefonning "Orqaga" tugmasi dasturdan chiqarib yubormaydi: avval oxirgi ochilgan
  // sahifa yopiladi, keyin boshqa bo'limdan Markazga qaytiladi, Markazda esa hech narsa
  // bo'lmaydi (dastur ochiq qoladi).
  const yol = usePathname();
  const yolRef = useRef(yol);
  yolRef.current = yol;
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      try {
        if (router.canDismiss()) { router.back(); return true; }
        if (yolRef.current !== "/") { router.navigate("/"); return true; }
      } catch { /* navigatsiya hali tayyor emas */ }
      return true;
    });
    return () => sub.remove();
  }, []);

  // Oyna (root view) foni ham mavzu rangida: sahifalar almashganda ikki ekran bir-biriga
  // o'tib turgan lahzada ostidagi fon ko'rinadi — u qora bo'lsa ekran qorayib ketardi.
  useEffect(() => { SystemUI.setBackgroundColorAsync(C.bg).catch(() => {}); }, [tema]);

  // Navigatsiya foni ham mavzuga mos (o'tishlarda oq chaqnash bo'lmasin)
  const navTema = useMemo(() => {
    const asos = temaQorongi() ? DarkTheme : DefaultTheme;
    return {
      ...asos,
      dark: temaQorongi(),
      colors: { ...asos.colors, primary: C.accent, background: C.bg, card: C.bg, text: C.text, border: C.borderSoft, notification: C.accent },
    };
  }, [tema]);

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AppDataProvider>
          <View style={[styles.ildiz, { backgroundColor: C.bg }]}>
            <StatusBar style={splash || temaQorongi() ? "light" : "dark"} />
            <ThemeProvider value={navTema}>
              <Stack key={tema} screenOptions={{ headerShown: false, animation: "fade", contentStyle: { backgroundColor: C.bg } }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="qarzlar" />
                <Stack.Screen name="optom" />
                <Stack.Screen name="karta" />
                <Stack.Screen name="xarajat" />
                <Stack.Screen name="qop" />
                <Stack.Screen name="tarix" />
                <Stack.Screen name="ochirilganlar" />
                <Stack.Screen name="akkaunt" />
                <Stack.Screen name="pdflar" />
                <Stack.Screen name="kalkulyator" />
              </Stack>
            </ThemeProvider>
            <BekorPanel />
            <Tanishuv />
            <KunOtishi />
            {parda}
          </View>
          {splash && <Splash onDone={() => setSplash(false)} />}
        </AppDataProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  ildiz: { flex: 1 },
});
