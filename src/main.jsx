import React from "react";
import ReactDOM from "react-dom/client";
import KakinadaCCC from "./kakinada1.jsx";
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element with id 'root' not found in index.html");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <KakinadaCCC />
  </React.StrictMode>
);

