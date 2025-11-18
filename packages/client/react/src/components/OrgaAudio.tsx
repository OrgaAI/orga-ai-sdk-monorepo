import React, { useEffect, useRef } from "react";
import { logger } from "@orga-ai/core";

type OrgaAudioProps = React.AudioHTMLAttributes<HTMLAudioElement> & {
    stream: MediaStream | null;
    hidden?: boolean;
  };

export const OrgaAudio = ({ stream, hidden = true, ...props }: OrgaAudioProps) => {
    const ref = useRef<HTMLAudioElement>(null);
    useEffect(() => {
      if (ref.current) ref.current.srcObject = stream || null;
      logger.debug("OrgaAudio stream:", stream);
    }, [stream]);
    return <audio ref={ref} hidden={hidden} autoPlay {...props} />;
  };

//   Example usage:
//   <OrgaAudio stream={remoteStream} />