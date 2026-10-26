// Doimiy ma'lumotlar: lavozimlar, ombor mahsulotlari (sof JS).

export const LAVOZIMLAR = [
  { id: "nonYopuvchi", label: "Non yopuvchi", emoji: "🫓" },
  { id: "xamirchi",    label: "Xamirchi",     emoji: "🌾" },
  { id: "yordamchi",   label: "Yordamchi",    emoji: "🙋" },
  { id: "kassir",      label: "Kassir",       emoji: "🧾" },
  { id: "checha",      label: "Checha (Pazanda)", emoji: "👩" },
  { id: "boshqasi",    label: "Boshqasi",     emoji: "✏️" },
];

export function getLavozimLabel(w) {
  if (!w) return "Xodim";
  if (w.lavozimId === "boshqasi") return w.lavozimCustom || "Boshqasi";
  return LAVOZIMLAR.find((l) => l.id === w.lavozimId)?.label || w.lavozimId;
}

// Ombor mahsulotlari (baza birligi kg/litr da saqlanadi) — haftalab turadigan zaxira
export const OMBOR_MAYDONLAR = [
  { id: "oqUn",     nom: "Oq un",            birlik: "kg",   emoji: "🌾" },
  { id: "sariqUn",  nom: "Sariq un",          birlik: "kg",   emoji: "🌾" },
  { id: "qoraUn",   nom: "Qora un",           birlik: "kg",   emoji: "🌾" },
  { id: "yog",      nom: "Yog'",              birlik: "litr", emoji: "🫗" },
  { id: "jir",      nom: "Jir (hayvon yog')", birlik: "kg",   emoji: "🥓" },
  { id: "quruqSut", nom: "Quruq sut",         birlik: "kg",   emoji: "🥄" },
  { id: "achitqi",  nom: "Achitqi (Droja)",   birlik: "kg",   emoji: "🍞" },
  { id: "shakar",   nom: "Shakar",            birlik: "kg",   emoji: "🍬" },
  { id: "tuz",      nom: "Tuz",               birlik: "kg",   emoji: "🧂" },
];

// Sut — xomashyo (retsept va narxda bor), lekin omborda turmaydi: har kuni 2 mahal keladi,
// kunlik vazifada litri yoziladi va shu kunning daromadidan to'g'ridan-to'g'ri ayriladi.
export const SUT = { id: "sut", nom: "Sut", birlik: "litr", emoji: "🥛" };

// Omborda saqlanmaydiganlar (sut — kunlik keladi, suv — sotib olinmaydi). Foydalanuvchi o'zi
// qo'shgan xomashyo nomi "Suv"/"Sut" bo'lsa ham ombordan chiqariladi.
const OMBORDA_YOQ = new Set(["sut", "suv"]);
export const omborEmasmi = (m) => OMBORDA_YOQ.has(m?.id) || OMBORDA_YOQ.has(String(m?.nom || "").trim().toLowerCase());

// Un turlari qop'da, yog' plastik qutida ko'rsatiladi
export const HISOBOT_UN_IDLAR = ["oqUn", "sariqUn", "qoraUn"];

// Barcha xomashyo = asosiy (doimiy) + sut + foydalanuvchi qo'shgan (custom)
export function xomashyoRoyxati(custom) {
  return [...OMBOR_MAYDONLAR, SUT, ...(custom || [])];
}
// Omborda hisobi yuritiladigan xomashyo (sut, suv chiqarilgan)
export function omborRoyxati(custom) {
  return xomashyoRoyxati(custom).filter((m) => !omborEmasmi(m));
}

// Qarz/optomda ism yozilmasa — shu nom bilan saqlanadi
export const ISM_SUKUT = "Nurafshon";
