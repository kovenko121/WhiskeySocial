import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { contactSupport } from '../../helpers/contactSupport';
import { createLogger } from '../../services/logger';

const logger = createLogger('ErrorBoundary');

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    logger.error('Unhandled render error', error, {
      extra: { componentStack: info.componentStack ?? '' },
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    const { hasError } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      if (fallback) return fallback;

      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.subtitle}>An unexpected error occurred. Please try again.</Text>
          <TouchableOpacity style={styles.button} onPress={this.handleRetry}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.supportButton}
            onPress={() => contactSupport('error_boundary')}
          >
            <Text style={styles.supportButtonText}>Contact support</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#192333',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#A69E6D',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  supportButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  supportButtonText: {
    color: '#A69E6D',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
});

export { ErrorBoundary };
