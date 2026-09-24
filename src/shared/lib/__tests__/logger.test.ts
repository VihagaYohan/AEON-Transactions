import { logger } from '../logger';

describe('logger', () => {
  afterEach(() => jest.restoreAllMocks());

  it('writes structured development messages without accepting payload objects', () => {
    const info = jest.spyOn(console, 'info').mockImplementation(() => undefined);
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    logger.info('Loaded transactions', { count: 4 });
    logger.warn('Retrying request', { attempt: 1 });
    logger.error('Request failed');

    expect(info).toHaveBeenCalledWith('[info] Loaded transactions', { count: 4 });
    expect(warn).toHaveBeenCalledWith('[warn] Retrying request', { attempt: 1 });
    expect(error).toHaveBeenCalledWith('[error] Request failed', '');
  });
});
