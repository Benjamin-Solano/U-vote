import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.jsx";
import "../src/styles/theme.css";

import { AuthProvider } from "./auth/AuthProvider.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";


// Estadisticas de Vercel
import { Analytics } from "@vercel/analytics/react"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Analytics />
          <App />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
