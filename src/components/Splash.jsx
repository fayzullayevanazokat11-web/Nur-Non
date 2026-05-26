// Splash ekran — ilova ochilganda ~2.2s ko'rinadi (avvalgi versiyadagidek).
import { useEffect, useRef } from "react";
import { View, Text, Animated, StyleSheet } from "react-native";
import { C } from "../theme";

export function Splash({ onDone }) {
  const op = useRef(new Animated.Value(0)).current;
  const sc = useRef(new Animated.Value(0.9)).current;

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
        <View style={styles.logo}>
          <Text style={styles.logoTxt}>Non</Text>
        </View>
        <Text style={styles.title}>Nur-Non</Text>
        <Text style={styles.sub}>Boshqaruv tizimi</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: C.accent,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: "#FFF3E8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  logoTxt: { fontSize: 30, fontWeight: "900", color: C.accent, fontFamily: "Georgia", letterSpacing: 0.5 },
  title: { fontSize: 34, fontWeight: "900", color: "#FFF3E8", letterSpacing: 0.5 },
  sub: { fontSize: 14, color: "#FFF3E8", opacity: 0.85, marginTop: 4, letterSpacing: 1 },
});
