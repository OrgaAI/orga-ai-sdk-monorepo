import { OrgaAIConfig } from '../types';
declare global {
    var OrgaAI: {
        config: OrgaAIConfig;
        isInitialized: boolean;
    } | undefined;
}
export declare class OrgaAI {
    private static instance;
    private constructor();
    static init(config: OrgaAIConfig): void;
    static getConfig(): OrgaAIConfig;
    static isInitialized(): boolean;
}
