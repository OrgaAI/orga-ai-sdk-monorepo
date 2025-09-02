import React from "react";
type OrgaAudioProps = React.AudioHTMLAttributes<HTMLAudioElement> & {
    stream: MediaStream | null;
    hidden?: boolean;
};
export declare const OrgaAudio: ({ stream, hidden, ...props }: OrgaAudioProps) => React.JSX.Element;
export {};
