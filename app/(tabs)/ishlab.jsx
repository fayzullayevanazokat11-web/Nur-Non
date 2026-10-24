// "Ishlab chiqarish" (assortiment) — inline forma yuqorida (modal yo'q).
// Non: o'zimizniki (ingredient + 1 qopdan non soni → dona foydasi avtomatik)
// yoki tashqaridan (donadan qoladigan foyda to'g'ridan kiritiladi).
import { useRef, useState } from "react";
import { View, Text, Pressable, TextInput, StyleSheet, Alert, LayoutAnimation } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useApp } from "../../src/store/AppData";
import { Card } from "../../src/components/Card";
import { Btn } from "../../src/components/Btn";
import { ScreenHeader } from "../../src/components/ScreenHeader";
import { ExpandableCard, yopKartalar } from "../../src/components/ExpandableCard";
import { MahsulotNarxi } from "../../src/components/MahsulotNarxi";
import { TannarxKalk } from "../../src/components/TannarxKalk";
import { XomashyoIkon, NonIkon, BosiladiganIkon, IkonTanlov, IKON_TANLOV, xomashyoIkonKaliti } from "../../src/components/XomashyoIkon";
import { ScrollBox } from "../../src/components/ScrollBox";
import { useTiklash } from "../../src/components/useTiklash";
import { xomashyoRoyxati } from "../../src/logic/konstantalar";
import { C, T, S, R, temaStil } from "../../src/theme";
import { formatSom, getQopTannarx, getIngNarx, sonOl, xamirdanNonSoni, nonVazniOl } from "../../src/logic/hisob";

const baseUnit = (birlik) => (birlik === "litr" ? "ml" : "g");
const SUV = { id: "suv", nom: "Suv", birlik: "litr" };
const BOSH = { nom: "", narx: "", oz: true, nonVazni: "", donaFoyda: "", ing: {} };
const kgMatn = (g) => `${String(Math.round(g / 100) / 10).replace(".", ",")} kg`;

const silliq = () => LayoutAnimation.configureNext(LayoutAnimation.create(200, LayoutAnimation.Types.easeInEaseOut, LayoutAnimation.Properties.opacity));

// Non uchun dona foydasi
function donaFoydasi(non, narxlar) {
  if (non.ozIshlab === false) return parseFloat(non.tashqariFoyda) || 0;
  const son = parseFloat(non.nonSoni) || 0;
  if (son <= 0) return 0;
  return Math.round((parseFloat(non.narx) || 0) - getQopTannarx(non, narxlar) / son);
}

export default function IshlabChiqarish() {
  const {
    nonlar, setNonlar, ishchilar, setIshchilar,
    optomlar, setOptomlar, qarzlar, setQarzlar, braklar, setBraklar,
    mahsulotNarxlari, customMahsulotlar, ochirArxivga,
    xomashyoIkonlari, xomashyoIkonQoy,
  } = useApp();
  const [tahrirId, setTahrirId] = useState(null);
  // Retsept xomashyolari: ombordagilar + suv (omborda yo'q, lekin xamir vazniga kiradi)
  // Tahrirlanayotgan nonning ro'yxatda yo'q xomashyolari ham (masalan, alohida tuz) — aks holda
  // saqlashda tushib qolardi va xamir vazni kam hisoblanardi
  const asosiyRoyxat = [...xomashyoRoyxati(customMahsulotlar), SUV];
  const tahrirNon = tahrirId ? (nonlar || []).find((n) => n.id === tahrirId) : null;
  const royxat = [
    ...asosiyRoyxat,
    ...((tahrirNon?.mahsulotlar || []).filter((m) => !asosiyRoyxat.some((x) => x.id === m.id))
      .map((m) => ({ id: m.id, nom: m.nom, birlik: m.birlik === "ml" ? "litr" : "kg", ...(m.ikon ? { ikon: m.ikon } : {}) }))),
  ];

  // Ikonkani bosib o'zgartirish: qaysi ikonkaning tanlovi ochiq ("non:<id>", "x:<joy>:<xId>")
  const [ikonOchiq, setIkonOchiq] = useState(null);
  const ikonAlmash = (k) => { silliq(); setIkonOchiq((o) => (o === k ? null : k)); };
  const ikonYop = () => { silliq(); setIkonOchiq(null); };
  // Xomashyo qatori — ikonka bosilsa shu qator tagida tanlov ochiladi
  const xIkon = (joy, m, size = 16) => (
    <BosiladiganIkon belgi={false} label={`${m.nom}: ikonkani o'zgartirish`} ochiq={ikonOchiq === `x:${joy}:${m.id}`} onPress={() => ikonAlmash(`x:${joy}:${m.id}`)}>
      <XomashyoIkon m={royxat.find((x) => x.id === m.id) || m} size={size} color={C.sub} />
    </BosiladiganIkon>
  );
  const xTanlov = (joy, m) => ikonOchiq === `x:${joy}:${m.id}` && (
    <IkonTanlov
      sarlavha={`${m.nom} — ikonka`}
      variantlar={IKON_TANLOV}
      tanlangan={xomashyoIkonKaliti(royxat.find((x) => x.id === m.id) || m, xomashyoIkonlari)}
      onTanla={(k) => xomashyoIkonQoy(m.id, k)}
      onYop={ikonYop}
    />
  );

  const [tab, setTab] = useState("assortiment");
  // Sahifadan chiqilganda — ikonka tanlovi yopiladi va birinchi ichki bo'lim (Assortiment) tanlanadi
  useTiklash(() => { setIkonOchiq(null); setTab("assortiment"); });
  const tabTanla = (t) => { if (t === tab) return; silliq(); setIkonOchiq(null); setTab(t); };
  const [forma, setForma] = useState(BOSH);
  const scrollRef = useRef(null);

  const yangila = (k, v) => setForma((p) => ({ ...p, [k]: v }));
  const yangilaIng = (id, v) => setForma((p) => ({ ...p, ing: { ...p.ing, [id]: v } }));
  // Saqlash/Bekor: forma tozalanadi va barcha ochiq kartalar (forma ham) yopiladi
  const tozala = () => { setForma(BOSH); setTahrirId(null); yopKartalar(); };

  const tahrirla = (non) => {
    const oz = non.ozIshlab !== false;
    setForma({
      nom: non.nom, narx: String(non.narx || ""), oz,
      nonVazni: oz && nonVazniOl(non) ? String(nonVazniOl(non)) : "",
      donaFoyda: oz ? "" : String(non.tashqariFoyda || ""),
      ing: oz ? Object.fromEntries((non.mahsulotlar || []).map((m) => [m.id, String(m.miqdor ?? "")])) : {},
    });
    yopKartalar({ qoldir: "forma" }); // non kartasi yopiladi, forma ochiq qoladi
    setTahrirId(non.id);
    // Forma yuqorida — avtomatik scroll qilamiz, foydalanuvchi qidirmasligi uchun
    setTimeout(() => scrollRef.current?.scrollToTop?.(true), 50);
  };

  // Forma jonli hisoblari
  const formaQopNarx = royxat.reduce((s, m) => {
    const miq = sonOl(forma.ing[m.id]);
    return miq > 0 ? s + getIngNarx({ id: m.id, miqdor: miq }, mahsulotNarxlari) : s;
  }, 0);
  // Non soni avtomatik: 1 qop xamiri (barcha xomashyo, g) ÷ bitta non xamiri vazni
  const formaMahsulotlar = royxat.map((m) => ({ miqdor: sonOl(forma.ing[m.id]) })).filter((m) => m.miqdor > 0);
  const formaXamir = formaMahsulotlar.reduce((s, m) => s + m.miqdor, 0);
  const formaSon = xamirdanNonSoni(formaMahsulotlar, sonOl(forma.nonVazni));
  const formaDonaFoyda = forma.oz
    ? Math.round((sonOl(forma.narx)) - (formaSon > 0 ? formaQopNarx / formaSon : 0))
    : (sonOl(forma.donaFoyda));

  const saqla = () => {
    if (!forma.nom.trim() || !forma.narx) {
      Alert.alert("Maydonlar to'liq emas", "Non nomi va sotuv narxini kiriting.");
      return;
    }
    // Nom bo'yicha bog'langan ma'lumotlar (xodim stavkalari, optom/qarz savati) aralashib ketmasligi uchun
    // ikki non bir xil nomda bo'lmaydi
    const nomi = forma.nom.trim().toLowerCase();
    if ((nonlar || []).some((n) => n.id !== tahrirId && String(n.nom || "").trim().toLowerCase() === nomi)) {
      Alert.alert("Bunday non bor", "Bu nomdagi non allaqachon qo'shilgan. Boshqa nom kiriting.");
      return;
    }
    const narx = sonOl(forma.narx);
    if (forma.oz && formaSon <= 0) {
      Alert.alert("Non soni hisoblanmadi", "1 qopga ketadigan xomashyo miqdorlarini va bitta non xamiri vaznini (gramm) kiriting.");
      return;
    }
    let yangi;
    if (forma.oz) {
      const mahsulotlar = royxat
        .map((m) => ({ id: m.id, nom: m.nom, ...(m.ikon ? { ikon: m.ikon } : {}), birlik: baseUnit(m.birlik), miqdor: sonOl(forma.ing[m.id]) }))
        .filter((m) => m.miqdor > 0);
      yangi = { nom: forma.nom.trim(), narx, ozIshlab: true, nonVazni: sonOl(forma.nonVazni), nonSoni: formaSon, tashqariFoyda: 0, mahsulotlar };
    } else {
      yangi = { nom: forma.nom.trim(), narx, ozIshlab: false, nonSoni: 0, tashqariFoyda: sonOl(forma.donaFoyda), mahsulotlar: [] };
    }
    if (tahrirId) {
      // Tahrirlash: nomi o'zgargan yoki "tashqaridan"ga o'zgargan bo'lsa ishchilar nonNarxlari/nonTurlari'ni sinxronlaymiz
      const eski = nonlar.find((n) => n.id === tahrirId);
      const eskiNom = eski?.nom;
      const yangiNom = yangi.nom;
      const yangiOz = yangi.ozIshlab;
      setNonlar((prev) => prev.map((n) => (n.id === tahrirId ? { ...n, ...yangi } : n)));
      if (eskiNom && eskiNom !== yangiNom) {
        // ── Ishchilar nonNarxlari/nonTurlari sinxron ──
        setIshchilar((prev) => (prev || []).map((w) => {
          const oldNarxlari = w.nonNarxlari || {};
          if (!(eskiNom in oldNarxlari)) return w;
          const newNarxlari = { ...oldNarxlari };
          const val = newNarxlari[eskiNom];
          delete newNarxlari[eskiNom];
          if (yangiOz) newNarxlari[yangiNom] = val;
          const newTurlari = (w.nonTurlari || [])
            .map((t) => t === eskiNom ? yangiNom : t)
            .filter((t) => yangiOz || t !== yangiNom);
          return { ...w, nonNarxlari: newNarxlari, nonTurlari: newTurlari };
        }));
        // ── Mavjud yozuvlar (optom/qarz savat va brak nonNomi) ham qayta nomlanadi ──
        const savatYangila = (savat) => (savat || []).map((s) => s.nonNomi === eskiNom ? { ...s, nonNomi: yangiNom } : s);
        setOptomlar((prev) => (prev || []).map((o) => ({ ...o, savat: savatYangila(o.savat) })));
        setQarzlar((prev) => (prev || []).map((q) => ({ ...q, savat: savatYangila(q.savat), nonNomi: q.nonNomi === eskiNom ? yangiNom : q.nonNomi })));
        setBraklar((prev) => (prev || []).map((b) => b.nonNomi === eskiNom ? { ...b, nonNomi: yangiNom } : b));
      } else if (eskiNom && !yangiOz) {
        // Tashqaridan'ga aylangan: ishchilardan olib tashlash (boshqalar tegmaydi)
        setIshchilar((prev) => (prev || []).map((w) => {
          if (!(w.nonNarxlari || {})[eskiNom]) return w;
          const newNarxlari = { ...w.nonNarxlari };
          delete newNarxlari[eskiNom];
          const newTurlari = (w.nonTurlari || []).filter((t) => t !== eskiNom);
          return { ...w, nonNarxlari: newNarxlari, nonTurlari: newTurlari };
        }));
      }
    } else {
      setNonlar((prev) => [...prev, { id: Date.now(), ...yangi }]);
    }
    tozala();
  };

  const ochirNon = (id) =>
    Alert.alert("O'chirish", "Bu non turini o'chirasizmi?", [
      { text: "Bekor", style: "cancel" },
      { text: "Ha", style: "destructive", onPress: () => {
        yopKartalar({ qoldir: "forma" });
        // Cascade: ishchilarning nonNarxlari/nonTurlari'dan ham olib tashlanadi
        const eski = nonlar.find((n) => n.id === id);
        const eskiNom = eski?.nom;
        // Tarixdagilar'ga: qaytarilganda ishchilarning shu nondagi qop narxlari ham tiklanadi
        const ishchiNarxlari = {};
        (ishchilar || []).forEach((w) => { if (eskiNom && w.nonNarxlari && eskiNom in w.nonNarxlari) ishchiNarxlari[w.id] = w.nonNarxlari[eskiNom]; });
        ochirArxivga("non", id, { ishchiNarxlari });
        if (eskiNom) {
          setIshchilar((prev) => (prev || []).map((w) => {
            if (!w.nonNarxlari || !(eskiNom in w.nonNarxlari)) return w;
            const newNarxlari = { ...w.nonNarxlari };
            delete newNarxlari[eskiNom];
            const newTurlari = (w.nonTurlari || []).filter((t) => t !== eskiNom);
            return { ...w, nonNarxlari: newNarxlari, nonTurlari: newTurlari };
          }));
        }
        if (tahrirId === id) tozala();
      } },
    ]);

  const aktivIshchi = (ishchilar || []).filter((w) => w.holat === "Aktiv").length;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollBox ref={scrollRef} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <ScreenHeader eyebrow="Assortiment" title="Ishlab chiqarish" subtitle={`${nonlar.length} xil non · ${aktivIshchi} aktiv xodim`} image={require("../../assets/tabicons/ishlab.png")} />

        <View style={styles.segment}>
          <Pressable style={[styles.seg, tab === "assortiment" && styles.segActive]} onPress={() => tabTanla("assortiment")}>
            <Ionicons name="grid-outline" size={15} color={tab === "assortiment" ? C.onAccent : C.sub} />
            <Text style={[styles.segTxt, tab === "assortiment" && styles.segTxtActive]}>Assortiment</Text>
          </Pressable>
          <Pressable style={[styles.seg, tab === "narx" && styles.segActive]} onPress={() => tabTanla("narx")}>
            <Ionicons name="leaf-outline" size={15} color={tab === "narx" ? C.onAccent : C.sub} />
            <Text style={[styles.segTxt, tab === "narx" && styles.segTxtActive]}>Xomashyo</Text>
          </Pressable>
          <Pressable style={[styles.seg, tab === "tannarx" && styles.segActive]} onPress={() => tabTanla("tannarx")}>
            <Ionicons name="calculator-outline" size={15} color={tab === "tannarx" ? C.onAccent : C.sub} />
            <Text style={[styles.segTxt, tab === "tannarx" && styles.segTxtActive]}>Tannarx</Text>
          </Pressable>
        </View>
        <View style={styles.gap14} />

        {tab === "tannarx" ? (
          <TannarxKalk />
        ) : tab === "narx" ? (
          <MahsulotNarxi />
        ) : (
          <>
            {/* INLINE FORMA — ExpandableCard ichida, default yopiq. Tahrirlash holatida avto-ochiladi. */}
            <ExpandableCard
              id="forma"
              style={styles.formCard}
              ochKaliti={tahrirId}
              header={
                <View style={styles.formHead}>
                  <Ionicons name={tahrirId ? "create-outline" : "add-circle-outline"} size={18} color={C.sub} />
                  <Text style={styles.formTitle}>{tahrirId ? "Nonni tahrirlash" : "Yangi non turi qo'shish"}</Text>
                </View>
              }
            >
              <Text style={styles.inputLabel}>Non nomi *</Text>
              <TextInput value={forma.nom} onChangeText={(v) => yangila("nom", v)} placeholder="Masalan: Kulcha" placeholderTextColor={C.muted} style={styles.input} />

              <Text style={styles.inputLabel}>Sotuv narxi (so'm) *</Text>
              <TextInput value={forma.narx} onChangeText={(v) => yangila("narx", v)} placeholder="0" placeholderTextColor={C.muted} keyboardType="numeric" style={styles.input} />

              <Text style={styles.inputLabel}>Non turi</Text>
              <View style={styles.turRow}>
                <Pressable style={[styles.turBtn, forma.oz && styles.turBtnActive]} onPress={() => yangila("oz", true)}>
                  <Text style={[styles.turTxt, forma.oz && styles.turTxtActive]}>O'zimizniki</Text>
                </Pressable>
                <Pressable style={[styles.turBtn, !forma.oz && styles.turBtnActive]} onPress={() => yangila("oz", false)}>
                  <Text style={[styles.turTxt, !forma.oz && styles.turTxtActive]}>Tashqaridan</Text>
                </Pressable>
              </View>

              {forma.oz ? (
                <>
                  <Text style={styles.inputLabel}>1 qopga ketadigan xomashyo</Text>
                  {royxat.map((m) => {
                    const unit = baseUnit(m.birlik);
                    return (
                      <View key={m.id}>
                        <View style={styles.ingEditRow}>
                          <View style={styles.ingEditNomQ}>
                            {xIkon("forma", m)}
                            <Text style={styles.ingEditNom} numberOfLines={1}>{m.nom}</Text>
                          </View>
                          <TextInput value={forma.ing[m.id] ?? ""} onChangeText={(v) => yangilaIng(m.id, v)} placeholder="0" placeholderTextColor={C.muted} keyboardType="numeric" style={styles.ingInput} />
                          <Text style={styles.ingUnit}>{unit}</Text>
                        </View>
                        {xTanlov("forma", m)}
                      </View>
                    );
                  })}

                  <Text style={styles.inputLabel}>Bitta non xamiri vazni (gramm) *</Text>
                  <TextInput accessibilityLabel="Bitta non xamiri vazni" value={forma.nonVazni} onChangeText={(v) => yangila("nonVazni", v)} placeholder="Masalan: 750" placeholderTextColor={C.muted} keyboardType="numeric" style={styles.input} />
                  <View style={styles.xamirBox}>
                    <Text style={styles.xamirTxt}>1 qop xamiri: <Text style={styles.xamirQalin}>{kgMatn(formaXamir)}</Text>{sonOl(forma.nonVazni) > 0 ? ` ÷ ${formatSom(sonOl(forma.nonVazni))} g` : ""}</Text>
                    <Text style={styles.xamirNatija}>= {formaSon} ta non</Text>
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.inputLabel}>Donadan qoladigan foyda (so'm) *</Text>
                  <TextInput value={forma.donaFoyda} onChangeText={(v) => yangila("donaFoyda", v)} placeholder="0" placeholderTextColor={C.muted} keyboardType="numeric" style={styles.input} />
                </>
              )}

              <View style={styles.foydaBox}>
                {forma.oz && (
                  <View style={styles.foydaLine}><Text style={styles.foydaLbl}>1 qopga xomashyo</Text><Text style={styles.foydaSub}>{formatSom(formaQopNarx)} so'm</Text></View>
                )}
                <View style={styles.foydaLine}><Text style={styles.foydaLblBig}>Dona foydasi</Text><Text style={styles.foydaVal}>{formatSom(formaDonaFoyda)} so'm</Text></View>
              </View>

              <View style={styles.formActions}>
                <Btn onPress={saqla}>{tahrirId ? "Yangilash" : "Saqlash"}</Btn>
                {tahrirId && <Btn secondary onPress={tozala}>Bekor</Btn>}
              </View>
            </ExpandableCard>

            {/* RO'YXAT */}
            <View style={styles.secHead}>
              <Ionicons name="grid-outline" size={13} color={C.sub} />
              <Text style={styles.secTitle}>NON TURLARI</Text>
              <Text style={styles.secCount}>{nonlar.length} ta</Text>
            </View>
            {nonlar.length > 0 && <Text style={styles.ikonHint}>Xomashyo ikonkasini o'zgartirish uchun uning ustiga bosing</Text>}

            {nonlar.length === 0 ? (
              <Card><Text style={styles.muted}>Hali non turi qo'shilmagan</Text></Card>
            ) : (
              nonlar.map((non) => {
                const oz = non.ozIshlab !== false;
                const foyda = donaFoydasi(non, mahsulotNarxlari);
                return (
                  <ExpandableCard
                    key={non.id}
                    style={styles.item}
                    header={
                      <View style={styles.nonBosh}>
                        <View style={[styles.nonIkon, !oz && styles.nonIkonTashqi]}>
                          <NonIkon non={non} size={28} color={oz ? C.accent : C.sub} />
                        </View>
                        <View style={styles.flex1}>
                          <Text style={styles.nonNom} numberOfLines={1}>{non.nom}</Text>
                          <View style={styles.nonMeta}>
                            <View style={[styles.chip, oz ? styles.chipOz : styles.chipTashqi]}>
                              <Text style={[styles.chipTxt, { color: oz ? C.accent : C.sub }]}>{oz ? "O'zimizniki" : "Tashqaridan"}</Text>
                            </View>
                            {oz && parseFloat(non.nonSoni) > 0 && <Text style={styles.nonMetaTxt}>qopdan {non.nonSoni} dona</Text>}
                          </View>
                        </View>
                        <View style={styles.nonNarxQ}>
                          <Text style={styles.nonNarx}>{formatSom(non.narx)}</Text>
                          <Text style={[styles.nonFoyda, foyda < 0 && { color: C.red }]}>{foyda >= 0 ? "+" : ""}{formatSom(foyda)} foyda</Text>
                        </View>
                      </View>
                    }
                  >
                    <Row label="Sotuv narxi" value={`${formatSom(non.narx)} so'm`} bold />
                    {oz && <Row label="1 qopdan (avtomatik)" value={`${non.nonSoni} dona`} />}
                    {oz && nonVazniOl(non) > 0 && <Row label="Bitta non xamiri" value={`${formatSom(nonVazniOl(non))} g`} />}
                    <Row label="Dona foydasi" value={`${formatSom(foyda)} so'm`} valueColor={C.accent} bold last={!oz} />
                    {oz && (non.mahsulotlar || []).length > 0 && (
                      <View style={styles.ingWrap}>
                        <Text style={styles.ingHead}>1 QOPGA XOMASHYO ({non.mahsulotlar.length})</Text>
                        {non.mahsulotlar.map((m) => (
                          <View key={m.id}>
                            <View style={styles.ingRow}>
                              <View style={styles.ingNomQ}>
                                {xIkon(non.id, m, 15)}
                                <Text style={styles.ingNom} numberOfLines={1}>{m.nom}</Text>
                              </View>
                              <Text style={styles.ingMiqdor}>{m.miqdor} {m.birlik}</Text>
                              <Text style={styles.ingNarx}>{formatSom(getIngNarx(m, mahsulotNarxlari))} so'm</Text>
                            </View>
                            {xTanlov(non.id, m)}
                          </View>
                        ))}
                        <View style={styles.ingTotalRow}>
                          <Text style={styles.ingTotalLbl}>1 qopga jami</Text>
                          <Text style={styles.ingTotalV}>{formatSom(getQopTannarx(non, mahsulotNarxlari))} so'm</Text>
                        </View>
                      </View>
                    )}
                    <View style={styles.bodyActions}>
                      <Pressable accessibilityLabel="Tahrirlash" onPress={() => tahrirla(non)} hitSlop={8} style={styles.actBtn}>
                        <Ionicons name="create-outline" size={16} color={C.accent} />
                        <Text style={[styles.actTxt, { color: C.accent }]}> Tahrirlash</Text>
                      </Pressable>
                      <Pressable accessibilityLabel="O'chirish" onPress={() => ochirNon(non.id)} hitSlop={8} style={styles.actBtn}>
                        <Ionicons name="trash-outline" size={16} color={C.red} />
                        <Text style={[styles.actTxt, { color: C.red }]}> O'chirish</Text>
                      </Pressable>
                    </View>
                  </ExpandableCard>
                );
              })
            )}
          </>
        )}
      </ScrollBox>
    </SafeAreaView>
  );
}

function Row({ label, value, valueColor = C.text, bold = false, last = false }) {
  return (
    <View style={[styles.row, last && styles.rowLast]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: valueColor, fontWeight: bold ? "800" : "600" }]}>{value}</Text>
    </View>
  );
}

const styles = temaStil(() => StyleSheet.create({
  safe:      { flex: 1, backgroundColor: C.bg },
  scroll:    { padding: S[5], paddingBottom: S[8] },
  gap14:     { height: S[4] },
  segment:   { flexDirection: "row", gap: S[1], backgroundColor: C.panel, borderRadius: R.lg, padding: 5 },
  seg:       { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12, borderRadius: R.md },
  segActive: { backgroundColor: C.accent },
  segTxt:    { fontSize: T.sm, fontWeight: "700", color: C.sub },
  segTxtActive: { color: C.onAccent },

  // Inline forma
  formCard:  { marginBottom: S[5] },
  formHead:  { flexDirection: "row", alignItems: "center", gap: S[2], marginBottom: S[3] },
  formTitle: { fontSize: T.md, fontWeight: "800", color: C.text },
  inputLabel:{ fontSize: T.xs, color: C.sub, fontWeight: "600", marginBottom: 6, marginTop: S[2], letterSpacing: 0.3 },
  input:     { borderWidth: 1, borderColor: C.border, borderRadius: R.md, paddingVertical: 12, paddingHorizontal: 14, fontSize: T.md, color: C.text, backgroundColor: C.surface },
  turRow:    { flexDirection: "row", gap: S[2] },
  turBtn:    { flex: 1, alignItems: "center", paddingVertical: 12, borderRadius: R.md, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface },
  turBtnActive:{ backgroundColor: C.accent, borderColor: C.accent },
  turTxt:    { fontSize: T.sm, fontWeight: "700", color: C.sub },
  turTxtActive:{ color: C.onAccent },
  ingEditRow:{ flexDirection: "row", alignItems: "center", gap: S[2], marginBottom: S[2] },
  ingEditNomQ:{ flex: 1, flexDirection: "row", alignItems: "center", gap: 6 },
  ingEditNom:{ flex: 1, fontSize: T.sm, color: C.text },
  ingInput:  { width: 90, borderWidth: 1, borderColor: C.border, borderRadius: R.sm, paddingVertical: 8, paddingHorizontal: 10, fontSize: T.sm, color: C.text, backgroundColor: C.surface, textAlign: "right" },
  ingUnit:   { width: 28, fontSize: T.xs, color: C.muted },
  xamirBox:  { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: S[2], backgroundColor: C.panel, borderRadius: R.md, paddingVertical: S[2] + 2, paddingHorizontal: S[3], marginTop: S[2] },
  xamirTxt:  { flex: 1, fontSize: T.xs, color: C.sub, fontWeight: "600" },
  xamirQalin:{ fontWeight: "800", color: C.text },
  xamirNatija:{ fontSize: T.md, fontWeight: "800", color: C.accent },
  foydaBox:  { backgroundColor: C.accent + "0D", borderWidth: 1, borderColor: C.accent + "2E", borderRadius: R.md, paddingVertical: S[3], paddingHorizontal: S[3], marginTop: S[3] },
  foydaLine: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  foydaLbl:  { fontSize: T.sm, color: C.sub },
  foydaSub:  { fontSize: T.sm, color: C.text, fontWeight: "700" },
  foydaLblBig:{ fontSize: T.md, color: C.text, fontWeight: "700", marginTop: 2 },
  foydaVal:  { fontSize: T.lg, color: C.accent, fontWeight: "800", marginTop: 2 },
  formActions:{ marginTop: S[4], gap: S[2] },

  // Section
  secHead:   { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: S[3] },
  secTitle:  { fontSize: T.xs, color: C.sub, fontWeight: "700", letterSpacing: 1, flex: 1 },
  secCount:  { fontSize: T.sm, color: C.sub, fontWeight: "700" },
  ikonHint:  { fontSize: 11, color: C.muted, marginTop: -S[2], marginBottom: S[3] },

  // Ro'yxat
  item:      { marginBottom: S[3] },
  flex1:     { flex: 1 },
  // Non kartasi sarlavhasi — ikonka, nom, belgi, narx va dona foydasi
  nonBosh:   { flexDirection: "row", alignItems: "center", gap: S[3] },
  nonIkon:   { width: 46, height: 46, borderRadius: R.md, alignItems: "center", justifyContent: "center", backgroundColor: C.accent + "16", borderWidth: 1, borderColor: C.accent + "26" },
  nonIkonTashqi: { backgroundColor: C.panel, borderColor: C.borderSoft },
  nonNom:    { fontSize: T.md + 1, fontWeight: "800", color: C.text, letterSpacing: -0.2 },
  nonMeta:   { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4, flexWrap: "wrap" },
  nonMetaTxt:{ fontSize: 11, color: C.muted, fontWeight: "600" },
  nonNarxQ:  { alignItems: "flex-end", marginLeft: S[1] },
  nonNarx:   { fontSize: T.md + 1, fontWeight: "800", color: C.text },
  nonFoyda:  { fontSize: 11, fontWeight: "700", color: C.accent, marginTop: 2 },
  chip:      { alignSelf: "flex-start", paddingVertical: 2, paddingHorizontal: 8, borderRadius: R.pill },
  chipOz:    { backgroundColor: C.accent + "16" },
  chipTashqi:{ backgroundColor: C.panel },
  chipTxt:   { fontSize: 10, fontWeight: "800", letterSpacing: 0.2 },
  row:       { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: S[2] },
  rowLast:   { marginBottom: 0 },
  label:     { fontSize: T.sm, color: C.sub },
  value:     { fontSize: T.sm },
  muted:     { fontSize: T.sm, color: C.muted },
  bodyActions:{ flexDirection: "row", justifyContent: "flex-end", gap: S[4], marginTop: S[3], borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.borderSoft, paddingTop: S[3] },
  actBtn:    { flexDirection: "row", alignItems: "center" },
  actTxt:    { fontSize: T.sm, fontWeight: "700" },

  ingWrap:   { marginTop: S[3], borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.borderSoft, paddingTop: S[3] },
  ingHead:   { fontSize: 10, color: C.muted, fontWeight: "700", letterSpacing: 0.8, marginBottom: S[2] },
  ingRow:    { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  ingNomQ:   { flex: 1, flexDirection: "row", alignItems: "center", gap: 6 },
  ingNom:    { flex: 1, fontSize: T.sm, color: C.text },
  ingMiqdor: { fontSize: T.xs, color: C.muted, width: 72, textAlign: "right" },
  ingNarx:   { fontSize: T.xs, color: C.sub, fontWeight: "700", width: 92, marginLeft: 6, textAlign: "right" },
  ingTotalRow:{ flexDirection: "row", justifyContent: "space-between", marginTop: 4, paddingTop: 6, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.borderSoft },
  ingTotalLbl:{ fontSize: T.xs, color: C.sub, fontWeight: "700" },
  ingTotalV: { fontSize: T.xs, color: C.text, fontWeight: "800" },
}));
