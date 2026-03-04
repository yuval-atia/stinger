import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import { ToastProvider } from './components/common/Toast'
import ErrorBoundary from './components/common/ErrorBoundary'
import '@stingr/json-viewer/styles'
import './styles/global.css'

// Lazy-load pages for code splitting
const JsonPreviewPage = lazy(() => import('./pages/JsonPreviewPage'))
const JsonComparePage = lazy(() => import('./pages/JsonComparePage'))
const GeneratePage = lazy(() => import('./pages/GeneratePage'))
const EncodePage = lazy(() => import('./pages/EncodePage'))
const HashPage = lazy(() => import('./pages/HashPage'))
const ConvertPage = lazy(() => import('./pages/ConvertPage'))
const TextToolsPage = lazy(() => import('./pages/TextToolsPage'))
const FormatterPage = lazy(() => import('./pages/FormatterPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'))
const TermsOfUsePage = lazy(() => import('./pages/TermsOfUsePage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="w-5 h-5 border-2 border-[var(--accent-color)] border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function PageRoute({ component: Component }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Component />
      </Suspense>
    </ErrorBoundary>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<PageRoute component={JsonPreviewPage} />} />
            <Route path="compare" element={<PageRoute component={JsonComparePage} />} />
            <Route path="generate" element={<PageRoute component={GeneratePage} />} />
            <Route path="encode" element={<PageRoute component={EncodePage} />} />
            <Route path="hash" element={<PageRoute component={HashPage} />} />
            <Route path="convert" element={<PageRoute component={ConvertPage} />} />
            <Route path="text" element={<PageRoute component={TextToolsPage} />} />
            <Route path="format" element={<PageRoute component={FormatterPage} />} />
            <Route path="privacy" element={<PageRoute component={PrivacyPolicyPage} />} />
            <Route path="terms" element={<PageRoute component={TermsOfUsePage} />} />
            <Route path="contact" element={<PageRoute component={ContactPage} />} />
            <Route path="*" element={<PageRoute component={NotFoundPage} />} />
          </Route>
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
