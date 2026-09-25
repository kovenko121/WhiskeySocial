/**
 * Shared logger for deployment scripts
 */

type LogLevel = 'info' | 'success' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: unknown;
}

class DeploymentLogger {
  private logs: LogEntry[] = [];

  private scriptName: string = 'deployment';

  private readonly maxLogEntries: number = 1000;

  setScriptName(name: string): void {
    this.scriptName = name;
  }

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private log(level: LogLevel, message: string, data?: unknown): void {
    const timestamp = this.formatTimestamp();
    const entry: LogEntry = { timestamp, level, message, data };
    this.logs.push(entry);

    // Prevent unbounded memory growth
    if (this.logs.length > this.maxLogEntries) {
      this.logs = this.logs.slice(-this.maxLogEntries);
    }

    const prefix = this.getPrefix(level);
    const formattedMessage = `${prefix} [${this.scriptName}] ${message}`;

    const logArgs: [string, ...unknown[]] = data !== undefined
      ? [formattedMessage, data]
      : [formattedMessage];

    switch (level) {
      case 'error':
        console.error(...logArgs);
        break;
      case 'warn':
        console.warn(...logArgs);
        break;
      case 'debug':
        if (process.env.DEBUG) {
          console.log(...logArgs);
        }
        break;
      default:
        console.log(...logArgs);
    }
  }

  private getPrefix(level: LogLevel): string {
    switch (level) {
      case 'info':
        return 'ℹ️ ';
      case 'success':
        return '✅';
      case 'warn':
        return '⚠️ ';
      case 'error':
        return '❌';
      case 'debug':
        return '🔍';
      default:
        return '';
    }
  }

  info(message: string, data?: unknown): void {
    this.log('info', message, data);
  }

  success(message: string, data?: unknown): void {
    this.log('success', message, data);
  }

  warn(message: string, data?: unknown): void {
    this.log('warn', message, data);
  }

  error(message: string, data?: unknown): void {
    this.log('error', message, data);
  }

  debug(message: string, data?: unknown): void {
    this.log('debug', message, data);
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }

  printSummary(stats: { total: number; success: number; failed: number }): void {
    console.log(`\n${  '='.repeat(50)}`);
    console.log('📊 DEPLOYMENT SCRIPT SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total scripts: ${stats.total}`);
    console.log(`Successful: ${stats.success}`);
    console.log(`Failed: ${stats.failed}`);
    console.log('='.repeat(50));

    if (stats.failed > 0) {
      console.log('⚠️  Some scripts failed. Check logs above for details.');
    } else if (stats.total > 0) {
      console.log('🎉 All scripts completed successfully!');
    } else {
      console.log('ℹ️  No scripts were executed.');
    }
  }
}

export const logger = new DeploymentLogger();
