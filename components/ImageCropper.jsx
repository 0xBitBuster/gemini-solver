import React, { useEffect, useState } from "react";
import { Image, ImageBackground, Modal, Text, TouchableOpacity, View } from "react-native";
import { icons } from "../constants";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ImageCropper({ image, open, onClose, onCropImage, text, croppedByDefault, customControl, loading }) {
  const [imageSizeOriginal, setImageSizeOriginal] = useState(null);
  const [imageSize, setImageSize] = useState({});
  const [containerLayout, setContainerLayout] = useState(null);

  const [cropRect, setCropRect] = useState({ new: true, x: 0, y: 0, width: 0, height: 0 });
  const [cropDrag, setCropDrag] = useState({
    inBounds: false,
    startX: 0,
    startY: 0,
    locations: [],
    startCropRect: cropRect,
  });

  // Set the original image size when the image changes
  useEffect(() => {
    if (!image) return;

    Image.getSize(image, (width, height) => {
      setImageSizeOriginal({ width, height });
    });

    // Reset the crop rectangle
    setCropRect({ new: true, x: 0, y: 0, width: 0, height: 0 });
  }, [image]);

  // Calculate the scaling ratio to fit image within container's dimensions
  const getRatio = () => {
    const widthRatio = (1.0 * containerLayout.width) / imageSizeOriginal.width;
    const heightRatio = (1.0 * containerLayout.height) / imageSizeOriginal.height;
    return Math.min(widthRatio, heightRatio);
  };

  // Resize image based on container's layout & original image size
  useEffect(() => {
    const _imageSize = { ...imageSizeOriginal };
    if (!!imageSizeOriginal && !!containerLayout) {
      _imageSize.width *= getRatio();
      _imageSize.height *= getRatio();

      setImageSize(_imageSize);

      if (croppedByDefault) {
        const defaultWidth = _imageSize.width - 10 * 2;
        const defaultHeight = _imageSize.height * 0.2;
        const defaultY = (_imageSize.height - defaultHeight) / 2;
        setCropRect({ new: false, x: 10, y: defaultY, width: defaultWidth, height: defaultHeight });
      }
    }
  }, [imageSizeOriginal, containerLayout]);

  // Handle the start of touch events on the image
  const handleImageTouchStart = (event) => {
    const {
      nativeEvent: { locationX, locationY },
    } = event;

    // Handle resizing or moving an existing crop rectangle
    if (!cropRect.new) {
      const cropLocationX = locationX - cropRect.x;
      const cropLocationY = locationY - cropRect.y;
      const touchPadding = 32;
      const outOfBounds = cropLocationX < -touchPadding || cropLocationX > cropRect.width + touchPadding || cropLocationY < -touchPadding || cropLocationY > cropRect.height + touchPadding;
      let locations = [];

      // Determine which part of the crop rectangle is being interacted with
      if (cropLocationY >= cropRect.height - Math.min(cropRect.height / 4, 32)) locations.push("bottom");
      if (cropLocationY < Math.min(cropRect.height / 4, 32)) locations.push("top");
      if (cropLocationX >= cropRect.width - Math.min(cropRect.width / 4, 32)) locations.push("right");
      if (cropLocationX < Math.min(cropRect.width / 4, 32)) locations.push("left");
      if (locations.length === 0) locations.push("center");

      setCropDrag({ inBounds: !outOfBounds, startX: locationX, startY: locationY, startCropRect: cropRect, locations });
      if (!outOfBounds) return;
    }

    setCropRect({ new: true, width: 0, height: 0, x: locationX, y: locationY });
  };

  // Handle touch movement on the image to adjust the crop rectangle
  const handleImageTouchMove = (event) => {
    const {
      nativeEvent: { locationX, locationY },
    } = event;

    // Handle dragging an existing crop rectangle
    if (!cropRect.new && cropDrag.inBounds) {
      const deltaX = locationX - cropDrag.startX;
      const deltaY = locationY - cropDrag.startY;

      let newX = cropDrag.startCropRect.x;
      let newY = cropDrag.startCropRect.y;
      let newWidth = cropDrag.startCropRect.width;
      let newHeight = cropDrag.startCropRect.height;

      // Adjust position and size of the crop rectangle based on drag direction
      if (cropDrag.locations.includes("center")) {
        newX += deltaX;
        newY += deltaY;
      }
      if (cropDrag.locations.includes("top")) {
        newY += deltaY;
        newHeight -= deltaY;
      }
      if (cropDrag.locations.includes("bottom")) {
        newHeight += deltaY;
      }
      if (cropDrag.locations.includes("left")) {
        newX += deltaX;
        newWidth -= deltaX;
      }
      if (cropDrag.locations.includes("right")) {
        newWidth += deltaX;
      }

      // Ensure the crop rectangle stays within the image bounds
      if (newX < 0) {
        newWidth += newX;
        newX = 0;
      }
      if (newY < 0) {
        newHeight += newY;
        newY = 0;
      }
      if (newX + newWidth > imageSize.width) {
        newWidth = imageSize.width - newX;
      }
      if (newY + newHeight > imageSize.height) {
        newHeight = imageSize.height - newY;
      }

      setCropRect({ x: newX, y: newY, width: newWidth, height: newHeight });
    } else {
      // Initialize or resize a new crop rectangle
      const width = locationX - cropRect.x;
      const height = locationY - cropRect.y;

      setCropRect((prev) => {
        if (prev.x === 0) prev.x = locationX;
        if (prev.y === 0) prev.y = locationY;

        let newWidth = width;
        let newHeight = height;

        // Ensure the crop rectangle stays within the image bounds
        if (cropRect.x + newWidth > imageSize.width) {
          newWidth = imageSize.width - cropRect.x;
        }
        if (cropRect.y + newHeight > imageSize.height) {
          newHeight = imageSize.height - cropRect.y;
        }

        return {
          ...prev,
          width: newWidth,
          height: newHeight,
        };
      });
    }
  };

  // Handle the end of touch events on the image
  const handleImageTouchEnd = () => {
    setCropRect((prev) => {
      prev.new = false;

      if (prev.width < 0) {
        prev.x += prev.width;
        prev.width *= -1;
      }

      if (prev.height < 0) {
        prev.y += prev.height;
        prev.height *= -1;
      }

      return { ...prev };
    });

    setCropDrag((prev) => ({ ...prev, locations: [] }));
  };

  // Handle the crop action to return the cropped image coordinates
  const handleCropImage = async () => {
    if (cropRect.width < 10 || cropRect.height < 10) {
      const crop = {
        originX: 0,
        originY: 0,
        width: imageSizeOriginal.width,
        height: imageSizeOriginal.height,
      };

      onCropImage(image, crop);
    } else {
      const crop = {
        originX: cropRect.x / getRatio(),
        originY: cropRect.y / getRatio(),
        width: cropRect.width / getRatio(),
        height: cropRect.height / getRatio(),
      };

      onCropImage(image, crop);
    }
  };

  return (
    <Modal visible={open} animationType={"slide"} onRequestClose={onClose}>
      <SafeAreaView className="flex-1 bg-cloud">
        <View className="flex-1 justify-center items-center" onLayout={(event) => setContainerLayout(event.nativeEvent.layout)}>
          <ImageBackground source={{ uri: image }} resizeMode={"contain"} style={{ width: "100%", height: "100%", ...imageSize }} onTouchStart={handleImageTouchStart} onTouchMove={handleImageTouchMove} onTouchEnd={handleImageTouchEnd}>
            {!!cropRect.width && !!cropRect.height && <CropRectangle cropRect={cropRect} cropDrag={cropDrag} />}
          </ImageBackground>
        </View>
        <Text className={`text-lg text-center font-pmedium mb-4 ${cropRect.width && cropRect.height ? "text-white" : "text-black"} transition-all`}>
          {text}
        </Text>
        <View className="w-full bg-white rounded-t-2xl py-6">
          {customControl}
          <View className="flex flex-row justify-evenly items-center">
            <TouchableOpacity className="p-6" activeOpacity={0.7} onPress={onClose}>
              <Image source={icons.arrowLeft} className="w-6 h-6" />
            </TouchableOpacity>
            <TouchableOpacity className="bg-apple p-4 rounded-full" activeOpacity={0.6} onPress={handleCropImage} disabled={loading} style={{ opacity: loading ? 0.6 : 1 }}>
              <Image source={icons.check} className="w-7 h-7" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

// This component represents the crop rectangle overlay on the image
function CropRectangle({ cropRect, cropDrag }) {
  let { x, y, width, height } = cropRect;

  if (width < 0) {
    width = -width;
    x -= width;
  }

  if (height < 0) {
    height = -height;
    y -= height;
  }

  return (
    <View
      pointerEvents={"none"}
      style={{
        position: "absolute",
        top: y,
        left: x,
        width: width,
        height: height,
      }}
    >
      {new Array(4).fill(0).map((_, i) => {
        const sides = ["top", "right", "bottom", "left"];
        return (
          <View
            key={i}
            style={{
              position: "absolute",
              [sides[i]]: -2000,
              [sides[(i + 1) % 4]]: 0,
              width: 2000,
              height: 2000,
              backgroundColor: "rgba(0, 0, 0, 0.7)",
            }}
          />
        );
      })}
      <View
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          borderStyle: "solid",
          borderColor: "rgba(255, 255, 255, 1)",
          borderTopWidth: cropDrag.locations.includes("top") ? 2 : 1,
          borderBottomWidth: cropDrag.locations.includes("bottom") ? 2 : 1,
          borderLeftWidth: cropDrag.locations.includes("left") ? 2 : 1,
          borderRightWidth: cropDrag.locations.includes("right") ? 2 : 1,
        }}
      />

      {new Array(4).fill(0).map((_, i) => {
        const sides = ["top", "right", "bottom", "left"];

        return (
          <React.Fragment key={i}>
            <View
              style={[
                {
                  position: "absolute",
                  [sides[(i + 2) % 4].toLowerCase()]: -2,
                  [sides[(i + 3) % 4].toLowerCase()]: -2,
                  backgroundColor: "rgba(255, 255, 255, 1)",
                  flex: -1,
                  width: 2,
                  height: Math.min(16, height),
                },
              ]}
            />
            <View
              key={i}
              style={[
                {
                  position: "absolute",
                  [sides[(i + 2) % 4].toLowerCase()]: -2,
                  [sides[(i + 3) % 4].toLowerCase()]: -2,
                  backgroundColor: "rgba(255, 255, 255, 1)",
                  flex: -1,
                  width: Math.min(16, width),
                  height: 2,
                },
              ]}
            />
          </React.Fragment>
        );
      })}
    </View>
  );
}
