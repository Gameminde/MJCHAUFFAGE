/**
 * Frontend Logger Service
 * Centralized logging for frontend with support for sending logs to backend
 * Replaces all console.log statements
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: any;
  userAgent?: string;
  url?: string;
}

class FrontendLogger {
  private isDevelopment: boolean;
  private logsQueue: LogEntry[] = [];
  private maxQueueSize: number = 50;
  private sendLogsToBackend: boolean = false;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.sendLogsToBackend = process.env.NEXT_PUBLIC_ENABLE_REMOTE_LOGGING === 'true';
  }

  /**
   * Format log message with timestamp and context
   */
  private formatMessage(level: LogLevel, message: string, context?: any): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    };
  }

  /**
   * Send logs to backend (batch)
   */
  private async sendLogs() {
    if (!this.sendLogsToBackend || this.logsQueue.length === 0) {
      return;
    }

    try {
      const logs = [...this.logsQueue];
      this.logsQueue = [];

      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs }),
      });
    } catch (error) {
      // Silently fail to avoid infinite loop
      if (this.isDevelopment) {
        console.error('Failed to send logs to backend:', error);
      }
    }
  }

  /**
   * Add log to queue and send if needed
   */
  private async queueLog(entry: LogEntry) {
    if (!this.sendLogsToBackend) {
      return;
    }

    this.logsQueue.push(entry);

    if (this.logsQueue.length >= this.maxQueueSize) {
      await this.sendLogs();
    }
  }

  /**
   * Debug level logging (development only)
   */
  debug(message: string, context?: any) {
    const entry = this.formatMessage('debug', message, context);

    if (this.isDevelopment) {
      console.log(`[DEBUG] ${message}`, context || '');
    }

    this.queueLog(entry);
  }

  /**
   * Info level logging
   */
  info(message: string, context?: any) {
    const entry = this.formatMessage('info', message, context);

    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, context || '');
    }

    this.queueLog(entry);
  }

  /**
   * Warning level logging
   */
  warn(message: string, context?: any) {
    const entry = this.formatMessage('warn', message, context);

    console.warn(`[WARN] ${message}`, context || '');
    this.queueLog(entry);
  }

  /**
   * Error level logging
   */
  error(message: string, error?: Error | any, context?: any) {
    const entry = this.formatMessage('error', message, {
      error: error instanceof Error
        ? {
            message: error.message,
            stack: error.stack,
            name: error.name,
          }
        : error,
      ...context,
    });

    console.error(`[ERROR] ${message}`, error, context || '');
    this.queueLog(entry);
  }

  /**
   * Success logging
   */
  success(message: string, context?: any) {
    const entry = this.formatMessage('info', `✓ ${message}`, { success: true, ...context });

    if (this.isDevelopment) {
      console.log(`[SUCCESS] ✓ ${message}`, context || '');
    }

    this.queueLog(entry);
  }

  /**
   * API call logging
   */
  api(method: string, url: string, status: number, duration: number, context?: any) {
    const message = `${method} ${url} - ${status} (${duration}ms)`;
    const entry = this.formatMessage('info', message, {
      api: { method, url, status, duration },
      ...context,
    });

    if (this.isDevelopment) {
      const color = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'log';
      console[color](`[API] ${message}`);
    }

    this.queueLog(entry);
  }

  /**
   * User action logging
   */
  action(actionName: string, context?: any) {
    const entry = this.formatMessage('info', `User action: ${actionName}`, {
      action: actionName,
      ...context,
    });

    if (this.isDevelopment) {
      console.log(`[ACTION] ${actionName}`, context || '');
    }

    this.queueLog(entry);
  }

  /**
   * Performance logging
   */
  performance(operation: string, duration: number, context?: any) {
    const message = `${operation} took ${duration}ms`;
    const entry = this.formatMessage('info', message, {
      performance: { operation, duration },
      ...context,
    });

    if (this.isDevelopment) {
      console.log(`[PERF] ${message}`, context || '');
    }

    this.queueLog(entry);
  }

  /**
   * Navigation logging
   */
  navigation(from: string, to: string, context?: any) {
    const message = `Navigation: ${from} → ${to}`;
    const entry = this.formatMessage('info', message, {
      navigation: { from, to },
      ...context,
    });

    if (this.isDevelopment) {
      console.log(`[NAV] ${message}`);
    }

    this.queueLog(entry);
  }

  /**
   * Component lifecycle logging
   */
  component(componentName: string, lifecycle: 'mount' | 'unmount' | 'update', context?: any) {
    const message = `${componentName} ${lifecycle}`;
    const entry = this.formatMessage('debug', message, {
      component: { name: componentName, lifecycle },
      ...context,
    });

    if (this.isDevelopment) {
      console.log(`[COMPONENT] ${message}`, context || '');
    }

    // Don't send component logs to backend (too verbose)
  }

  /**
   * Form validation logging
   */
  validation(formName: string, errors: any) {
    const message = `Validation errors in ${formName}`;
    const entry = this.formatMessage('warn', message, { form: formName, errors });

    if (this.isDevelopment) {
      console.warn(`[VALIDATION] ${message}`, errors);
    }

    this.queueLog(entry);
  }

  /**
   * Flush logs queue immediately
   */
  async flush() {
    await this.sendLogs();
  }
}

// Create singleton instance
const logger = new FrontendLogger();

// Flush logs before page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    logger.flush();
  });
}

// Export logger instance
export const log = logger;
export default log;

