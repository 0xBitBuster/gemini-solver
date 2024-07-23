import { View, useWindowDimensions } from "react-native";
import React, { useCallback } from "react";
import Animated, { Extrapolation, interpolate, interpolateColor, useAnimatedStyle } from "react-native-reanimated";

const PaginationElement = ({ length, x }) => {
  const { width: SCREEN_WIDTH } = useWindowDimensions();

  const PaginationComponent = useCallback(({ index }) => {
    const itemRnStyle = useAnimatedStyle(() => {
      const width = interpolate(
        x.value,
        [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH],
        [35, 16, 35],
        Extrapolation.CLAMP
      );

      const bgColor = interpolateColor(
        x.value,
        [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH],
        ["#D0D0D0", "#ff013f", "#D0D0D0"]
      );

      return {
        width,
        backgroundColor: bgColor,
      };
    }, [x]);
    
    return <Animated.View style={itemRnStyle} className="w-9 h-2.5 rounded-md mx-1" />;
  }, []);

  return (
    <View className="flex-row justify-center items-center">
      {Array.from({ length }).map((_, index) => {
        return <PaginationComponent index={index} key={index} />;
      })}
    </View>
  );
};

export default PaginationElement;

