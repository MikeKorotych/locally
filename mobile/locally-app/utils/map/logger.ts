type LogLevel = 'debug' | 'info' | 'warn' | 'error';

type LoggerOptions = {
  enabled?: boolean;
};

export const useMapLogger = (scope: string, options: LoggerOptions = {}) => {
  const enabled = options.enabled ?? true;

  const log = (level: LogLevel, message: string, payload?: unknown) => {
    if (!enabled) {
      return;
    }
    const prefix = `[map:${scope}]`;
    switch (level) {
      case 'debug':
        console.log(prefix, message, payload ?? '');
        break;
      case 'info':
        console.info(prefix, message, payload ?? '');
        break;
      case 'warn':
        console.warn(prefix, message, payload ?? '');
        break;
      case 'error':
        console.error(prefix, message, payload ?? '');
        break;
      default:
        console.log(prefix, message, payload ?? '');
    }
  };

  return {
    debug: (message: string, payload?: unknown) =>
      log('debug', message, payload),
    info: (message: string, payload?: unknown) => log('info', message, payload),
    warn: (message: string, payload?: unknown) => log('warn', message, payload),
    error: (message: string, payload?: unknown) =>
      log('error', message, payload),
  };
};
