// Guruhlangan bo'lim — bir nechta qator/karta alohida-alohida "sochilib" yotmasdan, bitta
// yaxlit kartada ingichka ajratgichlar bilan turadi (sozlamalar ro'yxatidek).
//   <Guruh sarlavha="HISOB-KITOB" icon=".." soni="3 ta">  — tepada kichik bo'lim sarlavhasi
//   <GuruhQator icon|image nom izoh qiymat onPress />      — bosiladigan qator (o'q bilan)
//   <KorsatkichQatori items=[...] />                       — bir kartada ustunlarga bo'lingan ko'rsatkichlar
// ExpandableCard `ichki` bilan Guruh ichida ham ishlaydi (o'z ramkasi va soyasisiz).
import { Children, Fragment, isValidElement } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "./Card";
import { Bosma } from "./Bosma";
import { C, T, S, R, temaStil } from "../theme";

export function GuruhSarlavha({ nom, icon, tint, soni, style }) {
  const rang = tint || C.sub;
  return (
    <View style={[styles.sar, style]}>
      {icon ? <Ionicons name={icon} size={13} color={rang} /> : null}
      <Text style={[styles.sarNom, { color: rang }]}>{nom}</Text>
      {soni != null ? <Text style={[styles.sarSoni, { color: rang }]}>{soni}</Text> : null}
    </View>
  );
}

export function Guruh({ sarlavha, icon, tint, soni, izoh, children, style }) {
  const bolalar = Children.toArray(children).filter((b) => isValidElement(b));
  if (!bolalar.length) return null;
  return (
    <View style={[styles.wrap, style]}>
      {sarlavha ? <GuruhSarlavha nom={sarlavha} icon={icon} tint={tint} soni={soni} /> : null}
      {izoh ? <Text style={styles.izoh}>{izoh}</Text> : null}
      <Card animate={false} style={styles.karta}>
        {bolalar.map((b, i) => (
          <Fragment key={b.key ?? i}>
            {i > 0 && <View style={styles.ajrat} />}
            {b}
          </Fragment>
        ))}
      </Card>
    </View>
  );
}

export function GuruhQator({ icon, image, nom, izoh, qiymat, onPress, accessibilityLabel, ogoh, chap }) {
  return (
    <Bosma
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || nom}
      onPress={onPress}
      kichrayish={0.985}
      style={styles.qator}
    >
      {chap || (
        <View style={styles.ikon}>
          {image
            ? <Image source={image} style={styles.ikonRasm} resizeMode="contain" />
            : <Ionicons name={icon} size={20} color={C.accent} />}
        </View>
      )}
      <View style={styles.flex1}>
        <Text style={styles.nom} numberOfLines={1}>{nom}</Text>
        {izoh ? <Text style={[styles.qIzoh, ogoh && { color: C.red }]} numberOfLines={1}>{izoh}</Text> : null}
      </View>
      {qiymat != null ? <Text style={styles.qiymat} numberOfLines={1}>{qiymat}</Text> : null}
      <Ionicons name="chevron-forward" size={17} color={C.muted} />
    </Bosma>
  );
}

// Bir kartada ustunlar: [{ label, qiymat, birlik, icon|image, tint, soni, onPress, accessibilityLabel }]
// 4 ta bo'lsa — 2×2 to'r (tor ekranda sig'ishi uchun), aks holda bitta qator
export function KorsatkichQatori({ items, style }) {
  const qatorlar = items.length === 4 ? [items.slice(0, 2), items.slice(2)] : [items];
  return (
    <Card animate={false} style={[styles.korKarta, style]}>
      {qatorlar.map((qator, q) => (
        <Fragment key={q}>
          {q > 0 && <View style={styles.korQatorAjrat} />}
          <View style={styles.korQator}>
            {qator.map((it, i) => (
              <Fragment key={it.label}>
                {i > 0 && <View style={styles.korAjrat} />}
                <KorsatkichUstun it={it} />
              </Fragment>
            ))}
          </View>
        </Fragment>
      ))}
    </Card>
  );
}

function KorsatkichUstun({ it }) {
  const ichi = (
    <>
      <View style={styles.korUst}>
        {it.image
          ? <Image source={it.image} style={[styles.korRasm, { tintColor: it.tint || C.accent }]} resizeMode="contain" />
          : it.icon ? <Ionicons name={it.icon} size={15} color={it.tint || C.accent} /> : null}
        <Text style={styles.korLabel} numberOfLines={1}>{it.label}</Text>
        {it.soni > 0 ? <View style={styles.korSoni}><Text style={styles.korSoniTxt}>{it.soni}</Text></View> : null}
      </View>
      <Text style={styles.korQiymat} numberOfLines={1} adjustsFontSizeToFit>{it.qiymat}</Text>
      {it.birlik ? <Text style={styles.korBirlik} numberOfLines={1}>{it.birlik}</Text> : null}
    </>
  );
  return it.onPress ? (
    <Bosma accessibilityRole="button" accessibilityLabel={it.accessibilityLabel || it.label} onPress={it.onPress} kichrayish={0.95} tashqi={styles.flex1} style={styles.korUstun}>
      {ichi}
    </Bosma>
  ) : (
    <View style={[styles.flex1, styles.korUstun]}>{ichi}</View>
  );
}

const styles = temaStil(() => StyleSheet.create({
  wrap:     { marginBottom: S[5] },
  sar:      { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: S[2], paddingHorizontal: S[1] },
  sarNom:   { flex: 1, fontSize: T.xs, fontWeight: "800", letterSpacing: 1.1 },
  sarSoni:  { fontSize: T.xs, fontWeight: "700" },
  izoh:     { fontSize: 11, color: C.muted, marginTop: -4, marginBottom: S[2], paddingHorizontal: S[1] },
  karta:    { padding: 0, overflow: "hidden" },
  ajrat:    { height: StyleSheet.hairlineWidth, backgroundColor: C.borderSoft, marginLeft: S[4] },
  qator:    { flexDirection: "row", alignItems: "center", gap: S[3], paddingVertical: S[3], paddingHorizontal: S[4], minHeight: 64 },
  ikon:     { width: 40, height: 40, borderRadius: R.sm, alignItems: "center", justifyContent: "center", backgroundColor: C.accent + "14" },
  ikonRasm: { width: 22, height: 22, tintColor: C.accent },
  flex1:    { flex: 1 },
  nom:      { fontSize: T.md, fontWeight: "800", color: C.text, letterSpacing: -0.2 },
  qIzoh:    { fontSize: 11, color: C.muted, fontWeight: "600", marginTop: 2 },
  qiymat:   { fontSize: T.sm, fontWeight: "800", color: C.accent, maxWidth: 120 },

  korKarta: { padding: 0, marginBottom: S[4], overflow: "hidden" },
  korQator: { flexDirection: "row" },
  korQatorAjrat:{ height: StyleSheet.hairlineWidth, backgroundColor: C.borderSoft, marginHorizontal: S[3] },
  korUstun: { paddingVertical: S[3], paddingHorizontal: S[4] },
  korAjrat: { width: StyleSheet.hairlineWidth, backgroundColor: C.borderSoft, marginVertical: S[3] },
  korUst:   { flexDirection: "row", alignItems: "center", gap: 4 },
  korRasm:  { width: 16, height: 16 },
  korLabel: { flexShrink: 1, fontSize: 10, color: C.muted, fontWeight: "800", letterSpacing: 0.4, textTransform: "uppercase" },
  korSoni:  { minWidth: 16, height: 16, paddingHorizontal: 4, borderRadius: 8, backgroundColor: C.accent, alignItems: "center", justifyContent: "center" },
  korSoniTxt:{ fontSize: 9, fontWeight: "800", color: C.onAccent },
  korQiymat:{ fontSize: 20, fontWeight: "800", color: C.text, letterSpacing: -0.3, marginTop: S[2] },
  korBirlik:{ fontSize: 10, color: C.muted, fontWeight: "600", marginTop: 1 },
}));
