import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedProps,
} from "react-native-reanimated";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function SpeedMeter({ speed, onStart }) {
  const radius = 100;
  const circumference = 2 * Math.PI * radius;

  const progress = useSharedValue(0);

  useEffect(() => {
    const normalizedSpeed = Math.min(speed / 100, 1);
    progress.value = withTiming(normalizedSpeed, { duration: 500 });
  }, [speed]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset:
      circumference - circumference * progress.value,
  }));

  return (
    <View style={styles.container}>
      <Svg width={250} height={250}>
        <Circle
          cx="125"
          cy="125"
          r={radius}
          stroke="#e5e7eb"
          strokeWidth="15"
          fill="none"
        />
        <AnimatedCircle
          cx="125"
          cy="125"
          r={radius}
          stroke="#38bdf8"
          strokeWidth="15"
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
        />
      </Svg>

      <View style={styles.center}>
        <Text style={styles.speed}>{speed.toFixed(1)}</Text>
        <Text style={styles.unit}>Mbps</Text>

        <TouchableOpacity style={styles.goButton} onPress={onStart}>
          <Text style={styles.goText}>GO</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center" },
  center: {
    position: "absolute",
    alignItems: "center",
  },
  speed: { fontSize: 36, fontWeight: "bold" },
  unit: { fontSize: 14, color: "#6b7280" },
  goButton: {
    marginTop: 15,
    backgroundColor: "#38bdf8",
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 50,
  },
  goText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
