// Markaz menyusi — Nur-Non logotipi bosilganda sarlavha ostida silliq ochiladi (Modal yo'q).
//   • Akkaunt va ma'lumotlar — akkaunt nomi, ma'lumotlarni yuborish/qabul qilish
//   • Non kalkulyatori — mijozga tez hisob
//   • Tarixdagilar — o'chirilgan narsalar (7 kun), qaytarish mumkin
//   • PDFlar arxivi — kunlik hisobot PDF'lari (30 kun)
//   • Yozuv — Lotin / Кирилл (butun ilova matni darhol o'zgaradi)
//   • Dizayn — mavzu tanlovi (Non — yorug', Tun — qorong'i)
// Menyu FAQAT logotip bosilganda ochiladi; boshqa bo'limga o'tilganda, dasturdan
// chiqilganda yoki dizayn almashganda yopiladi.
import { useEffect, useRef } from "react";
import { View, Text, Pressable, Animated, Easing, StyleSheet, Switch, Alert, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useApp } from "../store/AppData";
import { ruxsatSora, ESLATMA_SOAT } from "../logic/bildirishnoma";
import { tanishuvniOch } from "./Tanishuv";
import { Bosma } from "./Bosma";
import { useTil, setTil } from "../i18n/til";
import { C, T, S, R, ANIM, temaStil, TEMALAR, useTema, temaAlmashtir } from "../theme";

export function MarkazMenyu({ onYop }) {
  const { ochirilganlar, akkauntNomi, eslatmaYoqilgan, setEslatmaYoqilgan, eslatmaYangila, salomYoqilgan, setSalomYoqilgan } = useApp();
  const eslatmaAlmash = async (v) => {
    if (!v) { setEslatmaYoqilgan(false); return; }
    setEslatmaYoqilgan(true);
    if (Platform.OS === "web") return;
    const bor = await ruxsatSora();
    if (bor) eslatmaYangila(); // ruxsat endi berilgan bo'lsa — eslatmalar darhol rejalashtiriladi
    else Alert.alert("Ruxsat kerak", "Eslatma kelishi uchun telefon sozlamalarida Nur-Non ilovasiga bildirishnomalarni yoqing.");
  };
  const til = useTil();
  const tema = useTema();
  const soni = (ochirilganlar || []).length;

  // Ochilish animatsiyasi: shaffoflik + yuqoridan sirpanish
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(a, { toValue: 1, duration: ANIM.duration, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [a]);
  const translateY = a.interpolate({ inputRange: [0, 1], outputRange: [-8, 0] });

  return (
    <Animated.View style={[styles.wrap, { opacity: a, transform: [{ translateY }] }]}>
      <Bosma
        accessibilityRole="button"
        onPress={() => { onYop?.(); router.push("/akkaunt"); }}
        kichrayish={0.98}
        style={styles.row}
      >
        <View style={styles.icon}><Ionicons name="person-circle-outline" size={22} color={C.accent} /></View>
        <View style={styles.flex1}>
          <Text style={styles.label}>Akkaunt va ma'lumotlar</Text>
          <Text style={styles.sub} numberOfLines={1}>{akkauntNomi ? `${akkauntNomi} · ` : ""}Ma'lumotlarni yuborish va qabul qilish</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={C.muted} />
      </Bosma>

      <View style={styles.divider} />

      <Bosma
        accessibilityRole="button"
        onPress={() => { onYop?.(); router.push("/kalkulyator"); }}
        kichrayish={0.98}
        style={styles.row}
      >
        <View style={styles.icon}><Ionicons name="calculator-outline" size={20} color={C.accent} /></View>
        <View style={styles.flex1}>
          <Text style={styles.label}>Non kalkulyatori</Text>
          <Text style={styles.sub}>Mijozga tez hisob · qarz yoki optomga o'tkazish</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={C.muted} />
      </Bosma>

      <View style={styles.divider} />

      <Bosma
        accessibilityRole="button"
        onPress={() => { onYop?.(); router.push("/ochirilganlar"); }}
        kichrayish={0.98}
        style={styles.row}
      >
        <View style={styles.icon}><Ionicons name="archive-outline" size={20} color={C.accent} /></View>
        <View style={styles.flex1}>
          <Text style={styles.label}>Tarixdagilar</Text>
          <Text style={styles.sub}>O'chirish, nollash, haydash · 7 kun · qaytarish mumkin</Text>
        </View>
        {soni > 0 && <View style={styles.badge}><Text style={styles.badgeTxt}>{soni}</Text></View>}
        <Ionicons name="chevron-forward" size={18} color={C.muted} />
      </Bosma>

      <View style={styles.divider} />

      <Bosma
        accessibilityRole="button"
        onPress={() => { onYop?.(); router.push("/pdflar"); }}
        kichrayish={0.98}
        style={styles.row}
      >
        <View style={styles.icon}><Ionicons name="document-text-outline" size={20} color={C.accent} /></View>
        <View style={styles.flex1}>
          <Text style={styles.label}>PDFlar arxivi</Text>
          <Text style={styles.sub}>Kunlik hisobotlar rasmlari bilan · 30 kun</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={C.muted} />
      </Bosma>

      <View style={styles.divider} />

      <View style={styles.row}>
        <View style={styles.icon}><Ionicons name="language-outline" size={20} color={C.accent} /></View>
        <View style={styles.flex1}>
          <Text style={styles.label}>Yozuv</Text>
          <Text style={styles.sub}>Butun ilova matni</Text>
        </View>
        <View style={styles.seg}>
          {[["lotin", "Lotin"], ["kirill", "Кирилл"]].map(([k, nom]) => (
            <Pressable
              key={k}
              accessibilityRole="button"
              accessibilityState={{ selected: til === k }}
              onPress={() => setTil(k)}
              style={[styles.segBtn, til === k && styles.segBtnActive]}
            >
              <Text style={[styles.segTxt, til === k && styles.segTxtActive]}>{nom}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <View style={styles.icon}><Ionicons name="alarm-outline" size={20} color={C.accent} /></View>
        <View style={styles.flex1}>
          <Text style={styles.label}>Kechki eslatma</Text>
          <Text style={styles.sub}>Har kuni {ESLATMA_SOAT}:00 da, kun yakunlanmagan bo'lsa</Text>
        </View>
        <Switch
          accessibilityLabel="Kechki eslatma"
          value={!!eslatmaYoqilgan}
          onValueChange={eslatmaAlmash}
          trackColor={{ false: C.border, true: C.accent }}
          thumbColor={C.surface}
          activeThumbColor={C.surface}
          ios_backgroundColor={C.border}
        />
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <View style={styles.icon}><Ionicons name="sunny-outline" size={20} color={C.accent} /></View>
        <View style={styles.flex1}>
          <Text style={styles.label}>Salom va kun xulosasi</Text>
          <Text style={styles.sub}>Tunda 03:00 da xulosa, ertalab salom</Text>
        </View>
        <Switch
          accessibilityLabel="Salom va kun xulosasi"
          value={salomYoqilgan !== false}
          onValueChange={(v) => setSalomYoqilgan(v)}
          trackColor={{ false: C.border, true: C.accent }}
          thumbColor={C.surface}
          activeThumbColor={C.surface}
          ios_backgroundColor={C.border}
        />
      </View>

      <View style={styles.divider} />

      <Bosma
        accessibilityRole="button"
        onPress={() => { onYop?.(); tanishuvniOch(); }}
        kichrayish={0.98}
        style={styles.row}
      >
        <View style={styles.icon}><Ionicons name="help-buoy-outline" size={20} color={C.accent} /></View>
        <View style={styles.flex1}>
          <Text style={styles.label}>Yo'riqnoma</Text>
          <Text style={styles.sub}>Dastur bilan qisqacha tanishuv</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={C.muted} />
      </Bosma>

      <View style={styles.divider} />

      <View style={styles.row}>
        <View style={styles.icon}><Ionicons name="color-palette-outline" size={20} color={C.accent} /></View>
        <View style={styles.flex1}>
          <Text style={styles.label}>Dizayn</Text>
          <Text style={styles.sub}>Ilova ranglari</Text>
        </View>
      </View>
      <View style={styles.temalar}>
        {Object.entries(TEMALAR).map(([id, t]) => {
          const tanlangan = tema === id;
          return (
            <Pressable
              key={id}
              accessibilityRole="button"
              accessibilityLabel={`Dizayn: ${t.nom}`}
              accessibilityState={{ selected: tanlangan }}
              onPress={() => { if (!tanlangan) temaAlmashtir(id); }}
              style={({ pressed }) => [styles.tema, pressed && styles.temaPressed]}
            >
              <View style={[styles.namuna, { backgroundColor: t.ranglar.card, borderColor: tanlangan ? C.accent : C.border }, tanlangan && styles.namunaTanlangan]}>
                <View style={[styles.namunaBar, { backgroundColor: t.ranglar.accent }]} />
                <View style={styles.namunaQator}>
                  <View style={[styles.namunaNuqta, { backgroundColor: t.ranglar.text }]} />
                  <View style={[styles.namunaChiziq, { backgroundColor: t.ranglar.muted }]} />
                </View>
                {tanlangan && (
                  <View style={[styles.belgi, { backgroundColor: C.accent }]}>
                    <Ionicons name="checkmark" size={11} color={C.onAccent} />
                  </View>
                )}
              </View>
              <Text style={[styles.temaNom, tanlangan && styles.temaNomTanlangan]}>{t.nom}</Text>
            </Pressable>
          );
        })}
      </View>
    </Animated.View>
  );
}

const styles = temaStil(() => StyleSheet.create({
  wrap:      { backgroundColor: C.card, borderRadius: R.lg, borderWidth: StyleSheet.hairlineWidth, borderColor: C.borderSoft, marginTop: -S[3], marginBottom: S[5], overflow: "hidden" },
  row:       { flexDirection: "row", alignItems: "center", gap: S[3], paddingVertical: S[3], paddingHorizontal: S[4] },
  rowPressed:{ opacity: 0.75 },
  icon:      { width: 40, height: 40, borderRadius: R.md, alignItems: "center", justifyContent: "center", backgroundColor: C.accent + "14" },
  flex1:     { flex: 1 },
  label:     { fontSize: T.md, fontWeight: "800", color: C.text },
  sub:       { fontSize: T.xs, color: C.sub, marginTop: 2 },
  badge:     { minWidth: 24, height: 24, paddingHorizontal: 7, borderRadius: 12, backgroundColor: C.accent, alignItems: "center", justifyContent: "center" },
  badgeTxt:  { fontSize: 12, fontWeight: "800", color: C.onAccent },
  divider:   { height: StyleSheet.hairlineWidth, backgroundColor: C.borderSoft, marginHorizontal: S[4] },
  seg:       { flexDirection: "row", backgroundColor: C.panel, borderRadius: R.pill, padding: 3 },
  segBtn:    { paddingVertical: 7, paddingHorizontal: 12, borderRadius: R.pill },
  segBtnActive: { backgroundColor: C.accent },
  segTxt:    { fontSize: T.xs, fontWeight: "700", color: C.sub },
  segTxtActive: { color: C.onAccent },

  temalar:   { flexDirection: "row", gap: S[2], paddingHorizontal: S[4], paddingBottom: S[4] },
  tema:      { flex: 1, alignItems: "center" },
  temaPressed: { opacity: 0.8, transform: [{ scale: 0.97 }] },
  namuna:    { width: "100%", height: 54, borderRadius: R.sm, borderWidth: 1.5, padding: 8, gap: 6, overflow: "hidden" },
  namunaTanlangan: { borderWidth: 2 },
  namunaBar: { height: 12, borderRadius: 6, width: "70%" },
  namunaQator: { flexDirection: "row", alignItems: "center", gap: 4 },
  namunaNuqta: { width: 8, height: 8, borderRadius: 4 },
  namunaChiziq: { flex: 1, height: 4, borderRadius: 2 },
  belgi:     { position: "absolute", right: 5, bottom: 5, width: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  temaNom:   { fontSize: T.xs, fontWeight: "700", color: C.sub, marginTop: 6 },
  temaNomTanlangan: { color: C.accent },
}));
