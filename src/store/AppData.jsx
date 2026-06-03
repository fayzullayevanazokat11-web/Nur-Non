// Butun ilova holati — har bir kolleksiya "nurnon:" prefiksi bilan AsyncStorage'da.
import { createContext, useContext, useState, useEffect } from "react";
import usePersistedState from "./usePersistedState";
import { SEED_NONLAR, SEED_ISHCHILAR, SEED_MAHSULOT_NARXLARI } from "../logic/data";

const AppDataContext = createContext(null);

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
  const [omborTasdiqlar, setOmborTasdiqlar]       = usePersistedState("nurnon:omborTasdiqlar", []);
  const [hisobotlarTarixi, setHisobotlarTarixi]   = usePersistedState("nurnon:hisobotlarTarixi", []);
  const [tasdiqlanganKunlar, setTasdiqlanganKunlar] = usePersistedState("nurnon:tasdiqlanganKunlar", []);
  const [kunlikQoplar, setKunlikQoplar]           = usePersistedState("nurnon:kunlikQoplar", []);
  const [braklar, setBraklar]                     = usePersistedState("nurnon:braklar", []);
  const [gazNarx, setGazNarx]                     = usePersistedState("nurnon:gazNarx", "350000");
  const [elektroNarx, setElektroNarx]             = usePersistedState("nurnon:elektroNarx", "0");

  // ── Kunlik kiritmalar (ham saqlanadi) ──
  const [ozIshlabQoplar, setOzIshlabQoplar]       = usePersistedState("nurnon:ozIshlabQoplar", {});
  const [tashqariSonlar, setTashqariSonlar]       = usePersistedState("nurnon:tashqariSonlar", {});
  const [sotilmaganNon, setSotilmaganNon]         = usePersistedState("nurnon:sotilmaganNon", {});
  const [kunlikQopSoni, setKunlikQopSoni]         = usePersistedState("nurnon:kunlikQopSoni", "");
  // Partiyaviy inventarizatsiya: kechagi qoldiq (bugungi tonggi zaxira) + bugungi qo'lda yaroqsizlar.
  const [boshlangichQoldiq, setBoshlangichQoldiq] = usePersistedState("nurnon:boshlangichQoldiq", {});
  const [qoldaYaroqsiz, setQoldaYaroqsiz]         = usePersistedState("nurnon:qoldaYaroqsiz", {});
  // Kunlik qo'shimcha xarajatlar (7 kun saqlanadi, kunlik sof foydadan ayriladi)
  const [kunlikXarajatlar, setKunlikXarajatlar]   = usePersistedState("nurnon:kunlikXarajatlar", []);

  // ── Vaqtinchalik oqim bayroqlari (saqlanmaydi) ──
  const [qopTasdiqlandi, setQopTasdiqlandi]       = useState(false);
  const [hisobotYopildi, setHisobotYopildi]       = useState(false);

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
      setBraklar((p) => p.filter((b) => (now - (b.vaqt || now)) < 7 * D));
      setHisobotlarTarixi((p) => p.filter((h) => (now - (h.vaqt || now)) < 30 * D));
      setOmborTasdiqlar((p) => p.filter((t) => (now - (t.vaqt || now)) < 30 * D));
      setKunlikXarajatlar((p) => p.filter((x) => (now - (x.vaqt || now)) < 7 * D));
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
    omborTasdiqlar, setOmborTasdiqlar,
    hisobotlarTarixi, setHisobotlarTarixi,
    tasdiqlanganKunlar, setTasdiqlanganKunlar,
    kunlikQoplar, setKunlikQoplar,
    braklar, setBraklar,
    gazNarx, setGazNarx,
    elektroNarx, setElektroNarx,
    ozIshlabQoplar, setOzIshlabQoplar,
    tashqariSonlar, setTashqariSonlar,
    sotilmaganNon, setSotilmaganNon,
    kunlikQopSoni, setKunlikQopSoni,
    boshlangichQoldiq, setBoshlangichQoldiq,
    qoldaYaroqsiz, setQoldaYaroqsiz,
    kunlikXarajatlar, setKunlikXarajatlar,
    qopTasdiqlandi, setQopTasdiqlandi,
    hisobotYopildi, setHisobotYopildi,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}
