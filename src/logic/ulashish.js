// Hisobotni ulashish: PDF (Telegram'ga fayl bo'lib boradi).
// Barcha matn joriy yozuvda (lotin/kirill) chiqadi. PDF har doim yorug' fonda.
import { Platform } from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { formatSom } from "./hisob";
import { getTil } from "../i18n/til";
import { ogir } from "../i18n/translit";
import { testmi } from "../store/rejim";

const t = (s) => ogir(String(s ?? ""), getTil());
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const tx = (s) => esc(t(s));
const som = (x) => `${formatSom(x)} ${t("so'm")}`;
const son = (x) => parseFloat(x) || 0;

const USLUB = `
  @page { size: A4; margin: 10mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, Roboto, "Segoe UI", Arial, sans-serif; color: #3A2412; margin: 0; padding: 8px; background: #fff; }
  /* Qop rasmlari — har biri alohida sahifada, sahifani to'ldiradi (A4: 277mm balandlik, 190mm en) */
  .rasmSahifa { page-break-before: always; break-before: page; height: 272mm; display: flex; flex-direction: column; align-items: center; justify-content: center; overflow: hidden; }
  .rasmSahifa img { width: 100%; height: 262mm; object-fit: contain; }
  .rasmSahifa .rt { font-size: 11px; color: #86643F; font-weight: 700; margin-top: 6px; text-align: center; }
  .bosh { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #A05F27; padding-bottom: 12px; margin-bottom: 18px; }
  .brend { font-size: 22px; font-weight: 800; color: #A05F27; }
  .akk { font-size: 13px; color: #86643F; margin-top: 2px; }
  .sana { font-size: 13px; color: #86643F; text-align: right; }
  h1 { font-size: 18px; margin: 0 0 4px; }
  .katta { display: flex; gap: 10px; margin: 14px 0 18px; }
  .plitka { flex: 1; background: #FCF4E4; border: 1px solid #F3E5CB; border-radius: 12px; padding: 10px 12px; }
  .plitka .l { font-size: 11px; color: #86643F; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; }
  .plitka .v { font-size: 18px; font-weight: 800; margin-top: 3px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 13px; }
  th { text-align: left; font-size: 11px; color: #86643F; text-transform: uppercase; letter-spacing: .5px; padding: 6px 4px; border-bottom: 1px solid #EBD5AE; }
  td { padding: 7px 4px; border-bottom: 1px solid #F7ECDA; }
  td.r, th.r { text-align: right; }
  .jami td { font-weight: 800; border-bottom: none; border-top: 2px solid #EBD5AE; }
  .bolim { font-size: 12px; font-weight: 800; color: #86643F; letter-spacing: 1px; margin: 18px 0 6px; text-transform: uppercase; }
  .izoh { font-size: 11px; color: #B0916A; margin-top: 18px; }
`;

function sahifa({ sarlavha, davr, akkaunt, ichi, oxiri = "" }) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${USLUB}</style></head><body>
    <div class="bosh">
      <div><div class="brend">${tx("Nur-Non")}</div>${akkaunt ? `<div class="akk">${tx(akkaunt)}</div>` : ""}</div>
      <div class="sana"><h1>${tx(sarlavha)}</h1>${tx(davr)}</div>
    </div>
    ${ichi}
    <div class="izoh">${tx("Nur-Non boshqaruv tizimida tayyorlandi")}</div>
    ${oxiri}
  </body></html>`;
}

const plitkalar = (arr) => `<div class="katta">${arr.map(([l, v]) => `<div class="plitka"><div class="l">${tx(l)}</div><div class="v">${esc(v)}</div></div>`).join("")}</div>`;
// Raqamli ustunlar o'ngga, matnli ustunlar chapga tekislanadi
const raqammi = (c) => /^[−+\-]?[\d\s.,:%]+(\s?\S{0,5}|so'm|dona|qop|litr|ta)?$|^—$|^$/.test(String(c ?? "").trim());
const jadval = (bosh, qatorlar, jami) => {
  const ong = bosh.map((_, i) => i > 0 && qatorlar.every((q) => raqammi(q[i])));
  const k = (i) => (ong[i] ? "r" : "");
  return `<table><tr>${bosh.map((b, i) => `<th class="${k(i)}">${tx(b)}</th>`).join("")}</tr>
  ${qatorlar.map((q) => `<tr>${q.map((c, i) => `<td class="${k(i)}">${esc(c)}</td>`).join("")}</tr>`).join("")}
  ${jami ? `<tr class="jami">${jami.map((c, i) => `<td class="${k(i)}">${esc(c)}</td>`).join("")}</tr>` : ""}</table>`;
};

// ── Bitta kunlik hisobot — kunning barcha muhim tafsilotlari (vaqtlari bilan) ──
const ikki = (n) => String(n).padStart(2, "0");
const soat = (ms) => { if (!ms) return ""; const d = new Date(ms); return `${ikki(d.getHours())}:${ikki(d.getMinutes())}`; };
const vaqtOl = (e) => e?.soat || soat(e?.vaqt);
const savatMatn = (savat) => (savat || []).map((x) => `${t(x.nonNomi)} × ${x.soni}`).join(", ");

// rasmlar — [{ src, vaqt }] (src: data URI yoki web'da uri): har biri alohida sahifada
export function kunlikHtml(h, { akkaunt, nonlar, rasmlar = [] } = {}) {
  const daromad = son(h.daromad), haq = son(h.ishchiHaq);
  const a = h.arxiv || {};
  const tf = h.tafsilot || {};
  const qiy = (o, id) => parseInt((o || {})[id]) || 0;

  // Ishlab chiqarish — har bir non bo'yicha to'liq oqim
  const nonQatorlar = (h.nonlarSnapshot || nonlar || []).map((n) => {
    const oz = n.ozIshlab !== false;
    const ishlab = oz ? qiy(h.ozIshlabQoplar, n.id) : qiy(h.tashqariSonlar, n.id);
    const dona = oz ? ishlab * (son(n.nonSoni) || 0) : ishlab;
    const tonggi = qiy(h.boshlangichQoldiq, n.id), yaroqsiz = qiy(h.qoldaYaroqsiz, n.id), qoldiq = qiy(h.sotilmaganNon, n.id);
    if (!ishlab && !tonggi && !qoldiq && !yaroqsiz) return null;
    return [t(n.nom), oz ? `${ishlab} ${t("qop")}` : "—", formatSom(dona), formatSom(tonggi), formatSom(yaroqsiz), formatSom(qoldiq)];
  }).filter(Boolean);

  // Sof foyda = daromad − ayirmalar (hammasi ro'yxatda); karta/optom — daromad ichida, faqat ma'lumot
  const ayirmalar = [
    ["Tashqaridan olingan non", h.tashqariTannarx], ["Qo'shimcha xarajat", h.xarajatJami],
    [`${t("Sut")} (${String(son(h.sutLitr)).replace(".", ",")} l)`, h.sutXarajat],
  ].filter(([, v]) => son(v) > 0).map(([l, v]) => [t(l), `− ${som(v)}`]);
  const malumot = [["Karta to'lovlari (daromad ichida)", a.kartaSum], ["Optom savdo (daromad ichida)", a.optomSum]]
    .filter(([, v]) => son(v) > 0).map(([l, v]) => [t(l), som(v)]);

  const bolim = (nom, ich) => `<div class="bolim">${tx(nom)}</div>${ich}`;
  const vaqtli = (arr) => [...(arr || [])].sort((x, y) => (x.vaqt || 0) - (y.vaqt || 0));

  let ichi = plitkalar([["Sof foyda", som(h.sofFoyda)], ["Daromad", som(daromad)], ["Sotilgan non", `${formatSom(h.sotilganNon)} ${t("dona")}`]]);

  // Kun tartibi: kunlik vazifa va yakunlash vaqti
  const tartib = [];
  if (tf.ertalab) {
    const holat = (b) => t(b ? "bajarildi" : "bajarilmadi");
    tartib.push([t("Kunlik vazifa"), tf.ertalab.tugallandi ? `${t("bajarildi")} ${soat(tf.ertalab.tugallandi)}` : t("bajarilmagan")]);
    tartib.push([t("Ishchilar davomati"), holat(tf.ertalab.davomat)], [t("Ombor tekshiruvi"), holat(tf.ertalab.ombor)]);
    if (tf.ertalab.sut !== undefined) tartib.push([t("Sut kirimi yozildi"), holat(tf.ertalab.sut)]);
    if (tf.ertalab.tashqi !== undefined) tartib.push([t("Tashqi non kirimi yozildi"), holat(tf.ertalab.tashqi)]);
  }
  if (tf.sut && (son(tf.sut.m1) || son(tf.sut.m2))) {
    tartib.push([t("Sut kirimi"), `${t("1-mahal")} ${String(son(tf.sut.m1)).replace(".", ",")} l · ${t("2-mahal")} ${String(son(tf.sut.m2)).replace(".", ",")} l`]);
  }
  // Tashqi non kirimi — har bir non: ertalab + obeddan keyin
  (tf.tashqiKirim || []).forEach((k) => {
    tartib.push([`${t(k.nom)} (${t("tashqaridan")})`, `${t("ertalab")} ${formatSom(k.m1)} + ${t("obeddan keyin")} ${formatSom(k.m2)} = ${formatSom(k.m1 + k.m2)} ${t("dona")} · ${som((k.m1 + k.m2) * k.narx)}`]);
  });
  if (tf.rasmSoni != null) tartib.push([t("Qop rasmlari"), `${tf.rasmSoni} ${t("ta")}`]);
  if ((tf.kelmaganlar || []).length && !(tf.davomat || []).length) tartib.push([t("Kelmagan xodimlar"), tf.kelmaganlar.map(t).join(", ")]);
  tartib.push([t("Kun yakunlandi"), soat(h.vaqt)]);
  ichi += bolim("Kun tartibi", jadval(["Ko'rsatkich", "Holat"], tartib));

  // Davomat — har bir xodim, kelgan vaqti bilan (erta kelganlar avval)
  const davomat = [...(tf.davomat || [])].sort((x, y) => (y.keldi - x.keldi) || String(x.soat || "99").localeCompare(String(y.soat || "99")));
  // Shu kungi ish (boshqa lavozim / kimning o'rniga) bo'lsa — alohida ustun
  const ishBor = davomat.some((d) => d.lavozim || d.orniga);
  const kunIshi = (d) => [d.lavozim ? t(d.lavozim) : "", d.orniga ? `${t(d.orniga)} ${t("o'rniga")}` : ""].filter(Boolean).join(" · ");
  // Kelmaganlarning sababi (izoh) — vaqt ustunida
  const izohBor = davomat.some((d) => !d.keldi && d.izoh);
  if (davomat.length) ichi += bolim("Davomat", jadval(
    ["Xodim", "Holat", izohBor ? "Vaqt / sabab" : "Kelgan vaqti", ...(ishBor ? ["Bugungi ishi"] : [])],
    davomat.map((d) => [t(d.ism), t(d.keldi ? "Keldi" : "Kelmadi"), d.keldi ? (d.soat || t("Vaqtida")) : (d.izoh ? t(d.izoh) : "—"), ...(ishBor ? [kunIshi(d) || "—"] : [])])));

  if (nonQatorlar.length) ichi += bolim("Ishlab chiqarish", jadval(["Non turi", "Qop", "Ishlab (dona)", "Tonggi qoldiq", "Yaroqsiz", "Kun oxiri qoldiq"], nonQatorlar));
  ichi += bolim("Umumiy son", jadval(["Ko'rsatkich", "Dona"], [
    [t("Tonggi qoldiq"), formatSom(h.jamiBoshlang)], [t("Ishlab chiqarilgan"), formatSom(h.jamiNon)], [t("Sotilgan"), formatSom(h.sotilganNon)],
    [t("Yaroqsiz"), formatSom(h.jamiYaroqsiz)], [t("Ertangi qoldiq"), formatSom(h.jamiQoldiq)],
  ]));

  ichi += bolim("Moliya", jadval(["Ko'rsatkich", "Summa"], [
    [t("Daromad"), som(daromad)], [t("Ishchi haqi"), `− ${som(haq)}`], ...ayirmalar,
  ], [t("Sof foyda"), som(h.sofFoyda)]));
  if (malumot.length) ichi += jadval(["Ma'lumot uchun", "Summa"], malumot);

  // Kun davomidagi yozuvlar — vaqti bilan
  const kartalar = vaqtli(a.kartalar);
  if (kartalar.length) ichi += bolim("Karta to'lovlari", jadval(["Vaqt", "Izoh", "Summa"], kartalar.map((k) => [vaqtOl(k), t(k.izoh || "Karta to'lovi"), som(k.summa)]), [t("Jami"), "", som(a.kartaSum)]));
  const optomlar = vaqtli(a.optomlar);
  if (optomlar.length) ichi += bolim("Optom savdo", jadval(["Vaqt", "Xaridor", "Nonlar", "Summa"], optomlar.map((o) => [vaqtOl(o), t(o.ism), savatMatn(o.savat), som(o.summa)]), [t("Jami"), "", "", som(a.optomSum)]));
  const qarzlar = vaqtli(tf.qarzlar);
  if (qarzlar.length) ichi += bolim("Qarzga berilgan", jadval(["Vaqt", "Qarzdor", "Nonlar", "Summa"], qarzlar.map((q) => [vaqtOl(q), t(q.ism), savatMatn(q.savat), som(q.summa)])));
  const tolovlar = vaqtli(tf.tolovlar);
  if (tolovlar.length) ichi += bolim("Qarz to'lovlari", jadval(["Vaqt", "Qarzdor", "Summa"], tolovlar.map((x) => [soat(x.vaqt), t(x.ism), som(x.summa)])));
  const braklar = vaqtli(a.braklar);
  if (braklar.length) ichi += bolim("Brak", jadval(["Vaqt", "Xodim", "Non", "Soni", "Summa"], braklar.map((b) => [vaqtOl(b), t(b.ishchiIsm), t(b.nonNomi), String(b.soni), som(b.summa)]), [t("Jami"), "", "", "", som(a.brakSum)]));
  const xarajatlar = vaqtli(a.kunlikXarajatlar);
  if (xarajatlar.length) ichi += bolim("Qo'shimcha xarajatlar", jadval(["Vaqt", "Izoh", "Summa"], xarajatlar.map((x) => [vaqtOl(x), t(x.izoh), som(x.summa)]), [t("Jami"), "", som(h.xarajatJami)]));

  const ishchilar = (h.ishchiHaqlari || []).map((w) => [t(w.ism), son(w.brak) > 0 ? `−${formatSom(w.brak)}` : "", som(w.net)]);
  if (ishchilar.length) ichi += bolim("Ishchilar haqi", jadval(["Xodim", "Brak", "Haq"], ishchilar, [t("Jami"), "", som(haq)]));
  const xom = (tf.xomashyo || []).filter((x) => son(x.qiymat) > 0);
  if (xom.length) ichi += bolim("Xomashyo sarfi", jadval(["Xomashyo", "Miqdor"], xom.map((x) => [t(x.nom), `${String(Math.round(son(x.qiymat) * 100) / 100).replace(".", ",")} ${t(x.birlik)}`])));

  const oxiri = (rasmlar || []).map((r, i) => `<div class="rasmSahifa"><img src="${r.src}" /><div class="rt">${tx("Qop rasmi")} ${i + 1}/${rasmlar.length} · ${h.sana}${r.vaqt ? ` · ${soat(r.vaqt)}` : ""}</div></div>`).join("");
  return sahifa({ sarlavha: "Kunlik hisobot", davr: `${h.sana} · ${soat(h.vaqt)}`, akkaunt, ichi, oxiri });
}

// ── Davr (7/30 kun) hisoboti ──
export function davrHtml({ hisobotlar, kunlar, akkaunt }) {
  const list = [...(hisobotlar || [])].sort((a, b) => String(a.sana).localeCompare(String(b.sana)));
  const jam = (k) => list.reduce((s, h) => s + son(h[k]), 0);
  const davr = list.length ? `${list[0].sana} — ${list[list.length - 1].sana}` : "";
  const ichi = plitkalar([["Sof foyda", som(jam("sofFoyda"))], ["Daromad", som(jam("daromad"))], ["Hisobot kunlari", String(list.length)]])
    + jadval(["Sana", "Daromad", "Ishchi haqi", "Sotilgan", "Sof foyda"],
      list.map((h) => [h.sana, formatSom(h.daromad), formatSom(h.ishchiHaq), formatSom(h.sotilganNon), formatSom(h.sofFoyda)]),
      [t("Jami"), formatSom(jam("daromad")), formatSom(jam("ishchiHaq")), formatSom(jam("sotilganNon")), formatSom(jam("sofFoyda"))]);
  return sahifa({ sarlavha: `${kunlar} ${t("kunlik hisobot")}`, davr, akkaunt, ichi });
}

// PDF yaratib ulashish. Web'da — chop etish oynasi.
export async function pdfUlash(html, nom) {
  if (Platform.OS === "web") { await Print.printAsync({ html }); return true; }
  const { uri } = await Print.printToFileAsync({ html });
  let fayl = uri;
  try {
    const yangi = `${FileSystem.cacheDirectory}${nom}.pdf`;
    await FileSystem.deleteAsync(yangi, { idempotent: true });
    await FileSystem.moveAsync({ from: uri, to: yangi });
    fayl = yangi;
  } catch { /* nomini o'zgartira olmasa ham asl fayl ulashiladi */ }
  if (!(await Sharing.isAvailableAsync())) return false;
  await Sharing.shareAsync(fayl, { mimeType: "application/pdf", UTI: "com.adobe.pdf", dialogTitle: t("Hisobotni ulashish") });
  return true;
}

// ── PDFlar arxivi: kunlik hisobot PDF'i yakunlanganda telefon xotirasiga saqlanadi (30 kun) ──
// Test maydonida alohida papka — test PDF'lari asl PDF'larni hech qachon ustidan yozmaydi/o'chirmaydi
const pdfPapka = () => (FileSystem.documentDirectory || "") + (testmi() ? "pdf-arxiv-test/" : "pdf-arxiv/");

// Fayl yaratadi va arxiv papkasiga qo'yadi. Natija: { uri, hajm } (web'da null — fayl yo'q)
export async function pdfFaylYarat(html, nom) {
  if (Platform.OS === "web" || !FileSystem.documentDirectory) return null;
  const { uri } = await Print.printToFileAsync({ html });
  const papka = pdfPapka();
  await FileSystem.makeDirectoryAsync(papka, { intermediates: true }).catch(() => {});
  const yangi = `${papka}${nom}.pdf`;
  await FileSystem.deleteAsync(yangi, { idempotent: true });
  await FileSystem.moveAsync({ from: uri, to: yangi });
  const info = await FileSystem.getInfoAsync(yangi).catch(() => ({}));
  return { uri: yangi, hajm: info?.size || 0 };
}

// Arxivdagi faylni ulashish/ochish — chiroyli nom bilan (nur-non-2026-10-22.pdf)
export async function pdfFaylUlash(uri, nom) {
  let fayl = uri;
  try {
    const nusxa = `${FileSystem.cacheDirectory}${nom}.pdf`;
    await FileSystem.deleteAsync(nusxa, { idempotent: true });
    await FileSystem.copyAsync({ from: uri, to: nusxa });
    fayl = nusxa;
  } catch { /* nusxa bo'lmasa — asl fayl */ }
  if (!(await Sharing.isAvailableAsync())) return false;
  await Sharing.shareAsync(fayl, { mimeType: "application/pdf", UTI: "com.adobe.pdf", dialogTitle: t("Hisobotni ulashish") });
  return true;
}

export function pdfFaylOchir(uri) {
  if (Platform.OS === "web" || !uri || !uri.startsWith(pdfPapka())) return;
  FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => {});
}
