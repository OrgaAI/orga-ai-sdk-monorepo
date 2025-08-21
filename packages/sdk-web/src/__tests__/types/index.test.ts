import {
  ORGAAI_TEMPERATURE_RANGE,
  ORGAAI_VOICES,
  ORGAAI_MODELS,
  DataChannelEventTypes,
  MODALITIES_ENUM
} from '../../types';

describe('Types - Business Logic Validation', () => {
  describe('Temperature Range Validation', () => {
    it('should have valid temperature range', () => {
      expect(ORGAAI_TEMPERATURE_RANGE.min).toBeLessThan(ORGAAI_TEMPERATURE_RANGE.max);
      expect(ORGAAI_TEMPERATURE_RANGE.max - ORGAAI_TEMPERATURE_RANGE.min).toBe(1.0);
    });

    it('should have reasonable temperature bounds', () => {
      expect(ORGAAI_TEMPERATURE_RANGE.min).toBeGreaterThanOrEqual(0);
      expect(ORGAAI_TEMPERATURE_RANGE.max).toBeLessThanOrEqual(2);
    });
  });

  describe('Data Consistency Validation', () => {
    it('should not have duplicate voices', () => {
      const uniqueVoices = [...new Set(ORGAAI_VOICES)];
      expect(uniqueVoices).toHaveLength(ORGAAI_VOICES.length);
    });

    it('should not have duplicate models', () => {
      const uniqueModels = [...new Set(ORGAAI_MODELS)];
      expect(uniqueModels).toHaveLength(ORGAAI_MODELS.length);
    });

    it('should not have duplicate modalities', () => {
      const uniqueModalities = [...new Set(Object.values(MODALITIES_ENUM))];
      expect(uniqueModalities).toHaveLength(Object.values(MODALITIES_ENUM).length);
    });
  });

  describe('Event Type Pattern Validation', () => {
    it('should have consistent event type patterns', () => {
      // User events should follow conversation pattern
      expect(DataChannelEventTypes.USER_SPEECH_TRANSCRIPTION).toMatch(/conversation\./);
      
      // Response events should follow response pattern
      expect(DataChannelEventTypes.ASSISTANT_RESPONSE_COMPLETE).toMatch(/response\./);
      
      // Session events should follow session pattern
      expect(DataChannelEventTypes.SESSION_UPDATE).toMatch(/session\./);
    });

    it('should have non-empty event type strings', () => {
      Object.values(DataChannelEventTypes).forEach(eventType => {
        expect(eventType).toBeTruthy();
        expect(typeof eventType).toBe('string');
        expect(eventType.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Critical Business Rules', () => {
    it('should have at least one model available', () => {
      expect(ORGAAI_MODELS.length).toBeGreaterThan(0);
    });

    it('should have at least one voice available', () => {
      expect(ORGAAI_VOICES.length).toBeGreaterThan(0);
    });

    it('should have both audio and video modalities', () => {
      expect(MODALITIES_ENUM.AUDIO).toBe('audio');
      expect(MODALITIES_ENUM.VIDEO).toBe('video');
    });
  });
});
