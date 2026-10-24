// Pastki tab navigatsiya — 5 ta ekran. Bo'limlar orasida chapga/o'ngga SURISH
// (swipe) orqali ham o'tiladi: ekranlar sahifalovchi (pager) ichida turadi,
// pastki panel esa o'zimizniki — tanlangan bo'limga silliq suriladigan indikator bilan.
// Ikonkalar — maxsus rasmlar (tintColor bilan bo'yaladi).
import { useEffect, useRef, useState } from "react";
import { withLayoutContext } from "expo-router";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { View, Text, Image, Pressable, Animated, Easing, StyleSheet, Keyboard } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { C, temaStil, temaQorongi } from "../../src/theme";
import { useTil } from "../../src/i18n/til";
import { ogir } from "../../src/i18n/translit";
import { tabBosildi, PastkiJoy } from "../../src/components/ScrollBox";
import { useSafeAreaInsets as useInsets } from "react-native-safe-area-context";
import { sezgi } from "../../src/logic/sezgi";

const { Navigator } = createMaterialTopTabNavigator();
const SwipeTabs = withLayoutContext(Navigator);

const ICONS = {
  index: require("../../assets/tabicons/markaz.png"),
  ishlab: require("../../assets/tabicons/ishlab.png"),
  kalkulyator: require("../../assets/tabicons/kalkulyator.png"),
  xodimlar: require("../../assets/tabicons/xodimlar.png"),
  ombor: require("../../assets/tabicons/ombor.png"),
};

// Telegram uslubi: panel ekran chetlaridan ajralgan yumaloq "orol", tanlangan bo'lim
// ikonka+yozuvni o'rab turgan yumaloq fon bilan belgilanadi (fon bo'lim kengligiga moslashadi).
const ICHKI = 5; // panel ichki chegarasi

function PastkiPanel({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const [kenglik, setKenglik] = useState(0);
  // Klaviatura ochiq bo'lsa panel yashirinadi — formalarga ko'proq joy qoladi
  const [klaviatura, setKlaviatura] = useState(false);
  useEffect(() => {
    const a = Keyboard.addListener("keyboardDidShow", () => setKlaviatura(true));
    const b = Keyboard.addListener("keyboardDidHide", () => setKlaviatura(false));
    return () => { a.remove(); b.remove(); };
  }, []);
  // Surib o'tilganda ham (bosilmasdan) yengil tebranish
  const oxirgiBosish = useRef(0);
  const oldingi = useRef(state.index);
  useEffect(() => {
    if (oldingi.current === state.index) return;
    oldingi.current = state.index;
    if (Date.now() - oxirgiBosish.current > 500) sezgi("otish");
  }, [state.index]);
  const soni = state.routes.length;
  const kirishlar = state.routes.map((_, i) => i);
  // Har bir bo'lim kengligi yozuviga qarab; ortiqcha joy teng bo'linadi — shuning uchun
  // yozuvlar orasidagi ko'rinadigan masofa bir xil. Indikator o'lchangan markazga suriladi.
  const [joylar, setJoylar] = useState({});
  const markaz = (i) => (joylar[i] ? joylar[i].x + joylar[i].w / 2 : ((2 * i + 1) * kenglik) / (2 * soni));

  // Indikator tanlangan bo'limga silliq suriladi. Pager pozitsiyasiga bog'lanmaydi —
  // bosib o'tilganda (animatsiyasiz sakrash) u eski joyda qolib, boshqa bo'limni
  // ko'rsatib qo'yardi. Endi faqat haqiqiy tanlangan bo'lim (state.index) asos.
  const idx = useRef(new Animated.Value(state.index)).current;
  useEffect(() => {
    Animated.timing(idx, { toValue: state.index, duration: 240, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [state.index]);
  const pillKeng = (i) => (joylar[i] ? joylar[i].w : (kenglik - 2 * ICHKI) / soni);
  const pillX = kenglik && soni > 1
    ? idx.interpolate({ inputRange: kirishlar, outputRange: kirishlar.map((i) => markaz(i) - pillKeng(i) / 2), extrapolate: "clamp" })
    : 0;
  // Fon kengligi tanlangan bo'limga silliq moslashadi (kenglik native driver'da animatsiya qilinmaydi)
  const pillW = useRef(new Animated.Value(0)).current;
  const birinchi = useRef(true);
  useEffect(() => {
    const w = pillKeng(state.index);
    if (!w) return;
    if (birinchi.current) { pillW.setValue(w); birinchi.current = false; return; }
    Animated.timing(pillW, { toValue: w, duration: 240, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [state.index, joylar, kenglik]);

  if (klaviatura) return null;

  return (
    <View pointerEvents="box-none" style={[styles.tashqi, { paddingBottom: 8 + insets.bottom }]}>
    <View style={styles.bar} onLayout={(e) => setKenglik(e.nativeEvent.layout.width)}>
      {kenglik > 0 && (
        <Animated.View pointerEvents="none" style={[styles.pillQuti, { transform: [{ translateX: pillX }] }]}>
          <Animated.View testID="tab-indikator" style={[styles.pill, { width: pillW }]} />
        </Animated.View>
      )}
      {state.routes.map((route, i) => {
        const { options } = descriptors[route.key];
        const tanlangan = state.index === i;
        // Rang ham surish bilan silliq almashadi
        const faollik = soni > 1
          ? idx.interpolate({ inputRange: kirishlar, outputRange: kirishlar.map((j) => (j === i ? 1 : 0)), extrapolate: "clamp" })
          : 1;
        const onPress = () => {
          const ev = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
          if (!tanlangan && !ev.defaultPrevented) {
            oxirgiBosish.current = Date.now();
            tabBosildi(); // ochilayotgan bo'lim kontenti silliq paydo bo'ladi
            navigation.navigate(route.name, route.params);
          }
        };
        const nom = options.tabBarLabel ?? options.title ?? route.name;
        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            sezgiTuri={tanlangan ? false : "otish"}
            accessibilityState={{ selected: tanlangan }}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            onLongPress={() => navigation.emit({ type: "tabLongPress", target: route.key })}
            onLayout={(e) => { const { x, width } = e.nativeEvent.layout; setJoylar((p) => (p[i]?.x === x && p[i]?.w === width ? p : { ...p, [i]: { x, w: width } })); }}
            style={styles.item}
          >
            <View style={styles.iconBox}>
              <Image source={ICONS[route.name]} style={[styles.icon, { tintColor: C.muted }]} resizeMode="contain" />
              <Animated.Image
                source={ICONS[route.name]}
                style={[styles.icon, styles.iconUst, { tintColor: C.accent, opacity: faollik }]}
                resizeMode="contain"
              />
            </View>
            <Text numberOfLines={1} style={[styles.label, { color: tanlangan ? C.accent : C.muted }]}>{nom}</Text>
          </Pressable>
        );
      })}
    </View>
    </View>
  );
}

export default function TabsLayout() {
  // Sarlavhalar kutubxona ichida ham ishlatiladi — shuning uchun yozuvga shu yerda o'giramiz
  const til = useTil();
  const t = (s) => ogir(s, til);
  const insets = useInsets();
  return (
    <PastkiJoy.Provider value={84 + insets.bottom}>
    <SwipeTabs
      tabBarPosition="bottom"
      tabBar={(props) => <PastkiPanel {...props} />}
      screenOptions={{ swipeEnabled: true, animationEnabled: false, lazy: true, lazyPreloadDistance: 1, sceneStyle: { backgroundColor: C.bg } }}
    >
      <SwipeTabs.Screen name="index" options={{ title: t("Markaz") }} />
      <SwipeTabs.Screen name="ishlab" options={{ title: t("Ishlab chiqarish"), tabBarLabel: t("Ishlab") }} />
      <SwipeTabs.Screen name="kalkulyator" options={{ title: t("Kalkulyator") }} />
      <SwipeTabs.Screen name="xodimlar" options={{ title: t("Xodimlar") }} />
      <SwipeTabs.Screen name="ombor" options={{ title: t("Ombor") }} />
    </SwipeTabs>
    </PastkiJoy.Provider>
  );
}

const styles = temaStil(() => StyleSheet.create({
  // Panel kontent ustida suzadi: orqasida fon yo'q, kartalar uning ostidan ko'rinib turadi
  tashqi:  { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 12 },
  bar:     {
    flexDirection: "row", backgroundColor: C.card + "FA", borderRadius: 36, borderWidth: StyleSheet.hairlineWidth, borderColor: C.border, padding: ICHKI,
    shadowColor: "#000", shadowOpacity: temaQorongi() ? 0.5 : 0.16, shadowRadius: 18, shadowOffset: { width: 0, height: 6 }, elevation: 14,
  },
  pillQuti:{ position: "absolute", top: ICHKI, bottom: ICHKI, left: 0 },
  pill:    { flex: 1, borderRadius: 30, backgroundColor: C.accent + "1C" },
  item:    { flexGrow: 1, flexShrink: 1, flexBasis: "auto", alignItems: "center", paddingTop: 7, paddingBottom: 6, paddingHorizontal: 4 },
  iconBox: { width: 26, height: 26 },
  icon:    { width: 26, height: 26 },
  iconUst: { position: "absolute", top: 0, left: 0 },
  label:   { fontSize: 12, fontWeight: "700", letterSpacing: 0.2, marginTop: 4 },
}));
