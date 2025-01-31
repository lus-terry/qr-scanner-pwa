import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';


import { registerSW } from 'virtual:pwa-register';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);


const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm("Nova verzija aplikacije je dostupna. Želite li osvježiti?")) {
      updateSW(true); 
    }
  },
  onOfflineReady() {
    console.log("Aplikacija je spremna za offline rad.");
  }
});
