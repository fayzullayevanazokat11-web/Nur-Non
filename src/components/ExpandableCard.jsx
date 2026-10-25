// Yig'iladigan karta (akkordeon) — sarlavha bandi bosilganda tana silliq ochiladi/yopiladi.
// Fon oq; ochiqda pastki hairline ajratadi. Chevron ease-in-out bilan aylanadi.
//
// Avtomatik yopilish (ochiq batafsil ma'lumot "osilib" qolmasligi uchun):
//   1) Dasturdan chiqilganda (fon rejimiga o'tganda)
//   2) Boshqa bo'lim yoki sahifa ochilganda (ekran fokusni yo'qotganda)
//   3) Tasdiqlovchi amaldan keyin — ekranlar `yopKartalar()` ni chaqiradi
// `id` + `yopKartalar({ qoldir: id })` — ma'lum kartani yopilishdan saqlaydi
// (masalan, Tahrirlash bosilganda tahrir formasi ochiq qolishi kerak).
// `ochKaliti` — qiymati o'zgarib rost bo'lsa karta o'zi ochiladi (tahrir rejimi uchun).
import { useContext, useEffect, useRef, useState } from "react";
import { Animated, View, Pressable, Easing, StyleSheet, LayoutAnimation, Platform, UIManager, AppState } from "react-native";
import { NavigationContext } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "./Card";
import { C, R, S, ANIM, temaStil } from "../theme";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ── Butun ilova bo'ylab ochiq kartalar ro'yxati ──
const kartalar = new Set();

const silliq = () =>
  LayoutAnimation.configureNext(LayoutAnimation.create(ANIM.duration, LayoutAnimation.Types.easeInEaseOut, LayoutAnimation.Properties.opacity));

// Ochiq kartalarni yopadi. `qoldir` — yopilmasligi kerak bo'lgan karta id(lar)i.
export function yopKartalar({ qoldir } = {}) {
  const saqla = new Set([].concat(qoldir || []));
  let biror = false;
  kartalar.forEach((k) => {
    if (k.ochiq() && !(k.id && saqla.has(k.id))) { k.yop(); biror = true; }
  });
  if (biror) silliq();
}

// `ilova` — sarlavha tagida doim ko'rinadigan qism (masalan, ikonka tanlovi); bosilganda karta ochilmaydi
// `ichki` — Guruh ichida: o'z ramkasi/soyasi yo'q, ajratgichni Guruh chizadi
export function ExpandableCard({ header, children, defaultOpen = false, ochKaliti, id, style, ilova, ichki = false }) {
  const [open, setOpen] = useState(defaultOpen || !!ochKaliti);
  const openRef = useRef(open);
  openRef.current = open;
  const rot = useRef(new Animated.Value(open ? 1 : 0)).current;
  const press = useRef(new Animated.Value(0)).current;
  const navigation = useContext(NavigationContext); // navigatordan tashqarida — undefined

  useEffect(() => {
    Animated.timing(rot, {
      toValue: open ? 1 : 0,
      duration: ANIM.duration,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [open, rot]);

  // Tashqi signal bilan yopish uchun ro'yxatga yozilamiz
  useEffect(() => {
    const k = { id, ochiq: () => openRef.current, yop: () => setOpen(false) };
    kartalar.add(k);
    return () => { kartalar.delete(k); };
  }, [id]);

  // 1) Dastur fonga o'tsa — yopiladi
  useEffect(() => {
    const sub = AppState.addEventListener("change", (holat) => {
      if (holat !== "active" && openRef.current) setOpen(false);
    });
    return () => sub.remove();
  }, []);

  // 2) Ekran fokusni yo'qotsa (boshqa tab/sahifa ochilsa) — yopiladi
  useEffect(() => {
    if (!navigation?.addListener) return undefined;
    return navigation.addListener("blur", () => { if (openRef.current) setOpen(false); });
  }, [navigation]);

  // Tahrir rejimi: kalit yangi rost qiymatga o'zgarsa — ochiladi
  useEffect(() => {
    if (ochKaliti) { silliq(); setOpen(true); }
  }, [ochKaliti]);

  const toggle = () => {
    silliq();
    setOpen((o) => !o);
  };

  const animatePress = (to) =>
    Animated.timing(press, { toValue: to, duration: ANIM.pressDuration, easing: Easing.inOut(Easing.ease), useNativeDriver: true }).start();

  const spin = rot.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });
  const headOpacity = press.interpolate({ inputRange: [0, 1], outputRange: [1, 0.6] });

  const Qobiq = ichki ? View : Card;
  return (
    <Qobiq {...(ichki ? {} : { animate: false })} style={ichki ? [open && styles.ichkiOchiq, style] : [styles.card, style]}>
      <Pressable onPress={toggle} onPressIn={() => animatePress(1)} onPressOut={() => animatePress(0)}>
        <Animated.View needsOffscreenAlphaCompositing style={[styles.head, open ? styles.headOpen : styles.headClosed, { opacity: headOpacity }]}>
          <View style={styles.headLeft}>{header}</View>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Ionicons name="chevron-down" size={18} color={C.muted} />
          </Animated.View>
        </Animated.View>
      </Pressable>
      {ilova ? <View style={styles.ilova}>{ilova}</View> : null}
      {open ? <View style={styles.body}>{children}</View> : null}
    </Qobiq>
  );
}

const styles = temaStil(() => StyleSheet.create({
  card:       { padding: 0 },
  ichkiOchiq: { backgroundColor: C.accent + "08" },
  head:       { flexDirection: "row", alignItems: "center", gap: S[2], paddingVertical: S[4], paddingHorizontal: S[5] },
  headClosed: { borderRadius: R.lg },
  headOpen:   { borderTopLeftRadius: R.lg, borderTopRightRadius: R.lg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.borderSoft },
  headLeft:   { flex: 1 },
  body:       { paddingVertical: S[4], paddingHorizontal: S[5] },
  ilova:      { paddingHorizontal: S[4], paddingBottom: S[2] },
}));
