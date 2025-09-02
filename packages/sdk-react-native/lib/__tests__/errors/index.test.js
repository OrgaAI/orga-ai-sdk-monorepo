"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../../errors");
describe('Errors', () => {
    describe('OrgaAIError', () => {
        it('should create base error with custom message and code', () => {
            const error = new errors_1.OrgaAIError('Custom error message', 'CUSTOM_CODE');
            expect(error.message).toBe('Custom error message');
            expect(error.code).toBe('CUSTOM_CODE');
            expect(error.name).toBe('OrgaAIError');
            expect(error).toBeInstanceOf(Error);
            expect(error).toBeInstanceOf(errors_1.OrgaAIError);
        });
        it('should have correct prototype chain', () => {
            const error = new errors_1.OrgaAIError('Test message', 'TEST_CODE');
            expect(error).toBeInstanceOf(Error);
            expect(error).toBeInstanceOf(errors_1.OrgaAIError);
            expect(Object.getPrototypeOf(error)).toBe(errors_1.OrgaAIError.prototype);
        });
        it('should be serializable', () => {
            const error = new errors_1.OrgaAIError('Serializable error', 'SERIAL_CODE');
            const serialized = JSON.stringify({
                message: error.message,
                code: error.code,
                name: error.name
            });
            const parsed = JSON.parse(serialized);
            expect(parsed.message).toBe('Serializable error');
            expect(parsed.code).toBe('SERIAL_CODE');
            expect(parsed.name).toBe('OrgaAIError');
        });
    });
    describe('PermissionError', () => {
        it('should create permission error with default message', () => {
            const error = new errors_1.PermissionError();
            expect(error.message).toBe('Media permissions denied');
            expect(error.code).toBe('PERMISSION_DENIED');
            expect(error.name).toBe('PermissionError');
            expect(error).toBeInstanceOf(errors_1.OrgaAIError);
            expect(error).toBeInstanceOf(Error);
        });
        it('should create permission error with custom message', () => {
            const error = new errors_1.PermissionError('Camera access denied');
            expect(error.message).toBe('Camera access denied');
            expect(error.code).toBe('PERMISSION_DENIED');
            expect(error.name).toBe('PermissionError');
        });
        it('should have correct inheritance chain', () => {
            const error = new errors_1.PermissionError();
            expect(error).toBeInstanceOf(Error);
            expect(error).toBeInstanceOf(errors_1.OrgaAIError);
            expect(error).toBeInstanceOf(errors_1.PermissionError);
        });
    });
    describe('ConnectionError', () => {
        it('should create connection error with default message', () => {
            const error = new errors_1.ConnectionError();
            expect(error.message).toBe('Failed to connect to Orga AI service');
            expect(error.code).toBe('CONNECTION_ERROR');
            expect(error.name).toBe('ConnectionError');
            expect(error).toBeInstanceOf(errors_1.OrgaAIError);
            expect(error).toBeInstanceOf(Error);
        });
        it('should create connection error with custom message', () => {
            const error = new errors_1.ConnectionError('Network timeout occurred');
            expect(error.message).toBe('Network timeout occurred');
            expect(error.code).toBe('CONNECTION_ERROR');
            expect(error.name).toBe('ConnectionError');
        });
        it('should have correct inheritance chain', () => {
            const error = new errors_1.ConnectionError();
            expect(error).toBeInstanceOf(Error);
            expect(error).toBeInstanceOf(errors_1.OrgaAIError);
            expect(error).toBeInstanceOf(errors_1.ConnectionError);
        });
    });
    describe('SessionError', () => {
        it('should create session error with default message', () => {
            const error = new errors_1.SessionError();
            expect(error.message).toBe('Session error occurred');
            expect(error.code).toBe('SESSION_ERROR');
            expect(error.name).toBe('SessionError');
            expect(error).toBeInstanceOf(errors_1.OrgaAIError);
            expect(error).toBeInstanceOf(Error);
        });
        it('should create session error with custom message', () => {
            const error = new errors_1.SessionError('Session terminated unexpectedly');
            expect(error.message).toBe('Session terminated unexpectedly');
            expect(error.code).toBe('SESSION_ERROR');
            expect(error.name).toBe('SessionError');
        });
        it('should have correct inheritance chain', () => {
            const error = new errors_1.SessionError();
            expect(error).toBeInstanceOf(Error);
            expect(error).toBeInstanceOf(errors_1.OrgaAIError);
            expect(error).toBeInstanceOf(errors_1.SessionError);
        });
    });
    describe('ConfigurationError', () => {
        it('should create configuration error with default message', () => {
            const error = new errors_1.ConfigurationError();
            expect(error.message).toBe('Invalid configuration');
            expect(error.code).toBe('CONFIGURATION_ERROR');
            expect(error.name).toBe('ConfigurationError');
            expect(error).toBeInstanceOf(errors_1.OrgaAIError);
            expect(error).toBeInstanceOf(Error);
        });
        it('should create configuration error with custom message', () => {
            const error = new errors_1.ConfigurationError('Missing required API key');
            expect(error.message).toBe('Missing required API key');
            expect(error.code).toBe('CONFIGURATION_ERROR');
            expect(error.name).toBe('ConfigurationError');
        });
        it('should have correct inheritance chain', () => {
            const error = new errors_1.ConfigurationError();
            expect(error).toBeInstanceOf(Error);
            expect(error).toBeInstanceOf(errors_1.OrgaAIError);
            expect(error).toBeInstanceOf(errors_1.ConfigurationError);
        });
    });
    describe('Error Hierarchy', () => {
        it('should maintain proper inheritance structure', () => {
            const permissionError = new errors_1.PermissionError();
            const connectionError = new errors_1.ConnectionError();
            const sessionError = new errors_1.SessionError();
            const configError = new errors_1.ConfigurationError();
            // All should inherit from OrgaAIError
            expect(permissionError).toBeInstanceOf(errors_1.OrgaAIError);
            expect(connectionError).toBeInstanceOf(errors_1.OrgaAIError);
            expect(sessionError).toBeInstanceOf(errors_1.OrgaAIError);
            expect(configError).toBeInstanceOf(errors_1.OrgaAIError);
            // All should inherit from Error
            expect(permissionError).toBeInstanceOf(Error);
            expect(connectionError).toBeInstanceOf(Error);
            expect(sessionError).toBeInstanceOf(Error);
            expect(configError).toBeInstanceOf(Error);
        });
        it('should have unique error codes', () => {
            const codes = [
                new errors_1.PermissionError().code,
                new errors_1.ConnectionError().code,
                new errors_1.SessionError().code,
                new errors_1.ConfigurationError().code
            ];
            const uniqueCodes = [...new Set(codes)];
            expect(uniqueCodes).toHaveLength(codes.length);
        });
        it('should have unique error names', () => {
            const names = [
                new errors_1.PermissionError().name,
                new errors_1.ConnectionError().name,
                new errors_1.SessionError().name,
                new errors_1.ConfigurationError().name
            ];
            const uniqueNames = [...new Set(names)];
            expect(uniqueNames).toHaveLength(names.length);
        });
    });
    describe('Error Usage Patterns', () => {
        it('should work with try-catch blocks', () => {
            try {
                throw new errors_1.ConfigurationError('Test configuration error');
            }
            catch (error) {
                if (error instanceof errors_1.ConfigurationError) {
                    expect(error).toBeInstanceOf(errors_1.ConfigurationError);
                    expect(error).toBeInstanceOf(errors_1.OrgaAIError);
                    expect(error.message).toBe('Test configuration error');
                    expect(error.code).toBe('CONFIGURATION_ERROR');
                }
            }
        });
        it('should work with error instanceof checks', () => {
            const error = new errors_1.ConnectionError('Network error');
            if (error instanceof errors_1.OrgaAIError) {
                expect(error.code).toBe('CONNECTION_ERROR');
            }
            else {
                fail('Error should be instance of OrgaAIError');
            }
        });
        it('should preserve stack trace', () => {
            const error = new errors_1.SessionError('Stack trace test');
            expect(error.stack).toBeDefined();
            expect(typeof error.stack).toBe('string');
            expect(error.stack?.length).toBeGreaterThan(0);
        });
    });
});
