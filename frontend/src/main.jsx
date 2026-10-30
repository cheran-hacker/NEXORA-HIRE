import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./styles/globals.css";
import "./styles/glassmorphism.css";
import "./styles/theme.css";
import "./styles/dashboard.css";
import "./shared/components/modal.css";

const loader = document.getElementById("initial-loader");
if (loader) {
  loader.style.opacity = "0";
  setTimeout(() => loader.remove(), 500);
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
