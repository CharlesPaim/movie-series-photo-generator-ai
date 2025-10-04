
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
// O StrictMode foi removido para aumentar a estabilidade do ciclo de vida em ambientes de sandbox,
// o que pode ajudar a resolver o erro "invalid state".
root.render(
  <App />
);