// Doimiy ma'lumotlar: lavozimlar, ombor mahsulotlari (sof JS).

export const LAVOZIMLAR = [
  { id: "nonYopuvchi", label: "Non yopuvchi", emoji: "🫓" },
  { id: "xamirchi",    label: "Xamirchi",     emoji: "🌾" },
  { id: "yordamchi",   label: "Yordamchi",    emoji: "🙋" },
  { id: "kassir",      label: "Kassir",       emoji: "🧾" },
  { id: "checha",      label: "Checha (Pazanda)", emoji: "👩" },
  { id: "boshqasi",    label: "Boshqasi",     emoji: "✏️" },
];

export function getLavozimEmoji(w) {
  if (!w) return "👤";
  return LAVOZIMLAR.find((l) => l.id === w.lavozimId)?.emoji || "👤";
}

export function getLavozimLabel(w) {
  if (!w) return "Xodim";
  if (w.lavozimId === "boshqasi") return w.lavozimCustom || "Boshqasi";
  return LAVOZIMLAR.find((l) => l.id === w.lavozimId)?.label || w.lavozimId;
}

// Ombor mahsulotlari (baza birligi kg/litr da saqlanadi)
export const OMBOR_MAYDONLAR = [
  { id: "oqUn",     nom: "Oq un",            birlik: "kg",   emoji: "🌾" },
  { id: "sariqUn",  nom: "Sariq un",          birlik: "kg",   emoji: "🌾" },
  { id: "qoraUn",   nom: "Qora un",           birlik: "kg",   emoji: "🌾" },
  { id: "sut",      nom: "Sut",               birlik: "litr", emoji: "🥛" },
  { id: "yog",      nom: "Yog'",              birlik: "litr", emoji: "🫗" },
  { id: "jir",      nom: "Jir (hayvon yog')", birlik: "kg",   emoji: "🥓" },
  { id: "quruqSut", nom: "Quruq sut",         birlik: "kg",   emoji: "🥄" },
  { id: "achitqi",  nom: "Achitqi (Droja)",   birlik: "kg",   emoji: "🍞" },
  { id: "shakar",   nom: "Shakar",            birlik: "kg",   emoji: "🍬" },
  { id: "tuz",      nom: "Tuz",               birlik: "kg",   emoji: "🧂" },
];

// Un turlari qop'da, yog' plastik qutida ko'rsatiladi
export const HISOBOT_UN_IDLAR = ["oqUn", "sariqUn", "qoraUn"];
