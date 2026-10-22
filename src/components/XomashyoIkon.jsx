// Xomashyo ikonkasi — emoji o'rniga bir xil uslubdagi ikonkalar (mavzu rangida bo'yaladi).
// Asosiy xomashyolar id bo'yicha; yangi qo'shilganlar o'zi tanlagan `ikon` bilan.
import { View, Image, StyleSheet } from "react-native";
import { C, R, temaStil } from "../theme";

const RASM = {
  "sack": require("../../assets/xomashyo/sack.png"),
  "grain": require("../../assets/xomashyo/grain.png"),
  "bottle-soda-classic-outline": require("../../assets/xomashyo/bottle-soda-classic-outline.png"),
  "oil": require("../../assets/xomashyo/oil.png"),
  "food-steak": require("../../assets/xomashyo/food-steak.png"),
  "cow": require("../../assets/xomashyo/cow.png"),
  "bacteria-outline": require("../../assets/xomashyo/bacteria-outline.png"),
  "cube-outline": require("../../assets/xomashyo/cube-outline.png"),
  "shaker-outline": require("../../assets/xomashyo/shaker-outline.png"),
  "water-outline": require("../../assets/xomashyo/water-outline.png"),
  "package-variant-closed": require("../../assets/xomashyo/package-variant-closed.png"),
  "egg-outline": require("../../assets/xomashyo/egg-outline.png"),
  "seed-outline": require("../../assets/xomashyo/seed-outline.png"),
  "leaf": require("../../assets/xomashyo/leaf.png"),
  "cup-outline": require("../../assets/xomashyo/cup-outline.png"),
  "cheese": require("../../assets/xomashyo/cheese.png"),
  "bee": require("../../assets/xomashyo/bee.png"),
  "peanut-outline": require("../../assets/xomashyo/peanut-outline.png"),
  "fruit-cherries": require("../../assets/xomashyo/fruit-cherries.png"),
};

// Asosiy xomashyolar (va retseptdagi suv/tuz/shakar)
const ID_IKON = {
  oqUn: "sack", sariqUn: "sack", qoraUn: "sack",
  sut: "bottle-soda-classic-outline", yog: "oil", jir: "food-steak",
  quruqSut: "cow", achitqi: "bacteria-outline", shakar: "cube-outline",
  tuz: "shaker-outline", suv: "water-outline",
};

// Yangi ingredient qo'shishda tanlanadigan ikonkalar
export const IKON_TANLOV = [
  "package-variant-closed", "sack", "grain", "seed-outline", "egg-outline", "leaf",
  "oil", "bottle-soda-classic-outline", "cup-outline", "cube-outline", "shaker-outline",
  "water-outline", "cheese", "bee", "peanut-outline", "fruit-cherries",
];

export const xomashyoIkonKaliti = (m) => (m?.ikon && RASM[m.ikon] ? m.ikon : ID_IKON[m?.id] || "package-variant-closed");

// m — { id, ikon? }; quti — fonli kvadrat ichida (ro'yxatlar uchun)
export function XomashyoIkon({ m, ikon, size = 20, color, quti = false, qutiSize = 40 }) {
  const kalit = ikon && RASM[ikon] ? ikon : xomashyoIkonKaliti(m);
  const rasm = <Image source={RASM[kalit]} style={{ width: size, height: size, tintColor: color || C.accent }} resizeMode="contain" />;
  if (!quti) return rasm;
  return <View style={[styles.quti, { width: qutiSize, height: qutiSize }]}>{rasm}</View>;
}

const styles = temaStil(() => StyleSheet.create({
  quti: { borderRadius: R.sm, alignItems: "center", justifyContent: "center", backgroundColor: C.accent + "14" },
}));
