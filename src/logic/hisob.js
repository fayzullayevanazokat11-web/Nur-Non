// Sof biznes mantiq (React/UI yo'q). Eski App111.jsx hisob-kitoblari 1:1 ko'chirilgan.
import { HISOBOT_UN_IDLAR, OMBOR_MAYDONLAR } from "./konstantalar";

// ── Ingredient va tannarx ──
export function getIngNarx(m, narxlar) {
  const p = narxlar?.[m.id];
  if (p && p.miqdor && p.narx && m.miqdor)
    return Math.round((parseFloat(m.miqdor) / parseFloat(p.miqdor)) * parseFloat(p.narx));
  return parseFloat(m.narx) || 0;
}

export function getQopTannarx(non, narxlar) {
  return (non.mahsulotlar || []).reduce((s, m) => s + getIngNarx(m, narxlar), 0);
}

// Bugun optom/qarz orqali ketgan nonlar (kunlik hisobdan ayriladi)
function divertedByNon(optomlar, qarzlar) {
  const bugun = new Date().toISOString().split("T")[0];
  const map = {};
  (optomlar || []).filter((o) => o.sana === bugun).forEach((o) =>
    (o.savat || []).forEach((s) => { map[s.nonNomi] = (map[s.nonNomi] || 0) + (s.soni || 0); }));
  (qarzlar || []).filter((q) => q.sana === bugun).forEach((q) => {
    const savat = q.savat || [{ nonNomi: q.nonNomi, soni: q.soni }];
    savat.forEach((s) => { map[s.nonNomi] = (map[s.nonNomi] || 0) + (s.soni || 0); });
  });
  return map;
}

// Kunlik ko'rsatkichlar (sof foyda, sotilgan, qop)
export function hisoblaKunlik({
  nonlar = [], ishchilar = [], ozIshlabQoplar = {}, tashqariSonlar = {},
  sotilmaganNon = {}, optomlar = [], qarzlar = [], mahsulotNarxlari = {},
}) {
  const diverted = divertedByNon(optomlar, qarzlar);
  let jamiNon = 0, jamiQop = 0, jamiSotilmagan = 0, daromad = 0, xomashyo = 0;

  nonlar.forEach((non) => {
    const norma = parseFloat(non.nonSoni) || 0;
    const narx = parseFloat(non.narx) || 0;
    const sotilmaganShu = parseInt(sotilmaganNon[non.id]) || 0;
    const divertedShu = diverted[non.nom] || 0;
    jamiSotilmagan += sotilmaganShu;

    if (non.ozIshlab !== false) {
      const qopSoni = parseInt(ozIshlabQoplar[non.id]) || 0;
      const ishlab = qopSoni * norma;
      jamiQop += qopSoni; jamiNon += ishlab;
      const retailSold = Math.max(0, ishlab - sotilmaganShu - divertedShu);
      daromad += retailSold * narx;
      const perBreadCost = norma > 0 ? getQopTannarx(non, mahsulotNarxlari) / norma : 0;
      xomashyo += qopSoni * getQopTannarx(non, mahsulotNarxlari)
        - Math.min(divertedShu, ishlab) * perBreadCost;
    } else {
      const olingan = parseInt(tashqariSonlar[non.id]) || 0;
      jamiNon += olingan;
      const retailSold = Math.max(0, olingan - sotilmaganShu - divertedShu);
      daromad += retailSold * narx;
      const tannarx = Math.max(0, narx - (parseFloat(non.tashqariFoyda) || 2000));
      xomashyo += (olingan - Math.min(divertedShu, olingan)) * tannarx;
    }
  });

  let ishchiHaq = 0;
  nonlar.filter((n) => n.ozIshlab !== false).forEach((non) => {
    const qopSoni = parseInt(ozIshlabQoplar[non.id]) || 0;
    if (qopSoni <= 0) return;
    (ishchilar || [])
      .filter((w) => w.holat === "Aktiv" && w.haqTuri === "qop" && (w.nonTurlari || []).includes(non.nom))
      .forEach((w) => { ishchiHaq += qopSoni * (parseFloat((w.nonNarxlari || {})[non.nom]) || parseFloat(w.miqdor) || 0); });
  });
  (ishchilar || [])
    .filter((w) => w.holat === "Aktiv" && w.haqTuri === "kunlik")
    .forEach((w) => { ishchiHaq += parseFloat(w.miqdor) || 0; });

  const malumotBor = jamiQop > 0 || jamiNon > 0;
  const sofFoyda = malumotBor ? Math.round(daromad - xomashyo - ishchiHaq) : 0;
  const sotilganNon = Math.max(0, jamiNon - jamiSotilmagan);

  return { sofFoyda, jamiNon, jamiQop, sotilganNon };
}

// ── Ombor birliklari ──
// un → qop (50 kg), yog' → plastik quti (5 litr). Baza birligi kg/litr.
export function omborKattaBirlik(id) {
  if (HISOBOT_UN_IDLAR.includes(id)) return { birlik: "qop", faktor: 50 };
  if (id === "yog") return { birlik: "plastik quti", faktor: 5 };
  return null;
}

// "63 qop 23 kg" / "53 plastik quti 3 litr" ko'rinishida matn
export function zaxiraMatni(id, qiymat, bazaBirlik) {
  const katta = omborKattaBirlik(id);
  const manfiy = qiymat < 0;
  const abs = Math.abs(qiymat);
  const pref = manfiy ? "−" : "";
  const son = (x) => (x >= 100 ? formatSom(x) : x >= 1 ? +x.toFixed(1) : +x.toFixed(2));
  if (!katta) return abs === 0 ? `0 ${bazaBirlik}` : `${pref}${son(abs)} ${bazaBirlik}`;
  if (abs === 0) return `0 ${katta.birlik}`;
  const kattaSon = Math.floor(abs / katta.faktor);
  const qoldiq = +(abs - kattaSon * katta.faktor).toFixed(1);
  if (kattaSon > 0 && qoldiq > 0) return `${pref}${kattaSon} ${katta.birlik} ${qoldiq} ${bazaBirlik}`;
  if (kattaSon > 0) return `${pref}${kattaSon} ${katta.birlik}`;
  return `${pref}${qoldiq} ${bazaBirlik}`;
}

// Ombor balansi: set kirimlari − ayirish chiqimlari
export function omborBalans(omborlar) {
  const balans = {};
  OMBOR_MAYDONLAR.forEach((m) => { balans[m.id] = { ...m, qiymat: 0 }; });
  (omborlar || []).forEach((h) =>
    (h.maydonlar || []).forEach((m) => { if (balans[m.id]) balans[m.id].qiymat += parseFloat(m.qiymat) || 0; }));
  return Object.values(balans);
}

// So'm formatlash (Hermes Intl'ga bog'liq emas)
export function formatSom(n) {
  const x = Math.round(Number(n) || 0);
  const s = Math.abs(x).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return (x < 0 ? "-" : "") + s;
}
