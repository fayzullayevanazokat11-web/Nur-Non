// Yig'iladigan karta (akkordeon) — sarlavha bandi bosilganda tana silliq ochiladi/yopiladi.
// Fon oq; ochiqda pastki hairline ajratadi. Chevron ease-in-out bilan aylanadi.
import { useEffect, useRef, useState } from "react";
import { Animated, View, Pressable, Easing, StyleSheet, LayoutAnimation, Platform, UIManager } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "./Card";
import { C, R, S, ANIM } from "../theme";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export function ExpandableCard({ header, children, defaultOpen = false, style }) {
  const [open, setOpen] = useState(defaultOpen);
  const rot = useRef(new Animated.Value(defaultOpen ? 1 : 0)).current;
  const press = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(rot, {
      toValue: open ? 1 : 0,
      duration: ANIM.duration,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [open, rot]);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.create(ANIM.duration, LayoutAnimation.Types.easeInEaseOut, LayoutAnimation.Properties.opacity));
    setOpen((o) => !o);
  };

  const animatePress = (to) =>
    Animated.timing(press, { toValue: to, duration: ANIM.pressDuration, easing: Easing.inOut(Easing.ease), useNativeDriver: true }).start();

  const spin = rot.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });
  const headOpacity = press.interpolate({ inputRange: [0, 1], outputRange: [1, 0.6] });

  return (
    <Card style={[styles.card, style]}>
      <Pressable onPress={toggle} onPressIn={() => animatePress(1)} onPressOut={() => animatePress(0)}>
        <Animated.View style={[styles.head, open ? styles.headOpen : styles.headClosed, { opacity: headOpacity }]}>
          <View style={styles.headLeft}>{header}</View>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Ionicons name="chevron-down" size={18} color={C.muted} />
          </Animated.View>
        </Animated.View>
      </Pressable>
      {open ? <View style={styles.body}>{children}</View> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card:       { padding: 0 },
  head:       { flexDirection: "row", alignItems: "center", gap: S[2], paddingVertical: S[3], paddingHorizontal: S[4] },
  headClosed: { borderRadius: R.lg },
  headOpen:   { borderTopLeftRadius: R.lg, borderTopRightRadius: R.lg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.borderSoft },
  headLeft:   { flex: 1 },
  body:       { paddingVertical: S[3], paddingHorizontal: S[4] },
});
