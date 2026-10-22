// Qarzlar ekrani — inline forma yuqorida (modal yo'q). Sana, ism, savat,
// chegirma, izoh darrov sahifa ichida.
// Pastda QARZDORLAR: bir xil ismli qarzlar bitta kishiga yig'iladi — olgan,
// to'lagan, qoldiq; qisman to'lov (eng eski qarzdan boshlab yopiladi) va to'liq tarix.
import { useMemo, useState } from "react";
import { View, Text, Image, Pressable, TextInput, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { useApp } from "../src/store/AppData";
import { Card } from "../src/components/Card";
import { Btn } from "../src/components/Btn";
import { ExpandableCard, yopKartalar } from "../src/components/ExpandableCard";
import { DateField } from "../src/components/DateField";
import { NonIkon } from "../src/components/XomashyoIkon";
import { VaqtField, hozirgiSoat } from "../src/components/VaqtField";
import { ScrollBox } from "../src/components/ScrollBox";
import { SahifaSarlavha } from "../src/components/SahifaSarlavha";
import { C, T, S, R, temaStil } from "../src/theme";
import { formatSom, qarzJami, donaFoyda, bugunSana } from "../src/logic/hisob";
import { Qidiruv, qidiruvMos } from "../src/components/Qidiruv";
import { qarzdorlar, qarzdorTarixi, tolovQil, tolovniBekorQil, qarzdorKaliti, qarzQoldiq, kunOtdi } from "../src/logic/qarz";

const ikki = (n) => String(n).padStart(2, "0");
const vaqtMatni = (ms) => { const d = new Date(ms); return `${ikki(d.getDate())}.${ikki(d.getMonth() + 1)}.${d.getFullYear()}`; };

// Ish kuni sanasi (kun tunda 03:00 da tugaydi)
const localSana = () => bugunSana();

export default function Qarzlar() {
  const { nonlar, qarzlar, setQarzlar, mahsulotNarxlari, ochirArxivga, amalArxivga } = useApp();
  // sana: bo'sh bo'lsa => "avtomatik bugun". Qo'lda tanlansa => shu qiymat.
  const BOSH = { ism: "", izoh: "", sana: "", sanaTanlandi: false, soat: "", savat: {}, chegirma: "" };
  const [forma, setForma] = useState(BOSH);

  const qarz = useMemo(() => qarzJami(qarzlar), [qarzlar]);
  const guruhlar = useMemo(() => qarzdorlar(qarzlar), [qarzlar]);
  // Ism yozilayotganda mavjud qarzdorlardan taklif (bir kishi ikki xil yozilmasin)
  const takliflar = useMemo(() => {
    const k = qarzdorKaliti(forma.ism);
    if (!k) return [];
    return guruhlar.filter((g) => g.kalit.includes(k)).slice(0, 4);
  }, [forma.ism, guruhlar]);
  // Taklif tanlansa — ism va shu kishining oxirgi buyurtmasi (non turlari, soni) to'ladi
  const taklifTanla = (g) => {
    const oxirgi = [...g.qarzlar].sort((a, b) => (b.vaqt || 0) - (a.vaqt || 0))[0];
    const savat = {};
    (oxirgi?.savat || []).forEach((x) => {
      const n = (nonlar || []).find((nn) => nn.nom === x.nonNomi);
      if (n && x.soni) savat[n.id] = String(x.soni);
    });
    setForma((p) => ({ ...p, ism: g.ism, savat: Object.keys(savat).length ? savat : p.savat }));
  };
  const [qidiruv, setQidiruv] = useState("");
  const korinadi = guruhlar.filter((g) => qidiruvMos(g.ism, qidiruv));
  const [tolovlar, setTolovlar] = useState({}); // qarzdor kaliti → kiritilayotgan to'lov

  const savatHisob = useMemo(() => {
    let summa = 0, dona = 0, foyda = 0;
    const items = [];
    (nonlar || []).forEach((n) => {
      const soni = parseInt(forma.savat[n.id]) || 0;
      if (soni <= 0) return;
      const narx = parseFloat(n.narx) || 0;
      summa += soni * narx;
      dona += soni;
      foyda += soni * donaFoyda(n, mahsulotNarxlari);
      items.push({ nonNomi: n.nom, soni, narx });
    });
    const chegirma = parseFloat(forma.chegirma) || 0;
    return { summa, dona, foyda, items, chegirma, yakSumma: Math.max(0, summa - chegirma) };
  }, [forma.savat, forma.chegirma, nonlar, mahsulotNarxlari]);

  const yangila = (k, v) => setForma((p) => ({ ...p, [k]: v }));
  const yangilaSana = (v) => setForma((p) => ({ ...p, sana: v, sanaTanlandi: true }));
  const yangilaSavat = (id, v) => setForma((p) => ({ ...p, savat: { ...p.savat, [id]: v } }));
  const tozala = () => { setForma(BOSH); yopKartalar(); };

  const saqla = () => {
    if (!forma.ism.trim()) { Alert.alert("Ism kiritilmagan", "Iltimos, qarz oluvchi ismini kiriting."); return; }
    if (savatHisob.items.length === 0) { Alert.alert("Non tanlanmagan", "Kamida bitta non turidan soni kiriting."); return; }
    // Qo'lda tanlanmagan bo'lsa har safar joriy kun
    const sana = forma.sanaTanlandi && forma.sana ? forma.sana : localSana();
    const soat = forma.soat || hozirgiSoat(); // qo'lda tanlanmasa — hozirgi vaqt
    setQarzlar((prev) => [...prev, {
      id: Date.now(), ism: forma.ism.trim(), sana, soat, vaqt: Date.now(),
      savat: savatHisob.items, summa: savatHisob.yakSumma, chegirma: savatHisob.chegirma,
      izoh: forma.izoh.trim(), tolangan: false, tolanganVaqt: null, tolovlar: [],
    }]);
    tozala();
  };

  // Qisman yoki to'liq to'lov — eng eski ochiq qarzdan boshlab yopiladi
  const tolovKirit = (g, toliq = false) => {
    const summa = toliq ? g.qoldiq : parseFloat(String(tolovlar[g.kalit] || "").replace(/\s/g, "")) || 0;
    if (summa <= 0) { Alert.alert("Summa kiritilmagan", "To'lov summasini kiriting."); return; }
    if (summa > g.qoldiq + 0.5) { Alert.alert("Ortiqcha summa", `${g.ism}ning qarzi ${formatSom(g.qoldiq)} so'm. Undan ko'p to'lab bo'lmaydi.`); return; }
    const bajar = () => {
      setQarzlar((prev) => tolovQil(prev, g.kalit, summa));
      setTolovlar((p) => ({ ...p, [g.kalit]: "" }));
      if (summa >= g.qoldiq - 0.5) yopKartalar();
    };
    if (toliq) {
      Alert.alert("To'liq to'lash", `${g.ism} qarzining hammasi — ${formatSom(summa)} so'm to'landimi?`, [
        { text: "Bekor", style: "cancel" },
        { text: "Ha, to'landi", onPress: bajar },
      ]);
    } else bajar();
  };
  const tolovBekor = (v) => Alert.alert("To'lovni bekor qilish", `${formatSom(v.summa)} so'm to'lov bekor qilinsinmi? Qarz qayta ochiladi.`, [
    { text: "Yo'q", style: "cancel" },
    { text: "Bekor qilish", style: "destructive", onPress: () => {
      // Tarixdagilar'ga — to'lovni (barcha qismlari bilan) qayta tiklash mumkin
      const qismlar = (v.qismlar || []).map(({ qarzId, tolovId }) => {
        const q = (qarzlar || []).find((x) => x.id === qarzId);
        const tolov = (q?.tolovlar || []).find((t) => t.id === tolovId);
        return tolov ? { qarzId, tolov, tolanganVaqt: q.tolanganVaqt || null } : null;
      }).filter(Boolean);
      const ism = (qarzlar || []).find((x) => x.id === qismlar[0]?.qarzId)?.ism || "";
      if (qismlar.length) amalArxivga("tolovBekor", { ism, summa: v.summa, sana: v.sana || "", qismlar });
      setQarzlar((prev) => tolovniBekorQil(prev, v.qismlar));
    } },
  ]);
  const ochirQarz = (id) => Alert.alert("O'chirish", "Bu qarzni o'chirasizmi?", [
    { text: "Bekor", style: "cancel" },
    { text: "Ha", style: "destructive", onPress: () => { yopKartalar(); ochirArxivga("qarz", id); } },
  ]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollBox contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <SahifaSarlavha eyebrow="QARZLAR" title="Qarzdorlar" subtitle={`${formatSom(qarz.summa)} so'm · ${qarz.kishi} qarzdor`} image={require("../assets/icons/qarz.png")} ton="red" />

        {/* INLINE FORMA */}
        <Card style={styles.formCard}>
          <View style={styles.formHead}>
            <Ionicons name="add-circle-outline" size={18} color={C.sub} />
            <Text style={styles.formTitle}>Yangi qarz</Text>
          </View>

          <Text style={styles.inputLabel}>Sana</Text>
          <DateField value={forma.sana || localSana()} onChange={yangilaSana} />
          <Text style={styles.inputLabel}>Vaqt</Text>
          <VaqtField value={forma.soat} onChange={(v) => setForma((p) => ({ ...p, soat: v }))} />
          {!forma.sanaTanlandi && !forma.soat && <Text style={styles.hint}>Bugungi sana va hozirgi vaqt avtomatik. O'zgartirish uchun bosing.</Text>}

          <Text style={styles.inputLabel}>Qarz oluvchi *</Text>
          <TextInput value={forma.ism} onChangeText={(v) => yangila("ism", v)} placeholder="Ism familiya" placeholderTextColor={C.muted} style={styles.input} />
          {takliflar.length > 0 && (
            <View style={styles.takliflar}>
              {takliflar.map((g) => (
                <Pressable key={g.kalit} accessibilityLabel={`Taklif: ${g.ism}`} onPress={() => taklifTanla(g)} style={({ pressed }) => [styles.taklif, pressed && styles.pressed]}>
                  <Ionicons name="repeat-outline" size={13} color={C.sub} />
                  <Text style={styles.taklifTxt}>{g.ism} · oxirgi buyurtma</Text>
                </Pressable>
              ))}
            </View>
          )}

          <Text style={styles.inputLabel}>Non turlari (soni)</Text>
          {(nonlar || []).map((n) => (
            <View key={n.id} style={styles.savatRow}>
              <NonIkon non={n} size={16} color={C.sub} />
              <Text style={styles.savatNom} numberOfLines={1}>{n.nom}</Text>
              <Text style={styles.savatNarx}>{formatSom(n.narx)}</Text>
              <TextInput value={forma.savat[n.id] ?? ""} onChangeText={(v) => yangilaSavat(n.id, v)} placeholder="0" placeholderTextColor={C.muted} keyboardType="numeric" style={styles.savatInput} />
            </View>
          ))}

          <Text style={styles.inputLabel}>Chegirma (so'm, ixtiyoriy)</Text>
          <TextInput value={forma.chegirma} onChangeText={(v) => yangila("chegirma", v)} placeholder="0" placeholderTextColor={C.muted} keyboardType="numeric" style={styles.input} />

          <Text style={styles.inputLabel}>Izoh</Text>
          <TextInput value={forma.izoh} onChangeText={(v) => yangila("izoh", v)} placeholder="Qo'shimcha izoh (ixtiyoriy)" placeholderTextColor={C.muted} multiline style={[styles.input, styles.inputMulti]} />

          {savatHisob.items.length > 0 && (
            <View style={styles.preview}>
              <View style={styles.previewRow}><Text style={styles.previewLabel}>Jami ({savatHisob.dona} dona)</Text><Text style={styles.previewVal}>{formatSom(savatHisob.summa)} so'm</Text></View>
              {savatHisob.chegirma > 0 && (
                <View style={styles.previewRow}><Text style={styles.previewLabel}>Chegirma</Text><Text style={styles.previewVal}>− {formatSom(savatHisob.chegirma)} so'm</Text></View>
              )}
              <View style={styles.previewRow}><Text style={styles.previewLabel}>Qarz summasi</Text><Text style={[styles.previewVal, { color: C.accent }]}>{formatSom(savatHisob.yakSumma)} so'm</Text></View>
            </View>
          )}

          <View style={styles.formActions}>
            <Btn color={C.accent} onPress={saqla}>Saqlash</Btn>
          </View>
        </Card>

        {/* QARZDORLAR */}
        <View style={styles.secHead}>
          <Ionicons name="people-outline" size={13} color={C.sub} />
          <Text style={styles.secTitle}>QARZDORLAR</Text>
          <Text style={styles.secCount}>{guruhlar.length} kishi</Text>
        </View>

        {guruhlar.length > 4 && <Qidiruv value={qidiruv} onChange={setQidiruv} placeholder="Qarzdorni qidirish" />}

        {korinadi.length === 0 ? (
          <Card><Text style={styles.bosh}>{guruhlar.length ? "Topilmadi" : "Hali qarz yo'q"}</Text></Card>
        ) : (
          korinadi.map((g) => {
            const kun = g.qoldiq > 0 ? kunOtdi(g.enEskiFaol) : 0;
            const tarix = qarzdorTarixi(g);
            return (
              <ExpandableCard
                key={g.kalit}
                style={styles.item}
                header={
                  <View style={styles.mHead}>
                    <View style={styles.flex1}>
                      <Text style={styles.itemIsm} numberOfLines={1}>{g.ism}</Text>
                      <Text style={styles.itemSana} numberOfLines={1}>
                        {g.qoldiq > 0 ? `${g.qarzlar.filter((q) => qarzQoldiq(q) > 0).length} ta ochiq qarz · ${kun > 0 ? `${kun} kundan beri` : "bugun"}` : "To'liq to'langan"}
                      </Text>
                    </View>
                    <Text style={[styles.itemSumma, { color: g.qoldiq > 0 ? C.red : C.muted }]} numberOfLines={1}>
                      {g.qoldiq > 0 ? `${formatSom(g.qoldiq)} so'm` : "✓"}
                    </Text>
                  </View>
                }
              >
                <View style={styles.xulosa}>
                  <View style={styles.xulosaQ}><Text style={styles.xulosaL}>Olgan</Text><Text style={styles.xulosaV}>{formatSom(g.olgan)}</Text></View>
                  <View style={styles.xulosaQ}><Text style={styles.xulosaL}>To'lagan</Text><Text style={styles.xulosaV}>{formatSom(g.tolagan)}</Text></View>
                  <View style={styles.xulosaQ}><Text style={styles.xulosaL}>Qoldiq</Text><Text style={[styles.xulosaV, g.qoldiq > 0 && { color: C.red }]}>{formatSom(g.qoldiq)}</Text></View>
                </View>

                {g.qoldiq > 0 && (
                  <View style={styles.tolovBox}>
                    <View style={styles.flex1}>
                      <TextInput
                        value={tolovlar[g.kalit] ?? ""}
                        onChangeText={(v) => setTolovlar((p) => ({ ...p, [g.kalit]: v }))}
                        placeholder="To'lov summasi"
                        placeholderTextColor={C.muted}
                        keyboardType="numeric"
                        style={styles.input}
                      />
                    </View>
                    <Pressable accessibilityLabel={`${g.ism}: to'lov qo'shish`} onPress={() => tolovKirit(g)} style={({ pressed }) => [styles.tolovBtn, pressed && styles.pressed]}>
                      <Ionicons name="add" size={18} color={C.onAccent} />
                      <Text style={styles.tolovBtnTxt}>To'lov</Text>
                    </Pressable>
                  </View>
                )}
                {g.qoldiq > 0 && (
                  <Pressable onPress={() => tolovKirit(g, true)} hitSlop={6} style={styles.toliqBtn}>
                    <Ionicons name="checkmark-done-outline" size={15} color={C.accent} />
                    <Text style={[styles.actTxt, { color: C.accent }]}> Hammasini to'ladi</Text>
                  </Pressable>
                )}

                <Text style={styles.tarixSarlavha}>TARIX</Text>
                {tarix.map((v) => (
                  <View key={v.key} style={styles.tarixQator}>
                    <View style={[styles.tarixNuqta, { backgroundColor: v.tur === "qarz" ? C.red : C.accent }]} />
                    <View style={styles.flex1}>
                      <Text style={styles.tarixMatn} numberOfLines={2}>
                        {v.tur === "qarz"
                          ? (v.savat.length ? v.savat.map((s) => `${s.nonNomi} ×${s.soni}`).join(", ") : "Qarz")
                          : v.eski ? "To'landi" : "To'lov"}
                      </Text>
                      <Text style={styles.tarixSana}>
                        {v.sana || vaqtMatni(v.vaqt)}{v.soat ? ` · ${v.soat}` : ""}{v.chegirma > 0 ? ` · chegirma ${formatSom(v.chegirma)}` : ""}{v.izoh ? ` · ${v.izoh}` : ""}
                      </Text>
                    </View>
                    <Text style={[styles.tarixSumma, { color: v.tur === "qarz" ? C.red : C.accent }]}>
                      {v.tur === "qarz" ? "+" : "−"}{formatSom(v.summa)}
                    </Text>
                    {v.tur === "qarz" ? (
                      <Pressable accessibilityLabel="Qarzni o'chirish" onPress={() => ochirQarz(v.qarzId)} hitSlop={8} style={styles.tarixAmal}>
                        <Ionicons name="trash-outline" size={15} color={C.muted} />
                      </Pressable>
                    ) : !v.eski ? (
                      <Pressable accessibilityLabel="To'lovni bekor qilish" onPress={() => tolovBekor(v)} hitSlop={8} style={styles.tarixAmal}>
                        <Ionicons name="close-circle-outline" size={16} color={C.muted} />
                      </Pressable>
                    ) : <View style={styles.tarixAmal} />}
                  </View>
                ))}
              </ExpandableCard>
            );
          })
        )}
      </ScrollBox>
    </SafeAreaView>
  );
}

const styles = temaStil(() => StyleSheet.create({
  safe:     { flex: 1, backgroundColor: C.bg },
  scroll:   { padding: S[5], paddingBottom: S[8] },
  flex1:    { flex: 1 },
  bosh:     { fontSize: T.sm, color: C.muted },

  formCard: { marginBottom: S[5] },
  formHead: { flexDirection: "row", alignItems: "center", gap: S[2], marginBottom: S[4] },
  formTitle:{ fontSize: T.md, fontWeight: "800", color: C.text },
  inputLabel:{ fontSize: T.xs, color: C.sub, fontWeight: "600", marginBottom: 6, marginTop: S[3], letterSpacing: 0.3 },
  input:    { borderWidth: 1, borderColor: C.border, borderRadius: R.md, paddingVertical: 12, paddingHorizontal: 14, fontSize: T.md, color: C.text, backgroundColor: C.surface },
  inputMulti:{ minHeight: 64, textAlignVertical: "top" },
  hint:     { fontSize: 11, color: C.muted, marginTop: 5, fontStyle: "italic" },
  savatRow: { flexDirection: "row", alignItems: "center", gap: S[2], marginBottom: S[2] },
  savatNom: { flex: 1, fontSize: T.sm, color: C.text },
  savatNarx:{ fontSize: T.xs, color: C.muted, width: 70, textAlign: "right" },
  savatInput:{ width: 70, borderWidth: 1, borderColor: C.border, borderRadius: R.sm, paddingVertical: 8, paddingHorizontal: 10, fontSize: T.sm, color: C.text, backgroundColor: C.surface, textAlign: "right" },
  preview:  { marginTop: S[4], backgroundColor: C.accent + "0D", borderWidth: 1, borderColor: C.accent + "2E", borderRadius: R.md, padding: S[3] },
  previewRow:{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: S[1] },
  previewLabel:{ fontSize: T.sm, color: C.sub },
  previewVal:{ fontSize: T.md, fontWeight: "800", color: C.text },
  formActions:{ marginTop: S[4], gap: S[2] },

  secHead:  { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: S[3] },
  secTitle: { fontSize: T.xs, color: C.sub, fontWeight: "700", letterSpacing: 1, flex: 1 },
  secCount: { fontSize: T.sm, color: C.sub, fontWeight: "700" },

  item:     { marginBottom: S[3] },
  mHead:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: S[2] },
  itemIsm:  { fontSize: T.md, fontWeight: "700", color: C.text },
  itemIzoh: { fontSize: T.sm, color: C.sub, marginTop: 2 },
  itemSana: { fontSize: T.xs, color: C.muted, marginTop: 2 },
  itemSumma:{ fontSize: T.md, fontWeight: "800", marginLeft: S[2] },
  savatLine:{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  savatLNom:{ flex: 1, fontSize: T.sm, color: C.text },
  savatLV:  { fontSize: T.xs, color: C.sub, fontWeight: "700", marginLeft: S[2] },
  actions:  { flexDirection: "row", justifyContent: "flex-end", gap: S[4], marginTop: S[3], borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.borderSoft, paddingTop: S[3] },
  actBtn:   { flexDirection: "row", alignItems: "center" },
  actTxt:   { fontSize: T.sm, fontWeight: "700" },
  pressed:  { opacity: 0.75, transform: [{ scale: 0.98 }] },

  takliflar:{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: S[2] },
  taklif:   { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 6, paddingHorizontal: 10, borderRadius: R.pill, backgroundColor: C.panel },
  taklifTxt:{ fontSize: T.xs, fontWeight: "700", color: C.sub },

  xulosa:   { flexDirection: "row", gap: S[2], marginBottom: S[3] },
  xulosaQ:  { flex: 1, backgroundColor: C.surface, borderRadius: R.sm, paddingVertical: S[2], paddingHorizontal: S[3], borderWidth: StyleSheet.hairlineWidth, borderColor: C.borderSoft },
  xulosaL:  { fontSize: 11, color: C.muted, fontWeight: "700" },
  xulosaV:  { fontSize: T.md, color: C.text, fontWeight: "800", marginTop: 2 },
  tolovBox: { flexDirection: "row", gap: S[2], alignItems: "center" },
  tolovBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: C.accent, borderRadius: R.md, paddingVertical: 12, paddingHorizontal: 14 },
  tolovBtnTxt:{ fontSize: T.sm, fontWeight: "800", color: C.onAccent },
  toliqBtn: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", marginTop: S[3] },
  tarixSarlavha:{ fontSize: 11, color: C.muted, fontWeight: "800", letterSpacing: 1.2, marginTop: S[4], marginBottom: S[2] },
  tarixQator:{ flexDirection: "row", alignItems: "center", gap: S[2], paddingVertical: S[2], borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.borderSoft },
  tarixNuqta:{ width: 8, height: 8, borderRadius: 4 },
  tarixMatn:{ fontSize: T.sm, color: C.text, fontWeight: "600" },
  tarixSana:{ fontSize: 11, color: C.muted, marginTop: 1 },
  tarixSumma:{ fontSize: T.sm, fontWeight: "800" },
  tarixAmal:{ width: 22, alignItems: "flex-end" },
}));
