import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';


// Import your global stylesheets to apply them to the entire app
//import './style/theme.css';
//import './style/main.css';

// Find the root HTML element where the app will be mounted
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the main App component
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
