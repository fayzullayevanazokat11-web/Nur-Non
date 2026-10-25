// Harakat fizikasi — iOS'dagidek "qo'lda tutgandek" sezish uchun.
//
// Rezina (rubber-band): chegaradan tashqariga tortilganda element barmoqqa to'liq ergashmaydi —
// tobora qiyinroq cho'ziladi va hech qachon `d` dan oshmaydi (UIScrollView formulasi, c = 0.55):
//   offset = (1 − 1 / (c·x / d + 1)) · d
// x — chegaradan qancha tortildi, d — eng ko'p cho'zilish masofasi.
export const REZINA_C = 0.55;
export function rezina(x, d, c = REZINA_C) {
  if (!(x > 0) || !(d > 0)) return 0;
  return (1 - 1 / ((c * x) / d + 1)) * d;
}

// Prujina (spring): vaqtga bog'langan animatsiya emas — barmoq tezligini (velocity) davom ettiradi,
// yarim yo'lda ushlab olinsa darhol barmoqqa o'tadi. Sakramasdan (kritik so'nishga yaqin) joylashadi.
export const PRUJINA = { stiffness: 320, damping: 32, mass: 1, overshootClamping: false };
// Biroz yumshoqroq — katta masofalar (indikator, panel) uchun
export const PRUJINA_YUMSHOQ = { stiffness: 220, damping: 26, mass: 1, overshootClamping: false };
