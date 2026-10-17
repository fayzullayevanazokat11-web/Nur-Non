// Birinchi ochilishdagi qisqa yo'riqnoma (4 qadam). Bir marta ko'rsatiladi;
// ma'lumoti bor (yangilangan) ilovada chiqmaydi.
import { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, Animated, Easing, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../store/AppData";
import usePersistedState from "../store/usePersistedState";
import { C, T, S, R, temaStil } from "../theme";

const QADAMLAR = [
  { icon: "storefront-outline", sarlavha: "Xush kelibsiz!", matn: "Nur-Non — novvoyxonaning butun hisobi bitta joyda: ishlab chiqarish, savdo, xodimlar, ombor va foyda." },
  { icon: "layers-outline", sarlavha: "Har kuni 2 qadam", matn: "Kun davomida «Kunlik qop hisobi»ga qoplarni kiriting. Kechqurun «Kunni yakunlash»ni bosing — hisobot va statistika o'zi tayyor bo'ladi." },
  { icon: "apps-outline", sarlavha: "Hammasi qo'l ostida", matn: "Markazda qarz, optom, karta va brak. Bo'limlar orasida chapga-o'ngga surib o'ting. Logotipni bossangiz — menyu: akkaunt, yozuv, dizayn, eslatma." },
  { icon: "shield-checkmark-outline", sarlavha: "Ma'lumot xavfsiz", matn: "Har kuni avtomatik nusxa olinadi. O'chirilgan narsa 7 kun «Tarixdagilar»da turadi — qaytarish mumkin." },
];

export function Tanishuv() {
  const { tayyor, hisobotlarTarixi, qarzlar, kartalar } = useApp();
  const [korildi, setKorildi] = usePersistedState("nurnon:tanishuv", null, { hidratsiya: false });
  const [yuklandi, setYuklandi] = useState(false);
  const [i, setI] = useState(0);
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => { const t = setTimeout(() => setYuklandi(true), 400); return () => clearTimeout(t); }, []);

  // Yangilangan ilova (ma'lumoti bor) — yo'riqnoma kerak emas
  const malumotBor = (hisobotlarTarixi || []).length > 0 || (qarzlar || []).length > 0 || (kartalar || []).length > 0;
  useEffect(() => { if (tayyor && yuklandi && korildi == null && malumotBor) setKorildi(true); }, [tayyor, yuklandi, korildi, malumotBor]);
  const korsat = tayyor && yuklandi && korildi == null && !malumotBor;

  useEffect(() => {
    if (!korsat) return;
    a.setValue(0);
    Animated.timing(a, { toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [korsat, i]);

  if (!korsat) return null;
  const q = QADAMLAR[i];
  const oxirgi = i === QADAMLAR.length - 1;
  return (
    <View style={styles.fon}>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <Pressable accessibilityLabel="Yo'riqnomani o'tkazib yuborish" onPress={() => setKorildi(true)} hitSlop={10} style={styles.otkaz}>
          <Text style={styles.otkazTxt}>O'tkazib yuborish</Text>
        </Pressable>
        <Animated.View style={[styles.markaz, { opacity: a, transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }] }]}>
          <View style={styles.icon}><Ionicons name={q.icon} size={44} color={C.accent} /></View>
          <Text style={styles.sarlavha}>{q.sarlavha}</Text>
          <Text style={styles.matn}>{q.matn}</Text>
        </Animated.View>
        <View style={styles.nuqtalar}>
          {QADAMLAR.map((_, j) => <View key={j} style={[styles.nuqta, j === i && styles.nuqtaFaol]} />)}
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => (oxirgi ? setKorildi(true) : setI(i + 1))}
          style={({ pressed }) => [styles.btn, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.btnTxt}>{oxirgi ? "Boshlash" : "Keyingi"}</Text>
          <Ionicons name={oxirgi ? "checkmark" : "arrow-forward"} size={18} color={C.onAccent} />
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = temaStil(() => StyleSheet.create({
  fon:     { ...StyleSheet.absoluteFillObject, backgroundColor: C.bg, zIndex: 50 },
  safe:    { flex: 1, paddingHorizontal: S[6], paddingBottom: S[6] },
  otkaz:   { alignSelf: "flex-end", paddingVertical: S[3] },
  otkazTxt:{ fontSize: T.sm, color: C.sub, fontWeight: "700" },
  markaz:  { flex: 1, alignItems: "center", justifyContent: "center" },
  icon:    { width: 96, height: 96, borderRadius: 32, backgroundColor: C.accent + "14", alignItems: "center", justifyContent: "center", marginBottom: S[6] },
  sarlavha:{ fontSize: T.xl, fontWeight: "800", color: C.text, textAlign: "center", letterSpacing: -0.5 },
  matn:    { fontSize: T.md, color: C.sub, textAlign: "center", lineHeight: 23, marginTop: S[3] },
  nuqtalar:{ flexDirection: "row", justifyContent: "center", gap: 6, marginBottom: S[5] },
  nuqta:   { width: 7, height: 7, borderRadius: 4, backgroundColor: C.border },
  nuqtaFaol:{ width: 22, backgroundColor: C.accent },
  btn:     { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: S[2], backgroundColor: C.accent, borderRadius: R.md, paddingVertical: 15 },
  btnTxt:  { fontSize: T.md, fontWeight: "800", color: C.onAccent },
}));
