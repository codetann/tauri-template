import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import { Button, Layout, NavBar } from "@/components";
import { useTheme } from "@heroui/use-theme";
import { Select, Slider, Switch } from "@heroui/react";
import { Route, Routes } from "react-router-dom";
import { TextPage } from "./pages/text-page";
import { AudioPage } from "./pages";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState("");

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <Layout>
      <Routes>
        <Route path="/text" element={<TextPage />} />
        <Route path="/audio" element={<AudioPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
