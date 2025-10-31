
import React from 'react';
import ReactDOM from 'react-dom/client';
// Fix: Corrected import path for App component
import App from './App';
import { CombinedProvider } from './contexts/CombinedContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <CombinedProvider>
      <App />
    </CombinedProvider>
  </React.StrictMode>
);