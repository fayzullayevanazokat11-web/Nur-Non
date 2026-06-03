// Render paytidagi xatolarni ushlaydi va do'stona xabar ko'rsatadi.
// Production'da React xato chiqsa, butun ekran oppoq bo'lib qolmaslik uchun.
import React from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { C, T, S, R } from "../theme";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Konsolga yozamiz (Logcat / Expo log'da ko'rinadi)
    console.error("ErrorBoundary:", error, info?.componentStack);
  }

  reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (!this.state.hasError) return this.props.children;
    const msg = String(this.state.error?.message || this.state.error || "Noma'lum xatolik");
    return (
      <View style={styles.wrap}>
        <Text style={styles.title}>Kutilmagan xatolik</Text>
        <Text style={styles.sub}>Ilovada xatolik yuz berdi. Qayta urinib ko'ring yoki ilovani yopib qaytadan oching.</Text>
        <ScrollView style={styles.errBox}>
          <Text style={styles.err}>{msg}</Text>
        </ScrollView>
        <Pressable style={styles.btn} onPress={this.reset}>
          <Text style={styles.btnTxt}>Qaytadan urinish</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: S[5], paddingTop: S[7], backgroundColor: C.bg, justifyContent: "center" },
  title: { fontSize: T.xl, fontWeight: "800", color: C.text, marginBottom: S[2] },
  sub: { fontSize: T.sm, color: C.sub, marginBottom: S[5], lineHeight: 19 },
  errBox: { maxHeight: 200, backgroundColor: C.panel, borderRadius: R.md, padding: S[3], marginBottom: S[4] },
  err: { fontSize: 11, color: C.red, fontFamily: "monospace" },
  btn: { backgroundColor: C.accent, paddingVertical: 14, borderRadius: R.md, alignItems: "center" },
  btnTxt: { color: "#FFF3E8", fontSize: T.md, fontWeight: "800" },
});
