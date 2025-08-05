"use client";
import {
  useOrgaAI,
  OrgaVideo,
  OrgaAudio,
  ORGAAI_MODELS,
  ORGAAI_TEMPERATURE_RANGE,
  ORGAAI_VOICES,
  OrgaAIModel,
  OrgaAIVoice,
  ConnectionState,
} from "@orga-ai/sdk-web";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Mic,
  MicOff,
  Video,
  CameraOffIcon,
  Settings,
  X,
  ChevronDown,
  ChevronUp,
  MessageSquare,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ConversationItem } from "@orga-ai/sdk-web";
import { Textarea } from "@/components/ui/textarea";

export default function Home() {
  const {
    startSession,
    endSession,
    userVideoStream,
    aiAudioStream,
    connectionState,
    isCameraOn,
    isMicOn,
    toggleCamera,
    toggleMic,
    model,
    voice,
    temperature,
    conversationItems,
    updateParams,
  } = useOrgaAI();
  const [instructionsText, setInstructionsText] = useState("");
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [instructionsUpdated, setInstructionsUpdated] = useState(false);
  const [isConversationOpen, setIsConversationOpen] = useState(false);
  const conversationRef = useRef<HTMLDivElement>(null);

  const buttonText = () => {
    if (connectionState === "connected") {
      return "Disconnect";
    } else if (connectionState === "connecting") {
      return "Connecting...";
    } else {
      return "Connect";
    }
  };

  const isConnected = connectionState === "connected";

  // Close conversation panel when disconnecting
  useEffect(() => {
    if (!isConnected) {
      setIsConversationOpen(false);
    }
  }, [isConnected]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [conversationItems]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto h-[calc(100vh-2rem)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              OrgaAI Playground
            </h1>
            <p className="text-slate-600 mt-1">
              Test and explore the OrgaAI SDK
            </p>
          </div>

          {/* Connection Status */}
          <div className="flex items-center gap-3">
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                isConnected
                  ? "bg-green-100 text-green-800"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {connectionState === "connected" ? "Connected" : "Disconnected"}
            </div>

            {/* Config and Conversation Toggle Buttons */}
            {isConnected && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsConfigOpen(!isConfigOpen)}
                  className="flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Config
                  {isConfigOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsConversationOpen(!isConversationOpen)}
                  className="flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Conversation
                  {isConversationOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex gap-6">
          {/* Camera Preview - Centered */}
          <div className="flex-1 flex items-center justify-center">
            <div className="relative w-full max-w-2xl aspect-video bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
              {/* Camera Preview */}
              <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                {isCameraOn && userVideoStream ? (
                  <OrgaVideo
                    stream={userVideoStream}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-slate-300 flex items-center justify-center">
                      <CameraOffIcon className="w-12 h-12 text-slate-500" />
                    </div>
                    <p className="text-slate-600 font-medium">Camera Preview</p>
                    <p className="text-slate-500 text-sm mt-1">
                      {isCameraOn ? "Camera is on" : "Camera is off"}
                    </p>
                  </div>
                )}
              </div>

              {/* Connection Status Overlay */}
              {!isConnected && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-center text-white">
                    <p className="text-lg font-medium mb-2">Not Connected</p>
                    <p className="text-sm opacity-90">
                      Connect to start using the camera
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Configuration Panel */}
          {isConnected && isConfigOpen && (
            <div className="w-96 bg-white rounded-xl shadow-lg border border-slate-200 p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-900">
                  Model Configuration
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsConfigOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Model Selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">
                    Model
                  </Label>
                  <Select
                    value={model}
                    onValueChange={(value) =>
                      updateParams({ model: value as OrgaAIModel })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      {ORGAAI_MODELS.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Voice Selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">
                    Voice
                  </Label>
                  <Select
                    value={voice}
                    onValueChange={(value) =>
                      updateParams({ voice: value as OrgaAIVoice })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a voice" />
                    </SelectTrigger>
                    <SelectContent>
                      {ORGAAI_VOICES.map((voice) => (
                        <SelectItem key={voice} value={voice}>
                          {voice}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Temperature Slider */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-slate-700">
                      Temperature
                    </Label>
                    <span className="text-sm text-slate-500">
                      {temperature?.toFixed(1)}
                    </span>
                  </div>
                  <Slider
                    value={temperature ? [temperature] : [0]}
                    onValueChange={(value) =>
                      updateParams({ temperature: value[0] })
                    }
                    min={ORGAAI_TEMPERATURE_RANGE.min}
                    max={ORGAAI_TEMPERATURE_RANGE.max}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>{ORGAAI_TEMPERATURE_RANGE.min}</span>
                    <span>{ORGAAI_TEMPERATURE_RANGE.max}</span>
                  </div>
                </div>

                {/* Instructions */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">
                    Instructions
                  </Label>
                  <Textarea
                    value={instructionsText}
                    onChange={(e) => {
                      setInstructionsText(e.target.value);
                      setInstructionsUpdated(false);
                    }}
                    placeholder="Enter custom instructions for the AI..."
                    className="min-h-[100px] resize-none"
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        updateParams({ instructions: instructionsText });
                        setInstructionsUpdated(true);
                        // Reset the success state after 3 seconds
                        setTimeout(() => setInstructionsUpdated(false), 3000);
                      }}
                      className="flex-1"
                    >
                      Update Instructions
                    </Button>
                    {instructionsUpdated && (
                      <div className="flex items-center gap-1 text-green-600 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        Updated!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Conversation Panel */}
          {isConnected && isConversationOpen && (
            <div className="w-96 bg-white rounded-xl shadow-lg border border-slate-200 flex flex-col h-[600px]">
              <div className="flex items-center justify-between p-6 border-b border-slate-200 flex-shrink-0">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Conversation
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Real-time conversation items from SDK
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsConversationOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div
                ref={conversationRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0"
              >
                {conversationItems.length === 0 ? (
                  <div className="text-center text-slate-500 py-8">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="text-sm">No messages yet</p>
                    <p className="text-xs mt-1">
                      Start talking to see the conversation here
                    </p>
                  </div>
                ) : (
                  conversationItems.map((item, index) => (
                    <div
                      key={`${item.conversationId}-${index}`}
                      className={`flex ${item.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          item.sender === "user"
                            ? "bg-blue-500 text-white"
                            : "bg-slate-100 text-slate-900"
                        }`}
                      >
                        <p className="text-sm">{item.content.message}</p>
                        <div
                          className={`flex items-center gap-2 mt-1 text-xs ${
                            item.sender === "user"
                              ? "text-blue-100"
                              : "text-slate-500"
                          }`}
                        >
                          <span className="capitalize">{item.sender}</span>
                          {item.timestamp && (
                            <span>
                              {new Date(item.timestamp).toLocaleTimeString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Control Panel */}
        <div className="mt-6 bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            {/* Media Controls */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Camera:
                </span>
                <Button
                  variant={isCameraOn ? "default" : "outline"}
                  size="sm"
                  onClick={toggleCamera}
                  disabled={!isConnected}
                  className="flex items-center gap-2"
                >
                  {isCameraOn ? (
                    <Video className="w-4 h-4" />
                  ) : (
                    <CameraOffIcon className="w-4 h-4" />
                  )}
                  {isCameraOn ? "On" : "Off"}
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Microphone:
                </span>
                <Button
                  variant={isMicOn ? "default" : "outline"}
                  size="sm"
                  onClick={toggleMic}
                  disabled={!isConnected}
                  className="flex items-center gap-2"
                >
                  {isMicOn ? (
                    <Mic className="w-4 h-4" />
                  ) : (
                    <MicOff className="w-4 h-4" />
                  )}
                  {isMicOn ? "On" : "Off"}
                </Button>
              </div>
            </div>

            {/* Connection Button */}
            <Button
              onClick={() =>
                isConnected
                  ? endSession()
                  : startSession({
                      onConversationMessageCreated: (item: ConversationItem) => {
                        console.log("Conversation message created:", item);
                      },
                      onSessionConnected: () => {
                        console.log("Session connected");
                      },
                      onSessionEnd: () => {
                        console.log("Session ended");
                      },
                      onSessionStart: () => {
                        console.log("Session started");
                      },
                      onError: (error: Error) => {
                        console.log("Session error:", error);
                      },
                      onConnectionStateChange: (state: ConnectionState) => {
                        console.log("Connection state changed:", state);
                      },
                    })
              }
              variant={isConnected ? "destructive" : "default"}
              size="lg"
              className="px-8"
            >
              {buttonText()}
            </Button>
          </div>
        </div>
      </div>

      {/* Audio Stream */}
      <OrgaAudio stream={aiAudioStream} hidden />
    </div>
  );
}
