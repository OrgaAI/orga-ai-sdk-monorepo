import { Ionicons } from "@expo/vector-icons";
import React from "react";

const MicOn = () => {
  return <Ionicons name="mic" size={24} color="white" />;
};
const MicOff = () => {
  return <Ionicons name="mic-off" size={24} color="white" />;
};

const CameraOn = () => {
  return <Ionicons name="videocam" size={24} color="white" />;
};
const CameraOff = () => {
  return <Ionicons name="videocam-off" size={24} color="white" />;
};

export { MicOn, MicOff, CameraOn, CameraOff };
