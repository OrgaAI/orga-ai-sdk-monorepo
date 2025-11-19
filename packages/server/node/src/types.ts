export interface OrgaAIConfig {
  apiKey: string;
  userEmail: string;
  baseUrl?: string;
  debug?: boolean;
  timeout?: number;
  }
  
  export interface SessionConfig {
    ephemeralToken: string;
    iceServers: IceServer[];
  }
  
  export interface IceServer {
    urls: string | string[];
    username?: string;
    credential?: string;
  }
  
  export interface OrgaAIErrorType extends Error {
    status?: number;
    code?: string;
  }