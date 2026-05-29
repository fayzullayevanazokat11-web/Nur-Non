// Scroll konteyneri — Androidда doimiy ko'rinadigan native scrollbar bilan
// (persistentScrollbar). Maxsus animatsiyali overlay ishlatilmaydi (glitchsiz).
import { ScrollView } from "react-native";

export function ScrollBox({ children, contentContainerStyle, keyboardShouldPersistTaps }) {
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={contentContainerStyle}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      showsVerticalScrollIndicator={true}
      persistentScrollbar={true}
    >
      {children}
    </ScrollView>
  );
}
