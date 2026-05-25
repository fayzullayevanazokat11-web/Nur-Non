// Butun ilova holati — har bir kolleksiya "nurnon:" prefiksi bilan AsyncStorage'da.
import { createContext, useContext, useState } from "react";
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
  const [omborlar, setOmborlar]                   = usePersistedState("nurnon:omborlar", []);
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

  // ── Vaqtinchalik oqim bayroqlari (saqlanmaydi) ──
  const [qopTasdiqlandi, setQopTasdiqlandi]       = useState(false);
  const [hisobotYopildi, setHisobotYopildi]       = useState(false);

  const value = {
    nonlar, setNonlar,
    ishchilar, setIshchilar,
    mahsulotNarxlari, setMahsulotNarxlari,
    customMahsulotlar, setCustomMahsulotlar,
    qarzlar, setQarzlar,
    optomlar, setOptomlar,
    omborlar, setOmborlar,
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
    qopTasdiqlandi, setQopTasdiqlandi,
    hisobotYopildi, setHisobotYopildi,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}
