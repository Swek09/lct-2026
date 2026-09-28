import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";
import { colors, fonts } from "../theme";

export function Header({ title, back = true }: { title: string; back?: boolean }) {
  const router = useRouter();
  return (
    <Pressable style={styles.header} onPress={() => back && router.back()}>
      {back ? <Text style={styles.back}>‹</Text> : <Text style={styles.back} />}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.back} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  back: { fontSize: 30, color: colors.primary, width: 40 },
  title: { fontSize: fonts.subtitle, fontWeight: "700", color: colors.text },
});