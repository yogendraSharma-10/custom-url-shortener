import React from 'react';
import { createRoot } from 'react-dom/client'; // Recommended for React 18+
import App from './App';
import './styles/main.css'; // Global styles for the application

/**
 * The main entry point for the React client-side application.
 * This file is responsible for rendering the root App component into the DOM.
 */

// Get the root DOM element where the React application will be mounted.
// This element is typically defined in public/index.html with an id of 'root'.
const container = document.getElementById('root');

// Create a root for the React application using createRoot from react-dom/client.
// This is the recommended way to render applications in React 18 and beyond,
// offering better performance and new concurrent features.
const root = createRoot(container);

// Render the main App component inside a React.StrictMode wrapper.
// StrictMode is a tool for highlighting potential problems in an application.
// It activates additional checks and warnings for its descendants.
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// You can add a service worker registration here for PWA capabilities if needed.
// For example:
// import * as serviceWorkerRegistration from './serviceWorkerRegistration';
// serviceWorkerRegistration.register();

// If you ever want to measure performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// import reportWebVitals from './reportWebVitals';
// reportWebVitals();