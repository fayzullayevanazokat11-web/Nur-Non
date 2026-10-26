// Pastki tab navigatsiya — 4 ta ekran (Kalkulyator — Nur-Non menyusida). Bo'limlar orasida chapga/o'ngga SURISH
// (swipe) orqali ham o'tiladi: ekranlar sahifalovchi (pager) ichida turadi,
// pastki panel esa o'zimizniki — tanlangan bo'limga silliq suriladigan indikator bilan.
// Ikonkalar — maxsus rasmlar (tintColor bilan bo'yaladi).
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { withLayoutContext } from "expo-router";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { View, Text, Image, Pressable, Animated, Easing, StyleSheet, Keyboard, PanResponder, LayoutAnimation, AppState, ScrollView, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { C, temaStil, temaQorongi } from "../../src/theme";
import { useTil } from "../../src/i18n/til";
import { ogir } from "../../src/i18n/translit";
import { tabBosildi, PastkiJoy, TepaJoy } from "../../src/components/ScrollBox";
import { BrandHeader } from "../../src/components/BrandHeader";
import { SuzuvchiFon } from "../../src/components/SuzuvchiFon";
import { MarkazMenyu } from "../../src/components/MarkazMenyu";
import { useSafeAreaInsets as useInsets } from "react-native-safe-area-context";
import { rezina, PRUJINA, PRUJINA_YUMSHOQ } from "../../src/logic/fizika";
import { sezgi } from "../../src/logic/sezgi";

const { Navigator } = createMaterialTopTabNavigator();
const SwipeTabs = withLayoutContext(Navigator);

const ICONS = {
  index: require("../../assets/tabicons/markaz.png"),
  ishlab: require("../../assets/tabicons/ishlab.png"),
  xodimlar: require("../../assets/tabicons/xodimlar.png"),
  ombor: require("../../assets/tabicons/ombor.png"),
};

// Telegram uslubi: panel ekran chetlaridan ajralgan yumaloq "orol", tanlangan bo'lim
// ikonka+yozuvni o'rab turgan yumaloq fon bilan belgilanadi (fon bo'lim kengligiga moslashadi).
const ICHKI = 5; // panel ichki chegarasi

// Yuqori suzuvchi bar balandligini sahifalarga yetkazish uchun
const TepaOlchovQoy = createContext(() => {});

// Yuqori bar — pastki panel kabi kontent ustida suzadi (soya bilan): nonvoyxona nomi, joriy bo'lim
// nomi va vaqt. Bosilsa menyu ochiladi; bo'lim almashganda yoki dasturdan chiqilganda yopiladi.
function TepaPanel({ state, descriptors }) {
  const insets = useSafeAreaInsets();
  const olchovQoy = useContext(TepaOlchovQoy);
  const { height: ekranH } = useWindowDimensions();
  const [barH, setBarH] = useState(96);
  const [menu, setMenu] = useState(false);
  useEffect(() => { setMenu(false); }, [state.index]);
  useEffect(() => {
    const sub = AppState.addEventListener("change", (h) => { if (h !== "active") setMenu(false); });
    return () => sub.remove();
  }, []);
  // Menyu o'zi silliq paydo bo'ladi (MarkazMenyu ichida). Bu yerda LayoutAnimation (shaffoflik) yo'q —
  // Android'da soyali qobiq yarim shaffof bo'lganda chetlari bir lahza qorayardi.
  const almash = () => {
    setMenu((m) => !m);
  };
  const route = state.routes[state.index];
  const sahifa = descriptors[route.key]?.options?.title;
  return (
    <View pointerEvents="box-none" style={[styles.tepaTashqi, { top: insets.top + 8 }]}>
      <View onLayout={(e) => { olchovQoy(e.nativeEvent.layout.height); setBarH(e.nativeEvent.layout.height); }}>
        <BrandHeader onLogo={almash} menuOchiq={menu} sahifa={sahifa} suzuvchi />
      </View>
      {menu && (
        // Menyu ham suzadi; ekranga sig'masa — ichida scroll (pastki panelgacha)
        // Tashqi qobiq — soya va yumaloq shakl; ichki ScrollView burchaklardan kesiladi va oxirida
        // Android'ning cho'zilish (overscroll) effekti o'chirilgan — to'rtburchak qism chiqmaydi
        <View style={[styles.tepaMenyu, { maxHeight: Math.max(220, ekranH - insets.top - insets.bottom - barH - 130) }]}>
          <SuzuvchiFon rang={C.card + (temaQorongi() ? "F2" : "F0")} radius={22} kuch={50} />
          <ScrollView
            style={styles.tepaMenyuScroll}
            showsVerticalScrollIndicator={false}
            overScrollMode="never"
            bounces={false}
          >
            <MarkazMenyu onYop={() => setMenu(false)} />
          </ScrollView>
        </View>
      )}
    </View>
  );
}

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
  const sudralmoqda = useRef(false); // panel ustida barmoq surilayotgan payt — indikator barmoqqa ergashadi
  useEffect(() => {
    if (sudralmoqda.current) return;
    Animated.spring(idx, { toValue: state.index, ...PRUJINA_YUMSHOQ, useNativeDriver: false }).start();
  }, [state.index]);

  // ── Panelni ushlab surish (Telegram kabi): indikator barmoq ortidan yuradi, barmoq ostidagi
  //    bo'lim sahifasi darhol ochiladi; qo'yib yuborilganda indikator o'sha bo'limga joylashadi.
  const barRef = useRef(null);
  const barX = useRef(0);
  const holat = useRef({});
  holat.current = { joylar, soni, kenglik, state, navigation };
  const olchash = () => barRef.current?.measureInWindow?.((x) => { if (typeof x === "number") barX.current = x; });
  const kasrIndeks = (pageX) => {
    const { joylar: j, soni: n, kenglik: k } = holat.current;
    const x = pageX - barX.current;
    const markazlar = Array.from({ length: n }, (_, i) => (j[i] ? j[i].x + j[i].w / 2 : ((2 * i + 1) * k) / (2 * n)));
    // Chetdan tashqariga tortilsa — indikator rezinadek qarshilik bilan biroz cho'ziladi
    const qadam = n > 1 ? (markazlar[n - 1] - markazlar[0]) / (n - 1) : 1;
    if (x <= markazlar[0]) return -rezina(markazlar[0] - x, qadam * 0.45) / qadam;
    if (x >= markazlar[n - 1]) return n - 1 + rezina(x - markazlar[n - 1], qadam * 0.45) / qadam;
    for (let i = 0; i < n - 1; i++) {
      if (x < markazlar[i + 1]) return i + (x - markazlar[i]) / (markazlar[i + 1] - markazlar[i]);
    }
    return n - 1;
  };
  const chegara = (i) => Math.max(0, Math.min(holat.current.soni - 1, i));
  const qadamPx = () => {
    const { joylar: j, soni: n, kenglik: k } = holat.current;
    return n > 1 && j[0] && j[n - 1] ? (j[n - 1].x + j[n - 1].w / 2 - j[0].x - j[0].w / 2) / (n - 1) : (k || 300) / Math.max(1, n);
  };
  const otish = (i) => {
    const { state: st, navigation: nav } = holat.current;
    i = chegara(i);
    if (i === st.index) return;
    const route = st.routes[i];
    oxirgiBosish.current = Date.now();
    sezgi("otish");
    nav.navigate(route.name, route.params);
  };
  const surish = useRef(PanResponder.create({
    onMoveShouldSetPanResponderCapture: (_, g) => Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
    onPanResponderGrant: (e) => { sudralmoqda.current = true; olchash(); idx.stopAnimation(); },
    onPanResponderMove: (e) => {
      const f = kasrIndeks(e.nativeEvent.pageX);
      idx.setValue(f);
      otish(Math.round(f));
    },
    onPanResponderRelease: (e, g) => {
      // Qo'yib yuborilganda barmoq tezligi davom etadi: prujina shu tezlikdan boshlab joyiga keladi
      const i = chegara(Math.round(kasrIndeks(e.nativeEvent.pageX)));
      otish(i);
      sudralmoqda.current = false;
      Animated.spring(idx, { toValue: i, velocity: g.vx / qadamPx(), ...PRUJINA, useNativeDriver: false }).start();
    },
    onPanResponderTerminate: () => {
      sudralmoqda.current = false;
      Animated.spring(idx, { toValue: holat.current.state.index, ...PRUJINA, useNativeDriver: false }).start();
    },
  })).current;
  const pillKeng = (i) => (joylar[i] ? joylar[i].w : (kenglik - 2 * ICHKI) / soni);
  const pillX = kenglik && soni > 1
    ? idx.interpolate({ inputRange: kirishlar, outputRange: kirishlar.map((i) => markaz(i) - pillKeng(i) / 2), extrapolate: "extend" })
    : 0;
  // Kenglik ham XUDDI SHU qiymatdan (idx) — joyi va kengligi doim birga yuradi. Avval kenglik alohida
  // animatsiya edi: surib o'tganda ikkalasi ajralib, indikator bir lahza siljib "titrar" edi.
  // (kenglik native driver'da animatsiya qilinmaydi — shuning uchun idx JS driver'da)
  const pillW = kenglik && soni > 1
    ? idx.interpolate({ inputRange: kirishlar, outputRange: kirishlar.map((i) => pillKeng(i)), extrapolate: "clamp" })
    : pillKeng(state.index);

  return (
    <>
    <TepaPanel state={state} descriptors={descriptors} />
    {!klaviatura && (
    <View pointerEvents="box-none" style={[styles.tashqi, { paddingBottom: 8 + insets.bottom }]}>
    <View ref={barRef} style={styles.bar} onLayout={(e) => { setKenglik(e.nativeEvent.layout.width); olchash(); }} {...surish.panHandlers}>
      <SuzuvchiFon rang={C.card + (temaQorongi() ? "C8" : "B3")} radius={36} />
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
    )}
    </>
  );
}

export default function TabsLayout() {
  // Sarlavhalar kutubxona ichida ham ishlatiladi — shuning uchun yozuvga shu yerda o'giramiz
  const til = useTil();
  const t = (s) => ogir(s, til);
  const insets = useInsets();
  const [tepaH, setTepaH] = useState(0);
  return (
    <TepaOlchovQoy.Provider value={(h) => setTepaH((p) => (Math.abs(p - h) > 0.5 ? h : p))}>
    <TepaJoy.Provider value={tepaH ? tepaH + 8 : 0}>
    <PastkiJoy.Provider value={84 + insets.bottom}>
    <SwipeTabs
      tabBarPosition="bottom"
      tabBar={(props) => <PastkiPanel {...props} />}
      screenOptions={{ swipeEnabled: true, animationEnabled: false, lazy: true, lazyPreloadDistance: 1, sceneStyle: { backgroundColor: C.bg } }}
    >
      <SwipeTabs.Screen name="index" options={{ title: t("Markaz") }} />
      <SwipeTabs.Screen name="ishlab" options={{ title: t("Ishlab chiqarish"), tabBarLabel: t("Ishlab") }} />
      <SwipeTabs.Screen name="xodimlar" options={{ title: t("Xodimlar") }} />
      <SwipeTabs.Screen name="ombor" options={{ title: t("Ombor") }} />
    </SwipeTabs>
    </PastkiJoy.Provider>
    </TepaJoy.Provider>
    </TepaOlchovQoy.Provider>
  );
}

const styles = temaStil(() => StyleSheet.create({
  // Panel kontent ustida suzadi: orqasida fon yo'q, kartalar uning ostidan ko'rinib turadi
  tepaTashqi:{ position: "absolute", left: 20, right: 20 },
  // Soya (elevation) yo'q — barlar kabi orqa fon xiralashadi; chegarani ingichka chiziq beradi
  tepaMenyu:{ marginTop: 10, borderRadius: 22, borderWidth: StyleSheet.hairlineWidth, borderColor: C.border, overflow: "hidden" },
  tepaMenyuScroll:{ borderRadius: 22, overflow: "hidden" },
  tashqi:  { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 12 },
  bar:     {
    // Soya yo'q — fon SuzuvchiFon (ortidagi kontent xiralashadi)
    flexDirection: "row", borderRadius: 36, borderWidth: StyleSheet.hairlineWidth, borderColor: C.border, padding: ICHKI,
  },
  pillQuti:{ position: "absolute", top: ICHKI, bottom: ICHKI, left: 0 },
  pill:    { flex: 1, borderRadius: 30, backgroundColor: C.accent + "1C" },
  item:    { flexGrow: 1, flexShrink: 1, flexBasis: "auto", alignItems: "center", paddingTop: 7, paddingBottom: 6, paddingHorizontal: 4 },
  iconBox: { width: 26, height: 26 },
  icon:    { width: 26, height: 26 },
  iconUst: { position: "absolute", top: 0, left: 0 },
  label:   { fontSize: 12, fontWeight: "700", letterSpacing: 0.2, marginTop: 4 },
}));
