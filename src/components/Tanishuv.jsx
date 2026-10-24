// Kirish yo'riqnomasi (6 qadam): tanishuv, novvoyxona nomi, kundalik ish tartibi,
// bo'limlar, xavfsizlik va bildirishnoma ruxsati. Birinchi ochilishda bir marta chiqadi
// (ma'lumoti bor — yangilangan — ilovada chiqmaydi); menyudagi «Yo'riqnoma»dan qayta ochiladi.
// Qadamlar orasida tugmalar yoki chapga-o'ngga surish bilan o'tiladi.
import { useEffect, useRef, useState } from "react";
import { View, Text, Image, Pressable, TextInput, Animated, Easing, PanResponder, LayoutAnimation, Platform, StyleSheet, BackHandler } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../store/AppData";
import usePersistedState from "../store/usePersistedState";
import { ruxsatSora, ruxsatHolati, ESLATMA_SOAT } from "../logic/bildirishnoma";
import { C, T, S, R, temaStil } from "../theme";

const LOGO = require("../../assets/logo-tight.png");
const TAB_IKON = {
  markaz: require("../../assets/tabicons/markaz.png"),
  ishlab: require("../../assets/tabicons/ishlab.png"),
  xodimlar: require("../../assets/tabicons/xodimlar.png"),
  ombor: require("../../assets/tabicons/ombor.png"),
};

const QADAMLAR = ["salom", "nom", "kun", "bolim", "xavfsiz", "eslatma"];

// Menyudan qayta ochish uchun
let ochuvchi = null;
export const tanishuvniOch = () => ochuvchi?.();

const silliq = () => LayoutAnimation.configureNext(LayoutAnimation.create(240, LayoutAnimation.Types.easeInEaseOut, LayoutAnimation.Properties.opacity));

export function Tanishuv() {
  const { tayyor, hisobotlarTarixi, qarzlar, kartalar, akkauntNomi, setAkkauntNomi, setEslatmaYoqilgan, eslatmaYangila } = useApp();
  const [korildi, setKorildi] = usePersistedState("nurnon:tanishuv", null, { hidratsiya: false });
  const [yuklandi, setYuklandi] = useState(false);
  const [majburiy, setMajburiy] = useState(false);
  const [i, setI] = useState(0);
  const [yon, setYon] = useState(1); // o'tish yo'nalishi: 1 — oldinga, -1 — orqaga
  const [nom, setNom] = useState("");
  const [ruxsat, setRuxsat] = useState(null); // null | "bor" | "yoq" | "web"
  const a = useRef(new Animated.Value(0)).current;
  const fon = useRef(new Animated.Value(0)).current;

  useEffect(() => { const t = setTimeout(() => setYuklandi(true), 400); return () => clearTimeout(t); }, []);
  useEffect(() => {
    ochuvchi = () => { setI(0); setYon(1); setRuxsat(null); setMajburiy(true); };
    return () => { ochuvchi = null; };
  }, []);

  // Yangilangan ilova (ma'lumoti bor) — yo'riqnoma kerak emas
  const malumotBor = (hisobotlarTarixi || []).length > 0 || (qarzlar || []).length > 0 || (kartalar || []).length > 0;
  useEffect(() => { if (tayyor && yuklandi && korildi == null && malumotBor) setKorildi(true); }, [tayyor, yuklandi, korildi, malumotBor]);
  const korsat = majburiy || (tayyor && yuklandi && korildi == null && !malumotBor);

  useEffect(() => { if (korsat) setNom(akkauntNomi || ""); }, [korsat]);
  // Ruxsat allaqachon berilgan bo'lsa (yo'riqnoma qayta ochilganda) — "yoqilgan" deb ko'rsatiladi
  useEffect(() => {
    if (!korsat) return undefined;
    let tirik = true;
    ruxsatHolati().then((h) => { if (tirik && h === "bor") setRuxsat("bor"); });
    return () => { tirik = false; };
  }, [korsat]);

  // Ochilish (fon) va har qadam (kontent) animatsiyasi
  useEffect(() => {
    if (!korsat) return;
    fon.setValue(0);
    Animated.timing(fon, { toValue: 1, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [korsat]);
  useEffect(() => {
    if (!korsat) return;
    a.setValue(0);
    Animated.timing(a, { toValue: 1, duration: 340, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [korsat, i]);

  const yakunla = () => {
    Animated.timing(fon, { toValue: 0, duration: 220, easing: Easing.in(Easing.cubic), useNativeDriver: true }).start(() => {
      setKorildi(true);
      setMajburiy(false);
    });
  };
  const nomniSaqla = () => { const t = nom.trim(); if (t && t !== akkauntNomi) setAkkauntNomi(t); };
  const otish = (j) => {
    if (j < 0 || j >= QADAMLAR.length || j === i) return;
    if (QADAMLAR[i] === "nom") nomniSaqla();
    silliq();
    setYon(j > i ? 1 : -1);
    setI(j);
  };
  const ruxsatSo = async () => {
    if (Platform.OS === "web") { setRuxsat("web"); return; }
    const bor = await ruxsatSora();
    setRuxsat(bor ? "bor" : "yoq");
    if (bor) { setEslatmaYoqilgan(true); eslatmaYangila(); }
  };

  // Chapga-o'ngga surish bilan qadamlar orasida o'tish
  const iRef = useRef(i); iRef.current = i;
  const otishRef = useRef(otish); otishRef.current = otish;
  const sur = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 18 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
    onPanResponderRelease: (_, g) => {
      if (g.dx < -50) otishRef.current(iRef.current + 1);
      else if (g.dx > 50) otishRef.current(iRef.current - 1);
    },
  })).current;

  // "Orqaga" — oldingi qadamga (birinchi qadamda dasturdan chiqmaydi)
  useEffect(() => {
    if (!korsat) return undefined;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => { if (iRef.current > 0) otishRef.current(iRef.current - 1); return true; });
    return () => sub.remove();
  }, [korsat]);

  if (!korsat) return null;
  const q = QADAMLAR[i];
  const oxirgi = i === QADAMLAR.length - 1;
  const asosiyMatn = oxirgi ? (ruxsat ? "Boshlash" : "Ruxsat berish") : "Keyingi";
  const asosiy = () => {
    if (!oxirgi) { otish(i + 1); return; }
    if (!ruxsat) { ruxsatSo(); return; }
    yakunla();
  };
  const kirish = {
    opacity: a,
    transform: [{ translateX: a.interpolate({ inputRange: [0, 1], outputRange: [28 * yon, 0] }) }],
  };
  const ikonPop = { transform: [{ scale: a.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }] };

  return (
    <Animated.View style={[styles.fon, { opacity: fon }]}>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.tepa}>
          <Text style={styles.qadamSon}>{i + 1} / {QADAMLAR.length}</Text>
          {!oxirgi && (
            <Pressable accessibilityLabel="Yo'riqnomani o'tkazib yuborish" onPress={() => { nomniSaqla(); yakunla(); }} hitSlop={10} style={styles.otkaz}>
              <Text style={styles.otkazTxt}>O'tkazib yuborish</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.markaz} {...sur.panHandlers}>
          <Animated.View style={[styles.kontent, kirish]}>
            {q === "salom" && (
              <>
                <Animated.View style={[styles.logoQuti, ikonPop]}><Image source={LOGO} style={styles.logo} resizeMode="contain" /></Animated.View>
                <Text style={styles.sarlavha}>Xush kelibsiz!</Text>
                <Text style={styles.matn}>Nur-Non — novvoyxonangizning butun hisobi bitta joyda: ishlab chiqarish, savdo, qarzlar, xodimlar, ombor va sof foyda.</Text>
                <View style={styles.teglar}>
                  {["Internetsiz ishlaydi", "Lotin / Кирилл", "Kunduzgi va tungi dizayn"].map((t) => (
                    <View key={t} style={styles.teg}><Text style={styles.tegTxt}>{t}</Text></View>
                  ))}
                </View>
              </>
            )}

            {q === "nom" && (
              <>
                <Ikon nom="storefront-outline" pop={ikonPop} />
                <Text style={styles.sarlavha}>Novvoyxonangiz nomi</Text>
                <Text style={styles.matn}>Nom Markaz sarlavhasida, PDF hisobotlarda va ma'lumot ko'chirishda ko'rinadi.</Text>
                <TextInput
                  value={nom}
                  onChangeText={setNom}
                  placeholder="Masalan: Nur-Non novvoyxonasi"
                  placeholderTextColor={C.muted}
                  style={styles.input}
                  returnKeyType="next"
                  onSubmitEditing={() => otish(i + 1)}
                />
                <Text style={styles.izoh}>Ixtiyoriy — keyinroq menyudagi «Akkaunt»da o'zgartirasiz.</Text>
              </>
            )}

            {q === "kun" && (
              <>
                <Ikon nom="sunny-outline" pop={ikonPop} />
                <Text style={styles.sarlavha}>Har kungi tartib</Text>
                <View style={styles.royxat}>
                  <Band raqam="1" sarlavha="Qoplarni kiriting" matn="«Kunlik qop hisobi»da har non uchun qop/dona sonini yozib, «Saqlash»ni bosing." />
                  <Band raqam="2" sarlavha="Savdoni yozib boring" matn="Qarz, optom, karta va xarajatlar — sana va vaqti o'zi qo'yiladi." />
                  <Band raqam="3" sarlavha="Kunni yakunlang" matn="Kechqurun «Kunni yakunlash» — hisobot, PDF va statistika tayyor." />
                </View>
                <Text style={styles.izoh}>Ish kuni tunda soat 03:00 da tugaydi.</Text>
              </>
            )}

            {q === "bolim" && (
              <>
                <Ikon nom="apps-outline" pop={ikonPop} />
                <Text style={styles.sarlavha}>To'rt bo'lim</Text>
                <View style={styles.bolimlar}>
                  <Bolim rasm={TAB_IKON.markaz} nom="Markaz" matn="Kunlik ko'rsatkichlar" />
                  <Bolim rasm={TAB_IKON.ishlab} nom="Ishlab" matn="Non, xomashyo, tannarx" />
                  <Bolim rasm={TAB_IKON.xodimlar} nom="Xodimlar" matn="Jamoa, davomat" />
                  <Bolim rasm={TAB_IKON.ombor} nom="Ombor" matn="Zaxira, prognoz" />
                </View>
                <Text style={styles.matn}>Bo'limlar orasida chapga-o'ngga surib o'ting. Markazdagi logotipni bossangiz — menyu ochiladi.</Text>
              </>
            )}

            {q === "xavfsiz" && (
              <>
                <Ikon nom="shield-checkmark-outline" pop={ikonPop} />
                <Text style={styles.sarlavha}>Ma'lumot xavfsiz</Text>
                <View style={styles.royxat}>
                  <Band ikon="cloud-done-outline" sarlavha="Avtomatik nusxa" matn="Har kuni zaxira nusxa olinadi." />
                  <Band ikon="arrow-undo-outline" sarlavha="Tarixdagilar" matn="O'chirish, nollash, haydash va bekor qilishlar 7 kun turadi — qaytarish mumkin." />
                  <Band ikon="swap-horizontal-outline" sarlavha="Boshqa telefonga" matn="Butun akkauntni bitta matn bilan ko'chirasiz." />
                </View>
              </>
            )}

            {q === "eslatma" && (
              <>
                <Ikon nom={ruxsat === "bor" ? "notifications" : "notifications-outline"} pop={ikonPop} />
                <Text style={styles.sarlavha}>{ruxsat === "bor" ? "Bildirishnomalar yoqilgan" : "Bildirishnomalar"}</Text>
                <Text style={styles.matn}>
                  {ruxsat === "bor"
                    ? `Kechqurun soat ${ESLATMA_SOAT}:00 da kun yakunlanmagan bo'lsa, eslatib qo'yamiz. Hech narsa qilish shart emas.`
                    : `Kechqurun soat ${ESLATMA_SOAT}:00 da kun yakunlanmagan bo'lsa, eslatib qo'yamiz. Buning uchun bildirishnomalarga ruxsat bering.`}
                </Text>
                {ruxsat && (
                  <View style={[styles.holat, ruxsat === "bor" && styles.holatBor]}>
                    <Ionicons name={ruxsat === "bor" ? "checkmark-circle" : "information-circle-outline"} size={18} color={ruxsat === "bor" ? C.accent : C.sub} />
                    <Text style={styles.holatTxt}>
                      {ruxsat === "bor" ? "Ruxsat berilgan — eslatmalar yoqiq"
                        : ruxsat === "web" ? "Bu qurilmada bildirishnoma ishlamaydi"
                        : "Ruxsat berilmadi. Keyinroq menyudagi «Kechki eslatma»dan yoqish mumkin."}
                    </Text>
                  </View>
                )}
              </>
            )}
          </Animated.View>
        </View>

        <View style={styles.nuqtalar}>
          {QADAMLAR.map((k, j) => (
            <Pressable key={k} accessibilityLabel={`${j + 1}-qadam`} onPress={() => otish(j)} hitSlop={6}>
              <View style={[styles.nuqta, j === i && styles.nuqtaFaol, j < i && styles.nuqtaOtgan]} />
            </Pressable>
          ))}
        </View>

        <View style={styles.tugmalar}>
          {i > 0 && (
            <Pressable accessibilityRole="button" accessibilityLabel="Orqaga" onPress={() => otish(i - 1)} style={({ pressed }) => [styles.orqaga, pressed && styles.bosildi]}>
              <Ionicons name="arrow-back" size={20} color={C.sub} />
            </Pressable>
          )}
          <Pressable accessibilityRole="button" onPress={asosiy} style={({ pressed }) => [styles.btn, pressed && styles.bosildi]}>
            <Text style={styles.btnTxt}>{asosiyMatn}</Text>
            <Ionicons name={oxirgi ? (ruxsat ? "checkmark" : "notifications-outline") : "arrow-forward"} size={18} color={C.onAccent} />
          </Pressable>
        </View>
        {oxirgi && !ruxsat && (
          <Pressable accessibilityRole="button" onPress={yakunla} hitSlop={8} style={styles.keyin}>
            <Text style={styles.keyinTxt}>Keyinroq</Text>
          </Pressable>
        )}
      </SafeAreaView>
    </Animated.View>
  );
}

function Ikon({ nom, pop }) {
  return <Animated.View style={[styles.icon, pop]}><Ionicons name={nom} size={42} color={C.accent} /></Animated.View>;
}

function Band({ raqam, ikon, sarlavha, matn }) {
  return (
    <View style={styles.band}>
      <View style={styles.bandBelgi}>
        {raqam ? <Text style={styles.bandRaqam}>{raqam}</Text> : <Ionicons name={ikon} size={17} color={C.accent} />}
      </View>
      <View style={styles.flex1}>
        <Text style={styles.bandSarlavha}>{sarlavha}</Text>
        <Text style={styles.bandMatn}>{matn}</Text>
      </View>
    </View>
  );
}

function Bolim({ rasm, nom, matn }) {
  return (
    <View style={styles.bolim}>
      <View style={styles.bolimIkon}><Image source={rasm} style={styles.bolimRasm} resizeMode="contain" /></View>
      <Text style={styles.bolimNom}>{nom}</Text>
      <Text style={styles.bolimMatn} numberOfLines={2}>{matn}</Text>
    </View>
  );
}

const styles = temaStil(() => StyleSheet.create({
  fon:     { ...StyleSheet.absoluteFillObject, backgroundColor: C.bg, zIndex: 50 },
  safe:    { flex: 1, paddingHorizontal: S[6], paddingBottom: S[5] },
  flex1:   { flex: 1 },
  tepa:    { flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 44 },
  qadamSon:{ fontSize: T.xs, color: C.muted, fontWeight: "800", letterSpacing: 1 },
  otkaz:   { paddingVertical: S[3] },
  otkazTxt:{ fontSize: T.sm, color: C.sub, fontWeight: "700" },
  markaz:  { flex: 1, justifyContent: "center" },
  kontent: { alignItems: "center" },
  logoQuti:{ width: 104, height: 104, borderRadius: 32, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", marginBottom: S[6], borderWidth: 1, borderColor: C.accent + "33" },
  logo:    { width: 72, height: 72 },
  icon:    { width: 92, height: 92, borderRadius: 30, backgroundColor: C.accent + "14", alignItems: "center", justifyContent: "center", marginBottom: S[5] },
  sarlavha:{ fontSize: T.xl, fontWeight: "800", color: C.text, textAlign: "center", letterSpacing: -0.5 },
  matn:    { fontSize: T.md, color: C.sub, textAlign: "center", lineHeight: 23, marginTop: S[3] },
  izoh:    { fontSize: T.xs, color: C.muted, textAlign: "center", marginTop: S[3] },
  teglar:  { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 6, marginTop: S[5] },
  teg:     { paddingVertical: 5, paddingHorizontal: 10, borderRadius: R.pill, backgroundColor: C.accent + "14" },
  tegTxt:  { fontSize: 11, fontWeight: "800", color: C.accent },
  input:   { alignSelf: "stretch", marginTop: S[5], borderWidth: 1, borderColor: C.border, borderRadius: R.md, paddingVertical: 14, paddingHorizontal: 16, fontSize: T.md, color: C.text, backgroundColor: C.surface, textAlign: "center", fontWeight: "700" },
  royxat:  { alignSelf: "stretch", marginTop: S[5], gap: S[3] },
  band:    { flexDirection: "row", alignItems: "flex-start", gap: S[3], backgroundColor: C.card, borderRadius: R.md, borderWidth: StyleSheet.hairlineWidth, borderColor: C.borderSoft, padding: S[3] },
  bandBelgi:{ width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: C.accent + "18" },
  bandRaqam:{ fontSize: T.md, fontWeight: "800", color: C.accent },
  bandSarlavha:{ fontSize: T.sm, fontWeight: "800", color: C.text },
  bandMatn:{ fontSize: T.xs, color: C.sub, marginTop: 2, lineHeight: 17 },
  bolimlar:{ flexDirection: "row", gap: S[2], marginTop: S[5], alignSelf: "stretch" },
  bolim:   { flex: 1, alignItems: "center", backgroundColor: C.card, borderRadius: R.md, borderWidth: StyleSheet.hairlineWidth, borderColor: C.borderSoft, paddingVertical: S[3], paddingHorizontal: 4 },
  bolimIkon:{ width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: C.accent + "14" },
  bolimRasm:{ width: 22, height: 22, tintColor: C.accent },
  bolimNom:{ fontSize: T.xs, fontWeight: "800", color: C.text, marginTop: 6 },
  bolimMatn:{ fontSize: 10, color: C.muted, textAlign: "center", marginTop: 2, lineHeight: 13 },
  holat:   { flexDirection: "row", alignItems: "center", gap: S[2], marginTop: S[5], alignSelf: "stretch", backgroundColor: C.panel, borderRadius: R.md, paddingVertical: S[3], paddingHorizontal: S[4] },
  holatBor:{ backgroundColor: C.accent + "14" },
  holatTxt:{ flex: 1, fontSize: T.sm, color: C.text, fontWeight: "600" },
  nuqtalar:{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6, marginBottom: S[5] },
  nuqta:   { width: 7, height: 7, borderRadius: 4, backgroundColor: C.border },
  nuqtaOtgan:{ backgroundColor: C.accent + "66" },
  nuqtaFaol:{ width: 24, backgroundColor: C.accent },
  tugmalar:{ flexDirection: "row", gap: S[2] },
  orqaga:  { width: 52, alignItems: "center", justifyContent: "center", borderRadius: R.md, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface },
  btn:     { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: S[2], backgroundColor: C.accent, borderRadius: R.md, paddingVertical: 15 },
  btnTxt:  { fontSize: T.md, fontWeight: "800", color: C.onAccent },
  bosildi: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  keyin:   { alignSelf: "center", paddingVertical: S[3], marginTop: S[1] },
  keyinTxt:{ fontSize: T.sm, color: C.sub, fontWeight: "700" },
}));
