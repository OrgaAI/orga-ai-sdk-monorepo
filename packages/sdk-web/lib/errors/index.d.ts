export declare class OrgaAIError extends Error {
    code: string;
    constructor(message: string, code: string);
}
export declare class PermissionError extends OrgaAIError {
    constructor(message?: string);
}
export declare class ConnectionError extends OrgaAIError {
    constructor(message?: string);
}
export declare class SessionError extends OrgaAIError {
    constructor(message?: string);
}
export declare class ConfigurationError extends OrgaAIError {
    constructor(message?: string);
}
