// Butun ilova holati — har bir kolleksiya "nurnon:" prefiksi bilan AsyncStorage'da.
import { createContext, useContext, useState, useEffect, useRef } from "react";
import { AppState } from "react-native";
import usePersistedState from "./usePersistedState";
import { SEED_NONLAR, SEED_ISHCHILAR, SEED_MAHSULOT_NARXLARI } from "../logic/data";
import { hisoblaKunlik } from "../logic/hisob";

const AppDataContext = createContext(null);

// Lokal (UTC emas) sana — YYYY-MM-DD
function localDateStr(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function useApp() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useApp() faqat <AppDataProvider> ichida ishlaydi");
  return ctx;
}

export function AppDataProvider({ children }) {
  // ── Saqlanadigan ma'lumotlar ──
  const [nonlar, setNonlar]                       = usePersistedState("nurnon:nonlar", SEED_NONLAR);
  const [ishchilar, setIshchilar]                 = usePersistedState("nurnon:ishchilar", SEED_ISHCHILAR);
  const [mahsulotNarxlari, setMahsulotNarxlari]   = usePersistedState("nurnon:mahsulotNarxlari", SEED_MAHSULOT_NARXLARI);
  const [customMahsulotlar, setCustomMahsulotlar] = usePersistedState("nurnon:customMahsulotlar", []);
  const [qarzlar, setQarzlar]                     = usePersistedState("nurnon:qarzlar", []);
  const [optomlar, setOptomlar]                   = usePersistedState("nurnon:optomlar", []);
  const [kartalar, setKartalar]                   = usePersistedState("nurnon:kartalar", []);
  const [omborlar, setOmborlar]                   = usePersistedState("nurnon:omborlar", []);
  const [omborSorovlar, setOmborSorovlar]         = usePersistedState("nurnon:omborSorovlar", []);
  const [hisobotlarTarixi, setHisobotlarTarixi]   = usePersistedState("nurnon:hisobotlarTarixi", []);
  const [tasdiqlanganKunlar, setTasdiqlanganKunlar] = usePersistedState("nurnon:tasdiqlanganKunlar", []);
  const [kunlikQoplar, setKunlikQoplar]           = usePersistedState("nurnon:kunlikQoplar", []);
  const [braklar, setBraklar]                     = usePersistedState("nurnon:braklar", []);
  const [gazNarx, setGazNarx]                     = usePersistedState("nurnon:gazNarx", "350000");
  const [elektroNarx, setElektroNarx]             = usePersistedState("nurnon:elektroNarx", "0");

  // ── Avtomatik kunlik reset (lokal vaqt bo'yicha) ──
  const [resetVaqt, setResetVaqt]                 = usePersistedState("nurnon:resetVaqt", "03:00");
  const [lastResetDate, setLastResetDate]         = usePersistedState("nurnon:lastResetDate", "");

  // ── Kunlik kiritmalar (ham saqlanadi) ──
  const [ozIshlabQoplar, setOzIshlabQoplar]       = usePersistedState("nurnon:ozIshlabQoplar", {});
  const [tashqariSonlar, setTashqariSonlar]       = usePersistedState("nurnon:tashqariSonlar", {});
  const [sotilmaganNon, setSotilmaganNon]         = usePersistedState("nurnon:sotilmaganNon", {});
  const [kunlikQopSoni, setKunlikQopSoni]         = usePersistedState("nurnon:kunlikQopSoni", "");

  // ── Vaqtinchalik oqim bayroqlari (saqlanmaydi) ──
  const [qopTasdiqlandi, setQopTasdiqlandi]       = useState(false);
  const [hisobotYopildi, setHisobotYopildi]       = useState(false);

  // Eng so'nggi qiymatlarni ushlab turuvchi ref (timer/AppState callbacklari uchun)
  const oxirgi = useRef({});
  oxirgi.current = {
    nonlar, ishchilar, mahsulotNarxlari, optomlar, qarzlar,
    ozIshlabQoplar, tashqariSonlar, sotilmaganNon, resetVaqt, lastResetDate,
  };

  // Avtomatik kunlik arxivlash + reset (qurilmaning LOKAL vaqti bo'yicha).
  // Belgilangan vaqtdan (masalan 03:00) o'tgan VA bugun hali reset bo'lmagan bo'lsa:
  // joriy kunlik ma'lumotni Tarixga ko'chiradi va ko'rsatkichlarni nolga tushiradi.
  const resetTekshir = () => {
    const L = oxirgi.current;
    const now = new Date();
    const bugun = localDateStr(now);
    if (L.lastResetDate === bugun) return;
    const [rh, rm] = String(L.resetVaqt || "03:00").split(":");
    const resetMin = (parseInt(rh, 10) || 3) * 60 + (parseInt(rm, 10) || 0);
    if (now.getHours() * 60 + now.getMinutes() < resetMin) return;

    const r = hisoblaKunlik({
      nonlar: L.nonlar, ishchilar: L.ishchilar, ozIshlabQoplar: L.ozIshlabQoplar,
      tashqariSonlar: L.tashqariSonlar, sotilmaganNon: L.sotilmaganNon,
      optomlar: L.optomlar, qarzlar: L.qarzlar, mahsulotNarxlari: L.mahsulotNarxlari,
    });
    if (r.jamiNon > 0 || r.jamiQop > 0) {
      const ydate = localDateStr(new Date(now.getTime() - 86400000));
      const snap = {
        id: Date.now(), sana: ydate, vaqt: now.getTime(), avto: true,
        ozIshlabQoplar: L.ozIshlabQoplar, tashqariSonlar: L.tashqariSonlar, sotilmaganNon: L.sotilmaganNon,
        nonlarSnapshot: JSON.parse(JSON.stringify(L.nonlar)),
        ishchilarSnapshot: JSON.parse(JSON.stringify(L.ishchilar)),
        mahsulotNarxlariSnapshot: JSON.parse(JSON.stringify(L.mahsulotNarxlari)),
        daromad: r.daromad, xomashyo: r.xomashyo, ishchiHaq: r.ishchiHaq,
        sofFoyda: r.sofFoyda, sotilganNon: r.sotilganNon, jamiQop: r.jamiQop, jamiNon: r.jamiNon,
      };
      setHisobotlarTarixi((prev) => [snap, ...(prev || []).filter((h) => h.sana !== ydate)]);
    }
    setOzIshlabQoplar({}); setTashqariSonlar({}); setSotilmaganNon({}); setKunlikQopSoni("");
    setLastResetDate(bugun);
  };

  useEffect(() => {
    const t = setTimeout(resetTekshir, 1800); // hidratsiyadan keyin
    const sub = AppState.addEventListener("change", (s) => { if (s === "active") resetTekshir(); });
    return () => { clearTimeout(t); sub.remove(); };
  }, []);

  // Avtomatik tozalash (hidratsiyadan keyin): karta/optom va to'langan qarz 7 kun,
  // kunlik hisobotlar 30 kun saqlanadi, so'ng o'chiriladi.
  useEffect(() => {
    const t = setTimeout(() => {
      const now = Date.now();
      const D = 86400000;
      const yosh = (e) => now - (e.vaqt || (e.sana ? Date.parse(e.sana) : now) || now);
      setKartalar((p) => p.filter((k) => yosh(k) < 7 * D));
      setOptomlar((p) => p.filter((o) => yosh(o) < 7 * D));
      setQarzlar((p) => p.filter((q) => !q.tolangan || (now - (q.tolanganVaqt || now)) < 7 * D));
      setHisobotlarTarixi((p) => p.filter((h) => (now - (h.vaqt || now)) < 30 * D));
    }, 1500);
    return () => clearTimeout(t);
  }, []);

  const value = {
    nonlar, setNonlar,
    ishchilar, setIshchilar,
    mahsulotNarxlari, setMahsulotNarxlari,
    customMahsulotlar, setCustomMahsulotlar,
    qarzlar, setQarzlar,
    optomlar, setOptomlar,
    kartalar, setKartalar,
    omborlar, setOmborlar,
    omborSorovlar, setOmborSorovlar,
    hisobotlarTarixi, setHisobotlarTarixi,
    tasdiqlanganKunlar, setTasdiqlanganKunlar,
    kunlikQoplar, setKunlikQoplar,
    braklar, setBraklar,
    gazNarx, setGazNarx,
    elektroNarx, setElektroNarx,
    resetVaqt, setResetVaqt,
    lastResetDate, setLastResetDate,
    ozIshlabQoplar, setOzIshlabQoplar,
    tashqariSonlar, setTashqariSonlar,
    sotilmaganNon, setSotilmaganNon,
    kunlikQopSoni, setKunlikQopSoni,
    qopTasdiqlandi, setQopTasdiqlandi,
    hisobotYopildi, setHisobotYopildi,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}
