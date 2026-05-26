// Markazlashtirilgan dizayn tizimi — ranglar (C), tipografiya (T),
// spacing (S), radius (R) va yumshoq soya (shadow).
// RN'da fontSize/spacing SON bo'ladi (px emas).

export const C = {
  // Minimalistik: barcha fonlar OQ — shakl chegara (border) bilan beriladi
  bg: "#FFFFFF", surface: "#FFFFFF", card: "#FFFFFF",
  panel: "#FFFFFF",  // sarlavha bandi ham oq — pastki hairline ajratadi
  border: "#E4D5BB", borderSoft: "#EFE7D7",  // yupqa, lekin sezilarli (tashqi) / yumshoqroq (ichki)
  accent: "#A06020", accentDim: "#A0602012",
  // Semantik rollar — faqat asosiy (issiq) palitra tonlari (qizil/yashil/ko'k YO'Q):
  // red  → "cost/qarz/manfiy"  = eng quyuq jigarrang
  // green→ "foyda/aktiv/musbat" = accent (karamel)
  // blue → "optom/neytral urg'u" = o'rta jigarrang (sub)
  red: "#3A1E08", redDim: "#3A1E080D",
  green: "#A06020", greenDim: "#A060200D",
  blue: "#8A7050", blueDim: "#8A70500D",
  text: "#3A1E08",   // asosiy matn
  sub: "#8A7050",    // ikkilamchi matn (quyuqroq)
  muted: "#B39A78",  // uchlamchi / hint (ochroq)
};

export const T = { xs: 12, sm: 13, md: 15, lg: 18, xl: 26, xxl: 32 };

// 4pt asosidagi spacing shkalasi — barcha gap/margin/padding shu yerdan
export const S = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 7: 32 };

// Burchak radiuslari
export const R = { sm: 10, md: 14, lg: 18, xl: 22, pill: 999 };

// Juda yengil soya — chegara asosiy, soya faqat nozik "ko'tarilish" beradi
export const shadow = {
  shadowColor: "#3A1E08",
  shadowOpacity: 0.04,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 1,
};

// Animatsiya — barcha o'tishlar uchun yagona ease-in-out konfiguratsiyasi
export const ANIM = { duration: 200, pressDuration: 130 };
