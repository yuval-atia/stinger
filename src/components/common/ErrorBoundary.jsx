import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback({ error: this.state.error, reset: this.handleReset });
      }

      return (
        <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
          <div className="text-4xl">⚠</div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Something went wrong</h2>
          <p className="text-sm text-[var(--text-secondary)] max-w-md">
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={this.handleReset}
              className="px-4 py-2 text-sm rounded bg-[var(--accent-color)] text-white hover:opacity-90 transition-opacity"
            >
              Try Again
            </button>
            <a
              href="/"
              className="px-4 py-2 text-sm rounded border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Go Home
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
