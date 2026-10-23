// Pastki tab navigatsiya — 4 ta ekran. Bo'limlar orasida chapga/o'ngga SURISH
// (swipe) orqali ham o'tiladi: ekranlar sahifalovchi (pager) ichida turadi,
// pastki panel esa o'zimizniki — tanlangan bo'limga silliq suriladigan indikator bilan.
// Ikonkalar — maxsus rasmlar (tintColor bilan bo'yaladi).
import { useEffect, useRef, useState } from "react";
import { withLayoutContext } from "expo-router";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { View, Text, Image, Pressable, Animated, Easing, StyleSheet, Keyboard } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { C, temaStil } from "../../src/theme";
import { useTil } from "../../src/i18n/til";
import { ogir } from "../../src/i18n/translit";
import { tabBosildi } from "../../src/components/ScrollBox";
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

const PILL_W = 56;

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
  // Surib o'tilganda ham (bosilmasdan) yengil tebranish va o'tish ovozi
  const oxirgiBosish = useRef(0);
  const oldingi = useRef(state.index);
  useEffect(() => {
    if (oldingi.current === state.index) return;
    oldingi.current = state.index;
    if (Date.now() - oxirgiBosish.current > 500) sezgi("otish");
  }, [state.index]);
  const soni = state.routes.length;
  const tabW = kenglik / soni;
  const kirishlar = state.routes.map((_, i) => i);

  // Indikator tanlangan bo'limga silliq suriladi. Pager pozitsiyasiga bog'lanmaydi —
  // bosib o'tilganda (animatsiyasiz sakrash) u eski joyda qolib, boshqa bo'limni
  // ko'rsatib qo'yardi. Endi faqat haqiqiy tanlangan bo'lim (state.index) asos.
  const idx = useRef(new Animated.Value(state.index)).current;
  useEffect(() => {
    Animated.timing(idx, { toValue: state.index, duration: 240, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [state.index]);
  const pillX = kenglik && soni > 1
    ? idx.interpolate({ inputRange: kirishlar, outputRange: kirishlar.map((i) => i * tabW + (tabW - PILL_W) / 2), extrapolate: "clamp" })
    : 0;

  if (klaviatura) return null;

  return (
    <View
      style={[styles.bar, { paddingBottom: 6 + insets.bottom }]}
      onLayout={(e) => setKenglik(e.nativeEvent.layout.width)}
    >
      {kenglik > 0 && (
        <Animated.View pointerEvents="none" style={[styles.pill, { transform: [{ translateX: pillX }] }]} />
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
  );
}

export default function TabsLayout() {
  // Sarlavhalar kutubxona ichida ham ishlatiladi — shuning uchun yozuvga shu yerda o'giramiz
  const til = useTil();
  const t = (s) => ogir(s, til);
  return (
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
  );
}

const styles = temaStil(() => StyleSheet.create({
  bar:     { flexDirection: "row", backgroundColor: C.bar, borderTopColor: C.borderSoft, borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 6 },
  pill:    { position: "absolute", top: 6, left: 0, width: PILL_W, height: 30, borderRadius: 15, backgroundColor: C.accent + "16" },
  item:    { flex: 1, alignItems: "center", paddingBottom: 4 },
  iconBox: { width: 24, height: 24, marginTop: 3 },
  icon:    { width: 24, height: 24 },
  iconUst: { position: "absolute", top: 0, left: 0 },
  label:   { fontSize: 11, fontWeight: "600", letterSpacing: 0.3, marginTop: 5 },
}));
