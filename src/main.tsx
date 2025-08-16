import "@/styles/index.css";
import ReactDOM from "react-dom/client";
import App from "./App";
import { StyleProvider } from "@/styles/providers";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <StyleProvider>
    <App />
  </StyleProvider>
);
