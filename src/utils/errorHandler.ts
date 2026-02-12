// errorHandler.ts
import config from '../config';

const logger = config.logger;

interface ErrorHandlerOptions {
  exitOnUncaught?: boolean;
}

interface ConnectionError {
    host?: string;
    port?: number;
}

interface SystemError extends Error {
  code?: string;
  syscall?: string;
  address?: string;
  port?: number;
  client?: ConnectionError;
}

class ErrorHandler {
  private exitOnUncaught: boolean;

  constructor(options: ErrorHandlerOptions = {}) {
    this.exitOnUncaught = options.exitOnUncaught ?? true;
  }

  public init(): void {
    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      this.handleError('Uncaught Exception:', error);
      if (this.exitOnUncaught) {
        process.exit(1);
      }
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
      this.handleError('Unhandled Promise Rejection:', reason instanceof Error ? reason : new Error(String(reason)));
    });

    // Handle socket errors at the process level
    process.on('warning', (warning: Error) => {
      if (warning.name === 'SystemError' && (warning as SystemError).code === 'ERR_SOCKET_CLOSED') {
        logger.warn('Socket closed unexpectedly:', warning);
      } else {
        logger.warn('Process warning:', warning);
      }
    });
  }

  private handleError(prefix: string, error: Error | SystemError): void {
    // Log the full error details including stack trace
    const sysError = error as SystemError;
    const log = {
        error: prefix,
        code: sysError.code,
        syscall: sysError.syscall,
        host: sysError.client?.host,
        port: sysError.client?.port,
      }
    config.logger.error(log);

      // Log additional context if available for system errors
    if (sysError.address && sysError.port) {
      logger.error(`Network: ${sysError.address}:${sysError.port}`);
    }
  }
}


export { ErrorHandler, ErrorHandlerOptions };