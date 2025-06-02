// src/index.js
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import App from './App.jsx'
import './index.css'; // Your Tailwind CSS styles
import 'antd/dist/reset.css'; // Ant Design styles (for v5 and above)
import { Provider } from 'react-redux';
import { store } from './app/store'; // Your Redux store
import { initializeAuth } from './features/authSlice.js'; // Action to initialize auth state
import React from 'react'; // Required for JSX

// Initialize auth state from local storage on app load
// This ensures that if the user refreshes, their session is restored.
store.dispatch(initializeAuth());

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
);