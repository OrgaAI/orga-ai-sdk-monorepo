import React from "react";
import {
  StyleProp,
  View,
  ViewStyle,
  TouchableOpacity,
} from "react-native";
import { RTCView, RTCVideoViewProps } from "react-native-webrtc";

interface OrgaAICameraViewProps extends RTCVideoViewProps {
  onFlipCamera?: () => void;
  flipCameraButtonStyle?: StyleProp<ViewStyle>;
  icon?: React.ReactNode;
  text?: string;
  containerStyle?: StyleProp<ViewStyle>;
  placeholder?: React.ReactNode;
}

export const OrgaAICameraView = ({
  onFlipCamera,
  flipCameraButtonStyle,
  icon,
  text,
  containerStyle,
  placeholder,
  children,
  ...props
}: OrgaAICameraViewProps & { children?: React.ReactNode }) => {
  return (
    <View style={containerStyle}>
      {props.streamURL ? <RTCView {...props} /> : placeholder || null}
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
