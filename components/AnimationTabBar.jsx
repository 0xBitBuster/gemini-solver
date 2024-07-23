import { useRef } from "react";
import { Pressable, Dimensions } from "react-native";
import Animated, { Extrapolation, interpolate, interpolateColor, useAnimatedStyle } from "react-native-reanimated";
import Carousel from "react-native-reanimated-carousel";

function AnimationTabBar({ data, onItemChange, itemsPerView = 4, itemHeight = 40 }) {
  const carouselRef = useRef(null);

  return (
    <Carousel
      ref={carouselRef}
      loop={false}
      style={{
        width: Dimensions.get("window").width,
        justifyContent: "center",
        alignItems: "center",
      }}
      onSnapToItem={(index) => onItemChange(data[index])}
      width={Math.min(Dimensions.get("window").width, 500) / itemsPerView}
      height={itemHeight}
      data={data}
      renderItem={({ item, animationValue }) => {
        return (
          <Item
            animationValue={animationValue}
            label={item.name}
            onPress={() =>
              carouselRef.current?.scrollTo({
                count: animationValue.value,
                animated: true,
              })
            }
          />
        );
      }}
    />
  );
}


const Item = ({ animationValue, label, onPress }) => {
  const containerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      animationValue.value,
      [-1, 0, 1],
      [0.5, 1, 0.5],
      Extrapolation.CLAMP,
    );

    return {
      opacity,
    };
  }, [animationValue]);

  const labelStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      animationValue.value,
      [-1, 0, 1],
      ["#DDD", "#fff", "#DDD"]
    );

    return {
      color,
    };
  }, [animationValue]);

  return (
    <Pressable onPress={onPress}>
      <Animated.View
        style={[
          {
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
          },
          containerStyle,
        ]}
      >
        <Animated.Text
          className="font-psemibold"
          style={[
          { 
            fontSize: 17,
            color: "#DDD",
            textShadowColor: "rgba(0, 0, 0, 0.1)", 
            textShadowRadius: 1, 
            textShadowOffset: {
              width: -1, height: 1
            } 
          }, labelStyle]}
        >
          {label}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
};

export default AnimationTabBar;


