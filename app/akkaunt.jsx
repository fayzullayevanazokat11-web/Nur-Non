// "Akkaunt va ma'lumotlar" — asosiy akkaunt nomi + ma'lumotlarni uzatish.
// Butun baza bitta matnga aylanadi (nusxa olish / ulashish / fayl qilib yuborish);
// boshqa telefonda shu matnni qo'yib (yoki faylni tanlab) hammasi tiklanadi —
// internetsiz "offlayn akkaunt". Yuklashdan oldingi holat zaxirada qoladi.
import { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert, Share, Platform, LayoutAnimation } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Clipboard from "expo-clipboard";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";

import { useApp } from "../src/store/AppData";
import { Card } from "../src/components/Card";
import { Btn } from "../src/components/Btn";
import { ScrollBox } from "../src/components/ScrollBox";
import { C, T, S, R } from "../src/theme";
import { matngaAylantir, matndanOqi, xulosa, hajm, sanaVaqt, faylNomi } from "../src/logic/uzatish";

// Juda uzun matn TextInput'da sekinlashtiradi — undan uzunini ixcham ko'rsatamiz
const KATTA = 3000;
const silliq = () => LayoutAnimation.configureNext(LayoutAnimation.create(220, LayoutAnimation.Types.easeInEaseOut, LayoutAnimation.Properties.opacity));

function bosh(nom) {
  const q = String(nom || "").trim().split(/\s+/).filter(Boolean);
  if (!q.length) return null;
  return (q.length === 1 ? q[0].slice(0, 2) : q[0][0] + q[1][0]).toUpperCase();
}

export default function Akkaunt() {
  const { akkauntNomi, setAkkauntNomi, eksportMalumot, importMalumot, importZaxira, zaxiradanQaytar } = useApp();

  // ── Akkaunt nomi ──
  const [nom, setNom] = useState(akkauntNomi || "");
  const tegildi = useRef(false);
  useEffect(() => { if (!tegildi.current) setNom(akkauntNomi || ""); }, [akkauntNomi]);
  const nomOzgardi = nom.trim() !== (akkauntNomi || "").trim();

  // ── Xabar banneri ──
  const [xabar, setXabar] = useState(null); // { matn, xato }
  const xabarT = useRef(null);
  useEffect(() => () => clearTimeout(xabarT.current), []);
  const ayt = (matn, xato = false) => {
    silliq();
    setXabar({ matn, xato });
    clearTimeout(xabarT.current);
    xabarT.current = setTimeout(() => { silliq(); setXabar(null); }, 2600);
  };

  const nomSaqla = () => {
    const n = nom.trim().slice(0, 40);
    setAkkauntNomi(n);
    setNom(n);
    tegildi.current = false;
    ayt(n ? "Akkaunt nomi saqlandi" : "Akkaunt nomi olib tashlandi");
  };

  // ── Yuborish (eksport) ──
  const joriy = eksportMalumot();
  const joriyXulosa = xulosa(joriy.data);
  const matnTayyorla = () => matngaAylantir(eksportMalumot());

  const nusxaOl = async () => {
    try {
      const m = matnTayyorla();
      await Clipboard.setStringAsync(m);
      ayt(`Nusxa olindi · ${hajm(m)}`);
    } catch { ayt("Nusxa olib bo'lmadi", true); }
  };

  const ulash = async () => {
    try { await Share.share({ message: matnTayyorla(), title: "Nur-Non ma'lumotlari" }); } catch { ayt("Ulashib bo'lmadi", true); }
  };

  const faylYubor = async () => {
    const m = matnTayyorla();
    const fayl = faylNomi(Date.now());
    try {
      if (Platform.OS === "web") {
        const url = URL.createObjectURL(new Blob([m], { type: "text/plain" }));
        const a = document.createElement("a");
        a.href = url; a.download = fayl; a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        ayt("Fayl saqlandi");
        return;
      }
      const uri = FileSystem.cacheDirectory + fayl;
      await FileSystem.writeAsStringAsync(uri, m);
      if (!(await Sharing.isAvailableAsync())) { ayt("Bu qurilmada fayl ulashib bo'lmaydi", true); return; }
      await Sharing.shareAsync(uri, { mimeType: "text/plain", dialogTitle: "Nur-Non ma'lumotlari", UTI: "public.plain-text" });
    } catch { ayt("Faylni yuborib bo'lmadi", true); }
  };

  // ── Qabul qilish (import) ──
  const [kirish, setKirish] = useState("");
  const tahlil = useMemo(() => (kirish.trim() ? matndanOqi(kirish) : null), [kirish]);
  const kirishXulosa = tahlil?.ok ? xulosa(tahlil.paket.data) : [];

  const qoy = async () => {
    try {
      const m = await Clipboard.getStringAsync();
      if (!m) { ayt("Buferda matn yo'q", true); return; }
      silliq(); setKirish(m);
    } catch { ayt("Buferdan o'qib bo'lmadi", true); }
  };

  const fayldan = async () => {
    try {
      const r = await DocumentPicker.getDocumentAsync({ type: ["text/plain", "*/*"], copyToCacheDirectory: true, multiple: false });
      if (r.canceled || !r.assets?.[0]) return;
      const a = r.assets[0];
      const m = Platform.OS === "web" ? await (a.file ? a.file.text() : fetch(a.uri).then((x) => x.text())) : await FileSystem.readAsStringAsync(a.uri);
      silliq(); setKirish(m || "");
      if (!m) ayt("Fayl bo'sh", true);
    } catch { ayt("Faylni o'qib bo'lmadi", true); }
  };

  const yukla = () => {
    if (!tahlil?.ok) return;
    Alert.alert(
      "Ma'lumotlarni yuklash",
      "Joriy ma'lumotlar shu matndagilar bilan almashtiriladi. Hozirgi holat zaxirada saqlanadi — kerak bo'lsa qaytarish mumkin.",
      [
        { text: "Bekor", style: "cancel" },
        {
          text: "Yuklash",
          onPress: () => {
            const soni = importMalumot(tahlil.paket);
            tegildi.current = false;
            silliq(); setKirish("");
            ayt(soni ? `Yuklandi · ${soni} bo'lim yangilandi` : "Matnda yuklanadigan ma'lumot topilmadi", !soni);
          },
        },
      ]
    );
  };

  const zaxiraQaytar = () =>
    Alert.alert("Oldingi holatga qaytarish", "Oxirgi yuklashdan oldingi ma'lumotlar tiklanadi. Davom etasizmi?", [
      { text: "Bekor", style: "cancel" },
      { text: "Qaytarish", onPress: () => { tegildi.current = false; silliq(); if (zaxiradanQaytar()) ayt("Oldingi holat tiklandi"); } },
    ]);

  const harf = bosh(akkauntNomi);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollBox contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Pressable accessibilityLabel="Orqaga" onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={20} color={C.text} />
          <Text style={styles.backTxt}>Markaz</Text>
        </Pressable>

        <View style={styles.titleRow}>
          <View style={styles.iconBox}><Ionicons name="person-circle-outline" size={24} color={C.accent} /></View>
          <View style={styles.flex1}>
            <Text style={styles.eyebrow}>AKKAUNT</Text>
            <Text style={styles.title}>Akkaunt va ma'lumotlar</Text>
            <Text style={styles.subtitle}>Internetsiz — matn yoki fayl orqali</Text>
          </View>
        </View>

        {xabar ? (
          <View style={[styles.xabar, xabar.xato && styles.xabarXato]}>
            <Ionicons name={xabar.xato ? "alert-circle-outline" : "checkmark-circle-outline"} size={16} color={xabar.xato ? C.text : C.accent} />
            <Text style={[styles.xabarTxt, xabar.xato && { color: C.text }]}>{xabar.matn}</Text>
          </View>
        ) : null}

        {/* ASOSIY AKKAUNT */}
        <Card style={styles.card}>
          <View style={styles.akkRow}>
            <View style={styles.avatar}>
              {harf ? <Text style={styles.avatarTxt}>{harf}</Text> : <Ionicons name="storefront-outline" size={24} color="#FFF3E8" />}
            </View>
            <View style={styles.flex1}>
              <Text style={styles.akkEyebrow}>ASOSIY AKKAUNT</Text>
              <Text style={styles.akkNom} numberOfLines={1}>{akkauntNomi || "Nomsiz akkaunt"}</Text>
            </View>
          </View>
          <Text style={styles.inputLabel}>Akkaunt nomi</Text>
          <TextInput
            value={nom}
            onChangeText={(v) => { tegildi.current = true; setNom(v); }}
            placeholder="Masalan: Nur-Non novvoyxonasi"
            placeholderTextColor={C.muted}
            maxLength={40}
            returnKeyType="done"
            onSubmitEditing={() => nomOzgardi && nomSaqla()}
            style={styles.input}
          />
          <Text style={styles.hint}>Markaz sarlavhasida ko'rinadi va yuborilgan ma'lumotlar bilan birga ketadi.</Text>
          <View style={styles.actions}>
            <Btn icon="checkmark" disabled={!nomOzgardi} onPress={nomSaqla}>Saqlash</Btn>
          </View>
        </Card>

        {/* YUBORISH */}
        <View style={styles.secHead}>
          <Ionicons name="cloud-upload-outline" size={13} color={C.sub} />
          <Text style={styles.secTitle}>MA'LUMOTLARNI YUBORISH</Text>
        </View>
        <Card style={styles.card}>
          <Text style={styles.matn}>Barcha ma'lumotlar bitta matnga aylanadi. Uni o'zingizga yuboring yoki saqlab qo'ying — boshqa telefonda shu matnni qo'yib, hammasini tiklaysiz.</Text>
          <View style={styles.chips}>
            {joriyXulosa.length ? joriyXulosa.map((x) => (
              <View key={x.k} style={styles.chip}><Text style={styles.chipTxt}>{x.soni} {x.nom}</Text></View>
            )) : <Text style={styles.hint}>Hozircha asosan sozlamalar bor</Text>}
          </View>
          <View style={styles.btnRow}>
            <View style={styles.btnYarim}><Btn icon="copy-outline" onPress={nusxaOl}>Nusxa olish</Btn></View>
            <View style={styles.btnYarim}><Btn icon="share-social-outline" secondary onPress={ulash}>Ulashish</Btn></View>
          </View>
          <Btn icon="document-text-outline" secondary onPress={faylYubor}>Fayl qilib yuborish</Btn>
          <Text style={styles.hint}>Ma'lumot ko'p bo'lsa fayl qulayroq: Telegram kabi ilovalar uzun matnni bo'lib yuboradi.</Text>
        </Card>

        {/* QABUL QILISH */}
        <View style={styles.secHead}>
          <Ionicons name="cloud-download-outline" size={13} color={C.sub} />
          <Text style={styles.secTitle}>MA'LUMOTLARNI QABUL QILISH</Text>
        </View>
        <Card style={styles.card}>
          {kirish.length > KATTA ? (
            <View style={styles.qoyildi}>
              <Ionicons name="document-text-outline" size={20} color={C.accent} />
              <Text style={styles.qoyildiTxt}>Matn qo'yildi · {hajm(kirish)}</Text>
              <Pressable accessibilityLabel="Matnni tozalash" hitSlop={8} onPress={() => { silliq(); setKirish(""); }}>
                <Ionicons name="close-circle" size={20} color={C.muted} />
              </Pressable>
            </View>
          ) : (
            <TextInput
              value={kirish}
              onChangeText={setKirish}
              placeholder="Nusxa olingan matnni shu yerga qo'ying"
              placeholderTextColor={C.muted}
              multiline
              autoCorrect={false}
              autoCapitalize="none"
              style={[styles.input, styles.inputMulti]}
            />
          )}
          <View style={styles.btnRow}>
            <View style={styles.btnYarim}><Btn icon="clipboard-outline" secondary onPress={qoy}>Qo'yish</Btn></View>
            <View style={styles.btnYarim}><Btn icon="folder-open-outline" secondary onPress={fayldan}>Fayldan</Btn></View>
          </View>

          {tahlil && !tahlil.ok ? (
            <View style={[styles.tahlil, styles.tahlilXato]}>
              <Ionicons name="alert-circle-outline" size={16} color={C.text} />
              <Text style={styles.tahlilXatoTxt}>{tahlil.xato}</Text>
            </View>
          ) : null}

          {tahlil?.ok ? (
            <View style={styles.tahlil}>
              <Text style={styles.tahlilBosh}>{tahlil.paket.akkaunt || "Nomsiz akkaunt"}</Text>
              <Text style={styles.tahlilMeta}>Yuborilgan: {sanaVaqt(tahlil.paket.vaqt)}</Text>
              <View style={styles.chips}>
                {kirishXulosa.map((x) => (
                  <View key={x.k} style={styles.chip}><Text style={styles.chipTxt}>{x.soni} {x.nom}</Text></View>
                ))}
              </View>
              <Btn icon="download-outline" onPress={yukla}>Ma'lumotlarni yuklash</Btn>
              <Text style={styles.hint}>Joriy ma'lumotlar almashtiriladi, oldingisi zaxirada qoladi.</Text>
            </View>
          ) : null}
        </Card>

        {importZaxira ? (
          <Card style={styles.card}>
            <View style={styles.zaxiraRow}>
              <Ionicons name="time-outline" size={18} color={C.accent} />
              <View style={styles.flex1}>
                <Text style={styles.zaxiraBosh}>Oldingi holat saqlangan</Text>
                <Text style={styles.tahlilMeta}>{importZaxira.akkaunt || "Nomsiz akkaunt"} · {sanaVaqt(importZaxira.vaqt)}</Text>
              </View>
            </View>
            <Btn icon="arrow-undo-outline" secondary onPress={zaxiraQaytar}>Oldingi holatga qaytarish</Btn>
          </Card>
        ) : null}
      </ScrollBox>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:     { flex: 1, backgroundColor: C.bg },
  scroll:   { padding: S[5], paddingBottom: S[8] },
  backBtn:  { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: S[3] },
  backTxt:  { fontSize: T.sm, color: C.sub, fontWeight: "600" },
  titleRow: { flexDirection: "row", alignItems: "center", gap: S[3], marginBottom: S[5] },
  iconBox:  { width: 44, height: 44, borderRadius: R.md, alignItems: "center", justifyContent: "center", backgroundColor: C.accent + "14" },
  flex1:    { flex: 1 },
  eyebrow:  { fontSize: 11, color: C.muted, fontWeight: "700", letterSpacing: 1.8 },
  title:    { fontSize: T.xl, color: C.text, fontWeight: "800", letterSpacing: -0.6, marginTop: 2 },
  subtitle: { fontSize: T.sm, color: C.sub, fontWeight: "500", marginTop: 3 },

  xabar:    { flexDirection: "row", alignItems: "center", gap: S[2], backgroundColor: C.accent + "14", borderRadius: R.md, paddingVertical: S[2], paddingHorizontal: S[3], marginBottom: S[3] },
  xabarXato:{ backgroundColor: C.panel },
  xabarTxt: { fontSize: T.sm, fontWeight: "700", color: C.accent, flex: 1 },

  card:     { marginBottom: S[5] },
  akkRow:   { flexDirection: "row", alignItems: "center", gap: S[3] },
  avatar:   { width: 52, height: 52, borderRadius: 26, backgroundColor: C.accent, alignItems: "center", justifyContent: "center" },
  avatarTxt:{ fontSize: 19, fontWeight: "800", color: "#FFF3E8", letterSpacing: 0.5 },
  akkEyebrow:{ fontSize: 10, color: C.muted, fontWeight: "800", letterSpacing: 1.4 },
  akkNom:   { fontSize: T.lg, color: C.text, fontWeight: "800", marginTop: 2 },

  inputLabel:{ fontSize: T.xs, color: C.sub, fontWeight: "600", marginBottom: 6, marginTop: S[4], letterSpacing: 0.3 },
  input:    { borderWidth: 1, borderColor: C.border, borderRadius: R.md, paddingVertical: 12, paddingHorizontal: 14, fontSize: T.md, color: C.text, backgroundColor: C.surface },
  inputMulti:{ minHeight: 96, maxHeight: 180, textAlignVertical: "top", fontSize: T.sm },
  hint:     { fontSize: 11, color: C.muted, marginTop: S[2], lineHeight: 16 },
  actions:  { marginTop: S[4] },
  matn:     { fontSize: T.sm, color: C.sub, lineHeight: 20 },

  secHead:  { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: S[3] },
  secTitle: { fontSize: T.xs, color: C.sub, fontWeight: "700", letterSpacing: 1 },

  chips:    { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: S[3], marginBottom: S[4] },
  chip:     { paddingVertical: 5, paddingHorizontal: 10, borderRadius: R.pill, backgroundColor: C.surface, borderWidth: 1, borderColor: C.borderSoft },
  chipTxt:  { fontSize: T.xs, fontWeight: "700", color: C.sub },
  btnRow:   { flexDirection: "row", gap: S[2], marginBottom: S[2], marginTop: S[3] },
  btnYarim: { flex: 1 },

  qoyildi:  { flexDirection: "row", alignItems: "center", gap: S[2], borderWidth: 1, borderColor: C.border, borderRadius: R.md, paddingVertical: 14, paddingHorizontal: 14, backgroundColor: C.surface },
  qoyildiTxt:{ flex: 1, fontSize: T.sm, fontWeight: "700", color: C.text },

  tahlil:   { marginTop: S[3], paddingTop: S[3], borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.borderSoft },
  tahlilXato:{ flexDirection: "row", alignItems: "center", gap: S[2] },
  tahlilXatoTxt:{ flex: 1, fontSize: T.sm, fontWeight: "600", color: C.text },
  tahlilBosh:{ fontSize: T.md, fontWeight: "800", color: C.text },
  tahlilMeta:{ fontSize: T.xs, color: C.sub, marginTop: 2 },

  zaxiraRow:{ flexDirection: "row", alignItems: "center", gap: S[3], marginBottom: S[3] },
  zaxiraBosh:{ fontSize: T.md, fontWeight: "800", color: C.text },
});
