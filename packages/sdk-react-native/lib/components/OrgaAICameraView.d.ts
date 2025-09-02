import React from "react";
import { StyleProp, ViewStyle } from "react-native";
import { RTCVideoViewProps } from "react-native-webrtc";
import { CameraPosition } from "../types";
interface OrgaAICameraViewProps extends RTCVideoViewProps {
    onFlipCamera?: () => void;
    flipCameraButtonStyle?: StyleProp<ViewStyle>;
    icon?: React.ReactNode;
    text?: string;
    containerStyle?: StyleProp<ViewStyle>;
    placeholder?: React.ReactNode;
    cameraPosition?: CameraPosition;
}
export declare const OrgaAICameraView: ({ onFlipCamera, flipCameraButtonStyle, icon, text, containerStyle, placeholder, cameraPosition, children, ...props }: OrgaAICameraViewProps & {
    children?: React.ReactNode;
}) => React.JSX.Element;
export {};
