// Qarzlar mantig'i: qisman to'lovlar, qarzdorlar bo'yicha guruhlash, tarix.
// Qarz yozuvi: { id, ism, sana, vaqt, savat, summa, chegirma, izoh,
//               tolangan, tolanganVaqt, tolovlar: [{ id, summa, vaqt, sana }] }
import { bugunSana } from "./hisob";

const son = (x) => parseFloat(x) || 0;
const ikki = (n) => String(n).padStart(2, "0");
const soatMatni = (ms) => { const d = new Date(ms); return `${ikki(d.getHours())}:${ikki(d.getMinutes())}`; };

// Ism bo'yicha bir xil qarzdor (katta-kichik harf va ortiqcha bo'shliq farq qilmaydi)
export const qarzdorKaliti = (ism) => String(ism || "").trim().replace(/\s+/g, " ").toLowerCase();

export const tolovlarJami = (q) => (q.tolovlar || []).reduce((s, t) => s + son(t.summa), 0);

// To'langan qism: to'liq yopilgan bo'lsa — butun summa
export const qarzTolangan = (q) => (q.tolangan ? son(q.summa) : Math.min(son(q.summa), tolovlarJami(q)));
export const qarzQoldiq = (q) => Math.max(0, son(q.summa) - qarzTolangan(q));

// Qarzdorlar ro'yxati — qoldig'i borlar avval (kattasidan), keyin to'liq to'laganlar
export function qarzdorlar(qarzlar) {
  const map = new Map();
  [...(qarzlar || [])].sort((a, b) => (a.vaqt || 0) - (b.vaqt || 0)).forEach((q) => {
    const k = qarzdorKaliti(q.ism);
    if (!k) return;
    if (!map.has(k)) map.set(k, { kalit: k, ism: q.ism.trim(), qarzlar: [], olgan: 0, tolagan: 0, qoldiq: 0, enEskiFaol: null, oxirgi: 0 });
    const g = map.get(k);
    g.ism = q.ism.trim(); // oxirgi yozilishi
    g.qarzlar.push(q);
    g.olgan += son(q.summa);
    g.tolagan += qarzTolangan(q);
    const qol = qarzQoldiq(q);
    g.qoldiq += qol;
    if (qol > 0 && g.enEskiFaol == null) g.enEskiFaol = q.vaqt || Date.parse(q.sana) || Date.now();
    g.oxirgi = Math.max(g.oxirgi, q.vaqt || 0, q.tolanganVaqt || 0, ...(q.tolovlar || []).map((t) => t.vaqt || 0));
  });
  return [...map.values()].sort((a, b) => (b.qoldiq > 0) - (a.qoldiq > 0) || b.qoldiq - a.qoldiq || b.oxirgi - a.oxirgi);
}

// Qarzdor tarixi (yangi → eski): qarz olishlar va to'lovlar.
// Bitta to'lov bir nechta qarzga bo'lingan bo'lsa — bitta qator bo'lib ko'rinadi.
export function qarzdorTarixi(guruh) {
  const v = [];
  const tolovlar = new Map(); // vaqt → yig'ma to'lov
  (guruh?.qarzlar || []).forEach((q) => {
    v.push({ tur: "qarz", key: `q${q.id}`, qarzId: q.id, vaqt: q.vaqt || Date.parse(q.sana) || 0, sana: q.sana, soat: q.soat || "", summa: son(q.summa), savat: q.savat || [], izoh: q.izoh, chegirma: son(q.chegirma) });
    (q.tolovlar || []).forEach((t) => {
      const k = t.vaqt || t.id;
      if (!tolovlar.has(k)) {
        const y = { tur: "tolov", key: `t${t.id}`, vaqt: t.vaqt || 0, sana: t.sana, soat: t.vaqt ? soatMatni(t.vaqt) : "", summa: 0, qismlar: [] };
        tolovlar.set(k, y);
        v.push(y);
      }
      const y = tolovlar.get(k);
      y.summa += son(t.summa);
      y.qismlar.push({ qarzId: q.id, tolovId: t.id });
    });
    // Eski usulda (qisman to'lovlarsiz) yopilgan qarz — qolgan qism bitta to'lov sifatida
    const qolgan = son(q.summa) - tolovlarJami(q);
    if (q.tolangan && qolgan > 0.5) {
      v.push({ tur: "tolov", key: `y${q.id}`, qarzId: q.id, vaqt: q.tolanganVaqt || q.vaqt || 0, summa: qolgan, eski: true });
    }
  });
  return v.sort((a, b) => b.vaqt - a.vaqt);
}

// To'lov qarzdorning eng eski ochiq qarzlaridan boshlab taqsimlanadi (FIFO).
// Qaytaradi: yangi qarzlar ro'yxati. Summa umumiy qoldiqdan oshmasligi kerak.
export function tolovQil(qarzlar, kalit, summa, vaqt = Date.now()) {
  let qoldi = Math.round(son(summa));
  const ochiqlar = (qarzlar || [])
    .filter((q) => qarzdorKaliti(q.ism) === kalit && qarzQoldiq(q) > 0)
    .sort((a, b) => (a.vaqt || 0) - (b.vaqt || 0))
    .map((q) => q.id);
  const sana = bugunSana();
  let n = 0;
  return (qarzlar || []).map((q) => {
    if (qoldi <= 0 || !ochiqlar.includes(q.id)) return q;
    const qol = qarzQoldiq(q);
    const tolov = Math.min(qol, qoldi);
    qoldi -= tolov;
    const tolovlar = [...(q.tolovlar || []), { id: vaqt + n++, summa: tolov, vaqt, sana }];
    const yopildi = tolov >= qol - 0.5;
    return { ...q, tolovlar, tolangan: yopildi, tolanganVaqt: yopildi ? vaqt : null };
  });
}

// To'lovni bekor qilish (barcha qismlari bilan) — qarz(lar) yana ochiladi
export function tolovniBekorQil(qarzlar, qismlar) {
  const olib = new Map();
  (qismlar || []).forEach(({ qarzId, tolovId }) => { if (!olib.has(qarzId)) olib.set(qarzId, new Set()); olib.get(qarzId).add(tolovId); });
  return (qarzlar || []).map((q) => {
    if (!olib.has(q.id)) return q;
    const tolovlar = (q.tolovlar || []).filter((t) => !olib.get(q.id).has(t.id));
    const yopiq = tolovlar.reduce((s, t) => s + son(t.summa), 0) >= son(q.summa) - 0.5;
    return { ...q, tolovlar, tolangan: yopiq, tolanganVaqt: yopiq ? q.tolanganVaqt : null };
  });
}

// Necha kundan beri to'lanmagan
export const kunOtdi = (ms, hozir = Date.now()) => Math.max(0, Math.floor((hozir - (ms || hozir)) / 86400000));
