import {
  ORGAAI_MODELS,
  ORGAAI_VOICES,
  ORGAAI_TEMPERATURE_RANGE,
  MODALITIES_ENUM,
  DataChannelEventTypes,
} from '../../types';

describe('Type Constants', () => {
  describe('ORGAAI_MODELS', () => {
    it('should contain orga-1-beta', () => {
      expect(ORGAAI_MODELS).toContain('orga-1-beta');
    });

    it('should be readonly', () => {
      expect(Object.isFrozen(ORGAAI_MODELS)).toBe(false);
      // Type-level check - this will fail at compile time if not readonly
      // @ts-expect-error - Cannot assign to readonly array
      ORGAAI_MODELS[0] = 'test';
    });
  });

  describe('ORGAAI_VOICES', () => {
    it('should contain expected voices', () => {
      const expectedVoices = [
        'alloy',
        'ash',
        'ballad',
        'coral',
        'echo',
        'fable',
        'onyx',
        'nova',
        'sage',
        'shimmer',
      ];

      expectedVoices.forEach((voice) => {
        expect(ORGAAI_VOICES).toContain(voice);
      });
    });

    it('should have correct length', () => {
      expect(ORGAAI_VOICES).toHaveLength(10);
    });
  });

  describe('ORGAAI_TEMPERATURE_RANGE', () => {
    it('should have correct min and max values', () => {
      expect(ORGAAI_TEMPERATURE_RANGE.min).toBe(0.0);
      expect(ORGAAI_TEMPERATURE_RANGE.max).toBe(1.0);
    });
  });

  describe('MODALITIES_ENUM', () => {
    it('should have video and audio modalities', () => {
      expect(MODALITIES_ENUM.VIDEO).toBe('video');
      expect(MODALITIES_ENUM.AUDIO).toBe('audio');
    });
  });

  describe('DataChannelEventTypes', () => {
    it('should have all expected event types', () => {
      expect(DataChannelEventTypes.USER_SPEECH_TRANSCRIPTION).toBe(
        'conversation.item.input_audio_transcription.completed'
      );
      expect(DataChannelEventTypes.ASSISTANT_RESPONSE_COMPLETE).toBe(
        'response.output_item.done'
      );
      expect(DataChannelEventTypes.SESSION_UPDATE).toBe('session.update');
      expect(DataChannelEventTypes.SESSION_CREATED).toBe('session.created');
      expect(DataChannelEventTypes.CONVERSATION_CREATED).toBe(
        'conversation.created'
      );
    });
  });
});

