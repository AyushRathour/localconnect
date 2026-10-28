import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

declare global {
  interface Window {
    __LOCALCONNECT_MOUNTED__?: boolean;
  }
}

try {
  const container = document.getElementById('root');
  if (container) {
    const root = createRoot(container);
    root.render(<App />);
    window.__LOCALCONNECT_MOUNTED__ = true;
  }
} catch (err: any) {
  console.error('Fatal initialization error in main.tsx:', err);
  const container = document.getElementById('root');
  if (container) {
    container.innerHTML = `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background-color: #F7F9FC; font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 24px;">
        <div style="background: white; border: 1px solid #E2E8F0; border-radius: 16px; padding: 32px; max-width: 440px; width: 100%; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
          <div style="width: 48px; height: 48px; border-radius: 12px; background: #FEE2E2; color: #DC2626; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; font-size: 24px; margin-bottom: 16px;">
            ⚠️
          </div>
          <h2 style="font-size: 20px; font-weight: 700; color: #16324F; margin: 0 0 8px 0;">Initialization Notice</h2>
          <p style="font-size: 13px; color: #64748B; margin: 0 0 16px 0;">LocalConnect encountered an error while starting:</p>
          <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 12px; color: #DC2626; text-align: left; overflow-x: auto; margin-bottom: 20px;">
            ${(err && (err.message || String(err))) || 'Unknown startup error'}
          </div>
          <div style="display: flex; gap: 8px;">
            <button onclick="window.location.reload()" style="flex: 1; padding: 10px 16px; background: #16324F; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
              Reload Page
            </button>
            <button onclick="localStorage.clear(); window.location.reload()" style="flex: 1; padding: 10px 16px; background: #E2E8F0; color: #1E293B; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
              Reset Cache
            </button>
          </div>
        </div>
      </div>
    `;
  }
}

