import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

if (window.location.hash.startsWith('#/')) {
  const targetPath = window.location.hash.replace(/^#/, '');
  window.history.replaceState(null, '', targetPath);
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
