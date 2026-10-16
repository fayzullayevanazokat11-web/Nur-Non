// Davrlar bo'yicha hisob: oylar, hafta kunlari, oylik ish haqi.
// Kunlik hisobotlar 30 kun saqlanadi; eskirganlari "oylikArxiv"ga yig'ma ko'rinishda
// o'tadi (ixcham — telefon xotirasini to'ldirmaydi), shuning uchun oylar bo'yicha
// taqqoslash va oylik ish haqi uzoq muddat ishlaydi.
const son = (x) => parseFloat(x) || 0;

export const oyKaliti = (sana) => String(sana || "").slice(0, 7); // "2026-10"
export const OYLAR_TOLIQ = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"];
export const OYLAR_QISQA = ["Yan", "Fev", "Mar", "Apr", "May", "Iyun", "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek"];
export const oyNomi = (k) => { const [y, m] = String(k).split("-"); return `${OYLAR_TOLIQ[+m - 1] || ""} ${y}`; };
// "2026-10-15" → "15 Oktyabr · Payshanba"
const HAFTA_TOLIQ = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];
export function sanaChiroyli(sana) {
  const [y, m, d] = String(sana || "").split("-").map(Number);
  if (!y || !m || !d) return String(sana || "");
  return `${d} ${OYLAR_TOLIQ[m - 1]} · ${HAFTA_TOLIQ[new Date(y, m - 1, d).getDay()]}`;
}
export const oyQisqa = (k) => OYLAR_QISQA[+String(k).split("-")[1] - 1] || k;

export function oyQosh(k, n) {
  const [y, m] = String(k).split("-").map(Number);
  const d = new Date(y, m - 1 + n, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
export const joriyOy = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; };
export const oyKunlari = (k) => { const [y, m] = String(k).split("-").map(Number); return new Date(y, m, 0).getDate(); };

const BOSH = () => ({ kunlar: 0, daromad: 0, sofFoyda: 0, sotilganNon: 0, ishchiHaq: 0, jamiQop: 0, xarajatJami: 0, ishchilar: {}, idlar: [] });

function qoshHisobot(a, h) {
  a.kunlar += 1;
  a.daromad += son(h.daromad);
  a.sofFoyda += son(h.sofFoyda);
  a.sotilganNon += son(h.sotilganNon);
  a.ishchiHaq += son(h.ishchiHaq);
  a.jamiQop += son(h.jamiQop);
  a.xarajatJami += son(h.xarajatJami);
  (h.ishchiHaqlari || []).forEach((w) => { a.ishchilar[w.id] = (a.ishchilar[w.id] || 0) + son(w.net); });
}

// Eskirgan hisobotlarni arxivga qo'shadi (har bir hisobot faqat bir marta)
export function arxivla(arxiv, hisobotlar) {
  const yangi = { ...(arxiv || {}) };
  (hisobotlar || []).forEach((h) => {
    const k = oyKaliti(h.sana);
    if (!k) return;
    const a = yangi[k] ? { ...yangi[k], ishchilar: { ...yangi[k].ishchilar }, idlar: [...(yangi[k].idlar || [])] } : BOSH();
    if (a.idlar.includes(h.id)) return;
    qoshHisobot(a, h);
    a.idlar.push(h.id);
    yangi[k] = a;
  });
  return yangi;
}

// Oy → yig'ma (arxiv + hali saqlanayotgan kunlik hisobotlar)
export function oylar(hisobotlar, arxiv) {
  const natija = {};
  Object.entries(arxiv || {}).forEach(([k, a]) => { natija[k] = { ...BOSH(), ...a, ishchilar: { ...(a.ishchilar || {}) } }; });
  (hisobotlar || []).forEach((h) => {
    const k = oyKaliti(h.sana);
    if (!k) return;
    if (!natija[k]) natija[k] = BOSH();
    if ((natija[k].idlar || []).includes(h.id)) return;
    qoshHisobot(natija[k], h);
  });
  return natija;
}

// Hafta kunlari bo'yicha o'rtacha (Du..Ya). Qaytaradi: [{ kun, ortacha, soni }]
export const HAFTA = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];
export function haftaKunlari(hisobotlar, kalit) {
  const ol = typeof kalit === "function" ? kalit : (h) => son(h[kalit]);
  const yig = HAFTA.map((kun) => ({ kun, jami: 0, soni: 0 }));
  (hisobotlar || []).forEach((h) => {
    const [y, m, d] = String(h.sana || "").split("-").map(Number);
    if (!y || !m || !d) return;
    const i = (new Date(y, m - 1, d).getDay() + 6) % 7; // Dushanba = 0
    yig[i].jami += ol(h);
    yig[i].soni += 1;
  });
  return yig.map((x) => ({ kun: x.kun, soni: x.soni, ortacha: x.soni ? x.jami / x.soni : 0 }));
}

// Oxirgi n kun va undan oldingi n kun — o'zgarish foizi (ma'lumot yetarli bo'lsa)
export function davrTaqqos(hisobotlar, kalit, n, hozir = new Date()) {
  const ol = typeof kalit === "function" ? kalit : (h) => son(h[kalit]);
  const kunBoshi = new Date(hozir.getFullYear(), hozir.getMonth(), hozir.getDate()).getTime();
  const D = 86400000;
  const sanaMs = (s) => { const [y, m, d] = String(s || "").split("-").map(Number); return y ? new Date(y, m - 1, d).getTime() : NaN; };
  let joriy = 0, oldingi = 0, jSoni = 0, oSoni = 0;
  (hisobotlar || []).forEach((h) => {
    const t = sanaMs(h.sana);
    if (isNaN(t)) return;
    const farq = Math.floor((kunBoshi - t) / D); // 0 = bugun
    if (farq >= 0 && farq < n) { joriy += ol(h); jSoni++; }
    else if (farq >= n && farq < 2 * n) { oldingi += ol(h); oSoni++; }
  });
  if (!jSoni || !oSoni) return null;
  // Kunlik o'rtachalarni taqqoslaymiz — kunlar soni farq qilsa ham adolatli
  const a = joriy / jSoni, b = oldingi / oSoni;
  if (Math.abs(b) < 1) return null;
  return { foiz: Math.round(((a - b) / Math.abs(b)) * 100), joriyOrtacha: a, oldingiOrtacha: b };
}

// ── Oylik ish haqi ──
// Yozuv: { id, ishchiId, tur: "avans" | "jarima" | "bonus" | "tolov", summa, sana, vaqt, izoh }
export const ISH_HAQI_TURLAR = {
  avans:  { nom: "Avans",   ishora: -1, icon: "arrow-down-circle-outline" },
  jarima: { nom: "Jarima",  ishora: -1, icon: "remove-circle-outline" },
  bonus:  { nom: "Bonus",   ishora: +1, icon: "add-circle-outline" },
  tolov:  { nom: "To'lov",  ishora: -1, icon: "checkmark-circle-outline" },
};

// Oy bo'yicha har bir xodim: hisoblangan (yakunlangan kunlar), bonus, avans, jarima, to'langan, qoldiq
export function oylikIshHaqi({ oy, hisobotlar, arxiv, ishchilar, yozuvlar }) {
  const yig = oylar(hisobotlar, arxiv)[oy] || BOSH();
  const kunlar = {};
  (hisobotlar || []).filter((h) => oyKaliti(h.sana) === oy).forEach((h) =>
    (h.ishchiHaqlari || []).forEach((w) => { kunlar[w.id] = (kunlar[w.id] || 0) + 1; }));
  const oyYozuvlari = (yozuvlar || []).filter((y) => oyKaliti(y.sana) === oy);
  const idlar = new Set([
    ...(ishchilar || []).filter((w) => w.holat !== "Ishdan ketgan").map((w) => w.id),
    ...Object.keys(yig.ishchilar || {}).map((x) => (isNaN(+x) ? x : +x)),
    ...oyYozuvlari.map((y) => y.ishchiId),
  ]);
  const list = [...idlar].map((id) => {
    const w = (ishchilar || []).find((x) => String(x.id) === String(id));
    const r = { id, ism: w?.ism || "Xodim", holat: w?.holat, hisoblangan: Math.round(son((yig.ishchilar || {})[id])), kunlar: kunlar[id] || 0, avans: 0, jarima: 0, bonus: 0, tolov: 0, yozuvlar: [] };
    oyYozuvlari.filter((y) => String(y.ishchiId) === String(id)).forEach((y) => {
      if (r[y.tur] != null) r[y.tur] += son(y.summa);
      r.yozuvlar.push(y);
    });
    r.yozuvlar.sort((a, b) => (b.vaqt || 0) - (a.vaqt || 0));
    r.jami = r.hisoblangan + r.bonus - r.jarima;
    r.qoldiq = Math.round(r.jami - r.avans - r.tolov);
    return r;
  }).filter((r) => r.hisoblangan || r.yozuvlar.length || r.holat === "Aktiv" || r.holat === "Ta'tilda");
  list.sort((a, b) => b.jami - a.jami || String(a.ism).localeCompare(String(b.ism)));
  return {
    list,
    jami: list.reduce((s, r) => s + r.jami, 0),
    berilgan: list.reduce((s, r) => s + r.avans + r.tolov, 0),
    qoldiq: list.reduce((s, r) => s + Math.max(0, r.qoldiq), 0),
  };
}
