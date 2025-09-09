import React, { ReactNode } from 'react';
import { OrgaAIHookReturn, OrgaAIHookCallbacks, OrgaAIModel, OrgaAIVoice } from '../types';
interface OrgaAIProviderProps {
    children: ReactNode;
    callbacks?: OrgaAIHookCallbacks;
}
interface OrgaAIContextValue extends OrgaAIHookReturn {
    model: OrgaAIModel;
    setModel: (model: OrgaAIModel) => void;
    voice: OrgaAIVoice;
    setVoice: (voice: OrgaAIVoice) => void;
    temperature: number;
    setTemperature: (temperature: number) => void;
}
export declare const OrgaAIProvider: ({ children, callbacks, }: OrgaAIProviderProps) => React.JSX.Element;
export declare function useOrgaAI(): OrgaAIContextValue;
export {};
