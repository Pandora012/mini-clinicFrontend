import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import Sidebar from "./components/layout/Sidebar.jsx";
import "bootstrap/dist/css/bootstrap.min.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
