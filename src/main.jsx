import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import { ToastProvider } from './components/common/Toast'
import ErrorBoundary from './components/common/ErrorBoundary'
import '@stingr/json-viewer/styles'
import './styles/global.css'

// Lazy-load pages for code splitting
const pageImports = {
  JsonPreviewPage: () => import('./pages/JsonPreviewPage'),
  JsonComparePage: () => import('./pages/JsonComparePage'),
  GeneratePage: () => import('./pages/GeneratePage'),
  EncodePage: () => import('./pages/EncodePage'),
  HashPage: () => import('./pages/HashPage'),
  ConvertPage: () => import('./pages/ConvertPage'),
  TextToolsPage: () => import('./pages/TextToolsPage'),
  FormatterPage: () => import('./pages/FormatterPage'),
  NotFoundPage: () => import('./pages/NotFoundPage'),
  PrivacyPolicyPage: () => import('./pages/PrivacyPolicyPage'),
  TermsOfUsePage: () => import('./pages/TermsOfUsePage'),
  ContactPage: () => import('./pages/ContactPage'),
  ToolPage: () => import('./pages/ToolPage'),
  ToolsIndexPage: () => import('./pages/ToolsIndexPage'),
}

const JsonPreviewPage = lazy(pageImports.JsonPreviewPage)
const JsonComparePage = lazy(pageImports.JsonComparePage)
const GeneratePage = lazy(pageImports.GeneratePage)
const EncodePage = lazy(pageImports.EncodePage)
const HashPage = lazy(pageImports.HashPage)
const ConvertPage = lazy(pageImports.ConvertPage)
const TextToolsPage = lazy(pageImports.TextToolsPage)
const FormatterPage = lazy(pageImports.FormatterPage)
const NotFoundPage = lazy(pageImports.NotFoundPage)
const PrivacyPolicyPage = lazy(pageImports.PrivacyPolicyPage)
const TermsOfUsePage = lazy(pageImports.TermsOfUsePage)
const ContactPage = lazy(pageImports.ContactPage)
const ToolPage = lazy(pageImports.ToolPage)
const ToolsIndexPage = lazy(pageImports.ToolsIndexPage)

// Prefetch all page chunks once the app is idle
if (typeof requestIdleCallback === 'function') {
  requestIdleCallback(() => {
    Object.values(pageImports).forEach(fn => fn())
  })
} else {
  setTimeout(() => {
    Object.values(pageImports).forEach(fn => fn())
  }, 2000)
}

// Register service worker for offline support & PWA install
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
  })
}

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
            <Route path="tools" element={<PageRoute component={ToolsIndexPage} />} />
            <Route path="tools/:slug" element={<PageRoute component={ToolPage} />} />
            <Route path="*" element={<PageRoute component={NotFoundPage} />} />
          </Route>
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
