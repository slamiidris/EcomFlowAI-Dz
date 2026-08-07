import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import './index.css';
import { ToastProvider } from './context/ToastContext';
import { LanguageProvider } from './context/LanguageContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </ToastProvider>
  </StrictMode>,
);
