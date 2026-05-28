// "Markaz" ekrani — kunlik ko'rsatkichlar + Qarz / Optom / Karta to'lovlari.
import { useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useApp } from "../../src/store/AppData";
import { Card } from "../../src/components/Card";
import { Btn } from "../../src/components/Btn";
import { Modal } from "../../src/components/Modal";
import { BrandHeader } from "../../src/components/BrandHeader";
import { ExpandableCard } from "../../src/components/ExpandableCard";
import { KunlikQopModal } from "../../src/components/KunlikQopModal";
import { HisobotModal } from "../../src/components/HisobotModal";
import { C, T, S, R } from "../../src/theme";
import { hisoblaKunlik, formatSom, qarzJami, optomJami, kartaJami, kartaHisob, donaFoyda } from "../../src/logic/hisob";

const BOSH_FORMA = { ism: "", summa: "", izoh: "", sana: "", savat: {}, donaChegirma: "", chegirma: "" };
const localSana = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export default function Markaz() {
  const {
    nonlar, ishchilar, qarzlar, setQarzlar, optomlar, setOptomlar, kartalar, setKartalar,
    ozIshlabQoplar, tashqariSonlar, sotilmaganNon, mahsulotNarxlari,
    hisobotlarTarixi, setHisobotlarTarixi, braklar, setBraklar,
  } = useApp();

  const ochirHisobot = (id) =>
    Alert.alert("O'chirish", "Shu sanadagi hisobotni o'chirasizmi?", [
      { text: "Bekor", style: "cancel" },
      { text: "Ha", style: "destructive", onPress: () => setHisobotlarTarixi((p) => p.filter((h) => h.id !== id)) },
    ]);

  const stats = useMemo(
    () => hisoblaKunlik({ nonlar, ishchilar, ozIshlabQoplar, tashqariSonlar, sotilmaganNon, optomlar, qarzlar, mahsulotNarxlari, braklar }),
    [nonlar, ishchilar, ozIshlabQoplar, tashqariSonlar, sotilmaganNon, optomlar, qarzlar, mahsulotNarxlari, braklar]
  );

  const qarz = useMemo(() => qarzJami(qarzlar), [qarzlar]);
  const optom = useMemo(() => optomJami(optomlar), [optomlar]);
  const karta = useMemo(() => kartaJami(kartalar), [kartalar]);

  const [modalTur, setModalTur] = useState(null);
  const [forma, setForma] = useState(BOSH_FORMA);
  const [qopOchiq, setQopOchiq] = useState(false);
  const [hisobotOchiq, setHisobotOchiq] = useState(false);
  const [brakModal, setBrakModal] = useState(false);
  const [brakForma, setBrakForma] = useState({ ishchiId: null, nonNomi: "", soni: "" });

  const qopIshchilar = (ishchilar || []).filter((w) => w.haqTuri === "qop" && w.holat === "Aktiv");
  const brakIshchi = qopIshchilar.find((w) => w.id === brakForma.ishchiId);
  const brakSumma = (parseFloat((brakIshchi?.nonNarxlari || {})[brakForma.nonNomi]) || 0) * (parseFloat(brakForma.soni) || 0);
  const ochBrak = () => { setBrakForma({ ishchiId: null, nonNomi: "", soni: "" }); setBrakModal(true); };
  const saqlaBrak = () => {
    if (!brakIshchi || !brakForma.nonNomi || !(parseFloat(brakForma.soni) > 0)) {
      Alert.alert("To'liq emas", "Ishchi, non turi va brak sonini kiriting.");
      return;
    }
    setBraklar((prev) => [...prev, {
      id: Date.now(), sana: localSana(), vaqt: Date.now(),
      ishchiId: brakIshchi.id, ishchiIsm: brakIshchi.ism, nonNomi: brakForma.nonNomi,
      soni: parseFloat(brakForma.soni), summa: brakSumma,
    }]);
    setBrakModal(false);
  };
  const ochirBrak = (id) =>
    Alert.alert("O'chirish", "Bu brakni o'chirasizmi?", [
      { text: "Bekor", style: "cancel" },
      { text: "Ha", style: "destructive", onPress: () => setBraklar((p) => p.filter((b) => b.id !== id)) },
    ]);

  const ochModal = (tur) => { setForma({ ...BOSH_FORMA, sana: localSana() }); setModalTur(tur); };
  const yopModal = () => setModalTur(null);
  const yangila = (k, v) => setForma((p) => ({ ...p, [k]: v }));
  const yangilaSavat = (id, v) => setForma((p) => ({ ...p, savat: { ...p.savat, [id]: v } }));

  const kartaModal = modalTur === "karta";
  const qarzModal = modalTur === "qarz";

  // Karta modali uchun jonli hisob
  const preview = useMemo(
    () => (kartaModal ? kartaHisob(parseFloat(forma.summa) || 0, nonlar, mahsulotNarxlari) : null),
    [kartaModal, forma.summa, nonlar, mahsulotNarxlari]
  );

  // Qarz/Optom savati jonli hisobi (non × soni → summa, foyda, chegirma)
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
    const dch = qarzModal ? 0 : (parseFloat(forma.donaChegirma) || 0);
    const ch = parseFloat(forma.chegirma) || 0;
    const jamiChegirma = dch * dona + ch;
    return { summa, dona, foyda, items, jamiChegirma, yakSumma: Math.max(0, summa - jamiChegirma), yakFoyda: foyda - jamiChegirma };
  }, [forma.savat, forma.donaChegirma, forma.chegirma, qarzModal, nonlar, mahsulotNarxlari]);

  const saqla = () => {
    const sana = forma.sana || localSana();
    if (kartaModal) {
      const summa = parseFloat(forma.summa) || 0;
      if (!summa) { Alert.alert("Maydon to'liq emas", "Iltimos, summani kiriting."); return; }
      const pv = kartaHisob(summa, nonlar, mahsulotNarxlari);
      setKartalar((prev) => [...prev, { id: Date.now(), summa, izoh: forma.izoh.trim(), sana, vaqt: Date.now(), dona: pv.dona, sofFoyda: pv.sofFoyda }]);
      yopModal();
      return;
    }
    if (!forma.ism.trim()) { Alert.alert("Ism kiritilmagan", "Iltimos, oluvchi ismini kiriting."); return; }
    if (savatHisob.items.length === 0) { Alert.alert("Non tanlanmagan", "Kamida bitta non turidan soni kiriting."); return; }
    if (modalTur === "qarz") {
      setQarzlar((prev) => [...prev, {
        id: Date.now(), ism: forma.ism.trim(), sana, vaqt: Date.now(),
        savat: savatHisob.items, summa: savatHisob.yakSumma, chegirma: savatHisob.jamiChegirma,
        izoh: forma.izoh.trim(), tolangan: false, tolanganVaqt: null,
      }]);
    } else {
      setOptomlar((prev) => [...prev, {
        id: Date.now(), ism: forma.ism.trim(), sana, vaqt: Date.now(),
        savat: savatHisob.items, summa: savatHisob.yakSumma, chegirma: savatHisob.jamiChegirma,
        sofFoyda: savatHisob.yakFoyda, izoh: forma.izoh.trim(),
      }]);
    }
    yopModal();
  };

  const tolaQarz = (id) => setQarzlar((prev) => prev.map((q) => q.id === id ? { ...q, tolangan: true, tolanganVaqt: Date.now() } : q));
  const ochirQarz = (id) => setQarzlar((prev) => prev.filter((q) => q.id !== id));
  const ochirOptom = (id) => setOptomlar((prev) => prev.filter((o) => o.id !== id));
  const ochirKarta = (id) => setKartalar((prev) => prev.filter((k) => k.id !== id));

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <BrandHeader />

        <View style={styles.statsRow}>
          <StatTile label="Bugungi sof foyda" unit="so'm" value={formatSom(stats.sofFoyda)} color={stats.sofFoyda >= 0 ? C.green : C.red} icon="trending-up-outline" />
          <StatTile label="Sotilgan non" unit="dona" value={String(stats.sotilganNon)} color={C.text} icon="cube-outline" />
          <StatTile label="Kunlik qop" unit="qop" value={String(stats.jamiQop)} color={C.accent} icon="layers-outline" />
        </View>

        <Card accent style={styles.block}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="calculator-outline" size={18} color={C.sub} />
            <Text style={styles.cardTitle}>Kunlik qop hisobi</Text>
          </View>
          <Text style={styles.muted}>{nonlar.length} xil non · {stats.jamiNon} dona ishlab chiqarildi</Text>
          <View style={styles.gap10} />
          <Btn onPress={() => setQopOchiq(true)} icon="create-outline">Ma'lumot kiritish</Btn>
        </Card>

        {/* KUNLIK HISOBOTLAR TARIXI (30 kun) */}
        <SectionHead icon="calendar-outline" nom="KUNLIK HISOBOTLAR (30 kun)" sum={`${(hisobotlarTarixi || []).length} ta`} color={C.accent} />
        {(hisobotlarTarixi || []).length === 0 ? (
          <Text style={styles.bosh}>Hali hisobot yo'q</Text>
        ) : (
          [...hisobotlarTarixi].slice(0, 30).map((h) => (
            <ExpandableCard
              key={h.id}
              style={styles.item}
              header={
                <View style={styles.mHead}>
                  <Text style={[styles.itemIsm, styles.flex1]} numberOfLines={1}>{h.sana}</Text>
                  <Text style={[styles.itemSumma, { color: (h.sofFoyda || 0) >= 0 ? C.green : C.red }]} numberOfLines={1}>{formatSom(h.sofFoyda)} so'm</Text>
                </View>
              }
            >
              <View style={styles.histWrap}>
                {(h.nonlarSnapshot || nonlar).map((n) => {
                  const oz = n.ozIshlab !== false;
                  const q = oz ? (parseInt((h.ozIshlabQoplar || {})[n.id]) || 0) : (parseInt((h.tashqariSonlar || {})[n.id]) || 0);
                  if (q <= 0) return null;
                  return (
                    <View key={n.id} style={styles.histRow}>
                      <Text style={styles.histNom} numberOfLines={1}>{n.nom}</Text>
                      <Text style={styles.histVal}>{q} {oz ? "qop" : "dona"}</Text>
                    </View>
                  );
                })}
                <View style={styles.histDiv} />
                <View style={styles.histRow}><Text style={styles.histNom}>Daromad</Text><Text style={styles.histVal}>{formatSom(h.daromad)} so'm</Text></View>
                <View style={styles.histRow}><Text style={styles.histNom}>Xomashyo</Text><Text style={styles.histVal}>{formatSom(h.xomashyo)} so'm</Text></View>
                <View style={styles.histRow}><Text style={styles.histNom}>Ishchi haqi</Text><Text style={styles.histVal}>{formatSom(h.ishchiHaq)} so'm</Text></View>
                <View style={styles.histRow}><Text style={styles.histNom}>Ishlab / sotilgan</Text><Text style={styles.histVal}>{h.jamiNon || 0} / {h.sotilganNon || 0} dona</Text></View>
                <View style={styles.histRow}><Text style={styles.histNomB}>Sof foyda</Text><Text style={styles.histValB}>{formatSom(h.sofFoyda)} so'm</Text></View>
              </View>
              <View style={styles.actions}>
                <Pressable accessibilityLabel="O'chirish" onPress={() => ochirHisobot(h.id)} hitSlop={6} style={styles.actBtn}>
                  <Ionicons name="trash-outline" size={16} color={C.red} />
                  <Text style={[styles.actTxt, { color: C.red }]}> O'chirish</Text>
                </Pressable>
              </View>
            </ExpandableCard>
          ))
        )}

        {/* QARZ */}
        <SectionHead icon="pricetag-outline" nom="QARZLAR" sum={`${formatSom(qarz.summa)} so'm · ${qarz.soni} ta`} color={C.red} style={{ marginTop: S[6] }} />
        <Btn color={C.accent} onPress={() => ochModal("qarz")} icon="add-outline">Qarz qo'shish</Btn>
        <View style={styles.gap10} />
        {(qarzlar || []).length === 0 ? <Text style={styles.bosh}>Hali qarz yo'q</Text> : (
          [...qarzlar].reverse().map((q) => (
            <ExpandableCard
              key={q.id}
              style={styles.item}
              header={
                <View style={styles.mHead}>
                  <Text style={[styles.itemIsm, styles.flex1]} numberOfLines={1}>{q.ism}{q.tolangan ? "  · to'landi" : ""}</Text>
                  <Text style={[styles.itemSumma, { color: q.tolangan ? C.muted : C.red }]} numberOfLines={1}>{formatSom(q.summa)} so'm</Text>
                </View>
              }
            >
              {(q.savat || []).map((s, i) => (
                <View key={i} style={styles.savatLine}>
                  <Text style={styles.savatLNom} numberOfLines={1}>{s.nonNomi}</Text>
                  <Text style={styles.savatLV}>{s.soni} dona × {formatSom(s.narx)}</Text>
                </View>
              ))}
              {q.chegirma > 0 ? <Text style={styles.itemIzoh}>Chegirma: {formatSom(q.chegirma)} so'm</Text> : null}
              {q.izoh ? <Text style={styles.itemIzoh}>{q.izoh}</Text> : null}
              <Text style={styles.itemSana}>{q.sana}</Text>
              <View style={styles.actions}>
                {!q.tolangan && (
                  <Pressable onPress={() => tolaQarz(q.id)} hitSlop={6} style={styles.actBtn}>
                    <Ionicons name="checkmark" size={15} color={C.accent} />
                    <Text style={[styles.actTxt, { color: C.accent }]}> To'landi</Text>
                  </Pressable>
                )}
                <Pressable onPress={() => ochirQarz(q.id)} hitSlop={6} style={styles.actBtn}>
                  <Ionicons name="trash-outline" size={16} color={C.red} />
                  <Text style={[styles.actTxt, { color: C.red }]}> O'chirish</Text>
                </Pressable>
              </View>
            </ExpandableCard>
          ))
        )}

        {/* OPTOM */}
        <SectionHead icon="cube-outline" nom="OPTOM SAVDOLAR" sum={`${formatSom(optom.summa)} so'm · ${optom.soni} ta`} color={C.blue} style={{ marginTop: S[6] }} />
        <Btn color={C.accent} onPress={() => ochModal("optom")} icon="add-outline">Xarid qo'shish</Btn>
        <View style={styles.gap10} />
        {(optomlar || []).length === 0 ? <Text style={styles.bosh}>Hali optom savdo yo'q</Text> : (
          [...optomlar].reverse().map((o) => (
            <ExpandableCard
              key={o.id}
              style={styles.item}
              header={
                <View style={styles.mHead}>
                  <Text style={[styles.itemIsm, styles.flex1]} numberOfLines={1}>{o.ism}</Text>
                  <Text style={[styles.itemSumma, { color: C.blue }]} numberOfLines={1}>{formatSom(o.summa)} so'm</Text>
                </View>
              }
            >
              {(o.savat || []).map((s, i) => (
                <View key={i} style={styles.savatLine}>
                  <Text style={styles.savatLNom} numberOfLines={1}>{s.nonNomi}</Text>
                  <Text style={styles.savatLV}>{s.soni} dona × {formatSom(s.narx)}</Text>
                </View>
              ))}
              {o.chegirma > 0 ? <Text style={styles.itemIzoh}>Chegirma: {formatSom(o.chegirma)} so'm</Text> : null}
              <Text style={styles.itemIzoh}>Sof foyda: {formatSom(o.sofFoyda || 0)} so'm</Text>
              {o.izoh ? <Text style={styles.itemIzoh}>{o.izoh}</Text> : null}
              <Text style={styles.itemSana}>{o.sana}</Text>
              <View style={styles.actions}>
                <Pressable onPress={() => ochirOptom(o.id)} hitSlop={6} style={styles.actBtn}>
                  <Ionicons name="trash-outline" size={16} color={C.red} />
                  <Text style={[styles.actTxt, { color: C.red }]}> O'chirish</Text>
                </Pressable>
              </View>
            </ExpandableCard>
          ))
        )}

        {/* KARTA */}
        <SectionHead icon="card-outline" nom="KARTA TO'LOVLARI" sum={`${formatSom(karta.summa)} so'm · ${karta.soni} ta`} color={C.green} style={{ marginTop: S[6] }} />
        <Btn color={C.accent} onPress={() => ochModal("karta")} icon="card-outline">Karta to'lovi</Btn>
        <View style={styles.gap10} />
        {(kartalar || []).length === 0 ? <Text style={styles.bosh}>Hali karta to'lovi yo'q</Text> : (
          [...kartalar].reverse().map((k) => (
            <ExpandableCard
              key={k.id}
              style={styles.item}
              header={
                <View style={styles.mHead}>
                  <Text style={[styles.itemIsm, styles.flex1]} numberOfLines={1}>{k.izoh || "Karta to'lovi"}</Text>
                  <Text style={[styles.itemSumma, { color: C.green }]} numberOfLines={1}>{formatSom(k.summa)} so'm</Text>
                </View>
              }
            >
              <Text style={styles.itemIzoh}>≈ {k.dona} dona non · sof foyda {formatSom(k.sofFoyda)} so'm</Text>
              <Text style={styles.itemSana}>{k.sana}</Text>
              <View style={styles.actions}>
                <Pressable onPress={() => ochirKarta(k.id)} hitSlop={6} style={styles.actBtn}>
                  <Ionicons name="trash-outline" size={16} color={C.red} />
                  <Text style={[styles.actTxt, { color: C.red }]}> O'chirish</Text>
                </Pressable>
              </View>
            </ExpandableCard>
          ))
        )}

        {/* BRAK */}
        <SectionHead icon="alert-circle-outline" nom="BRAK" sum={`${(braklar || []).length} ta`} color={C.red} style={{ marginTop: S[6] }} />
        <Btn color={C.accent} onPress={ochBrak} icon="add-outline">Brak qo'shish</Btn>
        <View style={styles.gap10} />
        {(braklar || []).length === 0 ? <Text style={styles.bosh}>Hali brak yo'q</Text> : (
          [...braklar].reverse().map((b) => (
            <ExpandableCard
              key={b.id}
              style={styles.item}
              header={
                <View style={styles.mHead}>
                  <Text style={[styles.itemIsm, styles.flex1]} numberOfLines={1}>{b.ishchiIsm}</Text>
                  <Text style={[styles.itemSumma, { color: C.red }]} numberOfLines={1}>− {formatSom(b.summa)} so'm</Text>
                </View>
              }
            >
              <Text style={styles.itemIzoh}>{b.nonNomi} · {b.soni} qop brak</Text>
              <Text style={styles.itemSana}>{b.sana}</Text>
              <View style={styles.actions}>
                <Pressable onPress={() => ochirBrak(b.id)} hitSlop={6} style={styles.actBtn}>
                  <Ionicons name="trash-outline" size={16} color={C.red} />
                  <Text style={[styles.actTxt, { color: C.red }]}> O'chirish</Text>
                </Pressable>
              </View>
            </ExpandableCard>
          ))
        )}
      </ScrollView>

      {/* Brak modali */}
      <Modal modalVisible={brakModal} onClose={() => setBrakModal(false)}>
        <View style={styles.modalHead}>
          <Ionicons name="alert-circle-outline" size={20} color={C.sub} />
          <Text style={styles.modalTitle}>Brak qo'shish</Text>
        </View>
        <ScrollView style={styles.formScroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={styles.inputLabel}>Ishchi (qopdan haq oladigan)</Text>
          {qopIshchilar.length === 0 ? (
            <Text style={styles.muted}>Qopdan haq oladigan aktiv ishchi yo'q.</Text>
          ) : (
            qopIshchilar.map((w) => (
              <Pressable key={w.id} onPress={() => setBrakForma((p) => ({ ...p, ishchiId: w.id, nonNomi: "" }))} style={[styles.pickRow, brakForma.ishchiId === w.id && styles.pickRowActive]}>
                <Ionicons name={brakForma.ishchiId === w.id ? "radio-button-on-outline" : "ellipse-outline"} size={16} color={brakForma.ishchiId === w.id ? C.accent : C.muted} />
                <Text style={[styles.pickTxt, brakForma.ishchiId === w.id && styles.pickTxtActive]}>{w.ism}</Text>
              </Pressable>
            ))
          )}

          {brakIshchi && (
            <>
              <Text style={styles.inputLabel}>Non turi</Text>
              {(brakIshchi.nonTurlari || []).map((nom) => (
                <Pressable key={nom} onPress={() => setBrakForma((p) => ({ ...p, nonNomi: nom }))} style={[styles.pickRow, brakForma.nonNomi === nom && styles.pickRowActive]}>
                  <Ionicons name={brakForma.nonNomi === nom ? "radio-button-on-outline" : "ellipse-outline"} size={16} color={brakForma.nonNomi === nom ? C.accent : C.muted} />
                  <Text style={[styles.pickTxt, brakForma.nonNomi === nom && styles.pickTxtActive]}>{nom} · {formatSom((brakIshchi.nonNarxlari || {})[nom])} so'm/qop</Text>
                </Pressable>
              ))}

              <Text style={styles.inputLabel}>Nechta qop brak</Text>
              <TextInput value={brakForma.soni} onChangeText={(v) => setBrakForma((p) => ({ ...p, soni: v }))} placeholder="0" placeholderTextColor={C.muted} keyboardType="numeric" style={styles.input} />

              {brakSumma > 0 && (
                <View style={styles.preview}>
                  <View style={styles.previewRow}><Text style={styles.previewLabel}>Haqdan ayriladi</Text><Text style={[styles.previewVal, { color: C.red }]}>− {formatSom(brakSumma)} so'm</Text></View>
                </View>
              )}
            </>
          )}
        </ScrollView>
        <View style={styles.gap12} />
        <View style={styles.modalRow}>
          <View style={styles.flex1}><Btn secondary onPress={() => setBrakModal(false)}>Bekor</Btn></View>
          <View style={styles.flex1}><Btn color={C.accent} onPress={saqlaBrak}>Saqlash</Btn></View>
        </View>
      </Modal>

      {/* Kunlik qop hisobi modali → Tasdiqlashda yakuniy hisobot ochiladi */}
      <KunlikQopModal
        visible={qopOchiq}
        onClose={() => setQopOchiq(false)}
        onTasdiq={() => { setQopOchiq(false); setHisobotOchiq(true); }}
      />
      {/* Hisobot yopilgach Karta bo'limi bo'shaydi (kunlik tasdiqdan keyin yangilanadi) */}
      <HisobotModal visible={hisobotOchiq} onClose={() => { setHisobotOchiq(false); setKartalar([]); }} />

      {/* Universal modal: Qarz / Optom / Karta */}
      <Modal modalVisible={modalTur !== null} onClose={yopModal}>
        <View style={styles.modalHead}>
          <Ionicons name={qarzModal ? "pricetag-outline" : kartaModal ? "card-outline" : "cube-outline"} size={20} color={C.sub} />
          <Text style={styles.modalTitle}>
            {qarzModal ? "Yangi qarz" : kartaModal ? "Karta to'lovi" : "Yangi optom savdo"}
          </Text>
        </View>
        <ScrollView style={styles.formScroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {kartaModal ? (
            <>
              <Text style={styles.inputLabel}>Aniq narx (so'm) *</Text>
              <TextInput value={forma.summa} onChangeText={(v) => yangila("summa", v)} placeholder="0" placeholderTextColor={C.muted} keyboardType="numeric" style={styles.input} />
              <Text style={styles.inputLabel}>Izoh</Text>
              <TextInput value={forma.izoh} onChangeText={(v) => yangila("izoh", v)} placeholder="Qo'shimcha izoh (ixtiyoriy)" placeholderTextColor={C.muted} multiline style={[styles.input, styles.inputMulti]} />
              {(parseFloat(forma.summa) || 0) > 0 && (
                <View style={styles.preview}>
                  <Text style={styles.previewTitle}>Hisob (o'rtacha narx asosida)</Text>
                  <View style={styles.previewRow}><Text style={styles.previewLabel}>≈ Nechta non</Text><Text style={styles.previewVal}>{preview.dona} dona</Text></View>
                  <View style={styles.previewRow}><Text style={styles.previewLabel}>Sof foyda</Text><Text style={[styles.previewVal, { color: preview.sofFoyda >= 0 ? C.green : C.red }]}>{formatSom(preview.sofFoyda)} so'm</Text></View>
                </View>
              )}
            </>
          ) : (
            <>
              <Text style={styles.inputLabel}>Sana</Text>
              <TextInput value={forma.sana} onChangeText={(v) => yangila("sana", v)} placeholder="2026-01-01" placeholderTextColor={C.muted} style={styles.input} />

              <Text style={styles.inputLabel}>{qarzModal ? "Qarz oluvchi *" : "Xaridor *"}</Text>
              <TextInput value={forma.ism} onChangeText={(v) => yangila("ism", v)} placeholder="Ism familiya" placeholderTextColor={C.muted} style={styles.input} />

              <Text style={styles.inputLabel}>Non turlari (soni)</Text>
              {(nonlar || []).map((n) => (
                <View key={n.id} style={styles.savatRow}>
                  <Text style={styles.savatNom} numberOfLines={1}>{n.nom}</Text>
                  <Text style={styles.savatNarx}>{formatSom(n.narx)}</Text>
                  <TextInput value={forma.savat[n.id] ?? ""} onChangeText={(v) => yangilaSavat(n.id, v)} placeholder="0" placeholderTextColor={C.muted} keyboardType="numeric" style={styles.savatInput} />
                </View>
              ))}

              {!qarzModal && (
                <>
                  <Text style={styles.inputLabel}>Donadan tushirish (so'm/dona)</Text>
                  <TextInput value={forma.donaChegirma} onChangeText={(v) => yangila("donaChegirma", v)} placeholder="0" placeholderTextColor={C.muted} keyboardType="numeric" style={styles.input} />
                </>
              )}
              <Text style={styles.inputLabel}>{qarzModal ? "Chegirma (so'm, ixtiyoriy)" : "Umumiy chegirma (so'm)"}</Text>
              <TextInput value={forma.chegirma} onChangeText={(v) => yangila("chegirma", v)} placeholder="0" placeholderTextColor={C.muted} keyboardType="numeric" style={styles.input} />

              <Text style={styles.inputLabel}>Izoh</Text>
              <TextInput value={forma.izoh} onChangeText={(v) => yangila("izoh", v)} placeholder="Qo'shimcha izoh (ixtiyoriy)" placeholderTextColor={C.muted} multiline style={[styles.input, styles.inputMulti]} />

              <View style={styles.preview}>
                <View style={styles.previewRow}><Text style={styles.previewLabel}>Jami ({savatHisob.dona} dona)</Text><Text style={styles.previewVal}>{formatSom(savatHisob.summa)} so'm</Text></View>
                {savatHisob.jamiChegirma > 0 && (
                  <View style={styles.previewRow}><Text style={styles.previewLabel}>Chegirma</Text><Text style={styles.previewVal}>− {formatSom(savatHisob.jamiChegirma)} so'm</Text></View>
                )}
                <View style={styles.previewRow}><Text style={styles.previewLabel}>{qarzModal ? "Qarz summasi" : "To'lov"}</Text><Text style={[styles.previewVal, { color: C.accent }]}>{formatSom(savatHisob.yakSumma)} so'm</Text></View>
                {!qarzModal && (
                  <View style={styles.previewRow}><Text style={styles.previewLabel}>Sof foyda (kunlikka)</Text><Text style={[styles.previewVal, { color: savatHisob.yakFoyda >= 0 ? C.green : C.red }]}>{formatSom(savatHisob.yakFoyda)} so'm</Text></View>
                )}
              </View>
            </>
          )}
        </ScrollView>
        <View style={styles.gap12} />
        <View style={styles.modalRow}>
          <View style={styles.flex1}><Btn secondary onPress={yopModal}>Bekor</Btn></View>
          <View style={styles.flex1}><Btn color={C.accent} onPress={saqla}>Saqlash</Btn></View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function SectionHead({ icon, nom, sum, color, style }) {
  return (
    <View style={[styles.secHead, style]}>
      <View style={styles.secHeadLeft}>
        <Ionicons name={icon} size={13} color={C.sub} />
        <Text style={styles.section}>{nom}</Text>
      </View>
      <Text style={[styles.secSum, { color }]}>{sum}</Text>
    </View>
  );
}

function StatTile({ label, value, unit, color, icon }) {
  const len = String(value || "").length;
  const valSize = len > 9 ? 14 : len > 7 ? 16 : len > 5 ? 18 : 20;
  return (
    <Card style={styles.statTile}>
      <Ionicons name={icon} size={16} color={C.sub} style={styles.statIcon} />
      <Text style={styles.statLabel} numberOfLines={1}>{label}</Text>
      <Text style={[styles.statValue, { color, fontSize: valSize }]} numberOfLines={1}>{value}</Text>
      <Text style={styles.statUnit}>{unit}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: C.bg },
  scroll:    { padding: S[5], paddingBottom: S[8] },
  statsRow:  { flexDirection: "row", gap: S[2], marginBottom: S[5] },
  statTile:  { flex: 1, paddingVertical: S[3], paddingHorizontal: S[3] },
  statIcon:  { marginBottom: S[1] },
  statLabel: { fontSize: 9, color: C.muted, fontWeight: "700", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: S[2] },
  statValue: { fontWeight: "800", letterSpacing: -0.3 },
  statUnit:  { fontSize: 10, color: C.muted, marginTop: 2 },
  block:     { marginBottom: S[5] },
  cardTitleRow:{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: S[1] },
  cardTitle: { fontSize: T.md, fontWeight: "700", color: C.text },
  muted:     { fontSize: T.sm, color: C.sub },

  secHead:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: S[3] },
  secHeadLeft:{ flexDirection: "row", alignItems: "center", gap: 6 },
  section:   { fontSize: T.xs, color: C.sub, fontWeight: "700", letterSpacing: 1 },
  secSum:    { fontSize: T.sm, fontWeight: "700" },
  bosh:      { fontSize: T.sm, color: C.muted, paddingVertical: S[2] },

  item:      { marginBottom: S[3] },
  mHead:     { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: S[2] },
  flex1:     { flex: 1 },
  itemIsm:   { fontSize: T.md, fontWeight: "700", color: C.text },
  itemIzoh:  { fontSize: T.sm, color: C.sub, marginTop: 2 },
  itemSana:  { fontSize: T.xs, color: C.muted, marginTop: 2 },
  histWrap:  {},
  histRow:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 5 },
  histNom:   { flex: 1, fontSize: T.sm, color: C.sub },
  histVal:   { fontSize: T.sm, color: C.text, fontWeight: "700", marginLeft: S[2] },
  histNomB:  { flex: 1, fontSize: T.sm, color: C.text, fontWeight: "800" },
  histValB:  { fontSize: T.md, color: C.accent, fontWeight: "800", marginLeft: S[2] },
  histDiv:   { height: StyleSheet.hairlineWidth, backgroundColor: C.borderSoft, marginVertical: S[2] },
  itemSumma: { fontSize: T.md, fontWeight: "800", marginLeft: S[2] },
  actions:   { flexDirection: "row", justifyContent: "flex-end", gap: S[4], marginTop: S[3], borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.borderSoft, paddingTop: S[3] },
  actBtn:    { flexDirection: "row", alignItems: "center" },
  actTxt:    { fontSize: T.sm, fontWeight: "700" },
  gap10:     { height: S[3] },
  gap12:     { height: S[3] },

  // Modal
  modalHead:  { flexDirection: "row", alignItems: "center", gap: S[2], marginBottom: S[3] },
  modalTitle: { fontSize: T.lg, fontWeight: "800", color: C.text },
  formScroll: { maxHeight: 400 },
  inputLabel: { fontSize: T.xs, color: C.sub, fontWeight: "600", marginBottom: 6, marginTop: S[1], letterSpacing: 0.3 },
  input:     { borderWidth: 1, borderColor: C.border, borderRadius: R.md, paddingVertical: 12, paddingHorizontal: 14, fontSize: T.md, color: C.text, backgroundColor: C.surface },
  inputMulti:{ minHeight: 64, textAlignVertical: "top" },
  savatRow:  { flexDirection: "row", alignItems: "center", gap: S[2], marginBottom: S[2] },
  savatNom:  { flex: 1, fontSize: T.sm, color: C.text },
  savatNarx: { fontSize: T.xs, color: C.muted, width: 70, textAlign: "right" },
  savatInput:{ width: 70, borderWidth: 1, borderColor: C.border, borderRadius: R.sm, paddingVertical: 8, paddingHorizontal: 10, fontSize: T.sm, color: C.text, backgroundColor: C.surface, textAlign: "right" },
  savatLine: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  savatLNom: { flex: 1, fontSize: T.sm, color: C.text },
  savatLV:   { fontSize: T.xs, color: C.sub, fontWeight: "700", marginLeft: S[2] },
  pickRow:   { flexDirection: "row", alignItems: "center", gap: S[2], borderWidth: 1, borderColor: C.border, borderRadius: R.md, paddingVertical: 11, paddingHorizontal: 12, marginBottom: S[2], backgroundColor: C.surface },
  pickRowActive: { borderColor: C.accent, backgroundColor: C.accent + "0D" },
  pickTxt:   { fontSize: T.sm, color: C.sub, fontWeight: "600", flexShrink: 1 },
  pickTxtActive: { color: C.accent, fontWeight: "700" },
  preview:   { marginTop: S[3], backgroundColor: C.green + "0D", borderWidth: 1, borderColor: C.green + "2E", borderRadius: R.md, padding: S[3] },
  previewTitle: { fontSize: T.xs, color: C.sub, fontWeight: "600", marginBottom: S[2], letterSpacing: 0.3 },
  previewRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: S[1] },
  previewLabel: { fontSize: T.sm, color: C.sub },
  previewVal: { fontSize: T.md, fontWeight: "800", color: C.text },
  modalRow:  { flexDirection: "row", gap: S[3] },
});
