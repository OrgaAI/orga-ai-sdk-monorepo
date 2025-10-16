import { logger } from '../../utils';
import { OrgaAI } from '../../client/OrgaAI';

describe('Logger Utility', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleInfoSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    OrgaAI.reset();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleInfoSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('logLevel: debug', () => {
    beforeEach(() => {
      OrgaAI.init({
        sessionConfigEndpoint: 'https://api.example.com/session',
        logLevel: 'debug',
      });
    });

    it('should log debug messages', () => {
      logger.debug('test debug');
      expect(consoleLogSpy).toHaveBeenCalledWith('[OrgaAI Debug] test debug');
    });

    it('should log info messages', () => {
      logger.info('test info');
      expect(consoleInfoSpy).toHaveBeenCalledWith('[OrgaAI Info] test info');
    });

    it('should log warn messages', () => {
      logger.warn('test warn');
      expect(consoleWarnSpy).toHaveBeenCalledWith('[OrgaAI Warn] test warn');
    });

    it('should log error messages', () => {
      logger.error('test error');
      expect(consoleErrorSpy).toHaveBeenCalledWith('[OrgaAI Error] test error');
    });
  });

  describe('logLevel: info', () => {
    beforeEach(() => {
      OrgaAI.init({
        sessionConfigEndpoint: 'https://api.example.com/session',
        logLevel: 'info',
      });
    });

    it('should not log debug messages', () => {
      logger.debug('test debug');
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should log info messages', () => {
      logger.info('test info');
      expect(consoleInfoSpy).toHaveBeenCalled();
    });

    it('should log warn messages', () => {
      logger.warn('test warn');
      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    it('should log error messages', () => {
      logger.error('test error');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('logLevel: warn', () => {
    beforeEach(() => {
      OrgaAI.init({
        sessionConfigEndpoint: 'https://api.example.com/session',
        logLevel: 'warn',
      });
    });

    it('should not log debug messages', () => {
      logger.debug('test debug');
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should not log info messages', () => {
      logger.info('test info');
      expect(consoleInfoSpy).not.toHaveBeenCalled();
    });

    it('should log warn messages', () => {
      logger.warn('test warn');
      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    it('should log error messages', () => {
      logger.error('test error');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('logLevel: error', () => {
    beforeEach(() => {
      OrgaAI.init({
        sessionConfigEndpoint: 'https://api.example.com/session',
        logLevel: 'error',
      });
    });

    it('should not log debug messages', () => {
      logger.debug('test debug');
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should not log info messages', () => {
      logger.info('test info');
      expect(consoleInfoSpy).not.toHaveBeenCalled();
    });

    it('should not log warn messages', () => {
      logger.warn('test warn');
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should log error messages', () => {
      logger.error('test error');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('logLevel: disabled', () => {
    beforeEach(() => {
      OrgaAI.init({
        sessionConfigEndpoint: 'https://api.example.com/session',
        logLevel: 'disabled',
      });
    });

    it('should not log any messages', () => {
      logger.debug('test debug');
      logger.info('test info');
      logger.warn('test warn');
      logger.error('test error');

      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleInfoSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });
});

