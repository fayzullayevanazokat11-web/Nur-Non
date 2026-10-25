// "Ombor" ekrani — mavjud zaxira + "Yangi set kiritish" modali.
import { useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, Image, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useApp } from "../../src/store/AppData";
import { Card } from "../../src/components/Card";
import { Btn } from "../../src/components/Btn";
import { ScreenHeader } from "../../src/components/ScreenHeader";
import { ErtalabQadamBelgisi } from "../../src/components/ErtalabTekshiruv";
import { Bosma } from "../../src/components/Bosma";
import { router } from "expo-router";
import { ExpandableCard, yopKartalar } from "../../src/components/ExpandableCard";
import { ScrollBox } from "../../src/components/ScrollBox";
import { C, T, S, R, temaStil } from "../../src/theme";
import { omborBalans, zaxiraMatni, omborKattaBirlik, bugunSana, sonOl } from "../../src/logic/hisob";
import { omborRoyxati } from "../../src/logic/konstantalar";
import { ortachaSarf } from "../../src/logic/eslatma";
import { XomashyoIkon } from "../../src/components/XomashyoIkon";
import { useTiklash } from "../../src/components/useTiklash";
import { saqlandiXabar } from "../../src/components/Xabarcha";

// Har bir mahsulot id'si uchun bo'sh maydon (asosiy + Xomashyoda qo'shilganlar)
const boshForma = (royxat) => Object.fromEntries(royxat.map((m) => [m.id, ""]));

export default function Ombor() {
  const { omborlar, setOmborlar, omborSorovlar, setOmborSorovlar, omborTasdiqlar, setOmborTasdiqlar, customMahsulotlar, ochirArxivga, amalArxivga, hisobotlarTarixi, nonlar, ozIshlabQoplar, eksportMalumot, bekorTaklif } = useApp();
  // Ishlab chiqarish > Xomashyo'da qo'shilgan mahsulotlar ham omborda avtomatik ko'rinadi
  // (sut va suv omborda turmaydi)
  const royxat = useMemo(() => omborRoyxati(customMahsulotlar), [customMahsulotlar]);

  const [forma, setForma] = useState(() => boshForma(royxat));
  // "qosh" — keltirilgan miqdor bor zaxira ustiga qo'shiladi; "yangila" — mahsulotning aniq
  // hozirgi qoldig'i yoziladi (zaxira shu qiymatga tenglashtiriladi)
  const [rejim, setRejim] = useState("qosh");
  useTiklash(() => setRejim("qosh"));

  const balans = useMemo(() => omborBalans(omborlar, royxat), [omborlar, royxat]);
  const setSoni = (omborlar || []).filter((h) => h.turi === "yangiset").length;
  const zaxiraBor = balans.some((b) => Math.abs(b.qiymat) > 0.0001);

  // Prognoz: o'rtacha kunlik sarf (oxirgi hisobotlar) bo'yicha necha kunga yetadi.
  // Tasdiqlanmagan so'rovnomalar ham hisobga olinadi (ular baribir ayriladi).
  const sarf = useMemo(() => ortachaSarf({ hisobotlar: hisobotlarTarixi, nonlar, ozIshlabQoplar, royxat }), [hisobotlarTarixi, nonlar, ozIshlabQoplar, royxat]);
  const kutilayotgan = useMemo(() => {
    const k = {};
    (omborSorovlar || []).forEach((so) => (so.maydonlar || []).forEach((m) => { k[m.id] = (k[m.id] || 0) + (parseFloat(m.qiymat) || 0); }));
    return k;
  }, [omborSorovlar]);
  const prognoz = (b) => {
    const kunlik = sarf[b.id] || 0;
    if (kunlik <= 0 || !setSoni) return null;
    const kun = (b.qiymat - (kutilayotgan[b.id] || 0)) / kunlik;
    if (kun <= 0) return { kun: 0, matn: "tugagan", kam: true };
    const d = new Date(); d.setDate(d.getDate() + Math.floor(kun));
    const sana = `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`;
    return { kun, matn: kun < 1 ? "bugun tugaydi" : `~${Math.floor(kun)} kun · ${sana} gacha`, kam: kun < 2 };
  };

  // Mavjud zaxirani NOLGA tenglashtirish — joriy balansni teskari yozuv bilan bekor qiladi.
  const nollaZaxira = () => {
    if (!zaxiraBor) {
      Alert.alert("Bo'sh zaxira", "Mavjud zaxira allaqachon nol.");
      return;
    }
    Alert.alert("Zaxirani nollash", "Mavjud zaxirani nolga tenglashtirasizmi? Kerak bo'lsa «Tarixdagilar»dan qaytarish mumkin.", [
      { text: "Bekor", style: "cancel" },
      {
        text: "Nollash", style: "destructive", onPress: () => {
          const oldin = eksportMalumot();
          const entry = {
            id: Date.now(),
            sana: bugunSana(),
            vaqt: Date.now(),
            turi: "nollash",
            maydonlar: balans
              .filter((b) => Math.abs(b.qiymat) > 0.0001)
              .map((b) => ({ id: b.id, nom: b.nom, birlik: b.birlik, qiymat: -b.qiymat })),
          };
          setOmborlar((prev) => [entry, ...prev]);
          amalArxivga("nollash", entry); // Tarixdagilar'dan qaytarilsa — shu yozuv olib tashlanadi
          bekorTaklif("Zaxira nollandi", oldin);
        },
      },
    ]);
  };

  // So'rovnomani tasdiqlash — xomashyo ombordan AYRILADI (manfiy xarajat yozuvi)
  // + "Tasdiqlangan" tarixiga yoziladi (30 kunda o'chadi).
  const tasdiqlaSorov = (sorov) => {
    const sana = bugunSana();
    const omborId = Date.now();
    const tasdiqId = omborId + 1;
    const vaqt = Date.now();
    const entry = {
      id: omborId, sana, vaqt, turi: "xarajat", manba: sorov.manba, tasdiqId,
      maydonlar: (sorov.maydonlar || []).map((m) => ({ ...m, qiymat: -(parseFloat(m.qiymat) || 0) })),
    };
    setOmborlar((prev) => [entry, ...prev]);
    setOmborTasdiqlar((prev) => [{ id: tasdiqId, omborId, sorovId: sorov.id, sana, vaqt, manba: sorov.manba, maydonlar: sorov.maydonlar }, ...(prev || [])]);
    setOmborSorovlar((prev) => (prev || []).filter((s) => s.id !== sorov.id));
    yopKartalar();
  };

  const radEtSorov = (sorov) =>
    Alert.alert("Rad etish", "Bu so'rovnomani rad etasizmi? Xomashyo ayrilmaydi.", [
      { text: "Bekor", style: "cancel" },
      { text: "Rad etish", style: "destructive", onPress: () => ochirArxivga("omborSorov", sorov.id) },
    ]);

  // Tasdiqlangan xarajatni BEKOR qilish — tarixdan o'chiriladi va
  // mos manfiy xarajat omborlardan olib tashlanadi → xomashyo zaxiraga qaytadi.
  const bekorTasdiq = (t) =>
    Alert.alert("Bekor qilish", "Tasdiqlangan xarajatni bekor qilasizmi? Xomashyo zaxiraga qaytariladi.", [
      { text: "Bekor", style: "cancel" },
      { text: "Ha, bekor qil", style: "destructive", onPress: () => {
        yopKartalar();
        // Mos chiqim yozuvi: id bo'yicha, eski yozuvlar uchun manba va yaqin vaqt bo'yicha.
        const mos = (h) => (t.omborId ? h.id === t.omborId
          : h.turi === "xarajat" && h.manba === t.manba && Math.abs((h.vaqt || 0) - (t.vaqt || 0)) < 2000);
        const omborEntry = (omborlar || []).find(mos);
        setOmborlar((prev) => prev.filter((h) => !mos(h)));
        // Tarixdagilar'ga: qaytarilsa chiqim yozuvi ham tiklanadi (xomashyo yana ayriladi)
        ochirArxivga("omborTasdiq", t.id, { omborEntry });
      }},
    ]);

  // "Yangi set" yozuvini tarixdan o'chirish — balans avtomatik qayta hisoblanadi.
  const ochirSetKirim = (id) =>
    Alert.alert("O'chirish", "Bu set kirimini o'chirasizmi? Zaxiradan ayriladi.", [
      { text: "Bekor", style: "cancel" },
      { text: "Ha", style: "destructive", onPress: () => { yopKartalar(); ochirArxivga("omborSet", id); } },
    ]);

  const setKirimlari = (omborlar || []).filter((h) => h.turi === "yangiset").slice(0, 10);

  // Saqlangandan keyin forma tozalanadi va ochiq kartalar (forma ham) yopiladi
  const tozala = () => { setForma(boshForma(royxat)); yopKartalar(); };
  const yangila = (id, v) => setForma((p) => ({ ...p, [id]: v }));

  // Saqlash — kiritilgan qiymatlar baza birlikka (qop×50, quti×5) o'tkaziladi.
  // Yangi set avvalgi qoldiqqa QO'SHILADI (balans barcha yozuvlarni yig'adi).
  const saqla = () => {
    if (rejim === "yangila") return yangilaQoldiq();
    const maydonlar = royxat.map((m) => {
      const faktor = omborKattaBirlik(m.id)?.faktor || 1;
      const kiritilgan = sonOl(forma[m.id]);
      return { id: m.id, nom: m.nom, birlik: m.birlik, emoji: m.emoji, qiymat: kiritilgan * faktor };
    });
    if (!maydonlar.some((m) => m.qiymat > 0)) {
      Alert.alert("Bo'sh set", "Kamida bitta mahsulot miqdorini kiriting.");
      return;
    }
    const entry = {
      id: Date.now(),
      sana: bugunSana(),
      vaqt: Date.now(),
      turi: "yangiset",
      maydonlar,
    };
    setOmborlar((prev) => [entry, ...prev]);
    saqlandiXabar("Set kirimi saqlandi");
    tozala();
  };

  // Aniq qoldiqni yangilash: faqat to'ldirilgan maydonlar; farq (yangi − joriy) yozuv sifatida qo'shiladi
  const yangilaQoldiq = () => {
    const maydonlar = royxat
      .filter((m) => String(forma[m.id] ?? "").trim() !== "")
      .map((m) => {
        const faktor = omborKattaBirlik(m.id)?.faktor || 1;
        const yangi = sonOl(forma[m.id]) * faktor;
        const joriy = balans.find((b) => b.id === m.id)?.qiymat || 0;
        return { id: m.id, nom: m.nom, birlik: m.birlik, emoji: m.emoji, qiymat: +(yangi - joriy).toFixed(3), yangi };
      })
      .filter((m) => Math.abs(m.qiymat) > 0.0001);
    if (!maydonlar.length) {
      Alert.alert("O'zgarish yo'q", "Yangilanadigan mahsulotning hozirgi aniq qoldig'ini kiriting.");
      return;
    }
    const entry = { id: Date.now(), sana: bugunSana(), vaqt: Date.now(), turi: "yangilash", maydonlar };
    setOmborlar((prev) => [entry, ...prev]);
    amalArxivga("zaxiraYangilash", entry); // Tarixdagilar'dan qaytarilsa — avvalgi qoldiq tiklanadi
    saqlandiXabar("Qoldiq yangilandi");
    tozala();
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollBox contentContainerStyle={styles.scroll}>
        <ScreenHeader eyebrow="Zaxira" title="Ombor hisoboti" subtitle={`${setSoni} ta set kiritilgan`} image={require("../../assets/tabicons/ombor.png")} />
        <ErtalabQadamBelgisi qadam="ombor" matn="Zaxira va so'rovnomalarni tekshiring, so'ng «Tayyor»" />

        <Card accent>
          <View style={styles.cardTitleRow}>
            <Ionicons name="cube-outline" size={18} color={C.sub} />
            <Text style={styles.cardTitle}>Mavjud zaxira</Text>
          </View>
          <Text style={styles.muted}>Set kirimlari − tasdiqlangan xarajat ± qoldiq yangilashlari</Text>
          <View style={styles.gap10} />
          <View style={styles.grid}>
            {balans.map((b) => {
              const matn = zaxiraMatni(b.id, b.qiymat, b.birlik);
              const color = b.qiymat > 0 ? C.green : b.qiymat < 0 ? C.red : C.muted;
              const p = prognoz(b);
              return (
                <View key={b.id} style={styles.cell}>
                  <XomashyoIkon m={b} quti size={17} qutiSize={32} />
                  <View style={styles.cellChap}>
                    <Text style={styles.cellNom} numberOfLines={1}>{b.nom}</Text>
                    {p ? <Text style={[styles.prognoz, p.kam && styles.prognozKam]} numberOfLines={1}>{p.matn}</Text> : null}
                  </View>
                  <Text style={[styles.cellVal, { color }]} numberOfLines={1}>{matn}</Text>
                </View>
              );
            })}
          </View>
        </Card>

        <View style={styles.gap10} />
        <Btn secondary icon="refresh-outline" disabled={!zaxiraBor} onPress={nollaZaxira}>
          Mavjud zaxirani nollash
        </Btn>

        {(omborSorovlar || []).length > 0 && (
          <>
            <View style={styles.secHead}>
              <Ionicons name="documents-outline" size={13} color={C.sub} />
              <Text style={styles.secTitle}>OMBOR SO'ROVNOMALARI</Text>
              <Text style={styles.secCount}>{omborSorovlar.length} ta</Text>
            </View>
            {omborSorovlar.map((sorov) => (
              <Card key={sorov.id} style={styles.sorov}>
                <View style={styles.sorovHead}>
                  <View style={styles.flex1}>
                    <Text style={styles.sorovManba}>{sorov.manba}</Text>
                    <Text style={styles.muted}>{sorov.sana} · ketadigan xomashyo</Text>
                  </View>
                  <Pressable accessibilityLabel="So'rovnomani o'chirish" onPress={() => radEtSorov(sorov)} hitSlop={8} style={({ pressed }) => [styles.radBtn, pressed && styles.radBtnPressed]}>
                    <Image source={require("../../assets/icons/ochirish.png")} style={styles.radImg} resizeMode="contain" />
                  </Pressable>
                </View>
                <View style={styles.sorovList}>
                  {sorov.maydonlar.map((m) => (
                    <View key={m.id} style={styles.sorovRow}>
                      <View style={styles.sorovNomQ}>
                        <XomashyoIkon m={royxat.find((x) => x.id === m.id) || m} size={15} color={C.sub} />
                        <Text style={styles.sorovNom} numberOfLines={1}>{m.nom}</Text>
                      </View>
                      <Text style={styles.sorovVal}>− {zaxiraMatni(m.id, m.qiymat, m.birlik)}</Text>
                    </View>
                  ))}
                </View>
                <Btn onPress={() => tasdiqlaSorov(sorov)} icon="checkmark-outline">Tasdiqlash va chiqarish</Btn>
              </Card>
            ))}
            <View style={styles.gap14} />
          </>
        )}

        <View style={styles.gap14} />

        {/* INLINE FORMA — Modal o'rniga ExpandableCard (sahifaga kirsa darrov ko'rinmaydi, bosib ochiladi) */}
        <ExpandableCard
          style={styles.qoshCard}
          header={
            <View style={styles.qoshHead}>
              <Ionicons name="add-circle-outline" size={18} color={C.sub} />
              <Text style={styles.qoshTitle}>Yangi keltirilgan set / qoldiqni yangilash</Text>
            </View>
          }
        >
          <View style={styles.rejimQator}>
            {[["qosh", "Qo'shish"], ["yangila", "Aniq qoldiqni yangilash"]].map(([k, l]) => (
              <Pressable key={k} accessibilityRole="button" accessibilityState={{ selected: rejim === k }} onPress={() => setRejim(k)} style={[styles.rejimBtn, rejim === k && styles.rejimFaol]}>
                <Text style={[styles.rejimTxt, rejim === k && styles.rejimTxtFaol]}>{l}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.hint}>{rejim === "qosh" ? "Keltirilgan miqdor bor zaxira ustiga qo'shiladi." : "Mahsulotning hozir omborda turgan aniq miqdorini yozing — zaxira shu qiymatga tenglashadi. Bo'sh qoldirilgan mahsulot o'zgarmaydi."}</Text>
          {royxat.map((m) => {
            const katta = omborKattaBirlik(m.id);
            const birlik = katta ? katta.birlik : m.birlik;
            const qty = sonOl(forma[m.id]);
            return (
              <View key={m.id} style={styles.field}>
                <Text style={styles.inputLabel}>{m.nom} ({birlik})</Text>
                <TextInput
                  value={forma[m.id] ?? ""}
                  onChangeText={(v) => yangila(m.id, v)}
                  placeholder={rejim === "yangila"
                    ? `Hozir: ${zaxiraMatni(m.id, balans.find((b) => b.id === m.id)?.qiymat || 0, m.birlik)}`
                    : (katta ? `Nechta ${birlik}` : "0")}
                  placeholderTextColor={C.muted}
                  keyboardType="numeric"
                  style={styles.input}
                />
                {katta && qty > 0 && (
                  <Text style={styles.hint}>= {qty * katta.faktor} {m.birlik}</Text>
                )}
              </View>
            );
          })}
          <View style={styles.qoshActions}>
            <Btn color={C.blue} onPress={saqla}>{rejim === "yangila" ? "Qoldiqni yangilash" : "Saqlash"}</Btn>
          </View>
        </ExpandableCard>

        {(omborTasdiqlar || []).length > 0 && (
          <>
            <View style={styles.secHead}>
              <Ionicons name="checkmark-done-outline" size={13} color={C.sub} />
              <Text style={styles.secTitle}>TASDIQLANGAN (30 kun)</Text>
              <Text style={styles.secCount}>{omborTasdiqlar.length} ta</Text>
            </View>
            {omborTasdiqlar.map((t) => (
              <ExpandableCard
                key={t.id}
                style={styles.sorov}
                header={
                  <View style={styles.flex1}>
                    <Text style={styles.sorovManba}>{t.manba}</Text>
                    <Text style={styles.muted}>{t.sana} · chiqarilgan xomashyo</Text>
                  </View>
                }
              >
                {(t.maydonlar || []).map((m) => (
                  <View key={m.id} style={styles.sorovRow}>
                    <View style={styles.sorovNomQ}>
                        <XomashyoIkon m={royxat.find((x) => x.id === m.id) || m} size={15} color={C.sub} />
                        <Text style={styles.sorovNom} numberOfLines={1}>{m.nom}</Text>
                      </View>
                    <Text style={styles.sorovVal}>− {zaxiraMatni(m.id, m.qiymat, m.birlik)}</Text>
                  </View>
                ))}
                <View style={styles.tasdiqActions}>
                  <Pressable onPress={() => bekorTasdiq(t)} hitSlop={6} style={styles.tasdiqDel}>
                    <Ionicons name="arrow-undo-outline" size={16} color={C.red} />
                    <Text style={[styles.tasdiqDelTxt, { color: C.red }]}> Bekor qilish</Text>
                  </Pressable>
                </View>
              </ExpandableCard>
            ))}
          </>
        )}

        {setKirimlari.length > 0 && (
          <>
            <View style={styles.secHead}>
              <Ionicons name="cube-outline" size={13} color={C.sub} />
              <Text style={styles.secTitle}>OXIRGI SET KIRIMLARI</Text>
              <Text style={styles.secCount}>{setKirimlari.length} ta</Text>
            </View>
            {setKirimlari.map((h) => (
              <ExpandableCard
                key={h.id}
                style={styles.sorov}
                header={
                  <View style={styles.flex1}>
                    <Text style={styles.sorovManba}>Yangi set</Text>
                    <Text style={styles.muted}>{h.sana} · keltirilgan xomashyo</Text>
                  </View>
                }
              >
                {(h.maydonlar || []).filter((m) => (parseFloat(m.qiymat) || 0) > 0).map((m) => (
                  <View key={m.id} style={styles.sorovRow}>
                    <Text style={styles.sorovNom} numberOfLines={1}>{m.nom}</Text>
                    <Text style={[styles.sorovVal, { color: C.green }]}>+ {zaxiraMatni(m.id, m.qiymat, m.birlik)}</Text>
                  </View>
                ))}
                <View style={styles.tasdiqActions}>
                  <Pressable onPress={() => ochirSetKirim(h.id)} hitSlop={6} style={styles.tasdiqDel}>
                    <Ionicons name="trash-outline" size={16} color={C.red} />
                    <Text style={[styles.tasdiqDelTxt, { color: C.red }]}> O'chirish</Text>
                  </Pressable>
                </View>
              </ExpandableCard>
            ))}
          </>
        )}
      </ScrollBox>
    </SafeAreaView>
  );
}

const styles = temaStil(() => StyleSheet.create({
  rejimQator:{ flexDirection: "row", gap: 6, marginBottom: S[2] },
  rejimBtn: { flex: 1, paddingVertical: 9, borderRadius: R.pill, alignItems: "center", backgroundColor: C.panel },
  rejimFaol:{ backgroundColor: C.accent },
  rejimTxt: { fontSize: 12, fontWeight: "800", color: C.sub },
  rejimTxtFaol:{ color: C.onAccent },
  safe:      { flex: 1, backgroundColor: C.bg },
  scroll:    { padding: S[5], paddingBottom: S[8] },
  gap10:     { height: S[3] },
  gap12:     { height: S[3] },
  gap14:     { height: S[4] },
  cardTitleRow:{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: S[1] },
  cardTitle: { fontSize: T.md, fontWeight: "700", color: C.text },
  muted:     { fontSize: T.sm, color: C.sub },

  grid:      { flexDirection: "row", flexWrap: "wrap", gap: S[2] },
  cell:      { width: "100%", backgroundColor: C.surface, borderWidth: 1, borderColor: C.borderSoft, borderRadius: R.sm, paddingVertical: S[3], paddingHorizontal: S[4], flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cellNom:   { fontSize: T.sm, color: C.sub, fontWeight: "600", flexShrink: 1 },
  cellVal:   { fontSize: T.sm, fontWeight: "700", marginLeft: S[2] },
  cellChap:  { flex: 1, marginLeft: S[3] },
  prognoz:   { fontSize: 11, color: C.muted, fontWeight: "600", marginTop: 2 },
  prognozKam:{ color: C.red, fontWeight: "800" },

  // So'rovnomalar
  secHead:   { flexDirection: "row", alignItems: "center", gap: 6, marginTop: S[6], marginBottom: S[3] },
  secTitle:  { fontSize: T.xs, color: C.sub, fontWeight: "700", letterSpacing: 1, flex: 1 },
  secCount:  { fontSize: T.sm, color: C.sub, fontWeight: "700" },
  sorov:     { marginBottom: S[3] },
  sorovHead: { flexDirection: "row", alignItems: "flex-start", marginBottom: S[3] },
  sorovManba:{ fontSize: T.md, fontWeight: "800", color: C.text },
  radBtn:    { width: 36, height: 36, borderRadius: R.md, alignItems: "center", justifyContent: "center", backgroundColor: C.red + "12" },
  radBtnPressed: { opacity: 0.6, transform: [{ scale: 0.94 }] },
  radImg:    { width: 18, height: 18, tintColor: C.red },
  sorovList: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.borderSoft, paddingTop: S[3], marginBottom: S[3] },
  sorovRow:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: S[2] },
  sorovNomQ: { flex: 1, flexDirection: "row", alignItems: "center", gap: 6 },
  sorovNom:  { fontSize: T.sm, color: C.text, flex: 1 },
  sorovVal:  { fontSize: T.sm, fontWeight: "800", color: C.red, marginLeft: S[2] },
  tasdiqActions:{ flexDirection: "row", justifyContent: "flex-end", marginTop: S[2], borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.borderSoft, paddingTop: S[2] },
  tasdiqDel: { flexDirection: "row", alignItems: "center" },
  tasdiqDelTxt: { fontSize: T.sm, fontWeight: "700" },

  // Inline forma (ExpandableCard ichida)
  qoshCard:   { marginBottom: S[3] },
  qoshHead:   { flexDirection: "row", alignItems: "center", gap: S[2] },
  qoshTitle:  { fontSize: T.md, fontWeight: "800", color: C.text },
  qoshActions:{ marginTop: S[3] },
  field:      { marginBottom: S[3] },
  inputLabel: { fontSize: T.xs, color: C.sub, fontWeight: "600", marginBottom: 5, letterSpacing: 0.3 },
  input: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: R.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: T.md,
    color: C.text,
    backgroundColor: C.surface,
  },
  hint:       { fontSize: 11, color: C.muted, marginTop: 3 },
  flex1:      { flex: 1 },
}));
