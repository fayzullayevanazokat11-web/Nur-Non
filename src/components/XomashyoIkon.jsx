// Ikonkalar — emoji o'rniga bir xil uslubdagi rasmlar (mavzu rangida bo'yaladi).
// Xomashyo: asosiylari id bo'yicha, foydalanuvchi o'zgartirgani `xomashyoIkonlari`da.
// Non: barcha nonlar uchun yagona logo (dumaloq non, muhr naqshlari).
// IkonTanlov — ikonka bosilganda shu yerning o'zida ochiladigan tanlov paneli (modal yo'q).
import { useContext, useEffect, useRef } from "react";
import { View, Text, Image, Pressable, Animated, Easing, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppDataContext } from "../store/AppData";
import { C, T, S, R, temaStil } from "../theme";

const RASM = {
  "sack": require("../../assets/xomashyo/sack.png"),
  "grain": require("../../assets/xomashyo/grain.png"),
  "barley": require("../../assets/xomashyo/barley.png"),
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
  "sprout-outline": require("../../assets/xomashyo/sprout-outline.png"),
  "leaf": require("../../assets/xomashyo/leaf.png"),
  "cup-outline": require("../../assets/xomashyo/cup-outline.png"),
  "cheese": require("../../assets/xomashyo/cheese.png"),
  "bee": require("../../assets/xomashyo/bee.png"),
  "peanut-outline": require("../../assets/xomashyo/peanut-outline.png"),
  "fruit-cherries": require("../../assets/xomashyo/fruit-cherries.png"),
  "food-apple-outline": require("../../assets/xomashyo/food-apple-outline.png"),
  "corn": require("../../assets/xomashyo/corn.png"),
  "chili-mild-outline": require("../../assets/xomashyo/chili-mild-outline.png"),
  "spoon-sugar": require("../../assets/xomashyo/spoon-sugar.png"),
  // Non — yagona logo (dumaloq o'zbek noni, muhr naqshlari bilan)
  "non-logo": require("../../assets/xomashyo/non-logo.png"),
};

// Asosiy xomashyolar (va retseptdagi suv/tuz/shakar)
const ID_IKON = {
  oqUn: "sack", sariqUn: "sack", qoraUn: "sack",
  sut: "bottle-soda-classic-outline", yog: "oil", jir: "food-steak",
  quruqSut: "cow", achitqi: "bacteria-outline", shakar: "cube-outline",
  tuz: "shaker-outline", suv: "water-outline",
};

// Xomashyo uchun tanlanadigan ikonkalar
export const IKON_TANLOV = [
  "package-variant-closed", "sack", "grain", "barley", "seed-outline", "sprout-outline",
  "egg-outline", "leaf", "oil", "bottle-soda-classic-outline", "cup-outline", "water-outline",
  "cow", "cheese", "food-steak", "bacteria-outline", "cube-outline", "shaker-outline",
  "spoon-sugar", "bee", "peanut-outline", "fruit-cherries", "corn", "chili-mild-outline",
];


export const ikonBormi = (k) => !!k && !!RASM[k];

// Xomashyo ikonkasi: foydalanuvchi tanlagani → yozuvdagi `ikon` → asosiy → umumiy quti
export const xomashyoIkonKaliti = (m, ozgartirilgan) => {
  const o = ozgartirilgan?.[m?.id];
  if (ikonBormi(o)) return o;
  if (ikonBormi(m?.ikon)) return m.ikon;
  return ID_IKON[m?.id] || "package-variant-closed";
};

// Barcha nonlar uchun bitta logo
export const nonIkonKaliti = () => "non-logo";

function Rasm({ kalit, size, color }) {
  return <Image source={RASM[kalit] || RASM["package-variant-closed"]} style={{ width: size, height: size, tintColor: color || C.accent }} resizeMode="contain" />;
}

// m — { id, ikon? }; ikon — aniq kalit (tanlov panelida); quti — fonli kvadrat ichida
export function XomashyoIkon({ m, ikon, size = 20, color, quti = false, qutiSize = 40 }) {
  const app = useContext(AppDataContext);
  const kalit = ikonBormi(ikon) ? ikon : xomashyoIkonKaliti(m, app?.xomashyoIkonlari);
  const rasm = <Rasm kalit={kalit} size={size} color={color} />;
  if (!quti) return rasm;
  return <View style={[styles.quti, { width: qutiSize, height: qutiSize }]}>{rasm}</View>;
}

export function NonIkon({ non, size = 26, color }) {
  return <Rasm kalit={nonIkonKaliti(non)} size={size} color={color} />;
}

// Bosiladigan ikonka (o'zgartirish uchun). belgi — burchakda kichik qalam (katta ikonkalarda)
export function BosiladiganIkon({ onPress, label, children, style, ochiq, belgi = true }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [style, !belgi && ochiq && styles.kichikOchiq, pressed && styles.bosildi]}
    >
      {children}
      {belgi && (
        <View style={[styles.qalam, ochiq && styles.qalamOchiq]}>
          <Ionicons name={ochiq ? "close" : "pencil"} size={8} color={ochiq ? C.onAccent : C.accent} />
        </View>
      )}
    </Pressable>
  );
}

// Ikonka tanlash paneli — shu joyning o'zida silliq ochiladi
export function IkonTanlov({ variantlar, tanlangan, onTanla, onYop, sarlavha = "Ikonkani tanlang" }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(a, { toValue: 1, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View style={[styles.panel, { opacity: a, transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [-6, 0] }) }] }]}>
      <View style={styles.panelBosh}>
        <Text style={styles.panelSarlavha}>{sarlavha}</Text>
        <Pressable accessibilityLabel="Ikonka tanlovini yopish" onPress={onYop} hitSlop={10}>
          <Ionicons name="close" size={18} color={C.sub} />
        </Pressable>
      </View>
      <View style={styles.grid}>
        {variantlar.map((k) => {
          const faol = k === tanlangan;
          return (
            <Pressable
              key={k}
              accessibilityLabel={`Ikonka: ${k}`}
              accessibilityState={{ selected: faol }}
              onPress={() => { onTanla(k); onYop?.(); }}
              style={({ pressed }) => [styles.variant, faol && styles.variantFaol, pressed && styles.bosildi]}
            >
              <Rasm kalit={k} size={22} color={faol ? C.onAccent : C.sub} />
            </Pressable>
          );
        })}
      </View>
    </Animated.View>
  );
}

const styles = temaStil(() => StyleSheet.create({
  quti:   { borderRadius: R.sm, alignItems: "center", justifyContent: "center", backgroundColor: C.accent + "14" },
  bosildi:{ opacity: 0.7, transform: [{ scale: 0.94 }] },
  qalam:  { position: "absolute", right: -4, bottom: -4, width: 16, height: 16, borderRadius: 8, alignItems: "center", justifyContent: "center", backgroundColor: C.card, borderWidth: 1, borderColor: C.accent + "55" },
  qalamOchiq: { backgroundColor: C.accent, borderColor: C.accent },
  kichikOchiq:{ borderRadius: 6, backgroundColor: C.accent + "22" },
  panel:  { marginTop: S[2], marginBottom: S[2], borderWidth: 1, borderColor: C.borderSoft, borderRadius: R.md, padding: S[3], backgroundColor: C.surface },
  panelBosh: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: S[2] },
  panelSarlavha: { fontSize: T.xs, fontWeight: "800", color: C.sub, letterSpacing: 0.4 },
  grid:   { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  variant:{ width: 42, height: 42, borderRadius: R.sm, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.borderSoft, backgroundColor: C.card },
  variantFaol: { backgroundColor: C.accent, borderColor: C.accent },
}));
