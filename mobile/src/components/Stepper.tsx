import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";

interface StepperProps {
  currentStep: number; // 1, 2, 3
  totalSteps?: number;
}

export function Stepper({ currentStep, totalSteps = 3 }: StepperProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      {steps.map((step, idx) => {
        const isCompleted = step < currentStep;
        const isActive = step === currentStep;

        return (
          <React.Fragment key={step}>
            {/* Step circle */}
            <View
              style={[
                styles.circle,
                isActive && styles.circleActive,
                isCompleted && styles.circleCompleted,
                !isActive && !isCompleted && styles.circlePending,
              ]}
            >
              <Text
                style={[
                  styles.circleText,
                  isActive && styles.circleTextActive,
                  isCompleted && styles.circleTextCompleted,
                  !isActive && !isCompleted && styles.circleTextPending,
                ]}
              >
                {step}
              </Text>
            </View>

            {/* Connecting line */}
            {idx < steps.length - 1 && (
              <View
                style={[
                  styles.line,
                  step < currentStep ? styles.lineActive : styles.lineInactive,
                ]}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    width: "100%",
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  circleActive: {
    backgroundColor: colors.primary,
  },
  circleCompleted: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  circlePending: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#D2CCC0",
  },
  circleText: {
    fontSize: 13,
    fontWeight: "700",
  },
  circleTextActive: {
    color: "#FFFFFF",
  },
  circleTextCompleted: {
    color: colors.primary,
  },
  circleTextPending: {
    color: "#9E998E",
  },
  line: {
    flex: 0.28,
    height: 2,
    marginHorizontal: 8,
  },
  lineActive: {
    backgroundColor: colors.primary,
  },
  lineInactive: {
    backgroundColor: "#DCD7CB",
  },
});
