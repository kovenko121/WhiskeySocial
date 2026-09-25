import React, { Component, ErrorInfo } from 'react';
import { createLogger } from '../utils/logger';

/**
 * Error boundaries must be class components because React only supports
 * catching rendering errors via the getDerivedStateFromError and componentDidCatch
 * lifecycle methods, which have no hook equivalents.
 * @see https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
 */

const logger = createLogger('ErrorBoundary');

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Error Boundary component that catches React errors and reports them to Sentry
 *
 * @example
 * ```tsx
 * <ErrorBoundary fallback={<div>Something went wrong</div>}>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to console and Sentry (logger.error sends to Sentry automatically)
    logger.error('React component error caught by boundary', error, {
      extra: {
        componentStack: errorInfo.componentStack,
        errorMessage: error.message,
        errorStack: error.stack,
      },
    });
  }

  render(): JSX.Element {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback as JSX.Element;
      }

      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            padding: '20px',
            textAlign: 'center',
          }}
        >
          <h2 style={{ marginBottom: '16px', fontSize: '24px', fontWeight: '600' }}>
            Something went wrong
          </h2>
          <p style={{ marginBottom: '24px', color: '#666' }}>
            We've been notified and are working to fix the issue.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#1890ff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children as JSX.Element;
  }
}
