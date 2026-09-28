import React, { useEffect, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { useStore } from "../store/store";
import { colors } from "../theme";

const CONFETTI_EMOJIS = ["🎉", "⭐", "✨", "🎊", "🌟", "💛", "🪙"];

const COLORS = [
  colors.primary,
  colors.accent,
  "#F2C14E",
  "#8B5CF6",
  "#10B981",
  "#F38F69",
];

interface ConfettiPiece {
  id: number;
  emoji: string;
  color: string;
  left: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  rotateTo: string;
}

interface ConfettiEffectProps {
  active?: boolean;
  /** Количество частиц (по умолчанию 26) */
  count?: number;
}

function makePieces(count: number): ConfettiPiece[] {
  return Array.from({ length: count }, (_, i) => {
    const spinSign = Math.random() > 0.5 ? 1 : -1;
    return {
      id: i,
      emoji: CONFETTI_EMOJIS[i % CONFETTI_EMOJIS.length],
      color: COLORS[i % COLORS.length],
      left: Math.random() * 92 + 2,
      size: 16 + Math.random() * 12,
      duration: 2200 + Math.random() * 1800,
      delay: Math.random() * 500,
      drift: (Math.random() - 0.5) * 60,
      rotateTo: `${spinSign * 360}deg`,
    };
  });
}

/**
 * Праздничное конфетти при победе (ТЗ 3.6: анимации можно отключить).
 * Учитывает системный тумблер animationsEnabled из родительского раздела:
 * если анимации выключены, эффект не отображается вовсе.
 */
export function ConfettiEffect({ active = true, count = 26 }: ConfettiEffectProps) {
  const animationsEnabled = useStore((s) => s.animationsEnabled);
  const enabled = animationsEnabled && active;
  const [mountKey, setMountKey] = useState(0);
  const wasEnabled = React.useRef(false);

  useEffect(() => {
    // Перегенерация частиц при каждом новом включении эффекта
    if (enabled && !wasEnabled.current) {
      setMountKey((k) => k + 1);
    }
    wasEnabled.current = enabled;
  }, [enabled]);

  if (!enabled) return null;

  return (
    <View style={styles.wrap} pointerEvents="none">
      <ConfettiBurst key={mountKey} count={count} />
    </View>
  );
}

function ConfettiBurst({ count }: { count: number }) {
  // Генерация частиц один раз при монтировании всплеска (не в рендере)
  const [pieces] = useState(() => makePieces(count));

  return (
    <>
      {pieces.map((p) => (
        <ConfettiPieceView key={p.id} piece={p} />
      ))}
    </>
  );
}

function ConfettiPieceView({ piece }: { piece: ConfettiPiece }) {
  const [anim] = useState(() => ({
    fall: new Animated.Value(0),
    drift: new Animated.Value(0),
    spin: new Animated.Value(0),
  }));
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const falling = Animated.timing(anim.fall, {
      toValue: 1,
      duration: piece.duration,
      delay: piece.delay,
      easing: Easing.quad,
      useNativeDriver: true,
    });
    const drifting = Animated.timing(anim.drift, {
      toValue: piece.drift,
      duration: piece.duration,
      delay: piece.delay,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    });
    const spinning = Animated.timing(anim.spin, {
      toValue: 1,
      duration: piece.duration,
      delay: piece.delay,
      easing: Easing.linear,
      useNativeDriver: true,
    });

    falling.start(({ finished }) => {
      if (finished) setVisible(false);
    });
    drifting.start();
    spinning.start();

    return () => {
      falling.stop();
      drifting.stop();
      spinning.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [piece.id]);

  if (!visible) return null;

  const rotate = anim.spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", piece.rotateTo],
  });

  return (
    <Animated.View
      style={[
        styles.piece,
        {
          left: `${piece.left}%`,
          transform: [
            { translateY: anim.fall.interpolate({ inputRange: [0, 1], outputRange: [-40, 620] }) },
            { translateX: anim.drift },
            { rotate },
          ],
        },
      ]}
    >
      <Text style={{ fontSize: piece.size, color: piece.color }}>{piece.emoji}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    elevation: 100,
  },
  piece: {
    position: "absolute",
    top: -40,
  },
});
