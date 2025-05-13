import React from 'react';
import ReactDOM from 'react-dom/client';
import Home from './pages/index.jsx';
import './global.css'; // Estilos básicos

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Home />
  </React.StrictMode>
);
