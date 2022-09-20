import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import UI from './View';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <UI />
  </React.StrictMode>
);