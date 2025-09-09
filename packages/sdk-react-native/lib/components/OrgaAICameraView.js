"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrgaAICameraView = void 0;
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const react_native_webrtc_1 = require("react-native-webrtc");
const OrgaAICameraView = ({ onFlipCamera, flipCameraButtonStyle, icon, text, containerStyle, placeholder, cameraPosition = "front", children, ...props }) => {
    const shouldMirror = cameraPosition === "front";
    return (react_1.default.createElement(react_native_1.View, { style: containerStyle },
        props.streamURL ? react_1.default.createElement(react_native_webrtc_1.RTCView, { mirror: shouldMirror, ...props }) : placeholder || null,
        onFlipCamera && props.streamURL && (react_1.default.createElement(react_native_1.TouchableOpacity, { onPress: onFlipCamera, style: flipCameraButtonStyle },
            icon,
            text)),
        children));
};
exports.OrgaAICameraView = OrgaAICameraView;
