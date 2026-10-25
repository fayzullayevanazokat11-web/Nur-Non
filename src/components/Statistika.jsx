// Kunlik hisobotlar statistikasi — davr (7/30 kun) va ko'rsatkich tanlanadi.
//   • Bosh raqam: tanlangan ko'rsatkichning davr bo'yicha jami
//   • Plitkalar: o'rtacha kunlik, eng yaxshi kun, hisobot kunlari
//   • Ustunli grafik: har kun bitta ustun (bitta seriya — afsona shart emas).
//     Foyda va zarar — mavzuning ikki qarama-qarshi rangi, nol chizig'idan o'sadi.
//     Ustun bosilsa — sana va qiymat yuqorida ko'rsatiladi.
//   • Non turlari bo'yicha ishlab chiqarilgan qoplar
// Har bir mavzu ranglari validator bilan tekshirilgan (dataviz: lightness, chroma, CVD, kontrast — PASS).
import { useEffect, useMemo, useRef, useState } from "react";
import { useTiklash } from "./useTiklash";
import { View, Text, Pressable, Animated, Easing, StyleSheet, LayoutAnimation, Alert } from "react-native";
import { C, T, S, R, temaStil } from "../theme";
import { Ionicons } from "@expo/vector-icons";
import { formatSom, ishKuni } from "../logic/hisob";
import { oylar, oyQisqa, oyNomi, joriyOy, oyQosh, haftaKunlari, davrTaqqos } from "../logic/davr";
import { davrHtml, pdfUlash } from "../logic/ulashish";
import { OylikMaqsad } from "./OylikMaqsad";

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
  // oy: oylik yig'madan (arxiv + kunlik) shu ko'rsatkichni olish
  { k: "sofFoyda", nom: "Sof foyda", birlik: "so'm", ol: (h) => parseFloat(h.sofFoyda) || 0, oy: (a) => a.sofFoyda },
  { k: "kunOxiri", nom: "Kun oxiri", birlik: "so'm", ol: (h) => (parseFloat(h.daromad) || 0) - (parseFloat(h.ishchiHaq) || 0), oy: (a) => a.daromad - a.ishchiHaq },
  { k: "daromad",  nom: "Daromad",   birlik: "so'm", ol: (h) => parseFloat(h.daromad) || 0, oy: (a) => a.daromad },
  { k: "sotilgan", nom: "Sotilgan non", birlik: "dona", ol: (h) => parseFloat(h.sotilganNon) || 0, oy: (a) => a.sotilganNon },
];
const DAVRLAR = [{ k: 7, nom: "7 kun" }, { k: 30, nom: "30 kun" }];

const silliq = () => LayoutAnimation.configureNext(LayoutAnimation.create(220, LayoutAnimation.Types.easeInEaseOut, LayoutAnimation.Properties.opacity));
const qiymatMatni = (v, birlik) => (birlik === "so'm" ? `${formatSom(v)} so'm` : `${formatSom(v)} ${birlik}`);

export function Statistika({ hisobotlar, nonlar, arxiv, akkaunt }) {
  const [davr, setDavr] = useState(30);
  const [korK, setKorK] = useState("sofFoyda");
  const [tanlangan, setTanlangan] = useState(null);
  useTiklash(() => setTanlangan(null));
  const [kenglik, setKenglik] = useState(0);
  const kor = KORSATKICHLAR.find((x) => x.k === korK);

  // Davrdagi hisobotlar — sana bo'yicha eskidan yangiga
  const kunlar = useMemo(() => {
    const chegara = ishKuni(); chegara.setDate(chegara.getDate() - (davr - 1)); // ish kuni (03:00 gacha — kecha)
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

  // O'tgan shuncha kunga nisbatan (kunlik o'rtacha) — ma'lumot yetarli bo'lsa
  const taqqos = useMemo(() => davrTaqqos(hisobotlar, kor.ol, davr), [hisobotlar, kor, davr]);

  // Oylar: oxirgi 6 oy (joriy oy — hali tugamagan)
  const oyMalumot = useMemo(() => {
    const m = oylar(hisobotlar, arxiv);
    const j = joriyOy();
    return [-5, -4, -3, -2, -1, 0].map((i) => {
      const k = oyQosh(j, i);
      const a = m[k];
      return { k, qiymat: a ? kor.oy(a) : 0, kunlar: a ? a.kunlar : 0 };
    }).filter((x, i, arr) => x.kunlar > 0 || i === arr.length - 1);
  }, [hisobotlar, arxiv, kor]);
  const oyMax = Math.max(1, ...oyMalumot.map((x) => Math.abs(x.qiymat)));
  const buOy = oyMalumot[oyMalumot.length - 1];
  const otganOy = oyMalumot.length > 1 ? oyMalumot[oyMalumot.length - 2] : null;
  const oyFoiz = buOy?.kunlar && otganOy?.kunlar && otganOy.k === oyQosh(buOy.k, -1)
    ? (() => { const a = buOy.qiymat / buOy.kunlar, b = otganOy.qiymat / otganOy.kunlar; return Math.abs(b) >= 1 ? Math.round(((a - b) / Math.abs(b)) * 100) : null; })()
    : null;

  // Hafta kunlari bo'yicha o'rtacha (barcha saqlangan kunlik hisobotlar)
  const hafta = useMemo(() => haftaKunlari(hisobotlar, kor.ol), [hisobotlar, kor]);
  const haftaMax = Math.max(1, ...hafta.map((x) => Math.abs(x.ortacha)));
  const engHafta = hafta.reduce((b, x, i) => (x.soni && (b < 0 || x.ortacha > hafta[b].ortacha) ? i : b), -1);

  const ulash = () => pdfUlash(davrHtml({ hisobotlar: kunlar, kunlar: davr, akkaunt }), `nur-non-${davr}-kun`)
    .catch(() => Alert.alert("Xatolik", "PDF tayyorlab bo'lmadi."));

  return (
    <View>
      <OylikMaqsad />
      {/* Filtrlar — bitta qatorda */}
      <View style={styles.filtrQator}>
        <View style={styles.seg}>
          {DAVRLAR.map((d) => (
            <Pressable key={d.k} onPress={() => { silliq(); setDavr(d.k); }} style={[styles.segBtn, davr === d.k && styles.segBtnActive]}>
              <Text style={[styles.segTxt, davr === d.k && styles.segTxtActive]}>{d.nom}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.flex1} />
        {n > 0 && (
          <Pressable accessibilityLabel="Davr hisobotini PDF qilib ulashish" onPress={ulash} hitSlop={6} style={({ pressed }) => [styles.ulashBtn, pressed && { opacity: 0.7 }]}>
            <Ionicons name="document-outline" size={15} color={C.accent} />
            <Text style={styles.ulashTxt}>PDF</Text>
          </Pressable>
        )}
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
        {taqqos && (
          <View style={styles.trend}>
            <Ionicons name={taqqos.foiz >= 0 ? "trending-up" : "trending-down"} size={14} color={taqqos.foiz >= 0 ? C.accent : C.sub} />
            <Text style={styles.trendTxt}>
              <Text style={styles.trendFoiz}>{taqqos.foiz > 0 ? "+" : ""}{taqqos.foiz}%</Text> oldingi {davr} kunga nisbatan (kunlik o'rtacha)
            </Text>
          </View>
        )}

        <View style={styles.plitkalar}>
          <Plitka nom="O'rtacha kunlik" qiymat={ixcham(ortacha)} birinchi />
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

      {/* OYLAR */}
      {oyMalumot.some((x) => x.kunlar > 0) && (
        <View style={styles.karta}>
          <View style={styles.bolimBosh}>
            <Text style={[styles.bolimNom, styles.flex1]}>Oylar bo'yicha · {kor.nom.toLowerCase()}</Text>
          </View>
          {oyFoiz != null && (
            <Text style={styles.oyIzoh}>
              {oyNomi(buOy.k)}: kunlik o'rtacha <Text style={styles.trendFoiz}>{oyFoiz > 0 ? "+" : ""}{oyFoiz}%</Text> o'tgan oyga nisbatan
            </Text>
          )}
          {oyMalumot.map((x, i) => {
            const joriy = i === oyMalumot.length - 1;
            return (
              <View key={x.k} style={styles.nonQator}>
                <Text style={[styles.oyNom, joriy && styles.qalin]} numberOfLines={1}>{oyQisqa(x.k)}</Text>
                <View style={styles.nonTrek}>
                  <View style={[styles.nonBar, { width: `${x.qiymat ? Math.max(3, (Math.abs(x.qiymat) / oyMax) * 100) : 0}%`, backgroundColor: x.qiymat < 0 ? C.manfiy : C.musbat, opacity: joriy ? 1 : 0.6 }]} />
                </View>
                <Text style={[styles.oyQiymat, joriy && styles.qalin]} numberOfLines={1}>{ixcham(x.qiymat)}</Text>
              </View>
            );
          })}
          <Text style={styles.oyIzohKichik}>Oxirgi qator — joriy oy (hali tugamagan).</Text>
        </View>
      )}

      {/* HAFTA KUNLARI */}
      {engHafta >= 0 && (
        <View style={styles.karta}>
          <Text style={styles.bolimNom}>Hafta kunlari · kunlik o'rtacha</Text>
          {hafta.map((x, i) => (
            <View key={x.kun} style={styles.nonQator}>
              <Text style={[styles.oyNom, i === engHafta && styles.qalin]}>{x.kun}</Text>
              <View style={styles.nonTrek}>
                <View style={[styles.nonBar, { width: `${x.soni ? Math.max(3, (Math.abs(x.ortacha) / haftaMax) * 100) : 0}%`, backgroundColor: x.ortacha < 0 ? C.manfiy : C.musbat, opacity: i === engHafta ? 1 : 0.6 }]} />
              </View>
              <Text style={[styles.oyQiymat, i === engHafta && styles.qalin]}>{x.soni ? ixcham(x.ortacha) : "—"}</Text>
            </View>
          ))}
          <Text style={styles.oyIzohKichik}>Eng yaxshi kun: {["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba", "Yakshanba"][engHafta]}</Text>
        </View>
      )}

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

// Ko'rsatkichlar bitta oq panelda, ustunlar ingichka chiziq bilan ajraladi
function Plitka({ nom, qiymat, birinchi }) {
  return (
    <View style={[styles.plitka, !birinchi && styles.plitkaAjrat]}>
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
  plitkalar:  { flexDirection: "row", marginTop: S[3], marginBottom: S[4], backgroundColor: C.surface, borderRadius: R.md, borderWidth: StyleSheet.hairlineWidth, borderColor: C.borderSoft, overflow: "hidden" },
  plitka:     { flex: 1, paddingVertical: S[2], paddingHorizontal: S[3] },
  plitkaAjrat:{ borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: C.borderSoft },
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
  ulashBtn:   { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 7, paddingHorizontal: 12, borderRadius: R.pill, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface },
  ulashTxt:   { fontSize: T.xs, fontWeight: "800", color: C.accent },
  trend:      { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  trendTxt:   { fontSize: T.xs, color: C.sub, flexShrink: 1 },
  trendFoiz:  { fontWeight: "800", color: C.text },
  bolimBosh:  { flexDirection: "row", alignItems: "center" },
  oyIzoh:     { fontSize: T.xs, color: C.sub, marginTop: -S[1], marginBottom: S[3] },
  oyIzohKichik: { fontSize: 11, color: C.muted, marginTop: S[1], lineHeight: 15 },
  oyNom:      { width: 44, fontSize: T.xs, color: C.sub, fontWeight: "600" },
  oyQiymat:   { width: 64, textAlign: "right", fontSize: T.xs, color: C.text, fontWeight: "600" },
  qalin:      { fontWeight: "800", color: C.text },
}));
