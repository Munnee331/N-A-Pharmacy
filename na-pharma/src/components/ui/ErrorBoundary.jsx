import { Component } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

/**
 * React Error Boundary.
 * Catches render errors in the component tree and shows a friendly fallback UI.
 * In development, shows the error details. In production, shows a clean message.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })
    // In production, send to error tracking service (e.g. Sentry):
    // Sentry.captureException(error, { extra: errorInfo })
    console.error('[ErrorBoundary]', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (!this.state.hasError) return this.props.children

    const isDev = import.meta.env.DEV

    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white rounded-2xl border border-red-100 shadow-soft p-8 text-center">
          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5">
            <AlertTriangle size={26} className="text-red-500" />
          </div>

          <h2 className="text-xl font-bold text-neutral-900 mb-2">Something went wrong</h2>
          <p className="text-neutral-500 text-sm mb-6 leading-relaxed">
            An unexpected error occurred. You can try refreshing the page or go back to the home page.
          </p>

          {/* Dev-only error details */}
          {isDev && this.state.error && (
            <details className="text-left mb-6 bg-neutral-50 rounded-xl p-4 border border-neutral-200">
              <summary className="text-xs font-semibold text-red-600 cursor-pointer mb-2">
                Error details (development only)
              </summary>
              <pre className="text-[11px] text-neutral-700 overflow-auto whitespace-pre-wrap break-words">
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl
                         bg-primary-600 text-white text-sm font-semibold
                         hover:bg-primary-700 transition-colors
                         focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <RefreshCw size={15} />
              Try Again
            </button>
            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl
                         border border-neutral-200 text-neutral-700 text-sm font-semibold
                         hover:bg-neutral-50 transition-colors
                         focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <Home size={15} />
              Go Home
            </a>
          </div>
        </div>
      </div>
    )
  }
}
