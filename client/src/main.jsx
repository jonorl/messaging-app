import { StrictMode } from 'react'
import './index.css'
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import MessagingApp from "./App"; // or your main App component

ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <MessagingApp />
    </BrowserRouter>
  </StrictMode>
);