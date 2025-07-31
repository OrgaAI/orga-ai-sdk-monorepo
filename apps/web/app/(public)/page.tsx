'use client'
import Image from "next/image";
// import { OrgaAI, useOrgaAIContext, OrgaVideo, OrgaAudio } from "orga-ai-web-sdk";
import { OrgaAI, useOrgaAIContext, OrgaVideo, OrgaAudio } from "orga-ai-sdk";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, CameraOffIcon } from "lucide-react";
import { useEffect, useRef } from "react";

export default function Home() {
  const {startSession, endSession, videoStream, audioStream, connectionState,isCameraOn, isMicOn, toggleCamera, toggleMic, remoteStream} = useOrgaAIContext()
  useEffect(() => {
    console.log("videoStream", videoStream)
  },[videoStream

  ])
const buttonText = () => {
  if (connectionState === 'connected') {
    return 'Disconnect'
  } else if (connectionState === 'connecting') {
    return 'Connecting...'
  } else {
    return 'Connect'
  }
}
  // Custom option for more advance usage
  // const videoRef = useRef<HTMLVideoElement>(null);
  // const audioRef = useRef<HTMLAudioElement>(null);

  //   // Attach the video stream to the video element
  //   useEffect(() => {
  //     if (videoRef.current && videoStream) {
  //       videoRef.current.srcObject = videoStream;
  //     }
  //     // Optionally clear srcObject when stream is off
  //     if (videoRef.current && !videoStream) {
  //       videoRef.current.srcObject = null;
  //     }
  //   }, [videoStream]);

  //   useEffect(() => {
  //     if (audioRef.current && remoteStream) {
  //       audioRef.current.srcObject = remoteStream;
  //     }
  //     if (audioRef.current && !remoteStream) {
  //       audioRef.current.srcObject = null;
  //     }
  //   }, [remoteStream]);
    

  return (

     <div className="flex flex-col h-[calc(100vh-14rem)] overflow-hidden">
        <div className="flex-1 flex flex-col lg:flex-row gap-8 overflow-hidden">
          {/* Video Display Area */}
          {/* Main Content Area with Animation Circle */}
          <div className="flex-1 flex items-center justify-center bg-slate-50 rounded-lg aspect-video relative">
            <div className="relative w-full max-h-full aspect-video flex items-center justify-center">
              {/* Outer circle - light gray */}
              <div className="absolute w-40 h-40 rounded-full bg-slate-200"></div>

              {/* Inner circle - darker gray */}
              <div className="absolute w-24 h-24 rounded-full bg-slate-400"></div>
              {isCameraOn && videoStream ? (
                // Advanced option:
                  // <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover rounded-lg" />
                  <OrgaVideo stream={videoStream} className="absolute inset-0 w-full h-full object-cover rounded-lg" />
              ) : (
                <div className="absolute bottom-6 text-center text-slate-500">Webcam disabled</div>
              )}
            </div>
          </div>

          {/* Control Panel */}
          <div className="w-full lg:w-96 bg-transparent rounded-lg p-6 border border-slate-100 shadow-sm flex flex-col space-y-6 overflow-auto">
            <h2 className="text-lg font-medium mb-4">Set Model configuration</h2>

            <div className="space-y-1">
              <Label className="block text-sm font-medium mb-1">Model</Label>
              {/* <Select value={model} onValueChange={setModel}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Orga (1) beta">Orga (1) beta</SelectItem>
                </SelectContent>
              </Select> */}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium mb-1">Voice</label>
              {/* <Select value={voice} onValueChange={setVoice}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a voice" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dora">Dora</SelectItem>
                  <SelectItem value="Santa">Santa</SelectItem>
                  <SelectItem value="Alex">Alex</SelectItem>
                </SelectContent>
              </Select> */}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium">Temperature</label>
                {/* <span className="text-sm text-slate-500">{temperature[0]}</span> */}
              </div>
              {/* <Slider value={temperature} min={0} max={1} step={0.1} onValueChange={setTemperature} className="w-full" /> */}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium">Max Tokens</label>
                {/* <span className="text-sm text-slate-500">{maxTokens[0]}</span> */}
              </div>
              {/* <Slider value={maxTokens} min={1} max={100} onValueChange={setMaxTokens} className="w-full" /> */}
            </div>
          </div>
        </div>

        {/* Bottom Panel */}
        <div className="mt-8 shrink-0">
          <div className="bg-transparent border border-slate-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex space-x-2 mr-4">
              <Button variant={`${isMicOn ? 'default' : 'outline'}`} className={'rounded-md'} onClick={() => toggleMic()} disabled={connectionState === 'connecting' || connectionState === "closed"}>
                {isMicOn ? <Mic /> : <MicOff />}

              </Button>
              <Button variant={`${isCameraOn ? 'default' : 'outline'}`} className={'rounded-md'} onClick={() => toggleCamera()} disabled={connectionState === 'connecting' || connectionState === "closed"}>
                {isCameraOn ? <Video /> : <CameraOffIcon />}
              </Button>
            </div>

            <Button
              onClick={() => connectionState === 'connected' ? endSession() : startSession()}
              variant={connectionState === 'connected' ? 'default' : 'outline'}
              className={connectionState === 'connected' ? 'h-14 px-8 text-lg bg-primary text-primary-foreground' : 'h-14 px-8 text-lg'}
            >
              {buttonText()}
            </Button>
          </div>
        </div>
        {/* <audio ref={audioRef} autoPlay hidden /> */}
        <OrgaAudio stream={remoteStream} hidden/>
      </div>
  );
}
