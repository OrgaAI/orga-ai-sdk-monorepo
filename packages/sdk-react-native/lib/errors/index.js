"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigurationError = exports.SessionError = exports.ConnectionError = exports.PermissionError = exports.OrgaAIError = void 0;
// src/errors/index.ts
class OrgaAIError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
        this.name = 'OrgaAIError';
    }
}
exports.OrgaAIError = OrgaAIError;
class PermissionError extends OrgaAIError {
    constructor(message = 'Media permissions denied') {
        super(message, 'PERMISSION_DENIED');
        this.name = 'PermissionError';
    }
}
exports.PermissionError = PermissionError;
class ConnectionError extends OrgaAIError {
    constructor(message = 'Failed to connect to Orga AI service') {
        super(message, 'CONNECTION_ERROR');
        this.name = 'ConnectionError';
    }
}
exports.ConnectionError = ConnectionError;
class SessionError extends OrgaAIError {
    constructor(message = 'Session error occurred') {
        super(message, 'SESSION_ERROR');
        this.name = 'SessionError';
    }
}
exports.SessionError = SessionError;
class ConfigurationError extends OrgaAIError {
    constructor(message = 'Invalid configuration') {
        super(message, 'CONFIGURATION_ERROR');
        this.name = 'ConfigurationError';
    }
}
exports.ConfigurationError = ConfigurationError;
