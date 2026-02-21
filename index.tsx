import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ToastProvider } from './components/shared/ToastProvider';
import { TransactionProvider } from './contexts/TransactionContext';
import { ErrorBoundary } from './components/ErrorBoundary';
// @ts-ignore
import { registerSW } from 'virtual:pwa-register';

// Dev Tools: Expose MOM Portfolio import functions to browser console (DEV only)
import { seedMomPortfolio, clearMomPortfolio, getMomPortfolioSummary } from './utils/seedMomPortfolio';

// FIX #21: Only expose portfolio utilities in development
if (import.meta.env.DEV) {
  (window as any).momPortfolio = {
    seed: seedMomPortfolio,
    clear: clearMomPortfolio,
    summary: getMomPortfolioSummary,
    help: () => console.log(`
      🏠 MOM Portfolio Import Functions
      ─────────────────────────────────
      window.momPortfolio.seed()    → Import Zerodha holdings for MOM
      window.momPortfolio.clear()   → Remove all MOM assets
      window.momPortfolio.summary() → View MOM portfolio summary
    `)
  };
}

// Register PWA Service Worker
const updateSW = registerSW({
  onNeedRefresh() {
    console.log('New content available, click on reload button to update.');
  },
  onOfflineReady() {
    console.log('App is ready to work offline.');
  },
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// CRITICAL: Clear lock on boot just in case it got stuck from a failed restore
try {
  sessionStorage.removeItem('IS_RESTORING');
} catch (e) {
  console.warn("Could not clear session storage");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <TransactionProvider>
          <App />
        </TransactionProvider>
      </ToastProvider>
    </ErrorBoundary>
  </React.StrictMode>
);