/* Inicializa a interface React dentro do elemento root definido no index.html. */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// StrictMode ajuda a detectar problemas em desenvolvimento; não é uma segunda tela.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
