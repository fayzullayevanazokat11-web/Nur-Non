// Markazdagi eslatmalar: kam qolgan xomashyo, tasdiqlanmagan so'rovnomalar,
// uzoq to'lanmagan qarzlar, yakunlanmagan kun. Sof mantiq (UI yo'q).
import { omborBalans, kunlikXomashyoSarfi, zaxiraMatni, formatSom, bugunSana, KUN_TUGASH_SOAT } from "./hisob";
import { qarzdorlar, kunOtdi } from "./qarz";
import { kunTahlili, sanaChiroyli } from "./davr";

export const QARZ_KUN = 7;      // shuncha kundan eski qarz eslatiladi
export const ZAXIRA_KUN = 2;    // shuncha kunga yetmaydigan xomashyo eslatiladi
export const YAKUN_SOAT = 19;   // shu soatdan keyin yakunlanmagan kun eslatiladi

// O'rtacha kunlik sarf — oxirgi 7 ta hisobot bo'yicha; hisobot bo'lmasa bugungi kiritma
export function ortachaSarf({ hisobotlar, nonlar, ozIshlabQoplar, royxat }) {
  const oxirgi = (hisobotlar || []).slice(0, 7);
  const jami = {};
  let kunlar = 0;
  oxirgi.forEach((h) => {
    const sarf = kunlikXomashyoSarfi(h.nonlarSnapshot || nonlar, h.ozIshlabQoplar || {}, royxat);
    kunlar++;
    sarf.forEach((x) => { jami[x.id] = (jami[x.id] || 0) + x.qiymat; });
  });
  if (!kunlar) {
    kunlikXomashyoSarfi(nonlar, ozIshlabQoplar || {}, royxat).forEach((x) => { jami[x.id] = x.qiymat; });
    kunlar = 1;
  }
  const natija = {};
  Object.keys(jami).forEach((k) => { natija[k] = jami[k] / kunlar; });
  return natija;
}

export function eslatmalar({
  hozir = new Date(), nonlar, hisobotlar, ozIshlabQoplar, tashqariSonlar, omborlar, omborSorovlar,
  qarzlar, royxat, lockedDayStats,
}) {
  const r = [];
  const bugun = bugunSana();

  // 1) Kun yakunlanmagan (kechqurun, bugun ishlab chiqarish kiritilgan bo'lsa)
  const kiritilgan = Object.values(ozIshlabQoplar || {}).some((v) => parseFloat(v) > 0)
    || Object.values(tashqariSonlar || {}).some((v) => parseFloat(v) > 0);
  // Kechqurun 19:00 dan ish kuni tugaguncha (tunda 03:00) eslatiladi
  const kechqurun = hozir.getHours() >= YAKUN_SOAT || hozir.getHours() < KUN_TUGASH_SOAT;
  if (kechqurun && kiritilgan && (lockedDayStats?.kun || lockedDayStats?.sana) !== bugun) {
    r.push({ id: `yakun-${bugun}`, tur: "yakun", icon: "moon-outline", matn: "Bugungi kun hali yakunlanmagan", izoh: "Kunlik qop hisobida «Kunni yakunlash»ni bosing", yol: "/qop" });
  }

  // 2) Kam qolgan xomashyo (faqat omborga set kiritilgan bo'lsa kuzatiladi)
  const setBor = (omborlar || []).some((h) => h.turi === "yangiset");
  if (setBor) {
    const balans = omborBalans(omborlar, royxat);
    const kutilayotgan = {};
    (omborSorovlar || []).forEach((s) => (s.maydonlar || []).forEach((m) => { kutilayotgan[m.id] = (kutilayotgan[m.id] || 0) + (parseFloat(m.qiymat) || 0); }));
    const sarf = ortachaSarf({ hisobotlar, nonlar, ozIshlabQoplar, royxat });
    const kam = [];
    balans.forEach((b) => {
      const kunlik = sarf[b.id] || 0;
      if (kunlik <= 0) return;
      const bor = b.qiymat - (kutilayotgan[b.id] || 0);
      const kun = bor / kunlik;
      if (kun < ZAXIRA_KUN) kam.push({ b, bor, kun });
    });
    kam.sort((a, b) => a.kun - b.kun).forEach(({ b, bor, kun }) => {
      r.push({
        id: `zaxira-${b.id}-${bugun}`, tur: "zaxira", icon: "cube-outline",
        matn: bor <= 0 ? `${b.nom} tugagan` : `${b.nom} kam qoldi`,
        izoh: bor <= 0 ? "Yangi set kiriting" : `${zaxiraMatni(b.id, bor, b.birlik)} · ~${Math.max(0, Math.floor(kun * 10) / 10).toString().replace(".", ",")} kunga yetadi`,
        yol: "/ombor",
      });
    });
  }

  // 2b) Oxirgi yakunlangan kun odatdagidan keskin past bo'lsa (2 kun ichida)
  const oxirgi = (hisobotlar || [])[0];
  if (oxirgi && hozir.getTime() - (oxirgi.vaqt || 0) < 2 * 864e5) {
    const t = kunTahlili(oxirgi, hisobotlar);
    if (t?.past) {
      r.push({
        id: `tahlil-${oxirgi.id}`, tur: "tahlil", icon: "trending-down-outline",
        matn: `${sanaChiroyli(oxirgi.sana).split(" · ")[0]}: foyda o'rtachadan ${Math.abs(t.foiz)}% kam`,
        izoh: t.sabablar.length ? `Sabab: ${t.sabablar[0]}` : "Statistikada batafsil ko'ring",
        yol: "/tarix",
      });
    }
  }

  // 3) Tasdiqlanmagan so'rovnomalar
  const sorov = (omborSorovlar || []).length;
  if (sorov > 0) {
    r.push({ id: `sorov-${bugun}-${sorov}`, tur: "sorov", icon: "documents-outline", matn: `${sorov} ta so'rovnoma tasdiqlanmagan`, izoh: "Ombordan xomashyo ayirish uchun tasdiqlang", yol: "/ombor" });
  }

  // 4) Uzoq to'lanmagan qarzlar
  const eski = qarzdorlar(qarzlar).filter((g) => g.qoldiq > 0 && kunOtdi(g.enEskiFaol, hozir.getTime()) >= QARZ_KUN);
  eski.slice(0, 3).forEach((g) => {
    r.push({ id: `qarz-${g.kalit}-${bugun}`, tur: "qarz", icon: "time-outline", matn: `${g.ism}: ${formatSom(g.qoldiq)} so'm qarz`, izoh: `${kunOtdi(g.enEskiFaol, hozir.getTime())} kundan beri to'lanmagan`, yol: "/qarzlar" });
  });
  if (eski.length > 3) {
    r.push({ id: `qarz-yana-${bugun}-${eski.length}`, tur: "qarz", icon: "people-outline", matn: `Yana ${eski.length - 3} ta eski qarzdor`, izoh: "Qarzlar sahifasida ko'ring", yol: "/qarzlar" });
  }
  return r;
}
