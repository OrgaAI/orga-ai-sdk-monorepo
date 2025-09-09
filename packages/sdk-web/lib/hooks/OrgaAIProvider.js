"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrgaAIProvider = void 0;
exports.useOrgaAI = useOrgaAI;
const react_1 = __importStar(require("react"));
const types_1 = require("../types");
const useOrgaAI_1 = require("./useOrgaAI");
const OrgaAI_1 = require("../core/OrgaAI");
const utils_1 = require("../utils");
// Define the available options for model and voice
const DEFAULT_MODEL = "orga-1-beta";
const DEFAULT_VOICE = "alloy";
const DEFAULT_TEMPERATURE = 0.5;
const OrgaAIContext = (0, react_1.createContext)(undefined);
const OrgaAIProvider = ({ children, callbacks, }) => {
    const config = OrgaAI_1.OrgaAI.getConfig();
    const [model, _setModel] = (0, react_1.useState)(config.model ?? DEFAULT_MODEL);
    const [voice, _setVoice] = (0, react_1.useState)(config.voice ?? DEFAULT_VOICE);
    const [temperature, _setTemperature] = (0, react_1.useState)(config.temperature ?? DEFAULT_TEMPERATURE);
    // Validation helpers
    const isValidModel = (val) => types_1.ORGAAI_MODELS.includes(val);
    const isValidVoice = (val) => types_1.ORGAAI_VOICES.includes(val);
    const isValidTemperature = (val) => val >= types_1.ORGAAI_TEMPERATURE_RANGE.min && val <= types_1.ORGAAI_TEMPERATURE_RANGE.max;
    // Setters update both state and OrgaAI global config
    const setModel = (val) => {
        utils_1.logger.debug(`[Model] Setting model to ${val}`);
        if (isValidModel(val)) {
            _setModel(val);
            OrgaAI_1.OrgaAI.init({ ...OrgaAI_1.OrgaAI.getConfig(), model: val });
        }
        else {
            utils_1.logger.error(`[Model] Invalid model: ${val}`);
        }
    };
    const setVoice = (val) => {
        utils_1.logger.debug(`[Voice] Setting voice to ${val}`);
        if (isValidVoice(val)) {
            _setVoice(val);
            OrgaAI_1.OrgaAI.init({ ...OrgaAI_1.OrgaAI.getConfig(), voice: val });
        }
        else {
            utils_1.logger.error(`[Voice] Invalid voice: ${val}`);
        }
    };
    const setTemperature = (val) => {
        utils_1.logger.debug(`[Temperature] Setting temperature to ${val}`);
        if (isValidTemperature(val)) {
            _setTemperature(val);
            OrgaAI_1.OrgaAI.init({ ...OrgaAI_1.OrgaAI.getConfig(), temperature: val });
        }
        else {
            utils_1.logger.error(`[Temperature] Invalid temperature: ${val}`);
        }
    };
    const orgaAI = (0, useOrgaAI_1.useOrgaAI)({ ...callbacks });
    // Always use the latest context values for session
    const wrappedStartSession = (0, react_1.useCallback)(async (sessionConfig = {}) => {
        const newConfig = { ...OrgaAI_1.OrgaAI.getConfig(), model, voice, temperature };
        OrgaAI_1.OrgaAI.init(newConfig);
        return orgaAI.startSession(sessionConfig);
    }, [orgaAI, model, voice, temperature]);
    const contextValue = {
        ...orgaAI,
        startSession: wrappedStartSession,
        model,
        setModel,
        voice,
        setVoice,
        temperature,
        setTemperature,
    };
    return (react_1.default.createElement(OrgaAIContext.Provider, { value: contextValue }, children));
};
exports.OrgaAIProvider = OrgaAIProvider;
function useOrgaAI() {
    const context = (0, react_1.useContext)(OrgaAIContext);
    if (!context) {
        throw new Error('useOrgaAIContext must be used within an OrgaAIProvider');
    }
    return context;
}
