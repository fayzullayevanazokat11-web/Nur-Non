// Brend sarlavhasi — har bir asosiy bo'lim tepasida: jigarrang banner + "Non" logotipi,
// nonvoyxona (profil) nomi (kiritilmagan bo'lsa "Nur-Non") va ostida joriy bo'lim nomi.
// O'ng chetda joriy sana va vaqt (har 30s yangilanadi).
// Butun banner bosilganda menyu (Akkaunt, Tarixdagilar, PDFlar, yozuv, dizayn...) ochiladi/yopiladi.
import { useEffect, useState } from "react";
import { View, Text, Image, Pressable, StyleSheet, LayoutAnimation, AppState } from "react-native";
import { MarkazMenyu } from "./MarkazMenyu";
import { SuzuvchiFon } from "./SuzuvchiFon";
import { useTiklash } from "./useTiklash";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../store/AppData";
import { ishKuni } from "../logic/hisob";
import { C, T, S, R, shadow, temaStil, temaQorongi } from "../theme";

const LOGO = require("../../assets/logo-tight.png");
const OYLAR = ["Yan", "Fev", "Mar", "Apr", "May", "Iyun", "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek"];
const ikki = (n) => String(n).padStart(2, "0");

// Sana — ISH KUNI (tunda 03:00 gacha hali kechagi kun), soat — haqiqiy vaqt
function hozir() {
  const d = new Date();
  const k = ishKuni();
  return {
    sana: `${ikki(k.getDate())} ${OYLAR[k.getMonth()]}`,
    vaqt: `${ikki(d.getHours())}:${ikki(d.getMinutes())}`,
  };
}

// Bo'lim tepasidagi bar + uning menyusi (boshqa bo'limga o'tganda yoki dasturdan chiqilganda yopiladi)
export function SahifaBari({ sahifa }) {
  const [menu, setMenu] = useState(false);
  const almash = () => {
    LayoutAnimation.configureNext(LayoutAnimation.create(220, LayoutAnimation.Types.easeInEaseOut, LayoutAnimation.Properties.opacity));
    setMenu((m) => !m);
  };
  useTiklash(() => setMenu(false));
  useEffect(() => {
    const sub = AppState.addEventListener("change", (h) => { if (h !== "active") setMenu(false); });
    return () => sub.remove();
  }, []);
  return (
    <>
      <BrandHeader onLogo={almash} menuOchiq={menu} sahifa={sahifa} />
      {menu && <MarkazMenyu onYop={() => setMenu(false)} />}
    </>
  );
}

// Uzun nonvoyxona nomi to'liq sig'ishi uchun shrift kichrayadi
const nomShrift = (nom) => (nom.length <= 10 ? null : nom.length <= 14 ? { fontSize: 22 } : nom.length <= 18 ? { fontSize: 19 } : { fontSize: 16 });

export function BrandHeader({ onLogo, menuOchiq = false, sahifa, suzuvchi = false }) {
  const { akkauntNomi } = useApp();
  const nom = (akkauntNomi || "").trim() || "Nur-Non";
  const [t, setT] = useState(hozir());
  useEffect(() => {
    const id = setInterval(() => setT(hozir()), 30000); // 30s
    return () => clearInterval(id);
  }, []);

  return (
    // Butun banner bosiladi (faqat logotip emas) — Nur-Non menyusi ochiladi/yopiladi
    <Pressable
      accessibilityLabel="Menyu"
      accessibilityRole="button"
      accessibilityState={{ expanded: menuOchiq }}
      onPress={onLogo}
      disabled={!onLogo}
      style={({ pressed }) => [styles.banner, suzuvchi && styles.suzuvchi, pressed && styles.bannerPressed]}
    >
      {suzuvchi && <SuzuvchiFon rang={C.accent + "E6"} radius={R.xl} kuch={45} />}
      <View style={styles.tile}>
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        {onLogo ? (
          <View style={styles.tileBadge}>
            <Ionicons name={menuOchiq ? "chevron-up" : "chevron-down"} size={11} color={C.onAccent} />
          </View>
        ) : null}
      </View>
      <View style={styles.flex1}>
        {/* Nonvoyxona (profil) nomi — faqat shu yerda; ostida joriy bo'lim nomi */}
        <Text style={[styles.title, nomShrift(nom)]} numberOfLines={1} adjustsFontSizeToFit>{nom}</Text>
        <Text style={styles.sub} numberOfLines={1}>{sahifa || "Boshqaruv tizimi"}</Text>
      </View>
      <View style={styles.clock}>
        <View style={styles.clockRow}>
          <Ionicons name="time-outline" size={12} color={C.onAccent} />
          <Text style={styles.clockTime}>{t.vaqt}</Text>
        </View>
        <Text style={styles.clockDate}>{t.sana}</Text>
      </View>
    </Pressable>
  );
}

const styles = temaStil(() => StyleSheet.create({
  // Suzuvchi (kontent ustida turadigan) bar — soya yo'q; foni yarim shaffof, ortidagi kontent xiralashadi
  suzuvchi: { marginBottom: 0, backgroundColor: "transparent", shadowOpacity: 0, elevation: 0 },
  bannerPressed: { opacity: 0.92, transform: [{ scale: 0.985 }] },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: S[3],
    backgroundColor: C.accent,
    borderRadius: R.xl,
    paddingVertical: S[4],
    paddingHorizontal: S[4],
    marginBottom: S[6],
    ...shadow,
  },
  tile: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  tileBadge: {
    position: "absolute", right: -4, bottom: -4, width: 20, height: 20, borderRadius: 10,
    backgroundColor: C.accent, borderWidth: 2, borderColor: "#FFFFFF", alignItems: "center", justifyContent: "center",
  },
  logo:  { width: 50, height: 50 },
  flex1: { flex: 1 },
  title: { fontSize: 23, fontWeight: "800", color: C.onAccent, letterSpacing: -0.3 },
  sub:   { fontSize: T.sm, color: C.onAccentSub, marginTop: 2, fontWeight: "500" },
  akkRow:{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  akk:   { marginTop: 0, fontWeight: "700", flexShrink: 1 },
  clock: {
    alignItems: "flex-end",
    paddingHorizontal: S[3],
    paddingVertical: 6,
    borderRadius: R.md,
    backgroundColor: C.onAccent + "1F",
  },
  clockRow:  { flexDirection: "row", alignItems: "center", gap: 3 },
  clockTime: { fontSize: T.md, color: C.onAccent, fontWeight: "800", letterSpacing: 0.3 },
  clockDate: { fontSize: 10, color: C.onAccentSub, fontWeight: "700", marginTop: 1, letterSpacing: 0.4 },
}));
