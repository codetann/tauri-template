import "@/styles/index.css";
import ReactDOM from "react-dom/client";
import App from "./App";
import { StyleProvider } from "@/styles/providers";
import { BrowserRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <BrowserRouter>
    <StyleProvider>
      <App />
    </StyleProvider>
  </BrowserRouter>
);
