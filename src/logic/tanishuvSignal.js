// Yo'riqnoma (Tanishuv) yopilganini bildiruvchi signal. Kutayotganlar: kechki eslatma ruxsati
// (yo'riqnoma ustida tizim oynasi chiqmasligi uchun) va ertalabgi salom (KunOtishi).
const tinglovchilar = new Set();
export const tanishuvTugadi = () => tinglovchilar.forEach((f) => { try { f(); } catch {} });
export const tanishuvTinglash = (f) => { tinglovchilar.add(f); return () => tinglovchilar.delete(f); };
