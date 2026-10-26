// "Bugungi davomat" — Markazda turadi (avval Xodimlar bo'limida edi). Kelgan xodim «Keldi» deb belgilanadi,
// kechiksa kelgan vaqti yoziladi; ismi tagidagi qator bosilsa — bugungi ishi (boshqa lavozim, haq turi,
// kimning o'rniga). Belgilanmagan xodimga bugungi haq hisoblanmaydi.
import { useEffect, useState } from "react";
import { View, Text, Pressable, TextInput, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useApp } from "../store/AppData";
import { ExpandableCard } from "./ExpandableCard";
import { useTiklash } from "./useTiklash";
import { formatSom, sonOl, kunRoliBilan, ishchiHaqlari } from "../logic/hisob";
import { LAVOZIMLAR, getLavozimLabel } from "../logic/konstantalar";
import { C, T, S, R, temaStil } from "../theme";

// ochKaliti — qiymati o'zgarsa karta ochiladi (Kunlik vazifadan bosilganda); onOchildi — ochilganda
export function DavomatKarta({ ochKaliti, onOchildi, style }) {
  const { ishchilar, nonlar, kelmaganlar, keldiAlmash, kelishVaqti, kelishVaqtiQoy, kunlikRol, kunlikRolQoy, kelmaslikIzohi, kelmaslikIzohQoy } = useApp();
  const [ochiqRol, setOchiqRol] = useState(null); // "Bugungi ishi" ochiq xodim
  useTiklash(() => setOchiqRol(null));
  const hammaAktiv = (ishchilar || []).filter((w) => w.holat === "Aktiv");
  if (!hammaAktiv.length) return null;
  const keldi = hammaAktiv.filter((w) => !kelmaganlar.includes(w.id)).length;
  return (
    <ExpandableCard
      id="davomat"
      style={[styles.karta, style]}
      ochKaliti={ochKaliti}
      onOchildi={onOchildi}
      header={
        <View style={styles.bosh}>
          <View style={styles.boshIkon}><Ionicons name="people-outline" size={20} color={C.accent} /></View>
          <View style={styles.flex1}>
            <Text style={styles.boshNom}>Bugungi davomat</Text>
            <Text style={[styles.boshIzoh, keldi === 0 && { color: C.red }]} numberOfLines={1}>
              {keldi === 0 ? `0/${hammaAktiv.length} keldi — belgilanmagan, haq hisoblanmayapti` : `${keldi}/${hammaAktiv.length} keldi`}
            </Text>
          </View>
          <Text style={styles.davomatSoni}>{keldi}/{hammaAktiv.length}</Text>
        </View>
      }
    >
      {hammaAktiv.map((w) => {
        const kelmadi = kelmaganlar.includes(w.id);
        const rol = kunlikRol[w.id];
        return (
          <View key={w.id} style={styles.davomatQator}>
           <View style={styles.davomatUst}>
            <View style={styles.flex1}>
              <Text style={[styles.davomatIsm, kelmadi && styles.davomatKelmadi]} numberOfLines={1}>{w.ism}</Text>
              {!kelmadi && (
                <Pressable accessibilityRole="button" accessibilityLabel={`${w.ism}: bugungi ishi`} onPress={() => setOchiqRol(ochiqRol === w.id ? null : w.id)} hitSlop={6}>
                  <Text style={[styles.rolQator, rol && styles.rolOzgargan]} numberOfLines={2}>{rolMatni(w, rol, ishchilar)} ▾</Text>
                </Pressable>
              )}
            </View>
            {!kelmadi && <KelishVaqti ism={w.ism} qiymat={kelishVaqti[w.id] || ""} onSaqla={(v) => kelishVaqtiQoy(w.id, v)} />}
            <Pressable
              accessibilityRole="switch"
              accessibilityState={{ checked: !kelmadi }}
              accessibilityLabel={`${w.ism}: davomat`}
              onPress={() => { if (!kelmadi && ochiqRol === w.id) setOchiqRol(null); keldiAlmash(w.id); }}
              hitSlop={6}
              style={({ pressed }) => [styles.davomatBelgi, kelmadi ? styles.belgiYoq : styles.belgiHa, pressed && { opacity: 0.7 }]}
            >
              <Ionicons name={kelmadi ? "close" : "checkmark"} size={13} color={kelmadi ? C.sub : C.onAccent} />
              <Text style={[styles.belgiTxt, !kelmadi && { color: C.onAccent }]}>{kelmadi ? "Kelmadi" : "Keldi"}</Text>
            </Pressable>
           </View>
            {/* Kelmagan xodim — sababi (ixtiyoriy izoh) */}
            {kelmadi && (
              <IzohMaydon ism={w.ism} qiymat={kelmaslikIzohi[w.id] || ""} onSaqla={(v) => kelmaslikIzohQoy(w.id, v)} />
            )}
            {!kelmadi && ochiqRol === w.id && (
              <BugungiIsh w={w} rol={rol} ishchilar={ishchilar} nonlar={nonlar} boshqalar={hammaAktiv.filter((x) => x.id !== w.id && kelmaganlar.includes(x.id))} onQoy={(patch) => kunlikRolQoy(w.id, patch)} />
            )}
          </View>
        );
      })}
      <Text style={styles.davomatIzoh}>Kelgan xodimni «Keldi» deb belgilang. Vaqt yozilmasa — vaqtida kelgan hisoblanadi (kechiksa, masalan 0730 → 07:30). Belgilanmagan xodimga bugungi haq hisoblanmaydi. Bugun boshqa ishda yoki kimningdir o'rniga ishlasa — ismi tagidagi qatorni bosing.</Text>
    </ExpandableCard>
  );
}

// Kelgan vaqt — qo'lda kiritiladi ("0730" → "07:30"); noto'g'ri vaqt saqlanmaydi
const soatTozala = (v) => {
  const r = String(v || "").replace(/\D/g, "").slice(0, 4);
  return r.length > 2 ? `${r.slice(0, 2)}:${r.slice(2)}` : r;
};
const soatTogri = (v) => /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
// Davomatdagi qisqa satr: bugungi lavozim · haq · kimning o'rniga
const haqMatni = (w) => {
  if (w.haqTuri !== "qop") return `${formatSom(w.miqdor)} so'm`;
  if (w.kunRol?.haqTuri !== "qop") return "qop bo'yicha";
  const narxlar = [...new Set(Object.values(w.nonNarxlari || {}).filter((v) => v > 0))];
  return narxlar.length === 1 ? `${formatSom(narxlar[0])} so'm/qop` : narxlar.length ? "qop bo'yicha (non turiga qarab)" : "qop bo'yicha";
};
function rolMatni(w, rol, ishchilar) {
  const e = kunRoliBilan(w, rol);
  const orniga = rol?.orniga ? (ishchilar || []).find((x) => x.id === rol.orniga)?.ism : "";
  return [getLavozimLabel(e), haqMatni(e), orniga ? `${orniga} o'rniga` : ""].filter(Boolean).join(" · ");
}

// Xodimning bugungi ishi: boshqa lavozim (o'sha kungi haq bilan) va/yoki kimningdir o'rniga.
// Haq yozilmasa — o'zining odatdagi haqi (kimningdir o'rniga ishlasa ham — o'ziniki).
function BugungiIsh({ w, rol, ishchilar, nonlar, boshqalar, onQoy }) {
  const { ozIshlabQoplar } = useApp();
  const [haq, setHaq] = useState(rol?.haq != null ? String(rol.haq) : "");
  const lavozim = rol?.lavozimId || w.lavozimId;
  // Haq turi: sukut — o'zining turi. "Qop bo'yicha" tanlansa: kimning o'rniga bo'lsa o'sha odamning
  // nonlari, bo'lmasa o'zining (yoki barcha o'zimiz pishiradigan) nonlari qoplariga ko'payadi.
  const haqTuri = rol?.haqTuri || (w.haqTuri === "qop" ? "qop" : "kunlik");
  const turlarOl = (ornigaId) => {
    const o = (ishchilar || []).find((x) => x.id === ornigaId);
    if (o?.haqTuri === "qop" && (o.nonTurlari || []).length) return o.nonTurlari;
    if (w.haqTuri === "qop" && (w.nonTurlari || []).length) return w.nonTurlari;
    return (nonlar || []).filter((n) => n.ozIshlab !== false).map((n) => n.nom);
  };
  // Bugungi qoplar bo'yicha jonli hisob
  const samarali = kunRoliBilan(w, rol);
  const bugungi = ishchiHaqlari(nonlar, [samarali], ozIshlabQoplar).list[0];
  const qopSoni = samarali.haqTuri === "qop"
    ? (nonlar || []).filter((n) => n.ozIshlab !== false && (samarali.nonTurlari || []).includes(n.nom)).reduce((s, n) => s + (parseInt((ozIshlabQoplar || {})[n.id]) || 0), 0)
    : 0;
  const turBoyicha = (bugungi?.detal || []).length > 1
    ? bugungi.detal.map((d) => `${d.nom}: ${d.qop} qop`).join(", ")
    : null;
  const preview = samarali.haqTuri === "qop"
    ? `Bugun: ${turBoyicha || `${qopSoni} qop${sonOl(rol?.haq) && rol?.haqTuri === "qop" ? ` × ${formatSom(sonOl(rol.haq))}` : ""}`} = ${formatSom(bugungi?.gross || 0)} so'm (qop soniga qarab o'zgaradi)`
    : `Bugun: ${formatSom(bugungi?.gross || 0)} so'm (qop soniga bog'liq emas)`;
  const tanlov = LAVOZIMLAR.filter((l) => l.id !== "boshqasi" || w.lavozimId === "boshqasi");
  return (
    <View style={styles.rolPanel}>
      <Text style={styles.rolSarlavha}>Bugungi lavozimi</Text>
      <View style={styles.rolChiplar}>
        {tanlov.map((l) => {
          const faol = lavozim === l.id;
          return (
            <Pressable key={l.id} accessibilityLabel={`${w.ism}: bugun ${l.label}`} onPress={() => onQoy({ lavozimId: l.id === w.lavozimId ? null : l.id })} style={[styles.rolChip, faol && styles.rolChipFaol]}>
              <Text style={[styles.rolChipTxt, faol && styles.rolChipTxtFaol]}>{l.id === "boshqasi" ? getLavozimLabel(w) : l.label}{l.id === w.lavozimId ? " (asosiy)" : ""}</Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.rolSarlavha}>Bugungi haqi</Text>
      <View style={styles.rolChiplar}>
        {[["kunlik", "Kunlik summa"], ["qop", "Qop bo'yicha"]].map(([k, l]) => {
          const faol = haqTuri === k;
          return (
            <Pressable key={k} accessibilityLabel={`${w.ism}: haq ${l}`} onPress={() => onQoy(k === "qop" ? { haqTuri: "qop", nonTurlari: turlarOl(rol?.orniga) } : { haqTuri: "kunlik", nonTurlari: null })} style={[styles.rolChip, faol && styles.rolChipFaol]}>
              <Text style={[styles.rolChipTxt, faol && styles.rolChipTxtFaol]}>{l}</Text>
            </Pressable>
          );
        })}
      </View>
      {haqTuri === "qop" && (rol?.nonTurlari || []).length > 1 ? (
        // Bir nechta non turi — har biriga alohida 1 qop narxi
        (rol.nonTurlari || []).map((nom) => {
          const o = (ishchilar || []).find((x) => x.id === rol?.orniga);
          const asl = sonOl((o?.nonNarxlari || w.nonNarxlari || {})[nom]);
          return (
            <View key={nom} style={styles.turNarxQator}>
              <Text style={styles.turNarxNom} numberOfLines={1}>{nom}</Text>
              <TextInput
                accessibilityLabel={`${w.ism}: ${nom} qop narxi`}
                defaultValue={rol?.nonNarxlari?.[nom] ? String(rol.nonNarxlari[nom]) : ""}
                onChangeText={(v) => { const t = v.replace(/[^\d]/g, ""); onQoy({ nonNarxlari: { ...(rol?.nonNarxlari || {}), [nom]: t ? Number(t) : 0 } }); }}
                placeholder={asl ? `${o ? o.ism.split(" ")[0] + "da" : "odatda"}: ${formatSom(asl)}` : "1 qop uchun so'm"}
                placeholderTextColor={C.muted}
                keyboardType="number-pad"
                style={[styles.rolInput, styles.turNarxInput]}
              />
            </View>
          );
        })
      ) : (
      <TextInput
        accessibilityLabel={`${w.ism}: bugungi haq`}
        value={haq}
        onChangeText={(v) => { const t = v.replace(/[^\d]/g, ""); setHaq(t); onQoy({ haq: t ? Number(t) : null }); }}
        placeholder={haqTuri === "qop" ? "1 qop uchun so'm (bo'sh — o'zining)" : (w.haqTuri === "qop" ? "Kunlik summa (so'm)" : `Bo'sh — o'zining: ${formatSom(w.miqdor)}`)}
        placeholderTextColor={C.muted}
        keyboardType="number-pad"
        style={styles.rolInput}
      />
      )}
      <Text style={styles.rolPreview}>{preview}</Text>
      {boshqalar.length > 0 && (
        <>
          <Text style={styles.rolSarlavha}>Kimning o'rniga</Text>
          <View style={styles.rolChiplar}>
            {[{ id: null, ism: "Hech kim" }, ...boshqalar].map((x) => {
              const faol = (rol?.orniga || null) === x.id;
              return (
                <Pressable key={String(x.id)} accessibilityLabel={`${w.ism}: o'rniga ${x.ism}`} onPress={() => onQoy({
                  orniga: x.id,
                  // O'rniga ishlasa — o'sha odamning ishini qiladi (lavozim qo'lda tanlanmagan bo'lsa)
                  ...(x.id && !rol?.lavozimId && x.lavozimId !== w.lavozimId ? { lavozimId: x.lavozimId } : {}),
                  ...(haqTuri === "qop" && rol?.haqTuri === "qop" ? { nonTurlari: turlarOl(x.id) } : {}),
                })} style={[styles.rolChip, faol && styles.rolChipFaol]}>
                  <Text style={[styles.rolChipTxt, faol && styles.rolChipTxtFaol]}>{x.ism}</Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.rolIzoh}>Kimningdir o'rniga ishlasa ham — o'zining haqini oladi (yuqorida boshqacha yozilmasa). Qop bo'yicha tanlansa — o'sha odam yopadigan nonlar qoplariga ko'payadi.</Text>
        </>
      )}
      {rol && (
        <Pressable accessibilityRole="button" onPress={() => { setHaq(""); onQoy(null); }} hitSlop={6} style={styles.rolQaytar}>
          <Ionicons name="refresh-outline" size={13} color={C.sub} />
          <Text style={styles.rolQaytarTxt}>Odatdagi holatga qaytarish</Text>
        </Pressable>
      )}
    </View>
  );
}

// Kelmaganlik sababi: yozilgan zahoti saqlanadi (kasal, ta'tilda, oilaviy...)
function IzohMaydon({ ism, qiymat, onSaqla }) {
  const [matn, setMatn] = useState(qiymat);
  useEffect(() => { setMatn(qiymat); }, [qiymat]);
  return (
    <TextInput
      accessibilityLabel={`${ism}: kelmaganlik sababi`}
      value={matn}
      onChangeText={(v) => { setMatn(v); onSaqla(v); }}
      placeholder="Sababi (ixtiyoriy): kasal, oilaviy..."
      placeholderTextColor={C.muted}
      style={styles.izohInput}
    />
  );
}

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
      placeholder="Vaqtida"
      placeholderTextColor={C.muted}
      keyboardType="number-pad"
      maxLength={5}
      style={[styles.kelishInput, soatTogri(matn) && styles.kelishTayyor, xato && styles.kelishXato]}
    />
  );
}


const styles = temaStil(() => StyleSheet.create({
  karta:     { marginBottom: S[4] },
  izohInput: { marginTop: 6, borderWidth: 1, borderColor: C.borderSoft, borderRadius: R.sm, paddingVertical: 7, paddingHorizontal: 10, fontSize: 12, color: C.text, backgroundColor: C.surface },
  flex1:     { flex: 1 },
  bosh:      { flexDirection: "row", alignItems: "center", gap: S[3] },
  boshIkon:  { width: 40, height: 40, borderRadius: R.sm, alignItems: "center", justifyContent: "center", backgroundColor: C.accent + "14" },
  boshNom:   { fontSize: T.md, fontWeight: "800", color: C.text },
  boshIzoh:  { fontSize: 11, fontWeight: "600", color: C.muted, marginTop: 2 },
  davomatSoni:{ fontSize: T.xs, fontWeight: "800", color: C.accent },
  davomatQator:{ paddingVertical: S[2], borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.borderSoft },
  davomatUst:{ flexDirection: "row", alignItems: "center" },
  rolQator: { fontSize: 11, color: C.muted, fontWeight: "600", marginTop: 2, marginRight: S[2] },
  rolOzgargan:{ color: C.accent, fontWeight: "800" },
  rolPanel: { marginTop: S[2], backgroundColor: C.panel, borderRadius: R.md, padding: S[3] },
  rolSarlavha:{ fontSize: 11, fontWeight: "800", color: C.sub, letterSpacing: 0.3, marginBottom: 6, marginTop: 4 },
  rolChiplar:{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: S[2] },
  rolChip:  { paddingVertical: 6, paddingHorizontal: 10, borderRadius: R.pill, backgroundColor: C.surface, borderWidth: 1, borderColor: C.borderSoft },
  rolChipFaol:{ backgroundColor: C.accent, borderColor: C.accent },
  rolChipTxt:{ fontSize: 12, fontWeight: "700", color: C.sub },
  rolChipTxtFaol:{ color: C.onAccent },
  rolInput: { borderWidth: 1, borderColor: C.border, borderRadius: R.md, paddingVertical: 9, paddingHorizontal: 12, fontSize: T.sm, color: C.text, backgroundColor: C.surface, marginBottom: S[2] },
  rolIzoh:  { fontSize: 11, color: C.muted, lineHeight: 15 },
  turNarxQator:{ flexDirection: "row", alignItems: "center", gap: S[2] },
  turNarxNom:{ width: 110, fontSize: 12, fontWeight: "700", color: C.text },
  turNarxInput:{ flex: 1 },
  rolPreview:{ fontSize: 12, fontWeight: "800", color: C.accent, marginBottom: S[2] },
  rolQaytar:{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: S[2], alignSelf: "flex-start" },
  rolQaytarTxt:{ fontSize: 12, fontWeight: "700", color: C.sub },
  davomatIsm:{ fontSize: T.sm, fontWeight: "700", color: C.text },
  davomatKelmadi:{ color: C.muted, textDecorationLine: "line-through" },
  davomatBelgi:{ flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 5, paddingHorizontal: 10, borderRadius: R.pill },
  belgiHa:   { backgroundColor: C.accent },
  belgiYoq:  { backgroundColor: C.panel },
  belgiTxt:  { fontSize: 11, fontWeight: "800", color: C.sub },
  davomatIzoh:{ fontSize: 11, color: C.muted, marginTop: S[2] },
  kelishInput:{ width: 74, marginRight: S[2], borderWidth: 1, borderColor: C.border, borderRadius: R.sm, paddingVertical: 6, paddingHorizontal: 6, fontSize: T.sm, fontWeight: "800", color: C.text, backgroundColor: C.surface, textAlign: "center" },
  kelishTayyor:{ borderColor: C.accent, color: C.accent },
  kelishXato:{ borderColor: C.red },
}));
