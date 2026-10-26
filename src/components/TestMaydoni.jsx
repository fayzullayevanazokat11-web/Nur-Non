// Menyudagi "Test maydoni" — asl tizimga tegmaydigan, noldan ochiladigan parallel tizim.
// Asl rejimda: "Noldan boshlash" va (oldingi test bo'lsa) "Davom ettirish".
// Test rejimida: virtual vaqt, vaqt tezligi (1× / 60× / Ultra — 1 daqiqa = 1 kun), "Nollash", "Asl tizimga qaytish".
import { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRejim, testBormi, testSoati, testniOch, testdanChiq, testniNolla, tezlikQoy, TEZLIKLAR } from "../store/rejim";
import { sezgi } from "../logic/sezgi";
import { C, T, S, R, temaStil } from "../theme";

const OYLAR = ["Yan", "Fev", "Mar", "Apr", "May", "Iyun", "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek"];
const ikki = (n) => String(n).padStart(2, "0");
const vaqtMatni = (ms) => { const d = new Date(ms); return `${d.getDate()} ${OYLAR[d.getMonth()]} ${d.getFullYear()} · ${ikki(d.getHours())}:${ikki(d.getMinutes())}`; };

function Tugma({ nom, icon, onPress, asosiy, xavfli }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={nom}
      onPress={onPress}
      style={({ pressed }) => [styles.tugma, asosiy && styles.tugmaAsosiy, xavfli && styles.tugmaXavfli, pressed && { opacity: 0.75 }]}
    >
      <Ionicons name={icon} size={15} color={asosiy ? C.onAccent : xavfli ? C.red : C.accent} />
      <Text style={[styles.tugmaTxt, asosiy && { color: C.onAccent }, xavfli && { color: C.red }]} numberOfLines={1}>{nom}</Text>
    </Pressable>
  );
}

export function TestMaydoni({ onYop }) {
  const { rejim, tezlik } = useRejim();
  const test = rejim === "test";
  const [oldingi, setOldingi] = useState(null); // { bor, virt }
  const [hozir, setHozir] = useState(Date.now());
  useEffect(() => {
    if (test) return undefined;
    let tirik = true;
    Promise.all([testBormi(), testSoati()]).then(([bor, s]) => { if (tirik) setOldingi({ bor, virt: s?.virt }); });
    return () => { tirik = false; };
  }, [test]);
  useEffect(() => {
    if (!test) return undefined;
    const id = setInterval(() => setHozir(Date.now()), 1000);
    return () => clearInterval(id);
  }, [test]);

  const och = (yangi) => { sezgi("otish"); onYop?.(); testniOch({ yangi }); };
  const noldan = () => {
    if (!oldingi?.bor) { och(true); return; }
    Alert.alert("Testni noldan boshlash", "Oldingi test maydonidagi barcha ma'lumot o'chadi. Asl tizimga ta'sir qilmaydi. Davom etasizmi?", [
      { text: "Yo'q", style: "cancel" },
      { text: "Noldan boshlash", style: "destructive", onPress: () => och(true) },
    ]);
  };
  const nolla = () => Alert.alert("Test maydonini nollash", "Test maydonidagi hamma narsa o'chadi va vaqt hozirgi kunga qaytadi. Asl tizimga ta'sir qilmaydi. Davom etasizmi?", [
    { text: "Yo'q", style: "cancel" },
    { text: "Nollash", style: "destructive", onPress: () => { sezgi("tayyor"); onYop?.(); testniNolla(); } },
  ]);
  const chiq = () => { sezgi("otish"); onYop?.(); testdanChiq(); };

  return (
    <View style={styles.wrap}>
      <View style={styles.bosh}>
        <View style={[styles.icon, test && styles.iconTest]}><Ionicons name="flask-outline" size={20} color={test ? C.onAccent : C.accent} /></View>
        <View style={styles.flex1}>
          <Text style={styles.label}>{test ? "Test maydoni ochiq" : "Test maydoni"}</Text>
          <Text style={styles.sub}>
            {test ? `Virtual vaqt: ${vaqtMatni(hozir)}` : "Asl tizimga tegmaydi — bir xil tizim noldan ochiladi, vaqtni tezlatish mumkin"}
          </Text>
        </View>
      </View>

      {test ? (
        <>
          <Text style={styles.bolim}>Vaqt tezligi</Text>
          <View style={styles.tezliklar}>
            {TEZLIKLAR.map((x) => {
              const faol = tezlik === x.k;
              return (
                <Pressable
                  key={x.k}
                  accessibilityRole="button"
                  accessibilityLabel={`Vaqt tezligi: ${x.nom}`}
                  accessibilityState={{ selected: faol }}
                  onPress={() => { sezgi("bos"); tezlikQoy(x.k); }}
                  style={[styles.tezlik, faol && styles.tezlikFaol]}
                >
                  <Text style={[styles.tezlikNom, faol && { color: C.onAccent }]}>{x.nom}</Text>
                  <Text style={[styles.tezlikIzoh, faol && { color: C.onAccentSub }]} numberOfLines={1}>{x.izoh}</Text>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.tugmalar}>
            <Tugma nom="Nollash" icon="refresh-outline" onPress={nolla} xavfli />
            <Tugma nom="Asl tizimga qaytish" icon="exit-outline" onPress={chiq} asosiy />
          </View>
        </>
      ) : (
        <View style={styles.tugmalar}>
          {oldingi?.bor && <Tugma nom="Davom ettirish" icon="play-outline" onPress={() => och(false)} asosiy />}
          <Tugma nom={oldingi?.bor ? "Noldan boshlash" : "Test maydonini ochish"} icon="add-circle-outline" onPress={noldan} asosiy={!oldingi?.bor} />
        </View>
      )}
      {!test && oldingi?.bor && oldingi.virt ? <Text style={styles.oldingi}>Oldingi test to'xtagan vaqt: {vaqtMatni(oldingi.virt)}</Text> : null}
    </View>
  );
}

const styles = temaStil(() => StyleSheet.create({
  wrap:      { paddingVertical: S[3], paddingHorizontal: S[4] },
  bosh:      { flexDirection: "row", alignItems: "center", gap: S[3] },
  icon:      { width: 40, height: 40, borderRadius: R.md, alignItems: "center", justifyContent: "center", backgroundColor: C.accent + "14" },
  iconTest:  { backgroundColor: C.accent },
  flex1:     { flex: 1 },
  label:     { fontSize: T.md, fontWeight: "800", color: C.text },
  sub:       { fontSize: T.xs, color: C.sub, marginTop: 2 },
  bolim:     { fontSize: 11, fontWeight: "800", color: C.sub, letterSpacing: 0.5, marginTop: S[3], marginBottom: 6 },
  tezliklar: { flexDirection: "row", gap: 6 },
  tezlik:    { flex: 1, alignItems: "center", paddingVertical: 8, paddingHorizontal: 4, borderRadius: R.md, backgroundColor: C.panel },
  tezlikFaol:{ backgroundColor: C.accent },
  tezlikNom: { fontSize: T.sm, fontWeight: "800", color: C.text },
  tezlikIzoh:{ fontSize: 10, fontWeight: "600", color: C.muted, marginTop: 1 },
  tugmalar:  { flexDirection: "row", gap: S[2], marginTop: S[3] },
  tugma:     { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, paddingHorizontal: 8, borderRadius: R.pill, borderWidth: 1, borderColor: C.accent + "55", backgroundColor: C.surface },
  tugmaAsosiy:{ backgroundColor: C.accent, borderColor: C.accent },
  tugmaXavfli:{ borderColor: C.red + "55" },
  tugmaTxt:  { fontSize: T.xs, fontWeight: "800", color: C.accent },
  oldingi:   { fontSize: 11, color: C.muted, marginTop: S[2] },
}));
