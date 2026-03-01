import { Component } from 'react';

export class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('App error:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f172a',
          color: '#e2e8f0',
          fontFamily: 'system-ui',
          padding: 24,
          textAlign: 'center',
        }}>
          <div>
            <h1 style={{ fontSize: 20, marginBottom: 12 }}>Something went wrong</h1>
            <p style={{ color: '#94a3b8', marginBottom: 16 }}>{this.state.error?.message}</p>
            <p style={{ fontSize: 14, color: '#64748b' }}>
              Check the browser console (F12) and ensure the backend is running and Firebase env vars are set in <code style={{ background: '#1e293b', padding: '2px 6px', borderRadius: 4 }}>teamcollab/.env</code>.
            </p>
            <button
              onClick={() => window.location.href = '/'}
              style={{
                padding: '8px 16px',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
              }}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
