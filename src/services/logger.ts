import * as Sentry from '@sentry/react-native';

/**
 * Log levels supported by the Logger
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

/**
 * Map LogLevel to Sentry SeverityLevel
 */
const toSentrySeverity = (level: LogLevel): Sentry.SeverityLevel => {
  switch (level) {
    case LogLevel.DEBUG:
      return 'debug';
    case LogLevel.INFO:
      return 'info';
    case LogLevel.WARN:
      return 'warning';
    case LogLevel.ERROR:
      return 'error';
    default:
      return 'info';
  }
};

/**
 * Configuration options for Logger instance
 */
interface LoggerConfig {
  /**
   * Minimum log level to send to Sentry
   * @default LogLevel.ERROR
   */
  sentryLevel?: LogLevel;

  /**
   * Whether to send logs to Sentry
   * @default true (but respects Sentry's enabled state)
   */
  enableSentry?: boolean;

  /**
   * Whether to log to console
   * @default true
   */
  enableConsole?: boolean;

  /**
   * Prefix for console logs
   * @default undefined
   */
  prefix?: string;
}

/**
 * Additional context to attach to logs
 */
interface LogContext {
  tags?: Record<string, string>;
  extra?: Record<string, any>;
  user?: {
    id?: string;
    username?: string;
    email?: string;
  };
}

/**
 * Logger class that logs to console and optionally sends to Sentry
 *
 * @example
 * ```typescript
 * const logger = new Logger({ prefix: 'MyComponent' });
 * logger.info('User logged in', { tags: { userId: '123' } });
 * logger.error('Failed to fetch data', error, { extra: { endpoint: '/api/users' } });
 * ```
 */
export class Logger {
  private config: Required<LoggerConfig>;

  constructor(config: LoggerConfig = {}) {
    this.config = {
      sentryLevel: config.sentryLevel ?? LogLevel.ERROR,
      enableSentry: config.enableSentry ?? true,
      enableConsole: config.enableConsole ?? true,
      prefix: config.prefix ?? '',
    };
  }

  /**
   * Format console message with optional prefix
   */
  private formatMessage(message: string): string {
    return this.config.prefix ? `[${this.config.prefix}] ${message}` : message;
  }

  /**
   * Check if a log level should be sent to Sentry
   */
  private shouldSendToSentry(level: LogLevel): boolean {
    if (!this.config.enableSentry) return false;

    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const currentLevelIndex = levels.indexOf(level);
    const sentryLevelIndex = levels.indexOf(this.config.sentryLevel);

    return currentLevelIndex >= sentryLevelIndex;
  }

  /**
   * Send event to Sentry with context
   */
  private sendToSentry(
    level: LogLevel,
    message: string,
    error?: Error,
    context?: LogContext
  ): void {
    if (!this.shouldSendToSentry(level)) return;

    Sentry.withScope((scope) => {
      // Apply context if provided
      if (context) {
        if (context.tags) {
          Object.entries(context.tags).forEach(([key, value]) => {
            scope.setTag(key, value);
          });
        }

        if (context.user) {
          scope.setUser(context.user);
        }

        if (context.extra) {
          scope.setContext('extra', context.extra);
        }
      }

      // Add logger context
      scope.setContext('logger', {
        prefix: this.config.prefix,
        ...(error ? { message } : {}),
      });

      // Set level
      scope.setLevel(toSentrySeverity(level));

      // Send to Sentry based on level
      if (error) {
        Sentry.captureException(error);
      } else {
        Sentry.captureMessage(message);
      }
    });
  }

  /**
   * Check if a log level should be logged to console based on environment
   */
  private shouldLogToConsole(level: LogLevel): boolean {
    if (!this.config.enableConsole) return false;

    // In development, log everything to console
    if (__DEV__) return true;

    // In production, only log warnings and errors to console
    return level === LogLevel.WARN || level === LogLevel.ERROR;
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: LogContext): void {
    if (this.shouldLogToConsole(LogLevel.DEBUG)) {
      console.debug(this.formatMessage(message));
    }
    this.sendToSentry(LogLevel.DEBUG, message, undefined, context);
  }

  /**
   * Log info message
   */
  info(message: string, context?: LogContext): void {
    if (this.shouldLogToConsole(LogLevel.INFO)) {
      console.info(this.formatMessage(message));
    }
    this.sendToSentry(LogLevel.INFO, message, undefined, context);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: LogContext): void;
  warn(message: string, error: Error, context?: LogContext): void;
  warn(message: string, errorOrContext?: Error | LogContext, context?: LogContext): void {
    const error = errorOrContext instanceof Error ? errorOrContext : undefined;
    const ctx = errorOrContext instanceof Error ? context : errorOrContext;

    if (this.shouldLogToConsole(LogLevel.WARN)) {
      console.warn(this.formatMessage(message), error || '');
    }
    this.sendToSentry(LogLevel.WARN, message, error, ctx);
  }

  /**
   * Log error message
   */
  error(message: string, context?: LogContext): void;
  error(message: string, error: Error, context?: LogContext): void;
  error(message: string, errorOrContext?: Error | LogContext, context?: LogContext): void {
    const error = errorOrContext instanceof Error ? errorOrContext : undefined;
    const ctx = errorOrContext instanceof Error ? context : errorOrContext;

    if (this.shouldLogToConsole(LogLevel.ERROR)) {
      console.error(this.formatMessage(message), error || '');
    }
    this.sendToSentry(LogLevel.ERROR, message, error, ctx);
  }

  /**
   * Create a child logger with additional prefix
   */
  child(childPrefix: string): Logger {
    const newPrefix = this.config.prefix
      ? `${this.config.prefix}:${childPrefix}`
      : childPrefix;

    return new Logger({
      ...this.config,
      prefix: newPrefix,
    });
  }

  /**
   * Update logger configuration
   */
  updateConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// Export a default logger instance
export const logger = new Logger();

// Export convenience method to create named loggers
export const createLogger = (prefix: string, config?: Omit<LoggerConfig, 'prefix'>): Logger => new Logger({ ...config, prefix });
