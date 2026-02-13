import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import JsonPreviewPage from './pages/JsonPreviewPage'
import JsonComparePage from './pages/JsonComparePage'
import GeneratePage from './pages/GeneratePage'
import EncodePage from './pages/EncodePage'
import HashPage from './pages/HashPage'
import ConvertPage from './pages/ConvertPage'
import TextDiffPage from './pages/TextDiffPage'
import FormatterPage from './pages/FormatterPage'
import NotFoundPage from './pages/NotFoundPage'
import { ToastProvider } from './components/common/Toast'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<JsonPreviewPage />} />
            <Route path="compare" element={<JsonComparePage />} />
            <Route path="generate" element={<GeneratePage />} />
            <Route path="encode" element={<EncodePage />} />
            <Route path="hash" element={<HashPage />} />
            <Route path="convert" element={<ConvertPage />} />
            <Route path="diff" element={<TextDiffPage />} />
            <Route path="format" element={<FormatterPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </ToastProvider>
    </HashRouter>
  </React.StrictMode>,
)
