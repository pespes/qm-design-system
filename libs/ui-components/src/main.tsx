import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// JUST TO HAVE SOMETHING UP TO SEE STYLING
const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
