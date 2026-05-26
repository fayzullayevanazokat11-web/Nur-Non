// Markazlashtirilgan dizayn tizimi — ranglar (C), tipografiya (T),
// spacing (S), radius (R) va yumshoq soya (shadow).
// RN'da fontSize/spacing SON bo'ladi (px emas).

export const C = {
  bg: "#F7F0E6", surface: "#FBF5EC", card: "#FFFFFF",
  panel: "#F2E8D6",  // karta sarlavha bandi — oq tanaga nisbatan biroz quyuqroq
  border: "#EADCC6", borderSoft: "#F0E6D6",
  accent: "#A06020", accentDim: "#A0602012",
  red: "#c94f4f", redDim: "#c94f4f12",
  green: "#5a8a5a", greenDim: "#5a8a5a12",
  blue: "#7a8ab0", blueDim: "#7a8ab012",
  text: "#3A1E08",   // asosiy matn
  sub: "#8A7050",    // ikkilamchi matn (quyuqroq)
  muted: "#B39A78",  // uchlamchi / hint (ochroq)
};

export const T = { xs: 12, sm: 13, md: 15, lg: 18, xl: 26, xxl: 32 };

// 4pt asosidagi spacing shkalasi — barcha gap/margin/padding shu yerdan
export const S = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 7: 32 };

// Burchak radiuslari
export const R = { sm: 10, md: 14, lg: 18, xl: 22, pill: 999 };

// Yumshoq, bir qatlamli soya (premium "suzuvchi" karta hissi)
export const shadow = {
  shadowColor: "#3A1E08",
  shadowOpacity: 0.05,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2,
};
