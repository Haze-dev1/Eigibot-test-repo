import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { FocusProvider } from './state/focus.jsx'
import './styles/tokens.css'
import './styles/app.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <FocusProvider>
        <App />
      </FocusProvider>
    </BrowserRouter>
  </React.StrictMode>
)
