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

// Bitta nondan qoladigan foyda: o'zimizniki → narx − (1 qop xomashyo / non soni);
// tashqaridan → tashqariFoyda (to'g'ridan kiritilgan).
export function donaFoyda(non, narxlar) {
  if (non.ozIshlab === false) return parseFloat(non.tashqariFoyda) || 0;
  const son = parseFloat(non.nonSoni) || 0;
  if (son <= 0) return 0;
  return Math.round((parseFloat(non.narx) || 0) - getQopTannarx(non, narxlar) / son);
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

// Kunlik ko'rsatkichlar (sof foyda, sotilgan, qop).
// Partiyaviy inventarizatsiya: boshlangichQoldiq (kechagi) + bugungi ishlab chiqarish
// − sotilganlar − qoldaYaroqsiz = ertangi qoldiq (sotilmaganNon).
// FIFO: jami sonda nazarda tutiladi (boshlang -> ishlab tartibida sotilganlar).
export function hisoblaKunlik({
  nonlar = [], ishchilar = [], ozIshlabQoplar = {}, tashqariSonlar = {},
  sotilmaganNon = {}, optomlar = [], qarzlar = [], mahsulotNarxlari = {}, braklar = [],
  boshlangichQoldiq = {}, qoldaYaroqsiz = {},
}) {
  const diverted = divertedByNon(optomlar, qarzlar);
  let jamiNon = 0, jamiQop = 0, jamiBoshlang = 0, jamiQoldiq = 0, jamiYaroqsiz = 0;
  let daromad = 0, xomashyo = 0;

  nonlar.forEach((non) => {
    const norma = parseFloat(non.nonSoni) || 0;
    const narx = parseFloat(non.narx) || 0;
    const boshlang = parseInt(boshlangichQoldiq[non.id]) || 0;
    const yaroqsiz = parseInt(qoldaYaroqsiz[non.id]) || 0;
    const qoldiq = parseInt(sotilmaganNon[non.id]) || 0; // kun oxiri qoldiq = ertangi boshlang'ich
    const divertedShu = diverted[non.nom] || 0;
    jamiBoshlang += boshlang;
    jamiQoldiq += qoldiq;
    jamiYaroqsiz += yaroqsiz;

    if (non.ozIshlab !== false) {
      const qopSoni = parseInt(ozIshlabQoplar[non.id]) || 0;
      const ishlab = qopSoni * norma;
      jamiQop += qopSoni; jamiNon += ishlab;
      // Sotilgan retail = umumiy zaxira − chiqimlar (yaroqsiz, qoldiq, diverted)
      const retailSold = Math.max(0, boshlang + ishlab - yaroqsiz - qoldiq - divertedShu);
      daromad += retailSold * narx;
      const qopTannarx = getQopTannarx(non, mahsulotNarxlari);
      const perBreadCost = norma > 0 ? qopTannarx / norma : 0;
      // Bugungi xomashyo: faqat bugun pishirilgan qop (kechagi qoldiq tannarxi kecha hisoblangan).
      // Diverted (optom/qarz) tannarxi alohida hisoblanadi — kunlikdan ayirib qo'yiladi.
      xomashyo += qopSoni * qopTannarx - Math.min(divertedShu, ishlab) * perBreadCost;
    } else {
      const olingan = parseInt(tashqariSonlar[non.id]) || 0;
      jamiNon += olingan;
      const retailSold = Math.max(0, boshlang + olingan - yaroqsiz - qoldiq - divertedShu);
      daromad += retailSold * narx;
      const tannarx = Math.max(0, narx - (parseFloat(non.tashqariFoyda) || 2000));
      xomashyo += (olingan - Math.min(divertedShu, olingan)) * tannarx;
    }
  });

  const haq = ishchiHaqlari(nonlar, ishchilar, ozIshlabQoplar, braklar);
  const ishchiHaq = haq.jami;
  const brakAyirma = haq.list.reduce((s, x) => s + (x.gross - x.net), 0);

  const malumotBor = jamiQop > 0 || jamiNon > 0 || jamiBoshlang > 0;
  const sofFoyda = malumotBor ? Math.round(daromad - xomashyo - ishchiHaq) : 0;
  // Bugun sotilgan jami (retail + diverted), boshlang va ishlab dan
  const sotilganNon = Math.max(0, jamiBoshlang + jamiNon - jamiQoldiq - jamiYaroqsiz);

  return {
    sofFoyda, jamiNon, jamiQop, sotilganNon,
    jamiBoshlang, jamiQoldiq, jamiYaroqsiz,
    daromad: Math.round(daromad), xomashyo: Math.round(xomashyo),
    ishchiHaq: Math.round(ishchiHaq), brakAyirma: Math.round(brakAyirma),
  };
}

// Har non uchun partiyaviy zaxira tafsiloti: boshlang + ishlab − sotilgan − yaroqsiz − qoldiq.
// FIFO ko'rinishi (boshlang avval, keyin bugungi). Sotilgan tafsiloti: avval boshlang,
// keyin ishlab partiyasidan ketadi.
export function qoldiqlarHisobi(nonlar, { boshlangichQoldiq = {}, ozIshlabQoplar = {}, tashqariSonlar = {}, qoldaYaroqsiz = {}, sotilmaganNon = {}, optomlar = [], qarzlar = [] } = {}) {
  const diverted = divertedByNon(optomlar, qarzlar);
  return (nonlar || []).map((non) => {
    const norma = parseFloat(non.nonSoni) || 0;
    const oz = non.ozIshlab !== false;
    const boshlang = parseInt(boshlangichQoldiq[non.id]) || 0;
    const ishlab = oz ? (parseInt(ozIshlabQoplar[non.id]) || 0) * norma : (parseInt(tashqariSonlar[non.id]) || 0);
    const yaroqsiz = parseInt(qoldaYaroqsiz[non.id]) || 0;
    const qoldiq = parseInt(sotilmaganNon[non.id]) || 0;
    const divertedShu = diverted[non.nom] || 0;
    const jamiZaxira = boshlang + ishlab;
    const jamiSotilgan = Math.max(0, jamiZaxira - yaroqsiz - qoldiq); // retail + diverted
    const retailSold = Math.max(0, jamiSotilgan - divertedShu);
    // FIFO: avval boshlang partiyasidan ketadi
    const boshlangdanSotilgan = Math.min(boshlang, jamiSotilgan);
    const ishlabdanSotilgan = jamiSotilgan - boshlangdanSotilgan;
    return {
      id: non.id, nom: non.nom, oz,
      boshlang, ishlab, yaroqsiz, qoldiq, divertedShu,
      jamiZaxira, jamiSotilgan, retailSold,
      boshlangdanSotilgan, ishlabdanSotilgan,
    };
  });
}

// Ishchi haqi hisoblanadimi: faqat Aktiv bo'lsa hisoblanadi.
// Ta'tilda bo'lsa kunlik ish haqi umuman hisoblanmaydi.
export function ishchiHisoblanadi(w) {
  if (!w) return false;
  return w.holat === "Aktiv";
}

// Har bir ishchining kunlik haqi taqsimoti (kunlik yoki qop bo'yicha) + brak ayirmasi.
// Ta'tildagi ishchi umuman hisoblanmaydi.
// Qaytaradi: { list: [{ id, ism, haqTuri, gross, brak, net, detal:[{nom,qop,summa}] }], jami }
export function ishchiHaqlari(nonlar, ishchilar, ozIshlabQoplar = {}, braklar = []) {
  const list = [];
  (ishchilar || []).filter((w) => ishchiHisoblanadi(w)).forEach((w) => {
    let gross = 0;
    const detal = [];
    if (w.haqTuri === "qop") {
      (nonlar || []).filter((n) => n.ozIshlab !== false).forEach((n) => {
        if (!(w.nonTurlari || []).includes(n.nom)) return;
        const qop = parseInt((ozIshlabQoplar || {})[n.id]) || 0;
        if (qop <= 0) return;
        const rate = parseFloat((w.nonNarxlari || {})[n.nom]) || 0;
        const s = qop * rate;
        if (s > 0) { gross += s; detal.push({ nom: n.nom, qop, summa: Math.round(s) }); }
      });
    } else {
      gross = parseFloat(w.miqdor) || 0;
    }
    const brak = (braklar || []).filter((b2) => b2.ishchiId === w.id).reduce((s, b2) => s + (parseFloat(b2.summa) || 0), 0);
    const net = Math.max(0, gross - brak);
    if (gross > 0 || brak > 0) {
      list.push({ id: w.id, ism: w.ism, haqTuri: w.haqTuri || "kunlik", gross: Math.round(gross), brak: Math.round(brak), net: Math.round(net), detal });
    }
  });
  return { list, jami: list.reduce((s, x) => s + x.net, 0) };
}

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
export function omborBalans(omborlar, maydonlar = OMBOR_MAYDONLAR) {
  const balans = {};
  maydonlar.forEach((m) => { balans[m.id] = { ...m, qiymat: 0 }; });
  (omborlar || []).forEach((h) =>
    (h.maydonlar || []).forEach((m) => { if (balans[m.id]) balans[m.id].qiymat += parseFloat(m.qiymat) || 0; }));
  return Object.values(balans);
}

// Kunlik qop hisobidan kelib chiqadigan xomashyo sarfi (xomashyo ro'yxatidagi mahsulotlar).
// Retsept birligi g/ml → ombor bazasi kg/litr (1000 ga bo'linadi).
// Natija: [{ id, nom, emoji, birlik, qiymat }] — qiymat = ketadigan miqdor (baza birlikda).
export function kunlikXomashyoSarfi(nonlar, ozIshlabQoplar, maydonlar = OMBOR_MAYDONLAR) {
  const agg = {};
  (nonlar || []).forEach((n) => {
    if (n.ozIshlab === false) return;
    const qop = parseFloat((ozIshlabQoplar || {})[n.id]) || 0;
    if (qop <= 0) return;
    (n.mahsulotlar || []).forEach((m) => {
      const om = maydonlar.find((x) => x.id === m.id);
      if (!om) return; // faqat xomashyo ro'yxatidagi mahsulotlar
      const miq = (parseFloat(m.miqdor) || 0) * qop;
      if (!agg[m.id]) agg[m.id] = { id: m.id, nom: om.nom, emoji: om.emoji, birlik: om.birlik, qiymat: 0 };
      agg[m.id].qiymat += miq / 1000;
    });
  });
  return Object.values(agg).filter((x) => x.qiymat > 0);
}

// Faol (to'lanmagan) qarzlar jami
export function qarzJami(qarzlar) {
  const faol = (qarzlar || []).filter((q) => !q.tolangan);
  return { soni: faol.length, summa: faol.reduce((s, q) => s + (parseFloat(q.summa) || 0), 0) };
}

// Optom savdolar jami
export function optomJami(optomlar) {
  const list = optomlar || [];
  return { soni: list.length, summa: list.reduce((s, o) => s + (parseFloat(o.summa) || 0), 0) };
}

// Karta to'lovlari jami
export function kartaJami(kartalar) {
  const list = kartalar || [];
  return {
    soni: list.length,
    summa: list.reduce((s, k) => s + (parseFloat(k.summa) || 0), 0),
    sofFoyda: list.reduce((s, k) => s + (parseFloat(k.sofFoyda) || 0), 0),
  };
}

// Karta to'lovi: o'rtacha non narxi asosida ~nechta non chiqadi va undan sof foyda.
// (o'zimiz ishlab chiqaradigan nonlarning o'rtacha narxi va o'rtacha bitta non tannarxi)
export function kartaHisob(summa, nonlar, mahsulotNarxlari) {
  const oz = (nonlar || []).filter(
    (n) => n.ozIshlab !== false && parseFloat(n.narx) > 0 && parseFloat(n.nonSoni) > 0
  );
  if (oz.length === 0 || !summa) return { dona: 0, sofFoyda: 0, avgNarx: 0 };
  const avgNarx = oz.reduce((s, n) => s + parseFloat(n.narx), 0) / oz.length;
  const avgTannarx = oz.reduce((s, n) => s + getQopTannarx(n, mahsulotNarxlari) / parseFloat(n.nonSoni), 0) / oz.length;
  const dona = avgNarx > 0 ? Math.round(summa / avgNarx) : 0;
  const sofFoyda = Math.round(summa - dona * avgTannarx);
  return { dona, sofFoyda, avgNarx: Math.round(avgNarx) };
}

// So'm formatlash (Hermes Intl'ga bog'liq emas)
export function formatSom(n) {
  const x = Math.round(Number(n) || 0);
  const s = Math.abs(x).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return (x < 0 ? "-" : "") + s;
}
