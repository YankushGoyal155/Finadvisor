import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: '#0A0E1A',
          color: '#F0F4FF',
          fontFamily: "'Outfit', 'Inter', sans-serif",
          padding: '32px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>⚠️</div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '12px' }}>
            Something went wrong
          </h1>
          <p style={{ color: '#8B9BBF', fontSize: '15px', maxWidth: '500px', lineHeight: 1.6, marginBottom: '24px' }}>
            The application encountered an unexpected error. Your data is safe — just refresh the page to continue.
          </p>
          <div style={{
            padding: '14px 20px',
            background: 'rgba(255, 107, 0, 0.1)',
            border: '1px solid rgba(255, 107, 0, 0.3)',
            borderRadius: '12px',
            color: '#FF8C38',
            fontSize: '12px',
            fontFamily: 'monospace',
            maxWidth: '600px',
            wordBreak: 'break-word',
            marginBottom: '24px',
          }}>
            {this.state.error?.message || 'Unknown error'}
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: 'linear-gradient(135deg, #FF6B00, #FF8C38)',
              color: 'white',
              border: 'none',
              padding: '14px 32px',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(255, 107, 0, 0.3)',
              transition: 'transform 0.2s ease',
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            🔄 Refresh App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
