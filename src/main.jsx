import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App";

function main(onSave, initialState) {
  ReactDOM.createRoot(document.getElementById("manipulative-canvas-root")).render(
    <React.StrictMode>
      <App onSave={onSave} initialState={initialState}/>
    </React.StrictMode>
  );
}

window.runManipulative = main;
