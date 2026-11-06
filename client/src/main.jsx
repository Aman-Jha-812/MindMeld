import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster position="top-right" toastOptions={{
        duration: 4000,
        style: { background: '#FFFFFF', color: '#1C2321', border: '1px solid #E2DDD2', borderRadius: '8px' },
      }} />
    </BrowserRouter>
  </React.StrictMode>
);
