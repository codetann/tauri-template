import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import { Button, Layout, NavBar } from "@/components";
import { useTheme } from "@heroui/use-theme";
import { Select, Slider, Switch } from "@heroui/react";

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
      <Switch
        isSelected={theme === "dark"}
        onValueChange={(value) => setTheme(value ? "dark" : "light")}
      />
    </Layout>
  );
}

export default App;
