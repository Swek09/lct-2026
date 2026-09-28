import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { terms } from "../content/terms";
import { colors, fonts, radius, spacing } from "../theme";

export default function Terms() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filteredTerms = terms.filter(
    (t) =>
      t.word.toLowerCase().includes(search.toLowerCase()) ||
      t.explanation.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerBar}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>‹ Назад</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Словарик терминов 📖</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          style={styles.rulesCard}
          onPress={() => router.push("/onboarding")}
        >
          <Text style={{ fontSize: 26 }}>💡</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.rulesTitle}>3 правила управления монетками</Text>
            <Text style={styles.rulesSub}>
              Надо (обед) • Хочу (игры) • Копилка (мечта)
            </Text>
          </View>
          <Text style={styles.rulesArrow}>→</Text>
        </Pressable>

        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Поиск по терминам..."
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View style={styles.termsList}>
          {filteredTerms.map((t) => (
            <View key={t.word} style={styles.termCard}>
              <View style={styles.termHeader}>
                <Text style={styles.termBadge}>💡</Text>
                <Text style={styles.word}>{t.word}</Text>
              </View>
              <Text style={styles.expl}>{t.explanation}</Text>
            </View>
          ))}
          {filteredTerms.length === 0 && (
            <Text style={styles.emptyText}>Ничего не найдено по запросу.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1.5,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 60,
  },
  backBtnText: {
    fontSize: fonts.body,
    fontWeight: "700",
    color: colors.primaryDark,
  },
  headerTitle: {
    fontSize: fonts.subtitle,
    fontWeight: "800",
    color: colors.text,
  },
  screen: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 32,
    gap: 12,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: radius.md,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    height: 48,
    gap: 8,
  },
  searchIcon: {
    fontSize: 18,
  },
  searchInput: {
    flex: 1,
    fontSize: fonts.body,
    color: colors.text,
    fontWeight: "600",
  },
  termsList: {
    gap: 10,
  },
  termCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    borderBottomWidth: 4,
    borderBottomColor: "#DCD5C6",
    gap: 6,
  },
  termHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  termBadge: {
    fontSize: 18,
  },
  word: {
    fontSize: fonts.body,
    fontWeight: "800",
    color: colors.text,
  },
  expl: {
    fontSize: fonts.small,
    color: colors.textMuted,
    lineHeight: 20,
    fontWeight: "500",
  },
  emptyText: {
    textAlign: "center",
    color: colors.textMuted,
    marginTop: 20,
    fontSize: fonts.small,
  },
  rulesCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F7F1",
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    gap: 12,
  },
  rulesTitle: {
    fontSize: fonts.body,
    fontWeight: "800",
    color: colors.text,
  },
  rulesSub: {
    fontSize: fonts.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  rulesArrow: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primaryDark,
  },
});