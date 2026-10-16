// Kunlik hisobotlar statistikasi — davr (7/30 kun) va ko'rsatkich tanlanadi.
//   • Bosh raqam: tanlangan ko'rsatkichning davr bo'yicha jami
//   • Plitkalar: o'rtacha kunlik, eng yaxshi kun, hisobot kunlari
//   • Ustunli grafik: har kun bitta ustun (bitta seriya — afsona shart emas).
//     Foyda va zarar — mavzuning ikki qarama-qarshi rangi, nol chizig'idan o'sadi.
//     Ustun bosilsa — sana va qiymat yuqorida ko'rsatiladi.
//   • Non turlari bo'yicha ishlab chiqarilgan qoplar
// Har bir mavzu ranglari validator bilan tekshirilgan (dataviz: lightness, chroma, CVD, kontrast — PASS).
import { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Pressable, Animated, Easing, StyleSheet, LayoutAnimation } from "react-native";
import { C, T, S, R, temaStil } from "../theme";
import { formatSom } from "../logic/hisob";

// Grafik ranglari joriy mavzudan: C.musbat (foyda) va C.manfiy (zarar — qarama-qarshi qutb)
const H = 168;             // grafik balandligi

const OYLAR = ["Yan", "Fev", "Mar", "Apr", "May", "Iyun", "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek"];
const sanaQisqa = (s) => { const [, m, d] = (s || "").split("-"); return d ? `${+d} ${OYLAR[+m - 1] || ""}` : s; };

// Ixcham son: 1 250 000 → "1,3 mln", 125 000 → "125 ming"
export function ixcham(n) {
  const x = Math.round(Number(n) || 0);
  const a = Math.abs(x);
  const ishora = x < 0 ? "−" : "";
  const kasr = (v) => (v >= 10 ? String(Math.round(v)) : String(Math.round(v * 10) / 10).replace(".", ","));
  if (a >= 1e9) return `${ishora}${kasr(a / 1e9)} mlrd`;
  if (a >= 1e6) return `${ishora}${kasr(a / 1e6)} mln`;
  if (a >= 1e3) return `${ishora}${kasr(a / 1e3)} ming`;
  return `${ishora}${a}`;
}

const KORSATKICHLAR = [
  { k: "sofFoyda", nom: "Sof foyda", birlik: "so'm", ol: (h) => parseFloat(h.sofFoyda) || 0 },
  { k: "kunOxiri", nom: "Kun oxiri", birlik: "so'm", ol: (h) => (parseFloat(h.daromad) || 0) - (parseFloat(h.ishchiHaq) || 0) },
  { k: "daromad",  nom: "Daromad",   birlik: "so'm", ol: (h) => parseFloat(h.daromad) || 0 },
  { k: "sotilgan", nom: "Sotilgan non", birlik: "dona", ol: (h) => parseFloat(h.sotilganNon) || 0 },
];
const DAVRLAR = [{ k: 7, nom: "7 kun" }, { k: 30, nom: "30 kun" }];

const silliq = () => LayoutAnimation.configureNext(LayoutAnimation.create(220, LayoutAnimation.Types.easeInEaseOut, LayoutAnimation.Properties.opacity));
const qiymatMatni = (v, birlik) => (birlik === "so'm" ? `${formatSom(v)} so'm` : `${formatSom(v)} ${birlik}`);

export function Statistika({ hisobotlar, nonlar }) {
  const [davr, setDavr] = useState(30);
  const [korK, setKorK] = useState("sofFoyda");
  const [tanlangan, setTanlangan] = useState(null);
  const [kenglik, setKenglik] = useState(0);
  const kor = KORSATKICHLAR.find((x) => x.k === korK);

  // Davrdagi hisobotlar — sana bo'yicha eskidan yangiga
  const kunlar = useMemo(() => {
    const chegara = new Date(); chegara.setHours(0, 0, 0, 0); chegara.setDate(chegara.getDate() - (davr - 1));
    return [...(hisobotlar || [])]
      .filter((h) => h.sana && new Date(h.sana + "T00:00:00") >= chegara)
      .sort((a, b) => (a.sana < b.sana ? -1 : a.sana > b.sana ? 1 : 0));
  }, [hisobotlar, davr]);

  const qiymatlar = kunlar.map(kor.ol);
  const jami = qiymatlar.reduce((s, v) => s + v, 0);
  const ortacha = qiymatlar.length ? jami / qiymatlar.length : 0;
  const engYaxshiI = qiymatlar.length ? qiymatlar.indexOf(Math.max(...qiymatlar)) : -1;

  // Tanlangan ustun — sukut bo'yicha oxirgi kun
  useEffect(() => { setTanlangan(null); }, [davr, korK]);
  const tI = tanlangan != null && tanlangan < qiymatlar.length ? tanlangan : qiymatlar.length - 1;

  // O'sish animatsiyasi (ko'rsatkich/davr o'zgarganda qayta)
  const osish = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    osish.setValue(0);
    Animated.timing(osish, { toValue: 1, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [davr, korK, kunlar.length, osish]);

  // Masshtab: nol chizig'i har doim ko'rinadi
  const max = Math.max(0, ...qiymatlar);
  const min = Math.min(0, ...qiymatlar);
  const oraliq = max - min || 1;
  const nolY = (max / oraliq) * H;
  const n = qiymatlar.length;
  const slot = n ? kenglik / n : 0;
  const ustunEni = Math.max(3, Math.min(24, slot - 2)); // ≤24px, 2px sirt oralig'i

  // Non turlari bo'yicha qoplar (davr jami)
  const nonQoplar = useMemo(() => {
    const m = new Map();
    kunlar.forEach((h) => {
      (h.nonlarSnapshot || nonlar || []).forEach((nn) => {
        if (nn.ozIshlab === false) return;
        const q = parseInt((h.ozIshlabQoplar || {})[nn.id]) || 0;
        if (q > 0) m.set(nn.nom, (m.get(nn.nom) || 0) + q);
      });
    });
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [kunlar, nonlar]);
  const maxQop = nonQoplar.length ? nonQoplar[0][1] : 1;

  return (
    <View>
      {/* Filtrlar — bitta qatorda */}
      <View style={styles.filtrQator}>
        <View style={styles.seg}>
          {DAVRLAR.map((d) => (
            <Pressable key={d.k} onPress={() => { silliq(); setDavr(d.k); }} style={[styles.segBtn, davr === d.k && styles.segBtnActive]}>
              <Text style={[styles.segTxt, davr === d.k && styles.segTxtActive]}>{d.nom}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <View style={styles.chips}>
        {KORSATKICHLAR.map((x) => (
          <Pressable key={x.k} onPress={() => { silliq(); setKorK(x.k); }} style={[styles.chip, korK === x.k && styles.chipActive]}>
            <Text style={[styles.chipTxt, korK === x.k && styles.chipTxtActive]}>{x.nom}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.karta}>
        {/* Bosh raqam */}
        <Text style={styles.heroLbl}>{kor.nom} · {davr} kun jami</Text>
        <Text style={styles.hero} numberOfLines={1} adjustsFontSizeToFit>
          {formatSom(jami)}<Text style={styles.heroBirlik}> {kor.birlik}</Text>
        </Text>

        <View style={styles.plitkalar}>
          <Plitka nom="O'rtacha kunlik" qiymat={ixcham(ortacha)} />
          <Plitka nom="Eng yaxshi kun" qiymat={engYaxshiI >= 0 ? sanaQisqa(kunlar[engYaxshiI].sana) : "—"} />
          <Plitka nom="Hisobot kunlari" qiymat={String(n)} />
        </View>

        {n === 0 ? (
          <Text style={styles.bosh}>Bu davrda hisobot yo'q.</Text>
        ) : (
          <>
            {/* Tanlangan kun ko'rsatkichi (bosish bilan o'zgaradi) */}
            <View style={styles.oqish}>
              <View style={[styles.oqishNuqta, { backgroundColor: qiymatlar[tI] < 0 ? C.manfiy : C.musbat }]} />
              <Text style={styles.oqishSana}>{sanaQisqa(kunlar[tI]?.sana)}</Text>
              <Text style={styles.oqishQiymat}>{qiymatMatni(qiymatlar[tI], kor.birlik)}</Text>
            </View>

            <View style={styles.grafikQator}>
              {/* Y o'qi: maksimum, nol, minimum */}
              <View style={[styles.yOq, { height: H }]}>
                <Text numberOfLines={1} style={[styles.yTxt, { top: -7 }]}>{ixcham(max)}</Text>
                {min < 0 && max > 0 && <Text numberOfLines={1} style={[styles.yTxt, { top: nolY - 7 }]}>0</Text>}
                <Text numberOfLines={1} style={[styles.yTxt, { top: H - 7 }]}>{ixcham(min)}</Text>
              </View>

              <View style={styles.flex1} onLayout={(e) => setKenglik(e.nativeEvent.layout.width)}>
                <View style={{ height: H }}>
                  <View style={[styles.grid, { top: 0 }]} />
                  <View style={[styles.grid, { top: H - 1 }]} />
                  <View style={[styles.nolChiziq, { top: Math.min(H - 1, Math.max(0, nolY - 0.5)) }]} />
                  <View style={styles.ustunlar}>
                    {qiymatlar.map((v, i) => {
                      const h = (Math.abs(v) / oraliq) * H;
                      const musbat = v >= 0;
                      const faol = i === tI;
                      return (
                        <Pressable
                          key={kunlar[i].id || i}
                          accessibilityLabel={`${kunlar[i].sana}: ${qiymatMatni(v, kor.birlik)}`}
                          onPress={() => setTanlangan(i)}
                          style={[styles.slot, { width: slot }]}
                        >
                          <Animated.View
                            style={[
                              styles.ustun,
                              {
                                width: ustunEni,
                                height: osish.interpolate({ inputRange: [0, 1], outputRange: [0, Math.max(h, v !== 0 ? 2 : 0)] }),
                                backgroundColor: musbat ? C.musbat : C.manfiy,
                                opacity: faol ? 1 : 0.55,
                              },
                              musbat
                                ? { bottom: H - nolY, borderTopLeftRadius: 4, borderTopRightRadius: 4 }
                                : { top: nolY, borderBottomLeftRadius: 4, borderBottomRightRadius: 4 },
                            ]}
                          />
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
                {/* X o'qi: birinchi va oxirgi sana */}
                <View style={styles.xOq}>
                  <Text style={styles.xTxt}>{sanaQisqa(kunlar[0].sana)}</Text>
                  {n > 1 && <Text style={styles.xTxt}>{sanaQisqa(kunlar[n - 1].sana)}</Text>}
                </View>
              </View>
            </View>
          </>
        )}
      </View>

      {nonQoplar.length > 0 && (
        <View style={styles.karta}>
          <Text style={styles.bolimNom}>Non turlari bo'yicha · {davr} kun</Text>
          {nonQoplar.map(([nom, q]) => (
            <View key={nom} style={styles.nonQator}>
              <Text style={styles.nonNom} numberOfLines={1}>{nom}</Text>
              <View style={styles.nonTrek}>
                <View style={[styles.nonBar, { width: `${Math.max(4, (q / maxQop) * 100)}%` }]} />
              </View>
              <Text style={styles.nonQiymat}>{q} qop</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function Plitka({ nom, qiymat }) {
  return (
    <View style={styles.plitka}>
      <Text style={styles.plitkaNom} numberOfLines={1}>{nom}</Text>
      <Text style={styles.plitkaQiymat} numberOfLines={1}>{qiymat}</Text>
    </View>
  );
}

const styles = temaStil(() => StyleSheet.create({
  flex1:      { flex: 1 },
  filtrQator: { flexDirection: "row", marginBottom: S[2] },
  seg:        { flexDirection: "row", backgroundColor: C.panel, borderRadius: R.pill, padding: 3 },
  segBtn:     { paddingVertical: 7, paddingHorizontal: 16, borderRadius: R.pill },
  segBtnActive: { backgroundColor: C.accent },
  segTxt:     { fontSize: T.xs, fontWeight: "700", color: C.sub },
  segTxtActive: { color: C.onAccent },
  chips:      { flexDirection: "row", flexWrap: "wrap", gap: S[2], marginBottom: S[3] },
  chip:       { paddingVertical: 7, paddingHorizontal: 13, borderRadius: R.pill, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface },
  chipActive: { backgroundColor: C.text, borderColor: C.text },
  chipTxt:    { fontSize: T.xs, fontWeight: "700", color: C.sub },
  chipTxtActive: { color: C.onAccent },

  karta:      { backgroundColor: C.card, borderRadius: R.lg, borderWidth: StyleSheet.hairlineWidth, borderColor: C.borderSoft, padding: S[4], marginBottom: S[4] },
  heroLbl:    { fontSize: T.xs, color: C.sub, fontWeight: "700" },
  hero:       { fontSize: 44, fontWeight: "700", color: C.text, letterSpacing: -1, marginTop: 2 },
  heroBirlik: { fontSize: T.md, fontWeight: "600", color: C.sub, letterSpacing: 0 },
  plitkalar:  { flexDirection: "row", gap: S[2], marginTop: S[3], marginBottom: S[4] },
  plitka:     { flex: 1, backgroundColor: C.surface, borderRadius: R.md, paddingVertical: S[2], paddingHorizontal: S[3], borderWidth: StyleSheet.hairlineWidth, borderColor: C.borderSoft },
  plitkaNom:  { fontSize: 10, color: C.muted, fontWeight: "700" },
  plitkaQiymat: { fontSize: T.md, color: C.text, fontWeight: "800", marginTop: 2 },
  bosh:       { fontSize: T.sm, color: C.muted },

  oqish:      { flexDirection: "row", alignItems: "center", gap: S[2], marginBottom: S[3] },
  oqishNuqta: { width: 10, height: 10, borderRadius: 5 },
  oqishSana:  { fontSize: T.sm, color: C.sub, fontWeight: "700" },
  oqishQiymat:{ fontSize: T.sm, color: C.text, fontWeight: "800", marginLeft: "auto" },

  grafikQator:{ flexDirection: "row", gap: S[2] },
  yOq:        { width: 56 },
  yTxt:       { position: "absolute", right: 0, fontSize: 10, color: C.muted, fontWeight: "600" },
  grid:       { position: "absolute", left: 0, right: 0, height: 1, backgroundColor: C.borderSoft },
  nolChiziq:  { position: "absolute", left: 0, right: 0, height: 1, backgroundColor: C.border },
  ustunlar:   { ...StyleSheet.absoluteFillObject, flexDirection: "row" },
  slot:       { height: "100%", alignItems: "center" },
  ustun:      { position: "absolute" },
  xOq:        { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  xTxt:       { fontSize: 10, color: C.muted, fontWeight: "600" },

  bolimNom:   { fontSize: T.sm, color: C.text, fontWeight: "800", marginBottom: S[3] },
  nonQator:   { flexDirection: "row", alignItems: "center", gap: S[2], marginBottom: S[2] },
  nonNom:     { width: 104, fontSize: T.xs, color: C.sub, fontWeight: "600" },
  nonTrek:    { flex: 1, height: 10, borderRadius: 5, backgroundColor: C.panel, overflow: "hidden" },
  nonBar:     { height: "100%", borderRadius: 5, backgroundColor: C.musbat },
  nonQiymat:  { width: 52, textAlign: "right", fontSize: T.xs, color: C.text, fontWeight: "700" },
}));
