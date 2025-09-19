import "@/styles/index.css";
import ReactDOM from "react-dom/client";
import App from "./App";
import { StyleProvider } from "@/styles/providers";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { BrowserRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <BrowserRouter>
    <StyleProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </StyleProvider>
  </BrowserRouter>
);
