// Ma'lumotlarni uzatish — butun baza bitta matnga (va qaytib bazaga) aylanadi.
// Matn ko'rinishi:
//   NUR-NON MA'LUMOTLARI
//   Akkaunt: <nom> · 16.10.2026 14:30
//   NURNON1:<siqilgan kod>
// Kod — JSON'ning lz-string bilan siqilgan base64 shakli: qisqa, messenjerlarda
// buzilmaydi (faqat lotin harf/raqam). Bo'shliq va qator ko'chishlari e'tiborsiz.
import LZString from "lz-string";

const BELGI = "NURNON1:";
const ikki = (n) => String(n).padStart(2, "0");

export const sanaVaqt = (ms) => {
  const d = new Date(ms || Date.now());
  return `${ikki(d.getDate())}.${ikki(d.getMonth() + 1)}.${d.getFullYear()} ${ikki(d.getHours())}:${ikki(d.getMinutes())}`;
};

export function matngaAylantir(paket) {
  const kod = LZString.compressToBase64(JSON.stringify(paket));
  const sarlavha = `NUR-NON MA'LUMOTLARI\nAkkaunt: ${paket.akkaunt || "—"} · ${sanaVaqt(paket.vaqt)}`;
  return `${sarlavha}\n${BELGI}${kod}`;
}

// Matndan paketni o'qiydi. Natija: { ok: true, paket } yoki { ok: false, xato }
export function matndanOqi(matn) {
  const s = String(matn || "").trim();
  if (!s) return { ok: false, xato: "Matn bo'sh" };
  let json = null;
  const i = s.indexOf(BELGI);
  if (i >= 0) {
    const kod = s.slice(i + BELGI.length).replace(/\s+/g, "");
    try { json = LZString.decompressFromBase64(kod); } catch { json = null; }
    if (!json) return { ok: false, xato: "Kod to'liq emas yoki buzilgan. Matnni oxirigacha nusxalang." };
  } else if (s.includes("{")) {
    // Siqilmagan JSON ham qabul qilinadi
    json = s.slice(s.indexOf("{"), s.lastIndexOf("}") + 1);
  } else {
    return { ok: false, xato: "Bu Nur-Non ma'lumotlari emas" };
  }
  let paket;
  try { paket = JSON.parse(json); } catch { return { ok: false, xato: "Kod to'liq emas yoki buzilgan. Matnni oxirigacha nusxalang." }; }
  if (!paket || typeof paket !== "object" || paket.ilova !== "nur-non" || !paket.data || typeof paket.data !== "object" || Array.isArray(paket.data)) {
    return { ok: false, xato: "Bu Nur-Non ma'lumotlari emas" };
  }
  if (paket.v && paket.v > 1) return { ok: false, xato: "Bu matn yangiroq versiyadan. Ilovani yangilang." };
  return { ok: true, paket };
}

// Ko'rib chiqish uchun qisqa xulosa: [{ nom, soni }]
const XULOSA = [
  ["ishchilar", "xodim"],
  ["nonlar", "non turi"],
  ["customMahsulotlar", "xomashyo"],
  ["hisobotlarTarixi", "kunlik hisobot"],
  ["qarzlar", "qarz"],
  ["optomlar", "optom"],
  ["kartalar", "karta to'lovi"],
  ["braklar", "brak"],
  ["kunlikXarajatlar", "xarajat"],
  ["omborlar", "ombor kirimi"],
  ["omborSorovlar", "so'rovnoma"],
  ["ochirilganlar", "tarixdagi yozuv"],
];

export function xulosa(data) {
  return XULOSA
    .map(([k, nom]) => ({ k, nom, soni: Array.isArray(data?.[k]) ? data[k].filter((x) => x && typeof x === "object" && x.id != null).length : 0 }))
    .filter((x) => x.soni > 0);
}

export const hajm = (matn) => {
  const b = typeof matn === "number" ? matn : String(matn || "").length;
  return b < 1024 ? `${b} B` : `${(b / 1024).toFixed(b < 10240 ? 1 : 0)} KB`;
};

export const faylNomi = (ms) => {
  const d = new Date(ms || Date.now());
  return `nur-non-${d.getFullYear()}-${ikki(d.getMonth() + 1)}-${ikki(d.getDate())}.txt`;
};
