import { StrictMode } from 'react'
import './index.css'
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import router from './Routes.jsx';

ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
      <RouterProvider  router={router} />
  </StrictMode>
);