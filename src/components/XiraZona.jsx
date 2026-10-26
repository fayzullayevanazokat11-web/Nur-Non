// Suzuvchi barlar ortidagi xira zona: bar ortida va undan biroz nariroqda tagidan o'tayotgan kontent fon
// rangiga asta singib ketadi (yumshoq gradient). Ko'p yupqa qatlamdan yasalgan — native modul va har
// kadrda qayta chizish yo'q, shuning uchun sahifa almashganda titramaydi.
//   qattiq — ekran chetidan bar chetigacha (deyarli to'liq fon), otish — bar chetidan keyingi yumshoq o'tish
import { View, StyleSheet } from "react-native";
import { C } from "../theme";

const QATLAM = 12;
const hex = (a) => Math.round(255 * a).toString(16).padStart(2, "0");

export function XiraZona({ joy, qattiq, otish = 40 }) {
  if (!(qattiq > 0)) return null;
  const h = otish / QATLAM;
  // Yumshoq qism: bar chetidan uzoqlashgani sari shaffoflashadi (silliq egri)
  const yumshoq = Array.from({ length: QATLAM }, (_, i) => {
    const t = (i + 0.5) / QATLAM;
    return <View key={i} style={{ height: h + 0.5, backgroundColor: C.bg + hex(0.92 * (1 - t) * (1 - t)) }} />;
  });
  const asos = <View key="asos" style={{ height: qattiq, backgroundColor: C.bg + hex(0.94) }} />;
  return (
    <View pointerEvents="none" style={[styles.zona, joy === "tepa" ? { top: 0 } : { bottom: 0 }, { height: qattiq + otish }]}>
      {joy === "tepa" ? [asos, ...yumshoq] : [...yumshoq.reverse(), asos]}
    </View>
  );
}

const styles = StyleSheet.create({
  zona: { position: "absolute", left: 0, right: 0, overflow: "hidden" },
});
