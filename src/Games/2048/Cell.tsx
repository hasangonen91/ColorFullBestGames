import React, { useEffect, useRef } from "react";
import { Text, StyleSheet, Animated } from "react-native";

type CellProps = {
  value: number;
  merged?: boolean;
  animationsEnabled?: boolean;
};

const cellColors: { [key: number]: string } = {
  2: "#eee4da",
  4: "#ece0c8",
  8: "#f2b179",
  16: "#f59563",
  32: "#f57c5f",
  64: "#f65d3b",
  128: "#edce71",
  256: "#edcc61",
};

const Cell: React.FC<CellProps> = ({ value, merged, animationsEnabled = true }) => {
  const bgColor = cellColors[value > 256 ? 256 : value] || "#d6cdc4";
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (merged && animationsEnabled) {
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.2, duration: 120, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
      ]).start();
    }
  }, [merged, animationsEnabled]);

  return (
    <Animated.View style={[styles.cellStyle, { backgroundColor: bgColor, transform: [{ scale: scaleAnim }] }]}> 
      <Text
        style={[styles.textStyle, { color: value > 4 ? "#f8f5f0" : "#776e65" }]}
      >
        {value > 0 ? value : ""}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cellStyle: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    margin: 5,
    borderRadius: 5,
  },
  textStyle: {
    fontSize: 30,
    color: "#776e65",
  },
});

export default Cell; 