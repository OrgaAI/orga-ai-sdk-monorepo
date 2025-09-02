"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../../types");
describe('Types - Business Logic Validation', () => {
    describe('Temperature Range Validation', () => {
        it('should have valid temperature range', () => {
            expect(types_1.ORGAAI_TEMPERATURE_RANGE.min).toBeLessThan(types_1.ORGAAI_TEMPERATURE_RANGE.max);
            expect(types_1.ORGAAI_TEMPERATURE_RANGE.max - types_1.ORGAAI_TEMPERATURE_RANGE.min).toBe(1.0);
        });
        it('should have reasonable temperature bounds', () => {
            expect(types_1.ORGAAI_TEMPERATURE_RANGE.min).toBeGreaterThanOrEqual(0);
            expect(types_1.ORGAAI_TEMPERATURE_RANGE.max).toBeLessThanOrEqual(2);
        });
    });
    describe('Data Consistency Validation', () => {
        it('should not have duplicate voices', () => {
            const uniqueVoices = [...new Set(types_1.ORGAAI_VOICES)];
            expect(uniqueVoices).toHaveLength(types_1.ORGAAI_VOICES.length);
        });
        it('should not have duplicate models', () => {
            const uniqueModels = [...new Set(types_1.ORGAAI_MODELS)];
            expect(uniqueModels).toHaveLength(types_1.ORGAAI_MODELS.length);
        });
        it('should not have duplicate modalities', () => {
            const uniqueModalities = [...new Set(Object.values(types_1.MODALITIES_ENUM))];
            expect(uniqueModalities).toHaveLength(Object.values(types_1.MODALITIES_ENUM).length);
        });
    });
    describe('Event Type Pattern Validation', () => {
        it('should have consistent event type patterns', () => {
            // User events should follow conversation pattern
            expect(types_1.DataChannelEventTypes.USER_SPEECH_TRANSCRIPTION).toMatch(/conversation\./);
            // Response events should follow response pattern
            expect(types_1.DataChannelEventTypes.ASSISTANT_RESPONSE_COMPLETE).toMatch(/response\./);
            // Session events should follow session pattern
            expect(types_1.DataChannelEventTypes.SESSION_UPDATE).toMatch(/session\./);
        });
        it('should have non-empty event type strings', () => {
            Object.values(types_1.DataChannelEventTypes).forEach(eventType => {
                expect(eventType).toBeTruthy();
                expect(typeof eventType).toBe('string');
                expect(eventType.length).toBeGreaterThan(0);
            });
        });
    });
    describe('Critical Business Rules', () => {
        it('should have at least one model available', () => {
            expect(types_1.ORGAAI_MODELS.length).toBeGreaterThan(0);
        });
        it('should have at least one voice available', () => {
            expect(types_1.ORGAAI_VOICES.length).toBeGreaterThan(0);
        });
        it('should have both audio and video modalities', () => {
            expect(types_1.MODALITIES_ENUM.AUDIO).toBe('audio');
            expect(types_1.MODALITIES_ENUM.VIDEO).toBe('video');
        });
    });
});
