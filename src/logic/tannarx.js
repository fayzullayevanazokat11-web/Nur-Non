// Tannarx kalkulyatori: 1 dona non qancha turadi va qancha foyda qoladi.
// 1 qop uchun: xomashyo (retsept × narxlar) + qoplik ishchilar stavkasi +
// kunlik ishchilar ulushi + gaz/elektr ulushi (kunlik xarajat ÷ kunlik qoplar).
import { getQopTannarx } from "./hisob";

const son = (x) => parseFloat(String(x ?? "").replace(/\s/g, "")) || 0;

// Oxirgi 7 hisobot bo'yicha o'rtacha kunlik qop (bo'lmasa bugungi, bo'lmasa 0)
export function ortachaKunlikQop(hisobotlar, bugungiQop = 0) {
  const oxirgi = (hisobotlar || []).slice(0, 7).filter((h) => son(h.jamiQop) > 0);
  if (oxirgi.length) return Math.round((oxirgi.reduce((s, h) => s + son(h.jamiQop), 0) / oxirgi.length) * 10) / 10;
  return son(bugungiQop);
}

export function tannarxHisobi({ nonlar, mahsulotNarxlari, ishchilar, gazKunlik, elektrKunlik, kunlikQop }) {
  const aktiv = (ishchilar || []).filter((w) => w.holat === "Aktiv");
  const kunlikIshchilar = aktiv.filter((w) => w.haqTuri !== "qop").reduce((s, w) => s + son(w.miqdor), 0);
  const qoplar = son(kunlikQop);
  const ulush = (x) => (qoplar > 0 ? x / qoplar : 0);
  const energiyaQop = ulush(son(gazKunlik) + son(elektrKunlik));
  const kunlikUlushQop = ulush(kunlikIshchilar);

  return (nonlar || []).map((n) => {
    const narx = son(n.narx);
    if (n.ozIshlab === false) {
      const foyda = son(n.tashqariFoyda);
      const dona = Math.max(0, narx - foyda);
      return { id: n.id, nom: n.nom, oz: false, narx, dona, foyda, marja: narx ? foyda / narx : 0 };
    }
    const nonSoni = son(n.nonSoni);
    const xomashyo = getQopTannarx(n, mahsulotNarxlari);
    const qoplik = aktiv.filter((w) => w.haqTuri === "qop" && (w.nonTurlari || []).includes(n.nom))
      .reduce((s, w) => s + son((w.nonNarxlari || {})[n.nom]), 0);
    const qismlar = [
      { k: "xomashyo", nom: "Xomashyo", qop: xomashyo },
      { k: "qoplik", nom: "Qoplik ishchilar", qop: qoplik },
      { k: "kunlik", nom: "Kunlik ishchilar ulushi", qop: kunlikUlushQop },
      { k: "energiya", nom: "Gaz va elektr ulushi", qop: energiyaQop },
    ].map((q) => ({ ...q, dona: nonSoni > 0 ? q.qop / nonSoni : 0 }));
    const qopJami = qismlar.reduce((s, q) => s + q.qop, 0);
    const dona = nonSoni > 0 ? qopJami / nonSoni : 0;
    const foyda = narx - dona;
    return { id: n.id, nom: n.nom, oz: true, narx, nonSoni, qismlar, qopJami, dona, foyda, marja: narx ? foyda / narx : 0, qopFoyda: foyda * nonSoni };
  });
}

// Sinov narxi bilan foyda
export function sinovFoyda(r, narx) {
  const n = son(narx);
  const foyda = n - r.dona;
  return { foyda, marja: n ? foyda / n : 0, qopFoyda: r.oz ? foyda * (r.nonSoni || 0) : null };
}

// Narx o'zgarishining nonlarga ta'siri: har bir o'zimiz pishiradigan non uchun 1 dona qanchaga o'zgardi
const birlikNarx = (p) => (p && son(p.miqdor) > 0 ? son(p.narx) / son(p.miqdor) : 0);
export function narxTasiri(ozgarish, nonlar) {
  const farq = birlikNarx(ozgarish.yangi) - birlikNarx(ozgarish.eski);
  return (nonlar || [])
    .filter((n) => n.ozIshlab !== false && son(n.nonSoni) > 0)
    .map((n) => {
      const m = (n.mahsulotlar || []).find((x) => x.id === ozgarish.xId);
      if (!m) return null;
      return { nom: n.nom, dona: (son(m.miqdor) * farq) / son(n.nonSoni) };
    })
    .filter((x) => x && Math.abs(x.dona) >= 1);
}
