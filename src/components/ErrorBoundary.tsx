import { Component, ReactNode, ErrorInfo } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: '#1a1a1a',
          color: 'white',
          fontFamily: 'monospace',
          padding: '20px'
        }}>
          <div style={{
            maxWidth: '600px',
            background: '#2a2a2a',
            padding: '30px',
            borderRadius: '12px',
            border: '2px solid #ff4444'
          }}>
            <h1 style={{ color: '#ff4444', marginBottom: '20px' }}>⚠️ Error Detected</h1>
            <p style={{ marginBottom: '15px' }}>Something went wrong:</p>
            <pre style={{
              background: '#1a1a1a',
              padding: '15px',
              borderRadius: '8px',
              overflow: 'auto',
              fontSize: '12px',
              color: '#ff6666'
            }}>
              {this.state.error?.message || 'Unknown error'}
            </pre>
            <pre style={{
              background: '#1a1a1a',
              padding: '15px',
              borderRadius: '8px',
              overflow: 'auto',
              fontSize: '10px',
              marginTop: '10px',
              maxHeight: '200px',
              color: '#999'
            }}>
              {this.state.error?.stack}
            </pre>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                background: '#4444ff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

