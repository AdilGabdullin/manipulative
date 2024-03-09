import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App";

function main() {
  ReactDOM.createRoot(document.getElementById("manipulative-canvas-root")).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

window.runManipulative = main;
