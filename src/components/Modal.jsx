// Qayta ishlatiladigan Modal — pastdan chiqadigan "bottom sheet".
// Orqa fonga (backdrop) bosilganda yopiladi; ichki bosishlar yopmaydi.
import { Modal as RNModal, View, Pressable, StyleSheet } from "react-native";
import { C, R, S, temaStil } from "../theme";

export function Modal({ modalVisible, onClose, children }) {
  return (
    <RNModal
      visible={!!modalVisible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Backdrop — bosilsa yopadi */}
      <Pressable style={styles.backdrop} onPress={onClose}>
        {/* Sheet — ichki bosishni "yutadi", shuning uchun yopilmaydi */}
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.grabber} />
          {children}
        </Pressable>
      </Pressable>
    </RNModal>
  );
}

const styles = temaStil(() => StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: C.overlay,
    justifyContent: "flex-end",
  },
  sheet: {
    width: "100%",
    maxHeight: "92%",
    backgroundColor: C.card,
    borderTopLeftRadius: R.xl,
    borderTopRightRadius: R.xl,
    paddingHorizontal: S[5],
    paddingTop: S[3],
    paddingBottom: S[6],
  },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    alignSelf: "center",
    marginBottom: S[4],
  },
}));
