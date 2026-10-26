// "Tannarx" — har bir non uchun 1 dona tannarxi, foyda va foiz.
// Tannarx = xomashyo + qoplik ishchilar + kunlik ishchilar ulushi (o'rtacha kunlik
// qopga bo'linadi, oxirgi hisobotlardan avtomatik). Narx o'zgarsa — darhol qayta hisoblanadi.
// "Sinov narxi" — narxni o'zgartirsangiz qancha foyda qolishini ko'rsatadi (saqlanmaydi).
import { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, StyleSheet, LayoutAnimation } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useApp } from "../store/AppData";
import { useTiklash } from "./useTiklash";
import { Card } from "./Card";
import { ExpandableCard } from "./ExpandableCard";
import { formatSom, getIngNarx } from "../logic/hisob";
import { tannarxHisobi, ortachaKunlikQop, sinovFoyda, narxTasiri } from "../logic/tannarx";
import { xomashyoRoyxati } from "../logic/konstantalar";
import { C, T, S, R, temaStil } from "../theme";
import { XomashyoIkon, NonIkon, BosiladiganIkon, IkonTanlov, IKON_TANLOV, xomashyoIkonKaliti } from "./XomashyoIkon";

const NARX_KORINISH = 60 * 60 * 1000; // narx o'zgarishi 1 soat ko'rinadi

// Tannarx qismlari ikonkalari
const QISM_IKON = { xomashyo: "basket-outline", qoplik: "people-outline", kunlik: "person-outline" };

const foiz = (x) => `${Math.round(x * 100)}%`;

export function TannarxKalk() {
  const { nonlar, mahsulotNarxlari, ishchilar, hisobotlarTarixi, ozIshlabQoplar, narxTarixi, customMahsulotlar, xomashyoIkonlari, xomashyoIkonQoy } = useApp();
  const royxat = xomashyoRoyxati(customMahsulotlar);
  const xOl = (m) => royxat.find((x) => x.id === m.id) || m;
  // Ikonkani bosib o'zgartirish (non va xomashyo) — tanlov shu joyda ochiladi
  const [ikonOchiq, setIkonOchiq] = useState(null);
  // Narx o'zgarishlari faqat 1 soat ko'rinadi — har daqiqada tekshiriladi, muddati o'tgani o'zi yo'qoladi
  const [hozir, setHozir] = useState(Date.now());
  useEffect(() => { const id = setInterval(() => setHozir(Date.now()), 60000); return () => clearInterval(id); }, []);
  const yangiNarxlar = (narxTarixi || []).filter((o) => hozir - (o.vaqt || 0) < NARX_KORINISH);
  useTiklash(() => setIkonOchiq(null));
  const ikonAlmash = (k) => {
    LayoutAnimation.configureNext(LayoutAnimation.create(200, LayoutAnimation.Types.easeInEaseOut, LayoutAnimation.Properties.opacity));
    setIkonOchiq((o) => (o === k ? null : k));
  };
  const xTanlov = (k, m) => ikonOchiq === k && (
    <IkonTanlov sarlavha={`${m.nom} — ikonka`} variantlar={IKON_TANLOV} tanlangan={xomashyoIkonKaliti(xOl(m), xomashyoIkonlari)} onTanla={(v) => xomashyoIkonQoy(m.id, v)} onYop={() => ikonAlmash(k)} />
  );
  const xNom = (id) => royxat.find((m) => m.id === id)?.nom || id;
  const ikki = (n) => String(n).padStart(2, "0");
  const sana = (ms) => { const d = new Date(ms); return `${ikki(d.getDate())}.${ikki(d.getMonth() + 1)}`; };
  // Narxni ko'rsatish: 1 kg / 1 litr (yoki kiritilgan miqdor) uchun
  const narxMatni = (p, id) => {
    const m = royxat.find((x) => x.id === id);
    const b = parseFloat(p?.narx) / (parseFloat(p?.miqdor) || 1);
    return `${formatSom(b * 1000)}/${m?.birlik === "litr" ? "l" : "kg"}`;
  };
  const bugungiQop = Object.values(ozIshlabQoplar || {}).reduce((s, v) => s + (parseFloat(v) || 0), 0);
  const ortacha = ortachaKunlikQop(hisobotlarTarixi, bugungiQop);
  const [sinov, setSinov] = useState({});

  const natija = useMemo(
    () => tannarxHisobi({ nonlar, mahsulotNarxlari, ishchilar, kunlikQop: ortacha }),
    [nonlar, mahsulotNarxlari, ishchilar, ortacha]
  );

  return (
    <View>
      <Text style={styles.yoriq}>
        1 dona non tannarxi: xomashyo + ishchilar haqi.{ortacha > 0 ? ` Kunlik ishchilar haqi o'rtacha ${String(ortacha).replace(".", ",")} qopga bo'lib hisoblanadi.` : ""}
      </Text>

      {yangiNarxlar.length > 0 && (
        <Card style={styles.card}>
          <View style={styles.head}>
            <Ionicons name="pricetags-outline" size={18} color={C.sub} />
            <Text style={styles.headTxt}>Narx o'zgarishlari</Text>
          </View>
          {yangiNarxlar.slice(0, 5).map((o) => {
            const tasir = narxTasiri(o, nonlar);
            return (
              <View key={o.id} style={styles.narxQator}>
                <View style={styles.narxBosh}>
                  <View style={styles.narxNomQ}>
                    <XomashyoIkon m={royxat.find((m) => m.id === o.xId) || { id: o.xId }} size={15} color={C.sub} />
                    <Text style={styles.narxNom} numberOfLines={1}>{xNom(o.xId)}</Text>
                  </View>
                  <Text style={styles.narxSana}>{sana(o.vaqt)}</Text>
                </View>
                <Text style={styles.narxQiymat}>{narxMatni(o.eski, o.xId)} → {narxMatni(o.yangi, o.xId)}</Text>
                {tasir.map((t) => (
                  <Text key={t.nom} style={styles.narxTasir}>
                    {t.nom}: {t.dona > 0 ? "+" : "−"}{formatSom(Math.abs(t.dona))} so'm/dona
                  </Text>
                ))}
              </View>
            );
          })}
        </Card>
      )}

      {natija.map((r) => {
        const s = sinov[r.id] ?? "";
        const sf = s !== "" ? sinovFoyda(r, s) : null;
        const non = (nonlar || []).find((n) => n.id === r.id) || { id: r.id, ozIshlab: r.oz };
        const ingr = (non.mahsulotlar || []).filter((m) => parseFloat(m.miqdor) > 0);
        return (
          <ExpandableCard
            key={r.id}
            style={styles.item}
            header={
              <View style={styles.mHead}>
                <View style={[styles.nonIkon, !r.oz && styles.nonIkonTashqi]}>
                  <NonIkon non={non} size={24} color={r.oz ? C.accent : C.sub} />
                </View>
                <View style={styles.flex1}>
                  <Text style={styles.nom} numberOfLines={1}>{r.nom}</Text>
                  <Text style={styles.izoh}>Tannarx {formatSom(r.dona)} · narx {formatSom(r.narx)} so'm</Text>
                </View>
                <View style={styles.foydaBox}>
                  <Text style={[styles.foyda, r.foyda < 0 && { color: C.red }]}>{r.foyda >= 0 ? "+" : ""}{formatSom(r.foyda)}</Text>
                  <Text style={styles.marja}>{foiz(r.marja)}</Text>
                </View>
              </View>
            }
          >
            {r.oz ? (
              <>
                <View style={styles.jadvalBosh}>
                  <Text style={[styles.jNom, styles.jBosh]}>1 qop ({r.nonSoni || 0} dona)</Text>
                  <Text style={[styles.jV, styles.jBosh]}>qop</Text>
                  <Text style={[styles.jV, styles.jBosh]}>dona</Text>
                </View>
                {r.qismlar.map((q) => (
                  <View key={q.k}>
                    <View style={styles.jQator}>
                      <View style={styles.jNomQ}>
                        <Ionicons name={QISM_IKON[q.k] || "ellipse-outline"} size={14} color={C.sub} />
                        <Text style={styles.jNom} numberOfLines={1}>{q.nom}</Text>
                      </View>
                      <Text style={styles.jV}>{formatSom(q.qop)}</Text>
                      <Text style={styles.jV}>{formatSom(q.dona)}</Text>
                    </View>
                    {/* Xomashyo tarkibi — har biri o'z ikonkasi bilan */}
                    {q.k === "xomashyo" && ingr.map((m) => {
                      const k = `x:${r.id}:${m.id}`;
                      const qop = getIngNarx(m, mahsulotNarxlari);
                      return (
                        <View key={m.id}>
                          <View style={styles.ingQator}>
                            <View style={styles.jNomQ}>
                              <BosiladiganIkon belgi={false} label={`${m.nom}: ikonkani o'zgartirish`} ochiq={ikonOchiq === k} onPress={() => ikonAlmash(k)}>
                                <XomashyoIkon m={xOl(m)} size={14} color={C.sub} />
                              </BosiladiganIkon>
                              <Text style={styles.ingNom} numberOfLines={1}>{m.nom}</Text>
                            </View>
                            <Text style={styles.ingV}>{formatSom(qop)}</Text>
                            <Text style={styles.ingV}>{r.nonSoni > 0 ? formatSom(qop / r.nonSoni) : "0"}</Text>
                          </View>
                          {xTanlov(k, m)}
                        </View>
                      );
                    })}
                  </View>
                ))}
                <View style={[styles.jQator, styles.jJami]}>
                  <Text style={[styles.jNom, styles.qalin]}>Tannarx</Text>
                  <Text style={[styles.jV, styles.qalin]}>{formatSom(r.qopJami)}</Text>
                  <Text style={[styles.jV, styles.qalin]}>{formatSom(r.dona)}</Text>
                </View>
                <Text style={styles.hint}>1 qopdan foyda: {formatSom(r.qopFoyda)} so'm</Text>
                {!r.nonSoni && <Text style={styles.ogoh}>1 qopdan chiqadigan non soni hisoblanmagan — Assortimentda xomashyo va bitta non xamiri vaznini kiriting.</Text>}
              </>
            ) : (
              <Text style={styles.hint}>Tashqaridan olinadigan non: tannarx = sotib olish narxi ({formatSom(r.dona)} so'm), foyda = sotuv − olish ({formatSom(r.foyda)} so'm).</Text>
            )}

            <Text style={styles.lbl}>Sinov narxi</Text>
            <TextInput
              value={s}
              onChangeText={(v) => setSinov((p) => ({ ...p, [r.id]: v }))}
              keyboardType="numeric"
              placeholder={String(r.narx)}
              placeholderTextColor={C.muted}
              style={styles.input}
            />
            {sf && (
              <View style={styles.sinov}>
                <Text style={styles.sinovTxt}>
                  Foyda: <Text style={[styles.qalin, sf.foyda < 0 && { color: C.red }]}>{formatSom(sf.foyda)} so'm/dona ({foiz(sf.marja)})</Text>
                </Text>
                {sf.qopFoyda != null && <Text style={styles.sinovTxt}>1 qopdan: <Text style={styles.qalin}>{formatSom(sf.qopFoyda)} so'm</Text> ({sf.qopFoyda - r.qopFoyda >= 0 ? "+" : ""}{formatSom(sf.qopFoyda - r.qopFoyda)})</Text>}
              </View>
            )}
          </ExpandableCard>
        );
      })}
    </View>
  );
}

const styles = temaStil(() => StyleSheet.create({
  flex1:    { flex: 1 },
  card:     { marginBottom: S[4] },
  head:     { flexDirection: "row", alignItems: "center", gap: S[2], marginBottom: S[1] },
  headTxt:  { fontSize: T.md, fontWeight: "800", color: C.text },
  yoriq:    { fontSize: T.xs, color: C.sub, lineHeight: 17, marginBottom: S[3] },
  lbl:      { fontSize: T.xs, color: C.sub, fontWeight: "600", marginBottom: 6, marginTop: S[3], letterSpacing: 0.3 },
  input:    { borderWidth: 1, borderColor: C.border, borderRadius: R.md, paddingVertical: 11, paddingHorizontal: 14, fontSize: T.md, color: C.text, backgroundColor: C.surface },
  hint:     { fontSize: 11, color: C.muted, marginTop: S[2], lineHeight: 16 },
  ogoh:     { fontSize: T.xs, color: C.red, marginTop: S[2], fontWeight: "600" },

  item:     { marginBottom: S[3] },
  mHead:    { flexDirection: "row", alignItems: "center", gap: S[3] },
  nom:      { fontSize: T.md, fontWeight: "700", color: C.text },
  izoh:     { fontSize: T.xs, color: C.muted, marginTop: 2 },
  foydaBox: { alignItems: "flex-end" },
  foyda:    { fontSize: T.md, fontWeight: "800", color: C.accent },
  marja:    { fontSize: 11, fontWeight: "700", color: C.sub, marginTop: 1 },

  jadvalBosh:{ flexDirection: "row", paddingBottom: 6 },
  jBosh:    { fontSize: 11, color: C.muted, fontWeight: "800" },
  jQator:   { flexDirection: "row", paddingVertical: 6, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.borderSoft },
  jJami:    { borderTopWidth: 1, borderTopColor: C.border },
  jNom:     { flex: 1, fontSize: T.sm, color: C.sub },
  jNomQ:    { flex: 1, flexDirection: "row", alignItems: "center", gap: 6 },
  ingQator: { flexDirection: "row", alignItems: "center", paddingVertical: 4, paddingLeft: S[4] },
  ingNom:   { flex: 1, fontSize: T.xs, color: C.muted },
  ingV:     { width: 78, textAlign: "right", fontSize: T.xs, color: C.sub },
  nonIkon:  { width: 40, height: 40, borderRadius: R.sm, alignItems: "center", justifyContent: "center", backgroundColor: C.accent + "16", borderWidth: 1, borderColor: C.accent + "26" },
  nonIkonTashqi: { backgroundColor: C.panel, borderColor: C.borderSoft },
  narxNomQ: { flexDirection: "row", alignItems: "center", gap: 6, flexShrink: 1 },
  jV:       { width: 78, textAlign: "right", fontSize: T.sm, color: C.text, fontWeight: "600" },
  qalin:    { fontWeight: "800", color: C.text },
  sinov:    { marginTop: S[2], backgroundColor: C.accent + "0D", borderRadius: R.sm, padding: S[3], gap: 4 },
  sinovTxt: { fontSize: T.sm, color: C.sub },
  narxQator:{ paddingVertical: S[2], borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.borderSoft, marginTop: S[1] },
  narxBosh: { flexDirection: "row", justifyContent: "space-between" },
  narxNom:  { fontSize: T.sm, fontWeight: "800", color: C.text, flexShrink: 1 },
  narxSana: { fontSize: 11, color: C.muted },
  narxQiymat:{ fontSize: T.xs, color: C.sub, marginTop: 2 },
  narxTasir:{ fontSize: T.xs, color: C.text, fontWeight: "700", marginTop: 2 },
}));
