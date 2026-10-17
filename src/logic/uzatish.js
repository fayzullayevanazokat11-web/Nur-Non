// Ma'lumotlarni uzatish — butun baza bitta matnga (va qaytib bazaga) aylanadi.
// Matn ko'rinishi:
//   NUR-NON MA'LUMOTLARI
//   Akkaunt: <nom> · 16.10.2026 14:30
//   NURNON2:<siqilgan kod>
// NURNON2 — kunlik hisobotlardagi takrorlanuvchi nusxalar (non, xodim, narx
// ro'yxatlari) bir martagina yoziladi, so'ng JSON deflate bilan siqiladi va base64.
// Bir oylik real ma'lumot ~60 000 belgidan ~10 000 belgiga tushadi.
// Eski NURNON1 (lz-string) matnlari ham o'qiladi. Bo'shliq va qator ko'chishlari e'tiborsiz.
import LZString from "lz-string";
import { deflateSync, inflateSync, strToU8, strFromU8 } from "fflate";

const BELGI1 = "NURNON1:";
const BELGI = "NURNON2:";
const ikki = (n) => String(n).padStart(2, "0");

export const sanaVaqt = (ms) => {
  const d = new Date(ms || Date.now());
  return `${ikki(d.getDate())}.${ikki(d.getMonth() + 1)}.${d.getFullYear()} ${ikki(d.getHours())}:${ikki(d.getMinutes())}`;
};

// ── base64 (Hermes/brauzerdan mustaqil) ──
const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
function b64Kod(u8) {
  let s = "";
  for (let i = 0; i < u8.length; i += 3) {
    const a = u8[i], b = u8[i + 1], c = u8[i + 2];
    const n = (a << 16) | ((b || 0) << 8) | (c || 0);
    s += B64[(n >> 18) & 63] + B64[(n >> 12) & 63] + (b === undefined ? "=" : B64[(n >> 6) & 63]) + (c === undefined ? "=" : B64[n & 63]);
  }
  return s;
}
function b64Och(s) {
  const t = s.replace(/[^A-Za-z0-9+/]/g, "");
  const out = new Uint8Array(Math.floor((t.length * 3) / 4));
  let j = 0;
  for (let i = 0; i < t.length; i += 4) {
    const n = (B64.indexOf(t[i]) << 18) | (B64.indexOf(t[i + 1]) << 12) | ((B64.indexOf(t[i + 2]) & 63) << 6) | (B64.indexOf(t[i + 3]) & 63);
    out[j++] = (n >> 16) & 255;
    if (i + 2 < t.length) out[j++] = (n >> 8) & 255;
    if (i + 3 < t.length) out[j++] = n & 255;
  }
  return out.subarray(0, j);
}

// ── Takrorlanuvchi nusxalarni jadvalga chiqarish ──
const NUSXALAR = ["nonlarSnapshot", "ishchilarSnapshot", "mahsulotNarxlariSnapshot"];
function ixchamla(paket) {
  const jadval = [];
  const idx = new Map();
  const ref = (o) => {
    if (o == null) return o;
    const k = JSON.stringify(o);
    if (!idx.has(k)) { idx.set(k, jadval.length); jadval.push(o); }
    return { $r: idx.get(k) };
  };
  if (!Array.isArray(paket?.data?.hisobotlarTarixi)) return paket; // hisobot yo'q — o'zgartirmaymiz
  const h = paket.data.hisobotlarTarixi.map((x) => {
    if (!x || typeof x !== "object") return x;
    const y = { ...x };
    NUSXALAR.forEach((k) => { if (k in y) y[k] = ref(y[k]); });
    return y;
  });
  return { ...paket, data: { ...paket.data, hisobotlarTarixi: h }, $jadval: jadval };
}
function yoy(p) {
  const jadval = p?.$jadval;
  if (!Array.isArray(jadval) || !Array.isArray(p?.data?.hisobotlarTarixi)) return p;
  const och = (v) => (v && typeof v === "object" && typeof v.$r === "number" ? jadval[v.$r] : v);
  const h = (p?.data?.hisobotlarTarixi || []).map((x) => {
    if (!x || typeof x !== "object") return x;
    const y = { ...x };
    NUSXALAR.forEach((k) => { if (k in y) y[k] = och(y[k]); });
    return y;
  });
  const { $jadval, ...qolgan } = p;
  return { ...qolgan, data: { ...p.data, hisobotlarTarixi: h } };
}

export function matngaAylantir(paket) {
  const kod = b64Kod(deflateSync(strToU8(JSON.stringify(ixchamla(paket))), { level: 9 }));
  const sarlavha = `NUR-NON MA'LUMOTLARI\nAkkaunt: ${paket.akkaunt || "—"} · ${sanaVaqt(paket.vaqt)}`;
  return `${sarlavha}\n${BELGI}${kod}`;
}

const BUZUQ = "Kod to'liq emas yoki buzilgan. Matnni oxirigacha nusxalang.";

// Matndan paketni o'qiydi. Natija: { ok: true, paket } yoki { ok: false, xato }
export function matndanOqi(matn) {
  const s = String(matn || "").trim();
  if (!s) return { ok: false, xato: "Matn bo'sh" };
  let json = null;
  const i2 = s.indexOf(BELGI);
  const i1 = s.indexOf(BELGI1);
  if (i2 >= 0) {
    try { json = strFromU8(inflateSync(b64Och(s.slice(i2 + BELGI.length)))); } catch { return { ok: false, xato: BUZUQ }; }
  } else if (i1 >= 0) {
    const kod = s.slice(i1 + BELGI1.length).replace(/\s+/g, "");
    try { json = LZString.decompressFromBase64(kod); } catch { json = null; }
    if (!json) return { ok: false, xato: BUZUQ };
  } else if (s.includes("{")) {
    // Siqilmagan JSON ham qabul qilinadi
    json = s.slice(s.indexOf("{"), s.lastIndexOf("}") + 1);
  } else {
    return { ok: false, xato: "Bu Nur-Non ma'lumotlari emas" };
  }
  let paket;
  try { paket = yoy(JSON.parse(json)); } catch { return { ok: false, xato: BUZUQ }; }
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
