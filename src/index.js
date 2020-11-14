import React from "react";
import ReactDOM from "react-dom";

import Chat from "./Chat";

const rootElement = document.getElementById("root");
ReactDOM.render(
  <React.StrictMode>
    <Chat />
  </React.StrictMode>,
  rootElement
);
