import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import './AuthError.css';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // You can also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="auth-error-container">
          <div className="auth-error-card">
            {/* Header */}
            <div className="auth-error-header" style={{ background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' }}>
              <div className="auth-error-icon">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <h1 className="text-xl font-semibold mb-2">
                Terjadi Kesalahan
              </h1>
              <p className="text-red-100 text-sm">
                Mohon maaf, terjadi kesalahan dalam aplikasi. Silakan coba lagi.
              </p>
            </div>

            {/* Content */}
            <div className="auth-error-content">
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-gray-800 mb-2 text-sm">Error Details (Development):</h3>
                  <p className="text-xs text-gray-600 font-mono break-all bg-white p-2 rounded border">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="action-buttons">
                <button
                  onClick={() => window.location.reload()}
                  className="btn btn-danger"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Muat Ulang Halaman
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="btn btn-secondary"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Kembali ke Beranda
                </button>
              </div>

              {/* Help Section */}
              <div className="help-section">
                <p>
                  Jika masalah berlanjut, silakan hubungi administrator.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
