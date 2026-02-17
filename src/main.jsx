import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import { ToastProvider } from './components/common/Toast'
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

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<Suspense fallback={<PageLoader />}><JsonPreviewPage /></Suspense>} />
            <Route path="compare" element={<Suspense fallback={<PageLoader />}><JsonComparePage /></Suspense>} />
            <Route path="generate" element={<Suspense fallback={<PageLoader />}><GeneratePage /></Suspense>} />
            <Route path="encode" element={<Suspense fallback={<PageLoader />}><EncodePage /></Suspense>} />
            <Route path="hash" element={<Suspense fallback={<PageLoader />}><HashPage /></Suspense>} />
            <Route path="convert" element={<Suspense fallback={<PageLoader />}><ConvertPage /></Suspense>} />
            <Route path="text" element={<Suspense fallback={<PageLoader />}><TextToolsPage /></Suspense>} />
            <Route path="format" element={<Suspense fallback={<PageLoader />}><FormatterPage /></Suspense>} />
            <Route path="privacy" element={<Suspense fallback={<PageLoader />}><PrivacyPolicyPage /></Suspense>} />
            <Route path="terms" element={<Suspense fallback={<PageLoader />}><TermsOfUsePage /></Suspense>} />
            <Route path="contact" element={<Suspense fallback={<PageLoader />}><ContactPage /></Suspense>} />
            <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFoundPage /></Suspense>} />
          </Route>
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
