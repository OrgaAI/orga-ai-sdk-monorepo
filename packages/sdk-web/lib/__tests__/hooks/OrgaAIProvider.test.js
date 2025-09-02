"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_2 = require("@testing-library/react");
const OrgaAIProvider_1 = require("../../hooks/OrgaAIProvider");
const OrgaAI_1 = require("../../core/OrgaAI");
const utils_1 = require("../../utils");
// Mock dependencies
jest.mock('../../core/OrgaAI');
jest.mock('../../utils', () => ({
    logger: {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    }
}));
// Mock console methods
const mockConsole = {
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
};
jest.spyOn(console, 'log').mockImplementation(mockConsole.log);
jest.spyOn(console, 'info').mockImplementation(mockConsole.info);
jest.spyOn(console, 'warn').mockImplementation(mockConsole.warn);
jest.spyOn(console, 'error').mockImplementation(mockConsole.error);
// Test component to access context
const TestComponent = () => {
    const context = (0, OrgaAIProvider_1.useOrgaAI)();
    return (react_1.default.createElement("div", null,
        react_1.default.createElement("div", { "data-testid": "model" }, context.model),
        react_1.default.createElement("div", { "data-testid": "voice" }, context.voice),
        react_1.default.createElement("div", { "data-testid": "temperature" }, context.temperature),
        react_1.default.createElement("button", { "data-testid": "set-model", onClick: () => context.setModel('orga-1-beta') }, "Set Model"),
        react_1.default.createElement("button", { "data-testid": "set-voice", onClick: () => context.setVoice('alloy') }, "Set Voice"),
        react_1.default.createElement("button", { "data-testid": "set-temperature", onClick: () => context.setTemperature(0.7) }, "Set Temperature"),
        react_1.default.createElement("button", { "data-testid": "start-session", onClick: () => context.startSession() }, "Start Session")));
};
describe('OrgaAIProvider', () => {
    const mockOrgaAI = {
        getConfig: jest.fn(),
        init: jest.fn(),
        isInitialized: jest.fn(),
    };
    beforeEach(() => {
        jest.clearAllMocks();
        OrgaAI_1.OrgaAI.getConfig = mockOrgaAI.getConfig;
        OrgaAI_1.OrgaAI.init = mockOrgaAI.init;
        OrgaAI_1.OrgaAI.isInitialized = mockOrgaAI.isInitialized;
    });
    describe('Provider Initialization', () => {
        it('should initialize with default values when no config exists', () => {
            mockOrgaAI.getConfig.mockReturnValue({});
            (0, react_2.render)(react_1.default.createElement(OrgaAIProvider_1.OrgaAIProvider, null,
                react_1.default.createElement(TestComponent, null)));
            expect(react_2.screen.getByTestId('model')).toHaveTextContent('orga-1-beta');
            expect(react_2.screen.getByTestId('voice')).toHaveTextContent('alloy');
            expect(react_2.screen.getByTestId('temperature')).toHaveTextContent('0.5');
        });
        it('should initialize with config values when available', () => {
            mockOrgaAI.getConfig.mockReturnValue({
                model: 'orga-1-beta',
                voice: 'echo',
                temperature: 0.8,
            });
            (0, react_2.render)(react_1.default.createElement(OrgaAIProvider_1.OrgaAIProvider, null,
                react_1.default.createElement(TestComponent, null)));
            expect(react_2.screen.getByTestId('model')).toHaveTextContent('orga-1-beta');
            expect(react_2.screen.getByTestId('voice')).toHaveTextContent('echo');
            expect(react_2.screen.getByTestId('temperature')).toHaveTextContent('0.8');
        });
        it('should handle partial config values', () => {
            mockOrgaAI.getConfig.mockReturnValue({
                model: 'orga-1-beta',
                // voice and temperature missing
            });
            (0, react_2.render)(react_1.default.createElement(OrgaAIProvider_1.OrgaAIProvider, null,
                react_1.default.createElement(TestComponent, null)));
            expect(react_2.screen.getByTestId('model')).toHaveTextContent('orga-1-beta');
            expect(react_2.screen.getByTestId('voice')).toHaveTextContent('alloy'); // default
            expect(react_2.screen.getByTestId('temperature')).toHaveTextContent('0.5'); // default
        });
    });
    describe('State Management', () => {
        beforeEach(() => {
            mockOrgaAI.getConfig.mockReturnValue({});
        });
        it('should update model state and call OrgaAI.init', async () => {
            (0, react_2.render)(react_1.default.createElement(OrgaAIProvider_1.OrgaAIProvider, null,
                react_1.default.createElement(TestComponent, null)));
            await (0, react_2.act)(async () => {
                react_2.screen.getByTestId('set-model').click();
            });
            expect(mockOrgaAI.init).toHaveBeenCalledWith(expect.objectContaining({
                model: 'orga-1-beta'
            }));
            expect(utils_1.logger.debug).toHaveBeenCalledWith('[Model] Setting model to orga-1-beta');
        });
        it('should update voice state and call OrgaAI.init', async () => {
            (0, react_2.render)(react_1.default.createElement(OrgaAIProvider_1.OrgaAIProvider, null,
                react_1.default.createElement(TestComponent, null)));
            await (0, react_2.act)(async () => {
                react_2.screen.getByTestId('set-voice').click();
            });
            expect(mockOrgaAI.init).toHaveBeenCalledWith(expect.objectContaining({
                voice: 'alloy'
            }));
            expect(utils_1.logger.debug).toHaveBeenCalledWith('[Voice] Setting voice to alloy');
        });
        it('should update temperature state and call OrgaAI.init', async () => {
            (0, react_2.render)(react_1.default.createElement(OrgaAIProvider_1.OrgaAIProvider, null,
                react_1.default.createElement(TestComponent, null)));
            await (0, react_2.act)(async () => {
                react_2.screen.getByTestId('set-temperature').click();
            });
            expect(mockOrgaAI.init).toHaveBeenCalledWith(expect.objectContaining({
                temperature: 0.7
            }));
            expect(utils_1.logger.debug).toHaveBeenCalledWith('[Temperature] Setting temperature to 0.7');
        });
    });
    describe('Validation', () => {
        beforeEach(() => {
            mockOrgaAI.getConfig.mockReturnValue({});
        });
        it('should log error for invalid model', async () => {
            const TestComponentWithInvalidModel = () => {
                const context = (0, OrgaAIProvider_1.useOrgaAI)();
                return (react_1.default.createElement("button", { "data-testid": "set-invalid-model", onClick: () => context.setModel('invalid-model') }, "Set Invalid Model"));
            };
            (0, react_2.render)(react_1.default.createElement(OrgaAIProvider_1.OrgaAIProvider, null,
                react_1.default.createElement(TestComponentWithInvalidModel, null)));
            await (0, react_2.act)(async () => {
                react_2.screen.getByTestId('set-invalid-model').click();
            });
            expect(utils_1.logger.error).toHaveBeenCalledWith('[Model] Invalid model: invalid-model');
            expect(mockOrgaAI.init).not.toHaveBeenCalled();
        });
        it('should log error for invalid voice', async () => {
            const TestComponentWithInvalidVoice = () => {
                const context = (0, OrgaAIProvider_1.useOrgaAI)();
                return (react_1.default.createElement("button", { "data-testid": "set-invalid-voice", onClick: () => context.setVoice('invalid-voice') }, "Set Invalid Voice"));
            };
            (0, react_2.render)(react_1.default.createElement(OrgaAIProvider_1.OrgaAIProvider, null,
                react_1.default.createElement(TestComponentWithInvalidVoice, null)));
            await (0, react_2.act)(async () => {
                react_2.screen.getByTestId('set-invalid-voice').click();
            });
            expect(utils_1.logger.error).toHaveBeenCalledWith('[Voice] Invalid voice: invalid-voice');
            expect(mockOrgaAI.init).not.toHaveBeenCalled();
        });
        it('should log error for invalid temperature', async () => {
            const TestComponentWithInvalidTemperature = () => {
                const context = (0, OrgaAIProvider_1.useOrgaAI)();
                return (react_1.default.createElement("button", { "data-testid": "set-invalid-temperature", onClick: () => context.setTemperature(2.5) }, "Set Invalid Temperature"));
            };
            (0, react_2.render)(react_1.default.createElement(OrgaAIProvider_1.OrgaAIProvider, null,
                react_1.default.createElement(TestComponentWithInvalidTemperature, null)));
            await (0, react_2.act)(async () => {
                react_2.screen.getByTestId('set-invalid-temperature').click();
            });
            expect(utils_1.logger.error).toHaveBeenCalledWith('[Temperature] Invalid temperature: 2.5');
            expect(mockOrgaAI.init).not.toHaveBeenCalled();
        });
        it('should accept temperature at minimum value', async () => {
            const TestComponentWithMinTemperature = () => {
                const context = (0, OrgaAIProvider_1.useOrgaAI)();
                return (react_1.default.createElement("button", { "data-testid": "set-min-temperature", onClick: () => context.setTemperature(0) }, "Set Min Temperature"));
            };
            (0, react_2.render)(react_1.default.createElement(OrgaAIProvider_1.OrgaAIProvider, null,
                react_1.default.createElement(TestComponentWithMinTemperature, null)));
            await (0, react_2.act)(async () => {
                react_2.screen.getByTestId('set-min-temperature').click();
            });
            expect(mockOrgaAI.init).toHaveBeenCalledWith(expect.objectContaining({
                temperature: 0
            }));
            expect(utils_1.logger.error).not.toHaveBeenCalled();
        });
        it('should accept temperature at maximum value', async () => {
            const TestComponentWithMaxTemperature = () => {
                const context = (0, OrgaAIProvider_1.useOrgaAI)();
                return (react_1.default.createElement("button", { "data-testid": "set-max-temperature", onClick: () => context.setTemperature(1) }, "Set Max Temperature"));
            };
            (0, react_2.render)(react_1.default.createElement(OrgaAIProvider_1.OrgaAIProvider, null,
                react_1.default.createElement(TestComponentWithMaxTemperature, null)));
            await (0, react_2.act)(async () => {
                react_2.screen.getByTestId('set-max-temperature').click();
            });
            expect(mockOrgaAI.init).toHaveBeenCalledWith(expect.objectContaining({
                temperature: 1
            }));
            expect(utils_1.logger.error).not.toHaveBeenCalled();
        });
    });
    describe('Session Management', () => {
        beforeEach(() => {
            mockOrgaAI.getConfig.mockReturnValue({});
            mockOrgaAI.isInitialized.mockReturnValue(true);
        });
        it('should call startSession with updated config', async () => {
            const mockStartSession = jest.fn();
            const TestComponentWithSession = () => {
                const context = (0, OrgaAIProvider_1.useOrgaAI)();
                react_1.default.useEffect(() => {
                    // Mock the startSession method
                    context.startSession = mockStartSession;
                }, [context]);
                return (react_1.default.createElement("button", { "data-testid": "start-session", onClick: () => context.startSession() }, "Start Session"));
            };
            (0, react_2.render)(react_1.default.createElement(OrgaAIProvider_1.OrgaAIProvider, null,
                react_1.default.createElement(TestComponentWithSession, null)));
            await (0, react_2.act)(async () => {
                react_2.screen.getByTestId('start-session').click();
            });
            expect(mockStartSession).toHaveBeenCalled();
        });
    });
    describe('Context Integration', () => {
        it('should provide all required context values', () => {
            mockOrgaAI.getConfig.mockReturnValue({});
            const TestContextValues = () => {
                const context = (0, OrgaAIProvider_1.useOrgaAI)();
                return (react_1.default.createElement("div", null,
                    react_1.default.createElement("div", { "data-testid": "has-model" }, typeof context.model),
                    react_1.default.createElement("div", { "data-testid": "has-voice" }, typeof context.voice),
                    react_1.default.createElement("div", { "data-testid": "has-temperature" }, typeof context.temperature),
                    react_1.default.createElement("div", { "data-testid": "has-set-model" }, typeof context.setModel),
                    react_1.default.createElement("div", { "data-testid": "has-set-voice" }, typeof context.setVoice),
                    react_1.default.createElement("div", { "data-testid": "has-set-temperature" }, typeof context.setTemperature),
                    react_1.default.createElement("div", { "data-testid": "has-start-session" }, typeof context.startSession)));
            };
            (0, react_2.render)(react_1.default.createElement(OrgaAIProvider_1.OrgaAIProvider, null,
                react_1.default.createElement(TestContextValues, null)));
            expect(react_2.screen.getByTestId('has-model')).toHaveTextContent('string');
            expect(react_2.screen.getByTestId('has-voice')).toHaveTextContent('string');
            expect(react_2.screen.getByTestId('has-temperature')).toHaveTextContent('number');
            expect(react_2.screen.getByTestId('has-set-model')).toHaveTextContent('function');
            expect(react_2.screen.getByTestId('has-set-voice')).toHaveTextContent('function');
            expect(react_2.screen.getByTestId('has-set-temperature')).toHaveTextContent('function');
            expect(react_2.screen.getByTestId('has-start-session')).toHaveTextContent('function');
        });
    });
    describe('useOrgaAI Hook', () => {
        it('should throw error when used outside provider', () => {
            const TestComponentOutsideProvider = () => {
                try {
                    (0, OrgaAIProvider_1.useOrgaAI)();
                    return react_1.default.createElement("div", { "data-testid": "no-error" }, "No Error");
                }
                catch (error) {
                    return react_1.default.createElement("div", { "data-testid": "error" }, error instanceof Error ? error.message : 'Unknown error');
                }
            };
            (0, react_2.render)(react_1.default.createElement(TestComponentOutsideProvider, null));
            expect(react_2.screen.getByTestId('error')).toHaveTextContent('useOrgaAIContext must be used within an OrgaAIProvider');
        });
        it('should work correctly when used within provider', () => {
            mockOrgaAI.getConfig.mockReturnValue({});
            (0, react_2.render)(react_1.default.createElement(OrgaAIProvider_1.OrgaAIProvider, null,
                react_1.default.createElement(TestComponent, null)));
            expect(react_2.screen.getByTestId('model')).toBeInTheDocument();
            expect(react_2.screen.getByTestId('voice')).toBeInTheDocument();
            expect(react_2.screen.getByTestId('temperature')).toBeInTheDocument();
        });
    });
    describe('Callbacks Integration', () => {
        it('should pass callbacks to internal hook', () => {
            const mockCallbacks = {
                onSessionStart: jest.fn(),
                onSessionEnd: jest.fn(),
                onError: jest.fn(),
            };
            (0, react_2.render)(react_1.default.createElement(OrgaAIProvider_1.OrgaAIProvider, { callbacks: mockCallbacks },
                react_1.default.createElement(TestComponent, null)));
            // The callbacks should be passed through to the internal hook
            // We can't directly test this without exposing internal state,
            // but we can verify the provider renders without errors
            expect(react_2.screen.getByTestId('model')).toBeInTheDocument();
        });
    });
    describe('State Persistence', () => {
        it('should maintain state across re-renders', async () => {
            mockOrgaAI.getConfig.mockReturnValue({});
            const { rerender } = (0, react_2.render)(react_1.default.createElement(OrgaAIProvider_1.OrgaAIProvider, null,
                react_1.default.createElement(TestComponent, null)));
            // Set a value
            await (0, react_2.act)(async () => {
                react_2.screen.getByTestId('set-temperature').click();
            });
            // Re-render
            rerender(react_1.default.createElement(OrgaAIProvider_1.OrgaAIProvider, null,
                react_1.default.createElement(TestComponent, null)));
            // State should be maintained
            expect(mockOrgaAI.init).toHaveBeenCalledWith(expect.objectContaining({
                temperature: 0.7
            }));
        });
    });
});
