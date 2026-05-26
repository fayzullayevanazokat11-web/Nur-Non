// Yig'iladigan karta (akkordeon) — sarlavha bandi bosilganda tana ochiladi/yopiladi.
// Sarlavha doim oq tanaga nisbatan quyuqroq (C.panel) bandda; o'ngda chevron.
import { useState } from "react";
import { View, Pressable, StyleSheet, LayoutAnimation, Platform, UIManager } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "./Card";
import { C, R, S } from "../theme";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export function ExpandableCard({ header, children, defaultOpen = false, style }) {
  const [open, setOpen] = useState(defaultOpen);
  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((o) => !o);
  };
  return (
    <Card style={[styles.card, style]}>
      <Pressable
        onPress={toggle}
        style={({ pressed }) => [
          styles.head,
          open ? styles.headOpen : styles.headClosed,
          { opacity: pressed ? 0.9 : 1 },
        ]}
      >
        <View style={styles.headLeft}>{header}</View>
        <Ionicons name={open ? "chevron-up" : "chevron-down"} size={18} color={C.muted} />
      </Pressable>
      {open ? <View style={styles.body}>{children}</View> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card:       { padding: 0 },
  head:       { flexDirection: "row", alignItems: "center", gap: S[2], backgroundColor: C.panel, paddingVertical: S[3], paddingHorizontal: S[4] },
  headClosed: { borderRadius: R.lg },
  headOpen:   { borderTopLeftRadius: R.lg, borderTopRightRadius: R.lg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.borderSoft },
  headLeft:   { flex: 1 },
  body:       { paddingVertical: S[3], paddingHorizontal: S[4] },
});
