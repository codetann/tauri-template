import { useState } from "react";
import { ToolsMenu } from "./components/ToolsMenu";
import { InpaintingTool } from "./components/InpaintingTool";
import { FloatingPromptInput } from "./components/FloatingPromptInput";

export type ToolType =
  | "inpainting"
  | "outpainting"
  | "upscaling"
  | "style-transfer"
  | "background-removal";

export default function ToolsPage() {
  const [activeTool, setActiveTool] = useState<ToolType>("inpainting");
  const [prompt, setPrompt] = useState("");
  const [showInpaintSettings, setShowInpaintSettings] = useState(false);

  const handleToolSelect = (tool: ToolType) => {
    setActiveTool(tool);
  };

  const handlePromptSubmit = (newPrompt: string) => {
    setPrompt(newPrompt);
    // Handle prompt submission logic here
    console.log("Prompt submitted:", newPrompt);
  };

  const renderActiveTool = () => {
    switch (activeTool) {
      case "inpainting":
        return <InpaintingTool prompt={prompt} />;
      case "outpainting":
        return (
          <div className="flex items-center justify-center h-full text-default-500">
            Outpainting tool coming soon...
          </div>
        );
      case "upscaling":
        return (
          <div className="flex items-center justify-center h-full text-default-500">
            Upscaling tool coming soon...
          </div>
        );
      case "style-transfer":
        return (
          <div className="flex items-center justify-center h-full text-default-500">
            Style transfer tool coming soon...
          </div>
        );
      default:
        return <InpaintingTool prompt={prompt} />;
    }
  };

  return (
    <div className="w-full h-full flex relative">
      {/* Tools Menu */}
      <ToolsMenu activeTool={activeTool} onToolSelect={handleToolSelect} />

      {/* Main Tool Area */}
      <div className="flex-1 relative">
        {renderActiveTool()}

        {/* Floating Prompt Input */}
        <FloatingPromptInput
          prompt={prompt}
          onPromptSubmit={handlePromptSubmit}
          showInpaintSettings={showInpaintSettings}
          onToggleInpaintSettings={() =>
            setShowInpaintSettings(!showInpaintSettings)
          }
        />
      </div>
    </div>
  );
}
