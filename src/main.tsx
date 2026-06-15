import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";

import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";

import "bootstrap/dist/css/bootstrap.min.css";
import "./theme.css";

ReactDOM
.createRoot(
 document.getElementById(
  "root"
 )!
)
.render(

 <React.StrictMode>

   <AuthProvider>
     <ThemeProvider>
        <App />
     </ThemeProvider>
   </AuthProvider>

 </React.StrictMode>

);
