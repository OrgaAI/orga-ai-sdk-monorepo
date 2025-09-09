"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrgaAI = void 0;
const errors_1 = require("../errors");
const utils_1 = require("../utils");
const types_1 = require("../types");
class OrgaAI {
    constructor() { }
    static init(config) {
        // Validation for temperature
        if (config.temperature !== undefined &&
            (config.temperature < types_1.ORGAAI_TEMPERATURE_RANGE.min || config.temperature > types_1.ORGAAI_TEMPERATURE_RANGE.max)) {
            throw new errors_1.ConfigurationError(`Temperature must be between ${types_1.ORGAAI_TEMPERATURE_RANGE.min} and ${types_1.ORGAAI_TEMPERATURE_RANGE.max}`);
        }
        let fetchFn;
        if (!config.ephemeralEndpoint && !config.fetchEphemeralTokenAndIceServers) {
            throw new errors_1.ConfigurationError('ephemeralEndpoint or fetchEphemeralTokenAndIceServers is required');
        }
        if (config.fetchEphemeralTokenAndIceServers) {
            fetchFn = config.fetchEphemeralTokenAndIceServers;
        }
        else if (config.ephemeralEndpoint) {
            fetchFn = () => (0, utils_1.fetchEphemeralTokenAndIceServers)(config?.ephemeralEndpoint || "");
        }
        const defaultConfig = {
            logLevel: 'warn',
            timeout: 30000,
            ...config,
            fetchEphemeralTokenAndIceServers: fetchFn
        };
        globalThis.OrgaAI = {
            config: defaultConfig,
            isInitialized: true
        };
        utils_1.logger.info('OrgaAI SDK initialized');
    }
    static getConfig() {
        if (!globalThis.OrgaAI?.isInitialized) {
            throw new errors_1.ConfigurationError('OrgaAI must be initialized before use. Call OrgaAI.init() first.');
        }
        return globalThis.OrgaAI.config;
    }
    static isInitialized() {
        return globalThis.OrgaAI?.isInitialized || false;
    }
}
exports.OrgaAI = OrgaAI;
