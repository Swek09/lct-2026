import { Image, StyleSheet, Text, View } from "react-native";
import { colors, fonts, radius, spacing } from "../theme";

interface MascotBubbleProps {
  text: string;
  imageSource: any;
  imagePosition?: "left" | "top";
  imageSize?: { width: number; height: number };
}

export function MascotBubble({
  text,
  imageSource,
  imagePosition = "left",
  imageSize = { width: 70, height: 95 },
}: MascotBubbleProps) {
  if (imagePosition === "top") {
    return (
      <View style={styles.topContainer}>
        <Image
          source={imageSource}
          style={[styles.owlImage, { width: imageSize.width, height: imageSize.height }]}
          resizeMode="contain"
        />
        <View style={styles.bubbleTop}>
          <Text style={styles.bubbleTextSmall}>{text}</Text>
          <Text style={styles.leafIcon}>🍃</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={imageSource}
        style={[styles.owlImage, { width: imageSize.width, height: imageSize.height }]}
        resizeMode="contain"
      />
      <View style={styles.bubble}>
        {/* Tail pointing left */}
        <View style={styles.tail} />
        <Text style={styles.bubbleText}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: spacing.sm,
    paddingHorizontal: 4,
    gap: spacing.xs,
  },
  topContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
  },
  owlImage: {
    marginRight: 4,
  },
  bubble: {
    flex: 1,
    backgroundColor: colors.speechBubble,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.speechBubbleBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    justifyContent: "center",
    position: "relative",
  },
  bubbleTop: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.speechBubble,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.speechBubbleBorder,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    marginTop: 4,
    gap: 4,
  },
  tail: {
    position: "absolute",
    left: -7,
    top: "45%",
    width: 12,
    height: 12,
    backgroundColor: colors.speechBubble,
    borderLeftWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: colors.speechBubbleBorder,
    transform: [{ rotate: "45deg" }],
  },
  bubbleText: {
    fontSize: fonts.small,
    color: colors.text,
    lineHeight: 19,
    fontWeight: "500",
  },
  bubbleTextSmall: {
    fontSize: fonts.caption,
    color: colors.text,
    lineHeight: 16,
    fontWeight: "500",
  },
  leafIcon: {
    fontSize: 12,
  },
});
