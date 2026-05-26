// Qayta ishlatiladigan Modal — markazda C.card rangli oyna.
// Orqa fonga (backdrop) bosilganda yopiladi; ichki bosishlar yopmaydi.
import { Modal as RNModal, View, Pressable, StyleSheet } from "react-native";
import { C } from "../theme";

export function Modal({ modalVisible, onClose, children }) {
  return (
    <RNModal
      visible={!!modalVisible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Backdrop — bosilsa yopadi */}
      <Pressable style={styles.backdrop} onPress={onClose}>
        {/* Oyna — ichki bosishni "yutadi", shuning uchun yopilmaydi */}
        <Pressable style={styles.sheet} onPress={() => {}}>
          {children}
        </Pressable>
      </Pressable>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  sheet: {
    width: "100%",
    maxWidth: 440,
    backgroundColor: C.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    padding: 18,
  },
});
