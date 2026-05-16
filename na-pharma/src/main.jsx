import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './styles/index.css'
import AppRouter from './routes/index.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { CartProvider }  from './context/CartContext.jsx'
import ErrorBoundary from './components/ui/ErrorBoundary.jsx'
import ScrollToTop from './components/routing/ScrollToTop.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      {/* Global error boundary — catches render errors in the entire tree */}
      <ErrorBoundary>
        {/* Auth context — provides user state to all components */}
        <AuthProvider>
          <CartProvider>
          {/* Scroll to top on every route change */}
          <ScrollToTop />

          {/* Main application router */}
          <AppRouter />

          {/* Global toast notifications */}
          <Toaster
            position="top-right"
            gutter={8}
            containerStyle={{ top: 80 }} /* offset below the fixed navbar */
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: '12px',
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: '14px',
                fontWeight: '500',
                maxWidth: '380px',
                boxShadow: '0 4px 25px -5px rgba(0,0,0,0.10), 0 10px 30px -5px rgba(0,0,0,0.05)',
              },
            }}
          />
        </CartProvider>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  </StrictMode>,
)
