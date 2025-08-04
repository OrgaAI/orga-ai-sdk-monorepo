import React, { useEffect, useRef } from "react";
import { logger } from "../utils";

type OrgaAudioProps = React.AudioHTMLAttributes<HTMLAudioElement> & {
    stream: MediaStream | null;
  };

export const OrgaAudio = ({ stream, ...props }: OrgaAudioProps) => {
    const ref = useRef<HTMLAudioElement>(null);
    useEffect(() => {
      if (ref.current) ref.current.srcObject = stream || null;
      logger.debug("OrgaAudio stream:", stream);
    }, [stream]);
    return <audio ref={ref} autoPlay {...props} />;
  };

//   Example usage:
//   <OrgaAudio stream={remoteStream} hidden />