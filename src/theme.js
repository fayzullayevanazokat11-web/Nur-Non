// Markazlashtirilgan dizayn tizimi — ranglar (C), tipografiya (T),
// spacing (S), radius (R) va yumshoq soya (shadow).
// RN'da fontSize/spacing SON bo'ladi (px emas).

export const C = {
  // Premium minimalist: OQ asosiy fon, QAYMOQ bloklar (qatlamlararo farq + yumshoq soya)
  bg: "#FFFFFF",          // asosiy ekran foni — oq
  surface: "#FFFFFF",     // input/inset — oq (qaymoq karta ustida toza ko'rinadi)
  card: "#FBF6EC",        // bloklar — yumshoq qaymoq
  panel: "#F6EEDF",       // ichki band / chuqurroq qaymoq
  border: "#E2D2B4", borderSoft: "#EDE2CF",  // sezilarli, lekin yumshoq chegara chizig'i
  accent: "#A0612A", accentDim: "#A0612A12", // jigarrang — FAQAT asosiy harakatlar (tugmalar) uchun
  // Semantik rollar — issiq palitra tonlari (qizil/yashil/ko'k YO'Q):
  red: "#3A1E08", redDim: "#3A1E080D",
  green: "#A0612A", greenDim: "#A0612A0D",
  blue: "#8A7355", blueDim: "#8A73550D",
  text: "#33200E",   // asosiy matn — iliq quyuq jigarrang
  sub: "#8A7458",    // ikkilamchi matn / dekorativ ikonkalar
  muted: "#B5A07E",  // uchlamchi / hint
};

export const T = { xs: 12, sm: 13, md: 15, lg: 19, xl: 28, xxl: 34 };

// 4pt asosidagi spacing shkalasi
export const S = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 7: 32, 8: 40 };

// Burchak radiuslari — yumshoqroq (premium)
export const R = { sm: 14, md: 18, lg: 24, xl: 30, pill: 999 };

// Yumshoq iliq soya — yengil (ko'p kartali ro'yxatda scroll ravon bo'lishi uchun)
export const shadow = {
  shadowColor: "#5A3A1A",
  shadowOpacity: 0.07,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 3 },
  elevation: 2,
};

// Animatsiya — yagona ease-in-out konfiguratsiyasi
export const ANIM = { duration: 220, pressDuration: 140 };
