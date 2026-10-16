// Splash ekran — "Non" logo rasmi, bir xil (oq) fonda. Ochilganda ~2.2s.
import { useEffect, useRef } from "react";
import { View, Text, Image, Animated, StyleSheet } from "react-native";
import { C, temaStil } from "../theme";

const LOGO = require("../../assets/splash-logo.jpg");

export function Splash({ onDone }) {
  const op = useRef(new Animated.Value(0)).current;
  const sc = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(op, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.spring(sc, { toValue: 1, friction: 6, tension: 60, useNativeDriver: true }),
    ]).start();
    const t = setTimeout(() => {
      Animated.timing(op, { toValue: 0, duration: 350, useNativeDriver: true }).start(() => onDone && onDone());
    }, 2200);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={styles.wrap}>
      <Animated.View style={{ opacity: op, transform: [{ scale: sc }], alignItems: "center" }}>
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        <Text style={styles.sub}>Boshqaruv tizimi</Text>
      </Animated.View>
    </View>
  );
}

const styles = temaStil(() => StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#FFFFFF",   // bir xil (oq) fon — logo bilan mos
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  logo: { width: 300, height: 220 },
  sub: { fontSize: 14, color: C.accent, marginTop: -6, letterSpacing: 1.5, fontWeight: "700" },
}));
