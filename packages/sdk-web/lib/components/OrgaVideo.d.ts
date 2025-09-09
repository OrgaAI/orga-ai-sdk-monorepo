import React from "react";
type OrgaVideoProps = React.VideoHTMLAttributes<HTMLVideoElement> & {
    stream: MediaStream | null;
};
export declare const OrgaVideo: ({ stream, ...props }: OrgaVideoProps) => React.JSX.Element;
export {};
