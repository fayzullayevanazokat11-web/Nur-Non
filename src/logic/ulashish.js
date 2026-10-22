// Hisobotni ulashish: PDF (Telegram'ga fayl bo'lib boradi) yoki oddiy matn.
// Barcha matn joriy yozuvda (lotin/kirill) chiqadi. PDF har doim yorug' fonda.
import { Platform, Share } from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { formatSom } from "./hisob";
import { getTil } from "../i18n/til";
import { ogir } from "../i18n/translit";

const t = (s) => ogir(String(s ?? ""), getTil());
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const tx = (s) => esc(t(s));
const som = (x) => `${formatSom(x)} ${t("so'm")}`;
const son = (x) => parseFloat(x) || 0;

const USLUB = `
  * { box-sizing: border-box; }
  body { font-family: -apple-system, Roboto, "Segoe UI", Arial, sans-serif; color: #3B2A12; margin: 0; padding: 28px; background: #fff; }
  .bosh { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #93640E; padding-bottom: 12px; margin-bottom: 18px; }
  .brend { font-size: 22px; font-weight: 800; color: #93640E; }
  .akk { font-size: 13px; color: #806A33; margin-top: 2px; }
  .sana { font-size: 13px; color: #806A33; text-align: right; }
  h1 { font-size: 18px; margin: 0 0 4px; }
  .katta { display: flex; gap: 10px; margin: 14px 0 18px; }
  .plitka { flex: 1; background: #FBF4E2; border: 1px solid #F0E6C8; border-radius: 12px; padding: 10px 12px; }
  .plitka .l { font-size: 11px; color: #806A33; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; }
  .plitka .v { font-size: 18px; font-weight: 800; margin-top: 3px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 13px; }
  th { text-align: left; font-size: 11px; color: #806A33; text-transform: uppercase; letter-spacing: .5px; padding: 6px 4px; border-bottom: 1px solid #E8D8A8; }
  td { padding: 7px 4px; border-bottom: 1px solid #F5EDDA; }
  td.r, th.r { text-align: right; }
  .jami td { font-weight: 800; border-bottom: none; border-top: 2px solid #E8D8A8; }
  .bolim { font-size: 12px; font-weight: 800; color: #806A33; letter-spacing: 1px; margin: 18px 0 6px; text-transform: uppercase; }
  .izoh { font-size: 11px; color: #A8935C; margin-top: 18px; }
`;

function sahifa({ sarlavha, davr, akkaunt, ichi }) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${USLUB}</style></head><body>
    <div class="bosh">
      <div><div class="brend">Nur-Non</div>${akkaunt ? `<div class="akk">${tx(akkaunt)}</div>` : ""}</div>
      <div class="sana"><h1>${tx(sarlavha)}</h1>${tx(davr)}</div>
    </div>
    ${ichi}
    <div class="izoh">${tx("Nur-Non boshqaruv tizimida tayyorlandi")}</div>
  </body></html>`;
}

const plitkalar = (arr) => `<div class="katta">${arr.map(([l, v]) => `<div class="plitka"><div class="l">${tx(l)}</div><div class="v">${esc(v)}</div></div>`).join("")}</div>`;
const jadval = (bosh, qatorlar, jami) => `<table><tr>${bosh.map((b, i) => `<th class="${i ? "r" : ""}">${tx(b)}</th>`).join("")}</tr>
  ${qatorlar.map((q) => `<tr>${q.map((c, i) => `<td class="${i ? "r" : ""}">${esc(c)}</td>`).join("")}</tr>`).join("")}
  ${jami ? `<tr class="jami">${jami.map((c, i) => `<td class="${i ? "r" : ""}">${esc(c)}</td>`).join("")}</tr>` : ""}</table>`;

// ── Bitta kunlik hisobot ──
export function kunlikHtml(h, { akkaunt, nonlar } = {}) {
  const daromad = son(h.daromad), haq = son(h.ishchiHaq);
  const nonQatorlar = (h.nonlarSnapshot || nonlar || []).map((n) => {
    const oz = n.ozIshlab !== false;
    const q = oz ? (parseInt((h.ozIshlabQoplar || {})[n.id]) || 0) : (parseInt((h.tashqariSonlar || {})[n.id]) || 0);
    return q > 0 ? [t(n.nom), `${q} ${t(oz ? "qop" : "dona")}`] : null;
  }).filter(Boolean);
  const ishchilar = (h.ishchiHaqlari || []).map((w) => [t(w.ism), som(w.net)]);
  const a = h.arxiv || {};
  const qoshimcha = [
    ["Karta to'lovlari", a.kartaSum], ["Optom savdo", a.optomSum], ["Brak", a.brakSum], ["Qo'shimcha xarajat", h.xarajatJami],
  ].filter(([, v]) => son(v) > 0).map(([l, v]) => [t(l), som(v)]);
  const ichi = plitkalar([["Sof foyda", som(h.sofFoyda)], ["Daromad", som(daromad)], ["Sotilgan non", `${formatSom(h.sotilganNon)} ${t("dona")}`]])
    + (nonQatorlar.length ? `<div class="bolim">${tx("Ishlab chiqarish")}</div>` + jadval(["Non turi", "Miqdor"], nonQatorlar) : "")
    + `<div class="bolim">${tx("Moliya")}</div>` + jadval(["Ko'rsatkich", "Summa"], [
      [t("Daromad"), som(daromad)], [t("Ishchi haqi"), som(haq)], [t("Kun oxiri (daromad − ishchi haqi)"), som(daromad - haq)], ...qoshimcha,
    ], [t("Sof foyda"), som(h.sofFoyda)])
    + (ishchilar.length ? `<div class="bolim">${tx("Ishchilar haqi")}</div>` + jadval(["Xodim", "Haq"], ishchilar, [t("Jami"), som(haq)]) : "");
  return sahifa({ sarlavha: "Kunlik hisobot", davr: h.sana, akkaunt, ichi });
}

export function kunlikMatn(h, { akkaunt } = {}) {
  const daromad = son(h.daromad), haq = son(h.ishchiHaq);
  const q = [
    `📊 ${t("Nur-Non — kunlik hisobot")}`, `📅 ${h.sana}`, akkaunt ? `👤 ${t(akkaunt)}` : null, "",
    `${t("Daromad")}: ${som(daromad)}`, `${t("Ishchi haqi")}: ${som(haq)}`, `${t("Kun oxiri")}: ${som(daromad - haq)}`,
    son(h.xarajatJami) > 0 ? `${t("Qo'shimcha xarajat")}: ${som(h.xarajatJami)}` : null,
    `${t("Sof foyda")}: ${som(h.sofFoyda)}`, "",
    `${t("Ishlab chiqarilgan")}: ${formatSom(h.jamiNon)} ${t("dona")} (${formatSom(h.jamiQop)} ${t("qop")})`,
    `${t("Sotilgan")}: ${formatSom(h.sotilganNon)} ${t("dona")}`,
  ];
  return q.filter((x) => x !== null).join("\n");
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

export async function matnUlash(matn) {
  await Share.share({ message: matn });
}
