import React from 'react';
import { createRoot } from 'react-dom/client';
import { ChatBot } from './components/ChatBot';
import './index.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <ChatBot />
    </React.StrictMode>
  );
}
