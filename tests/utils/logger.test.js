import { jest } from '@jest/globals';
import { logger } from 'src/utils/logger';
describe('logger', () => {
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    let logSpy;
    let warnSpy;
    let errorSpy;
    beforeEach(() => {
        logSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
        warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });
        errorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        logSpy.mockRestore();
        warnSpy.mockRestore();
        errorSpy.mockRestore();
        console.log = originalLog;
        console.warn = originalWarn;
        console.error = originalError;
    });
    it('info는 콘솔에 메시지를 출력해야 한다', () => {
        logger.info('hello', 'world');
        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('hello'), 'world');
    });
    it('warn은 콘솔 경고를 출력해야 한다', () => {
        logger.warn('be careful');
        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('be careful'));
    });
    it('error는 콘솔 에러를 출력해야 한다', () => {
        logger.error('boom');
        expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('boom'));
    });
});
//# sourceMappingURL=logger.test.js.map