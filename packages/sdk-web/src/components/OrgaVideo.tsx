import React, { useEffect, useRef } from "react";
import { logger } from "../utils";

type OrgaVideoProps = React.VideoHTMLAttributes<HTMLVideoElement> & {
    stream: MediaStream | null;
  };  

export const OrgaVideo = ({ stream, ...props }: OrgaVideoProps) => {
    const ref = useRef<HTMLVideoElement>(null);
    useEffect(() => {
      if (ref.current) ref.current.srcObject = stream || null;
      logger.debug("OrgaVideo stream:", stream);
    }, [stream]);
    return <video ref={ref} autoPlay playsInline {...props} />;
  };
/*
    Example usage:
   <OrgaVideo stream={remoteStream} className="..." />

   This is optional, allows dev to plug and play and get going.
   Otherwise they can directly use the stream in their own components.
 */