import React from "react";
import {
  StyleProp,
  View,
  ViewStyle,
  TouchableOpacity,
} from "react-native";
import { RTCView, RTCVideoViewProps } from "react-native-webrtc";
import { CameraPosition } from "../types/index";

interface OrgaAICameraViewProps extends RTCVideoViewProps {
  onFlipCamera?: () => void;
  flipCameraButtonStyle?: StyleProp<ViewStyle>;
  icon?: React.ReactNode;
  text?: string;
  containerStyle?: StyleProp<ViewStyle>;
  placeholder?: React.ReactNode;
  cameraPosition?: CameraPosition;
}

export const OrgaAICameraView = ({
  onFlipCamera,
  flipCameraButtonStyle,
  icon,
  text,
  containerStyle,
  placeholder,
  cameraPosition = "front",
  children,
  ...props
}: OrgaAICameraViewProps & { children?: React.ReactNode }) => {

  const shouldMirror = cameraPosition === "front";
  
  return (
    <View style={containerStyle}>
      {props.streamURL ? <RTCView mirror={shouldMirror} {...props} /> : placeholder || null}
      {onFlipCamera && props.streamURL && (
        <TouchableOpacity onPress={onFlipCamera} style={flipCameraButtonStyle}>
          {icon}
          {text}
        </TouchableOpacity>
      )}
      {children}
    </View>
  );
};
