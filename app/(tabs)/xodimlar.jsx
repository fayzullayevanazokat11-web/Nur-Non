// "Xodimlar" — inline forma yuqorida (modal yo'q). Yangi ishchi qo'shish va
// tahrirlash to'g'ridan-to'g'ri sahifa ichida.
import { useEffect, useMemo, useRef, useState } from "react";
import { router } from "expo-router";
import { View, Text, Pressable, TextInput, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useApp } from "../../src/store/AppData";
import { Card } from "../../src/components/Card";
import { Btn } from "../../src/components/Btn";
import { ScreenHeader } from "../../src/components/ScreenHeader";
import { ErtalabQadamBelgisi } from "../../src/components/ErtalabTekshiruv";
import { NavQator } from "../../src/components/NavQator";
import { Qidiruv, qidiruvMos } from "../../src/components/Qidiruv";
import { oylikIshHaqi, joriyOy, oyNomi } from "../../src/logic/davr";
import { ExpandableCard, yopKartalar } from "../../src/components/ExpandableCard";
import { ScrollBox } from "../../src/components/ScrollBox";
import { DateField } from "../../src/components/DateField";
import { Avatar } from "../../src/components/Avatar";
import { C, T, S, R, temaStil } from "../../src/theme";
import { formatSom, sonOl } from "../../src/logic/hisob";
import { LAVOZIMLAR, getLavozimLabel } from "../../src/logic/konstantalar";

const BOSH = { ism: "", lavozimId: LAVOZIMLAR[0].id, lavozimCustom: "", haqTuri: "kunlik", miqdor: "", nonNarx: {}, holat: "Aktiv", tatilSana: "" };
const HOLATLAR = ["Aktiv", "Ta'tilda"];

export default function Xodimlar() {
  const { ishchilar, setIshchilar, nonlar, ochirArxivga, amalArxivga, hisobotlarTarixi, oylikArxiv, ishHaqiYozuvlari, kelmaganlar, kelmadiAlmash, ertalabYonalish, kelishVaqti, kelishVaqtiQoy } = useApp();
  const [qidiruv, setQidiruv] = useState("");
  const oylik = useMemo(
    () => oylikIshHaqi({ oy: joriyOy(), hisobotlar: hisobotlarTarixi, arxiv: oylikArxiv, ishchilar, yozuvlar: ishHaqiYozuvlari }),
    [hisobotlarTarixi, oylikArxiv, ishchilar, ishHaqiYozuvlari]
  );
  const ozNonlar = (nonlar || []).filter((n) => n.ozIshlab !== false);

  const [tahrirId, setTahrirId] = useState(null);
  const [forma, setForma] = useState(BOSH);
  const scrollRef = useRef(null);

  const hammaAktiv = (ishchilar || []).filter((w) => w.holat === "Aktiv");
  const mos = (w) => qidiruvMos(`${w.ism} ${getLavozimLabel(w)}`, qidiruv);
  const aktiv = hammaAktiv.filter(mos);
  const tatildagilar = (ishchilar || []).filter((w) => w.holat === "Ta'tilda").filter(mos);
  const ishdanKetgan = (ishchilar || []).filter((w) => w.holat === "Ishdan ketgan").filter(mos);
  const keldi = hammaAktiv.filter((w) => !kelmaganlar.includes(w.id)).length;

  const yangila = (k, v) => setForma((p) => ({ ...p, [k]: v }));
  const yangilaNon = (nom, v) => setForma((p) => ({ ...p, nonNarx: { ...p.nonNarx, [nom]: v } }));
  // Saqlash/Bekor: forma tozalanadi va barcha ochiq kartalar (forma ham) yopiladi
  const tozala = () => { setForma(BOSH); setTahrirId(null); yopKartalar(); };

  const tahrirla = (w) => {
    const nonNarx = {};
    Object.entries(w.nonNarxlari || {}).forEach(([nom, narx]) => { nonNarx[nom] = String(narx); });
    setForma({
      ism: w.ism, lavozimId: w.lavozimId, lavozimCustom: w.lavozimCustom || "",
      haqTuri: w.haqTuri || "kunlik",
      miqdor: String(w.miqdor || ""), nonNarx, holat: w.holat || "Aktiv",
      tatilSana: w.tatilQaytishSana || "",
    });
    yopKartalar({ qoldir: "forma" }); // ishchi kartasi yopiladi, forma ochiq qoladi
    setTahrirId(w.id);
    setTimeout(() => scrollRef.current?.scrollToTop?.(true), 50);
  };

  const saqla = () => {
    if (!forma.ism.trim()) {
      Alert.alert("Ism kiritilmagan", "Iltimos, xodim ismini kiriting.");
      return;
    }
    const nomKalit = forma.ism.trim().toLowerCase();
    if ((ishchilar || []).some((w) => w.id !== tahrirId && String(w.ism || "").trim().toLowerCase() === nomKalit)) {
      Alert.alert("Takroriy ism", `"${forma.ism.trim()}" ismli xodim allaqachon bor. Farqlash uchun boshqacha yozing (masalan, familiya qo'shing).`);
      return;
    }
    if (forma.lavozimId === "boshqasi" && !forma.lavozimCustom.trim()) {
      Alert.alert("Lavozim kiritilmagan", "Iltimos, lavozim nomini kiriting.");
      return;
    }
    let qoshimcha;
    if (forma.haqTuri === "qop") {
      const nonNarxlari = {};
      const nonTurlari = [];
      Object.entries(forma.nonNarx).forEach(([nom, narx]) => {
        const n = sonOl(narx);
        if (n > 0) { nonNarxlari[nom] = n; nonTurlari.push(nom); }
      });
      qoshimcha = { haqTuri: "qop", miqdor: 0, nonTurlari, nonNarxlari };
    } else {
      qoshimcha = { haqTuri: "kunlik", miqdor: sonOl(forma.miqdor), nonTurlari: [], nonNarxlari: {} };
    }
    const asos = {
      ism: forma.ism.trim(), lavozimId: forma.lavozimId,
      lavozimCustom: forma.lavozimId === "boshqasi" ? forma.lavozimCustom.trim() : "",
      holat: forma.holat,
      tatilQaytishSana: forma.holat === "Ta'tilda" ? forma.tatilSana : "",
      ...qoshimcha,
    };
    if (tahrirId) {
      setIshchilar((prev) => prev.map((w) => (w.id === tahrirId ? { ...w, ...asos } : w)));
    } else {
      setIshchilar((prev) => [...prev, { id: Date.now(), tel: "", tatilQaytishSana: "", tahrirSoni: 0, ...asos }]);
    }
    tozala();
  };

  const ochir = (id) =>
    Alert.alert("O'chirish", "Bu xodimni o'chirasizmi?", [
      { text: "Bekor", style: "cancel" },
      { text: "Ha", style: "destructive", onPress: () => {
        yopKartalar({ qoldir: "forma" });
        ochirArxivga("ishchi", id); // Tarixdagilar'ga — 7 kun ichida qaytarish mumkin
        if (tahrirId === id) tozala();
      } },
    ]);

  const tatildanQaytar = (w) =>
    Alert.alert("Ta'tildan qaytdi", `${w.ism} ta'tildan qaytdimi? Holati Aktivga o'tkaziladi.`, [
      { text: "Bekor", style: "cancel" },
      { text: "Ha", onPress: () => { yopKartalar({ qoldir: "forma" }); setIshchilar((p) => p.map((x) => x.id === w.id ? { ...x, holat: "Aktiv", tatilQaytishSana: "" } : x)); } },
    ]);

  const haydash = (w) =>
    Alert.alert("Ishdan haydash", `${w.ism}ni ishdan haydaysizmi? Ishchi "Ishdan ketganlar" ro'yxatiga o'tadi.`, [
      { text: "Bekor", style: "cancel" },
      { text: "Haydash", style: "destructive", onPress: () => {
        yopKartalar({ qoldir: "forma" });
        // Tarixdagilar'ga — oldingi holatiga qaytarish mumkin
        amalArxivga("haydash", { id: w.id, ism: w.ism, holat: w.holat, tatilQaytishSana: w.tatilQaytishSana || "" });
        setIshchilar((p) => p.map((x) => x.id === w.id ? { ...x, holat: "Ishdan ketgan", tatilQaytishSana: "" } : x));
      } },
    ]);

  const qaytarish = (w) =>
    Alert.alert("Ishga qaytarish", `${w.ism}ni ishga qaytarasizmi? Holati Aktivga o'tkaziladi.`, [
      { text: "Bekor", style: "cancel" },
      { text: "Qaytarish", onPress: () => { yopKartalar({ qoldir: "forma" }); setIshchilar((p) => p.map((x) => x.id === w.id ? { ...x, holat: "Aktiv" } : x)); } },
    ]);

  const tatilgaChiqar = (w) =>
    Alert.alert("Ta'tilga chiqarish", `${w.ism}ni ta'tilga chiqarasizmi? Ta'tilda bo'lganida kunlik ish haqi hisoblanmaydi.`, [
      { text: "Bekor", style: "cancel" },
      { text: "Chiqarish", onPress: () => { yopKartalar({ qoldir: "forma" }); setIshchilar((p) => p.map((x) => x.id === w.id ? { ...x, holat: "Ta'tilda" } : x)); } },
    ]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollBox ref={scrollRef} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <ScreenHeader eyebrow="Jamoa" title="Xodimlar" image={require("../../assets/tabicons/xodimlar.png")} />
        <ErtalabQadamBelgisi qadam="davomat" matn="Bugungi davomatni belgilang, so'ng «Tayyor»" />

        <View style={styles.statsRow}>
          <Card style={styles.statTile}>
            <Ionicons name="people-circle-outline" size={16} color={C.green} style={styles.statIcon} />
            <Text style={styles.statLabel}>AKTIV</Text>
            <Text style={[styles.statValue, { color: C.text }]}>{aktiv.length}</Text>
            <Text style={styles.statUnit}>nafar</Text>
          </Card>
          <Card style={styles.statTile}>
            <Ionicons name="airplane-outline" size={16} color={C.accent} style={styles.statIcon} />
            <Text style={styles.statLabel}>TA'TILDA</Text>
            <Text style={[styles.statValue, { color: C.text }]}>{tatildagilar.length}</Text>
            <Text style={styles.statUnit}>nafar</Text>
          </Card>
          <Card style={styles.statTile}>
            <Ionicons name="exit-outline" size={16} color={C.red} style={styles.statIcon} />
            <Text style={styles.statLabel}>KETGAN</Text>
            <Text style={[styles.statValue, { color: C.text }]}>{ishdanKetgan.length}</Text>
            <Text style={styles.statUnit}>nafar</Text>
          </Card>
        </View>

        <NavQator
          icon="wallet-outline"
          nom="Oylik ish haqi"
          izoh={`${oyNomi(joriyOy())} · qolgan ${formatSom(oylik.qoldiq)} so'm`}
          onPress={() => router.push("/ishhaqi")}
          style={styles.navQator}
        />

        {/* BUGUNGI DAVOMAT — kelmagan xodimga bugungi kunlik haq yozilmaydi */}
        {hammaAktiv.length > 0 && (
          <ExpandableCard
            style={styles.formCard}
            ochKaliti={ertalabYonalish === "davomat" ? "ertalab" : null}
            header={
              <View style={styles.formHead}>
                <Ionicons name="checkbox-outline" size={18} color={C.sub} />
                <Text style={[styles.formTitle, styles.flex1]}>Bugungi davomat</Text>
                <Text style={styles.davomatSoni}>{keldi}/{hammaAktiv.length} keldi</Text>
              </View>
            }
          >
            {hammaAktiv.map((w) => {
              const kelmadi = kelmaganlar.includes(w.id);
              return (
                <View key={w.id} style={styles.davomatQator}>
                  <Text style={[styles.davomatIsm, kelmadi && styles.davomatKelmadi]} numberOfLines={1}>{w.ism}</Text>
                  {!kelmadi && <KelishVaqti ism={w.ism} qiymat={kelishVaqti[w.id] || ""} onSaqla={(v) => kelishVaqtiQoy(w.id, v)} />}
                  <Pressable
                    accessibilityRole="switch"
                    accessibilityState={{ checked: !kelmadi }}
                    accessibilityLabel={`${w.ism}: davomat`}
                    onPress={() => kelmadiAlmash(w.id)}
                    hitSlop={6}
                    style={({ pressed }) => [styles.davomatBelgi, kelmadi ? styles.belgiYoq : styles.belgiHa, pressed && { opacity: 0.7 }]}
                  >
                    <Ionicons name={kelmadi ? "close" : "checkmark"} size={13} color={kelmadi ? C.sub : C.onAccent} />
                    <Text style={[styles.belgiTxt, !kelmadi && { color: C.onAccent }]}>{kelmadi ? "Kelmadi" : "Keldi"}</Text>
                  </Pressable>
                </View>
              );
            })}
            <Text style={styles.davomatIzoh}>Kelgan vaqtni qo'lda yozing (masalan, 0730 → 07:30). Kelmagan xodimga bugungi haq hisoblanmaydi (oylik hisobda ham).</Text>
          </ExpandableCard>
        )}

        {(ishchilar || []).length > 5 && <Qidiruv value={qidiruv} onChange={setQidiruv} placeholder="Xodimni qidirish" />}

        {/* INLINE FORMA — ExpandableCard ichida, default yopiq. Tahrirlash holatida avto-ochiladi. */}
        <ExpandableCard
          id="forma"
          style={styles.formCard}
          ochKaliti={tahrirId}
          header={
            <View style={styles.formHead}>
              <Ionicons name={tahrirId ? "create-outline" : "person-add-outline"} size={18} color={C.sub} />
              <Text style={styles.formTitle}>{tahrirId ? "Xodimni tahrirlash" : "Yangi ishchi qo'shish"}</Text>
            </View>
          }
        >
          <Text style={styles.inputLabel}>Ism *</Text>
          <TextInput value={forma.ism} onChangeText={(v) => yangila("ism", v)} placeholder="Masalan: Akmal aka" placeholderTextColor={C.muted} style={styles.input} />

          <Text style={styles.inputLabel}>Lavozim</Text>
          <View style={styles.lavGrid}>
            {LAVOZIMLAR.map((lav) => {
              const tanlangan = forma.lavozimId === lav.id;
              return (
                <Pressable key={lav.id} onPress={() => yangila("lavozimId", lav.id)} style={[styles.lavBtn, tanlangan && styles.lavBtnActive]}>
                  <Ionicons name={tanlangan ? "checkmark-circle-outline" : "ellipse-outline"} size={16} color={tanlangan ? C.accent : C.muted} />
                  <Text style={[styles.lavLabel, tanlangan && styles.lavLabelActive]} numberOfLines={1}>{lav.label}</Text>
                </Pressable>
              );
            })}
          </View>

          {forma.lavozimId === "boshqasi" && (
            <>
              <Text style={styles.inputLabel}>Lavozim nomi *</Text>
              <TextInput
                value={forma.lavozimCustom}
                onChangeText={(v) => yangila("lavozimCustom", v)}
                placeholder="Masalan: Yetkazib beruvchi"
                placeholderTextColor={C.muted}
                style={styles.input}
              />
            </>
          )}

          <Text style={styles.inputLabel}>Haq turi</Text>
          <View style={styles.turRow}>
            <Pressable style={[styles.turBtn, forma.haqTuri === "kunlik" && styles.turBtnActive]} onPress={() => yangila("haqTuri", "kunlik")}>
              <Text style={[styles.turTxt, forma.haqTuri === "kunlik" && styles.turTxtActive]}>Kunlik</Text>
            </Pressable>
            <Pressable style={[styles.turBtn, forma.haqTuri === "qop" && styles.turBtnActive]} onPress={() => yangila("haqTuri", "qop")}>
              <Text style={[styles.turTxt, forma.haqTuri === "qop" && styles.turTxtActive]}>Qoplik</Text>
            </Pressable>
          </View>

          {forma.haqTuri === "kunlik" ? (
            <>
              <Text style={styles.inputLabel}>Kunlik haq (so'm)</Text>
              <TextInput value={forma.miqdor} onChangeText={(v) => yangila("miqdor", v)} placeholder="0" placeholderTextColor={C.muted} keyboardType="numeric" style={styles.input} />
            </>
          ) : (
            <>
              <Text style={styles.inputLabel}>Qaysi nondan qancha (1 qop, so'm)</Text>
              {ozNonlar.length === 0 ? (
                <Text style={styles.muted}>Avval o'zimizniki non turi qo'shing.</Text>
              ) : (
                ozNonlar.map((n) => (
                  <View key={n.id} style={styles.nonRow}>
                    <Text style={styles.nonNom} numberOfLines={1}>{n.nom}</Text>
                    <TextInput value={forma.nonNarx[n.nom] ?? ""} onChangeText={(v) => yangilaNon(n.nom, v)} placeholder="0" placeholderTextColor={C.muted} keyboardType="numeric" style={styles.nonInput} />
                  </View>
                ))
              )}
            </>
          )}

          <Text style={styles.inputLabel}>Holat</Text>
          <View style={styles.holatRow}>
            {HOLATLAR.map((h) => {
              const tanlangan = forma.holat === h;
              return (
                <Pressable key={h} onPress={() => yangila("holat", h)} style={[styles.holatBtn, tanlangan && styles.holatBtnActive]}>
                  <Text style={[styles.holatTxt, tanlangan && styles.holatTxtActive]}>{h}</Text>
                </Pressable>
              );
            })}
          </View>

          {forma.holat === "Ta'tilda" && (
            <>
              <Text style={styles.inputLabel}>Ta'tildan qaytish sanasi</Text>
              <DateField value={forma.tatilSana} onChange={(v) => yangila("tatilSana", v)} />
              <Text style={styles.hintSm}>Ta'tilda bo'lsa kunlik ish haqi hisoblanmaydi.</Text>
            </>
          )}

          <View style={styles.formActions}>
            <Btn onPress={saqla}>{tahrirId ? "Yangilash" : "Saqlash"}</Btn>
            {tahrirId && <Btn secondary onPress={tozala}>Bekor</Btn>}
          </View>
        </ExpandableCard>

        {(ishchilar || []).length === 0 ? (
          <Card><Text style={styles.muted}>Xodimlar hali kiritilmagan</Text></Card>
        ) : (
          <>
            <Bolim icon="checkmark-circle-outline" tint={C.green} nom="AKTIVLAR" soni={aktiv.length}>
              {aktiv.map((w) => (
                <KartaWrap
                  key={w.id} w={w}
                  ochTahrir={() => tahrirla(w)}
                  ochir={() => ochir(w.id)}
                  haydash={() => haydash(w)}
                  tatilgaChiqar={() => tatilgaChiqar(w)}
                />
              ))}
            </Bolim>

            <Bolim icon="airplane-outline" tint={C.accent} nom="TA'TILDAGILAR" soni={tatildagilar.length}>
              {tatildagilar.map((w) => (
                <KartaWrap
                  key={w.id} w={w}
                  ochTahrir={() => tahrirla(w)}
                  ochir={() => ochir(w.id)}
                  haydash={() => haydash(w)}
                  tatildanQaytar={() => tatildanQaytar(w)}
                />
              ))}
            </Bolim>

            <Bolim icon="exit-outline" tint={C.red} nom="ISHDAN KETGANLAR" soni={ishdanKetgan.length}>
              {ishdanKetgan.map((w) => (
                <KartaWrap
                  key={w.id} w={w}
                  ochir={() => ochir(w.id)}
                  qaytarish={() => qaytarish(w)}
                />
              ))}
            </Bolim>
          </>
        )}
      </ScrollBox>
    </SafeAreaView>
  );
}

function Bolim({ icon, tint, nom, soni, children }) {
  if (soni === 0) return null;
  return (
    <>
      <View style={styles.secHead}>
        <View style={styles.secHeadLeft}>
          <Ionicons name={icon} size={13} color={tint} />
          <Text style={[styles.section, { color: tint }]}>{nom}</Text>
        </View>
        <Text style={[styles.secSum, { color: tint }]}>{soni} nafar</Text>
      </View>
      {children}
    </>
  );
}

// Kelgan vaqt — qo'lda kiritiladi ("0730" → "07:30"); noto'g'ri vaqt saqlanmaydi
const soatTozala = (v) => {
  const r = String(v || "").replace(/\D/g, "").slice(0, 4);
  return r.length > 2 ? `${r.slice(0, 2)}:${r.slice(2)}` : r;
};
const soatTogri = (v) => /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
function KelishVaqti({ ism, qiymat, onSaqla }) {
  const [matn, setMatn] = useState(qiymat);
  useEffect(() => { setMatn(qiymat); }, [qiymat]);
  const xato = matn.length > 0 && !soatTogri(matn);
  const ozgar = (v) => {
    const t = soatTozala(v);
    setMatn(t);
    if (soatTogri(t)) onSaqla(t);
    else if (!t) onSaqla("");
  };
  return (
    <TextInput
      accessibilityLabel={`${ism}: kelgan vaqti`}
      value={matn}
      onChangeText={ozgar}
      placeholder="--:--"
      placeholderTextColor={C.muted}
      keyboardType="number-pad"
      maxLength={5}
      style={[styles.kelishInput, soatTogri(matn) && styles.kelishTayyor, xato && styles.kelishXato]}
    />
  );
}

function KartaWrap({ w, ochTahrir, ochir, haydash, tatildanQaytar, qaytarish, tatilgaChiqar }) {
  const qop = w.haqTuri === "qop";
  const nonlarRo = Object.entries(w.nonNarxlari || {});
  const ketgan = w.holat === "Ishdan ketgan";
  return (
    <ExpandableCard
      style={styles.item}
      header={
        <View style={styles.left}>
          <Avatar name={w.ism} />
          <View style={styles.flex1}>
            <Text style={styles.ism}>{w.ism}</Text>
            <Text style={styles.lavozim}>{getLavozimLabel(w)}</Text>
          </View>
          {w.holat === "Ta'tilda" && (
            <View style={[styles.tatilBadge, { backgroundColor: C.accent + "14" }]}>
              <Ionicons name="airplane-outline" size={12} color={C.accent} />
              <Text style={[styles.tatilBadgeTxt, { color: C.accent }]}>Ta'tilda</Text>
            </View>
          )}
          {ketgan && (
            <View style={[styles.tatilBadge, { backgroundColor: C.red + "14" }]}>
              <Ionicons name="exit-outline" size={12} color={C.red} />
              <Text style={[styles.tatilBadgeTxt, { color: C.red }]}>Ketgan</Text>
            </View>
          )}
        </View>
      }
    >
      <View style={styles.bodyTop}>
        <View style={[styles.statePill, { backgroundColor: (w.holat === "Aktiv" ? C.green : ketgan ? C.red : C.accent) + "14" }]}>
          <Text style={[styles.stateTxt, { color: w.holat === "Aktiv" ? C.green : ketgan ? C.red : C.accent }]}>{w.holat}</Text>
        </View>
        {!ketgan && <Text style={styles.haq}>{qop ? "Qoplik" : `${formatSom(w.miqdor)} so'm/kun`}</Text>}
      </View>
      {w.holat === "Ta'tilda" && w.tatilQaytishSana ? (
        <Text style={styles.tatil}>Ta'tildan qaytadi: {w.tatilQaytishSana}</Text>
      ) : null}
      {qop && nonlarRo.length > 0 && !ketgan && (
        <View style={styles.haqWrap}>
          {nonlarRo.map(([nom, narx]) => (
            <View key={nom} style={styles.haqRow}>
              <Text style={styles.haqNom} numberOfLines={1}>{nom}</Text>
              <Text style={styles.haqVal}>{formatSom(narx)} so'm/qop</Text>
            </View>
          ))}
        </View>
      )}
      <View style={styles.bodyActions}>
        {tatildanQaytar && (
          <Pressable accessibilityLabel="Ta'tildan qaytdi" onPress={tatildanQaytar} hitSlop={8} style={styles.actBtn}>
            <Ionicons name="checkmark-circle-outline" size={16} color={C.green} />
            <Text style={[styles.actTxt, { color: C.green }]}> Ta'tildan qaytdi</Text>
          </Pressable>
        )}
        {tatilgaChiqar && (
          <Pressable accessibilityLabel="Ta'tilga chiqarish" onPress={tatilgaChiqar} hitSlop={8} style={styles.actBtn}>
            <Ionicons name="airplane-outline" size={16} color={C.accent} />
            <Text style={[styles.actTxt, { color: C.accent }]}> Ta'tilga chiqarish</Text>
          </Pressable>
        )}
        {qaytarish && (
          <Pressable accessibilityLabel="Ishga qaytarish" onPress={qaytarish} hitSlop={8} style={styles.actBtn}>
            <Ionicons name="arrow-undo-outline" size={16} color={C.green} />
            <Text style={[styles.actTxt, { color: C.green }]}> Qaytarish</Text>
          </Pressable>
        )}
        {ochTahrir && (
          <Pressable accessibilityLabel="Tahrirlash" onPress={ochTahrir} hitSlop={8} style={styles.actBtn}>
            <Ionicons name="create-outline" size={16} color={C.accent} />
            <Text style={[styles.actTxt, { color: C.accent }]}> Tahrirlash</Text>
          </Pressable>
        )}
        {haydash && (
          <Pressable accessibilityLabel="Ishdan haydash" onPress={haydash} hitSlop={8} style={styles.actBtn}>
            <Ionicons name="exit-outline" size={16} color={C.red} />
            <Text style={[styles.actTxt, { color: C.red }]}> Haydash</Text>
          </Pressable>
        )}
        <Pressable accessibilityLabel="O'chirish" onPress={ochir} hitSlop={8} style={styles.actBtn}>
          <Ionicons name="trash-outline" size={16} color={C.red} />
          <Text style={[styles.actTxt, { color: C.red }]}> O'chirish</Text>
        </Pressable>
      </View>
    </ExpandableCard>
  );
}

const styles = temaStil(() => StyleSheet.create({
  safe:      { flex: 1, backgroundColor: C.bg },
  scroll:    { padding: S[5], paddingBottom: S[8] },
  statsRow:  { flexDirection: "row", gap: S[2], marginBottom: S[4] },
  statTile:  { flex: 1, paddingVertical: S[3], paddingHorizontal: S[3] },
  statIcon:  { marginBottom: S[1] },
  statLabel: { fontSize: 9, color: C.muted, fontWeight: "700", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: S[2] },
  statValue: { fontSize: 26, fontWeight: "800", letterSpacing: -0.3 },
  statUnit:  { fontSize: 10, color: C.muted, marginTop: 2 },
  gap14:     { height: S[4] },
  navQator:  { marginBottom: S[4] },
  davomatSoni:{ fontSize: T.xs, fontWeight: "800", color: C.accent },
  davomatQator:{ flexDirection: "row", alignItems: "center", paddingVertical: S[2], borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.borderSoft },
  davomatIsm:{ flex: 1, fontSize: T.sm, fontWeight: "700", color: C.text },
  davomatKelmadi:{ color: C.muted, textDecorationLine: "line-through" },
  davomatBelgi:{ flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 5, paddingHorizontal: 10, borderRadius: R.pill },
  belgiHa:   { backgroundColor: C.accent },
  belgiYoq:  { backgroundColor: C.panel },
  belgiTxt:  { fontSize: 11, fontWeight: "800", color: C.sub },
  davomatIzoh:{ fontSize: 11, color: C.muted, marginTop: S[2] },

  // Inline forma
  formCard:  { marginBottom: S[5] },
  formHead:  { flexDirection: "row", alignItems: "center", gap: S[2], marginBottom: S[3] },
  formTitle: { fontSize: T.md, fontWeight: "800", color: C.text },
  inputLabel:{ fontSize: T.xs, color: C.sub, fontWeight: "600", marginBottom: 6, marginTop: S[3], letterSpacing: 0.3 },
  input:     { borderWidth: 1, borderColor: C.border, borderRadius: R.md, paddingVertical: 12, paddingHorizontal: 14, fontSize: T.md, color: C.text, backgroundColor: C.surface },
  lavGrid:   { flexDirection: "row", flexWrap: "wrap", gap: S[2] },
  lavBtn:    { width: "47%", flexDirection: "row", alignItems: "center", gap: S[2], borderWidth: 1, borderColor: C.border, borderRadius: R.md, paddingVertical: 11, paddingHorizontal: 11, backgroundColor: "transparent" },
  lavBtnActive:{ borderColor: C.accent, backgroundColor: C.accent + "0D" },
  lavLabel:  { fontSize: T.sm, color: C.sub, fontWeight: "600", flexShrink: 1 },
  lavLabelActive:{ color: C.accent, fontWeight: "700" },
  turRow:    { flexDirection: "row", gap: S[2] },
  turBtn:    { flex: 1, alignItems: "center", paddingVertical: 12, borderRadius: R.md, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface },
  turBtnActive:{ backgroundColor: C.accent, borderColor: C.accent },
  turTxt:    { fontSize: T.sm, fontWeight: "700", color: C.sub },
  turTxtActive:{ color: C.onAccent },
  nonRow:    { flexDirection: "row", alignItems: "center", gap: S[2], marginBottom: S[2] },
  nonNom:    { flex: 1, fontSize: T.sm, color: C.text },
  nonInput:  { width: 120, borderWidth: 1, borderColor: C.border, borderRadius: R.sm, paddingVertical: 9, paddingHorizontal: 12, fontSize: T.sm, color: C.text, backgroundColor: C.surface, textAlign: "right" },
  holatRow:  { flexDirection: "row", gap: S[2] },
  holatBtn:  { flex: 1, borderWidth: 1, borderColor: C.border, borderRadius: R.md, paddingVertical: 11, alignItems: "center" },
  holatBtnActive:{ borderColor: C.accent, backgroundColor: C.accent + "0D" },
  holatTxt:  { fontSize: T.sm, color: C.sub, fontWeight: "600" },
  holatTxtActive:{ color: C.accent, fontWeight: "700" },
  hintSm:    { fontSize: 11, color: C.muted, marginTop: 5 },
  formActions:{ marginTop: S[4], gap: S[2] },

  // Section heading
  secHead:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: S[4], marginBottom: S[3] },
  secHeadLeft:{ flexDirection: "row", alignItems: "center", gap: 6 },
  section:   { fontSize: T.xs, fontWeight: "800", letterSpacing: 1.2 },
  secSum:    { fontSize: T.xs, fontWeight: "700" },

  // Ro'yxat
  item:      { marginBottom: S[3] },
  left:      { flexDirection: "row", alignItems: "center", gap: S[3], flex: 1 },
  flex1:     { flex: 1 },
  ism:       { fontSize: T.md, fontWeight: "700", color: C.text },
  lavozim:   { fontSize: T.sm, color: C.sub, marginTop: 1 },
  bodyTop:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  statePill: { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 3, paddingHorizontal: 10, borderRadius: R.pill },
  stateTxt:  { fontSize: 11, fontWeight: "700", letterSpacing: 0.2 },
  tatilBadge:{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: C.accent + "14", paddingVertical: 3, paddingHorizontal: 8, borderRadius: R.pill },
  tatilBadgeTxt:{ fontSize: 10, fontWeight: "700", color: C.accent, letterSpacing: 0.2 },
  haq:       { fontSize: T.sm, fontWeight: "800", color: C.accent },
  tatil:     { fontSize: T.xs, color: C.muted, marginTop: 6 },
  haqWrap:   { marginTop: S[3], borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.borderSoft, paddingTop: S[2] },
  haqRow:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 5 },
  haqNom:    { flex: 1, fontSize: T.sm, color: C.text },
  haqVal:    { fontSize: T.sm, color: C.sub, fontWeight: "700", marginLeft: S[2] },
  muted:     { fontSize: T.sm, color: C.muted },
  bodyActions:{ flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-end", gap: S[3], rowGap: S[2], marginTop: S[3], borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.borderSoft, paddingTop: S[3] },
  actBtn:    { flexDirection: "row", alignItems: "center" },
  actTxt:    { fontSize: T.sm, fontWeight: "700" },
  kelishInput:{ width: 64, marginRight: S[2], borderWidth: 1, borderColor: C.border, borderRadius: R.sm, paddingVertical: 6, paddingHorizontal: 6, fontSize: T.sm, fontWeight: "800", color: C.text, backgroundColor: C.surface, textAlign: "center" },
  kelishTayyor:{ borderColor: C.accent, color: C.accent },
  kelishXato:{ borderColor: C.red },
}));
