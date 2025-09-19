import { motion } from "framer-motion";
import {
  BiPaint,
  BiExpand,
  BiZoomIn,
  BiPalette,
  BiPlus,
  BiImage,
  BiDownload,
  BiUpload,
} from "react-icons/bi";
import { ToolType } from "../ToolsPage";

interface ToolsMenuProps {
  activeTool: ToolType;
  onToolSelect: (tool: ToolType) => void;
}

const tools = [
  {
    id: "inpainting" as ToolType,
    name: "Inpainting",
    icon: BiPaint,
    shortcut: "I",
    description: "Edit and fill parts of images",
  },
  {
    id: "outpainting" as ToolType,
    name: "Outpainting",
    icon: BiExpand,
    shortcut: "O",
    description: "Extend image boundaries",
  },
  {
    id: "upscaling" as ToolType,
    name: "Upscaling",
    icon: BiZoomIn,
    shortcut: "U",
    description: "Increase image resolution",
  },
  {
    id: "style-transfer" as ToolType,
    name: "Style Transfer",
    icon: BiPalette,
    shortcut: "S",
    description: "Apply artistic styles",
  },
  {
    id: "background-removal" as ToolType,
    name: "Background Removal",
    icon: BiImage,
    shortcut: "B",
    description: "Remove background from images",
  },
];

export function ToolsMenu({ activeTool, onToolSelect }: ToolsMenuProps) {
  return (
    <div className="w-64 bg-default-50 border-r border-default-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-default-200">
        <h2 className="text-lg font-semibold text-default-900">Tools</h2>
        <p className="text-sm text-default-500">Select a tool to get started</p>
      </div>

      {/* Tools List */}
      <div className="flex-1 p-2 space-y-1">
        {tools.map((tool, index) => (
          <motion.button
            key={tool.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            onClick={() => onToolSelect(tool.id)}
            className={`w-full p-3 rounded-lg text-left transition-all duration-200 group ${
              activeTool === tool.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "hover:bg-default-100 text-default-700"
            }`}
          >
            <div className="flex items-center gap-3">
              <tool.icon
                className={`text-lg ${
                  activeTool === tool.id
                    ? "text-primary-foreground"
                    : "text-default-500"
                }`}
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{tool.name}</span>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      activeTool === tool.id
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-default-200 text-default-500"
                    }`}
                  >
                    {tool.shortcut}
                  </span>
                </div>
                <p
                  className={`text-xs mt-1 ${
                    activeTool === tool.id
                      ? "text-primary-foreground/80"
                      : "text-default-400"
                  }`}
                >
                  {tool.description}
                </p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-t border-default-200">
        <div className="space-y-2">
          <button className="w-full p-2 rounded-lg bg-default-100 hover:bg-default-200 transition-colors flex items-center gap-2 text-sm text-default-700">
            <BiUpload className="text-lg" />
            Upload Image
          </button>
          <button className="w-full p-2 rounded-lg bg-default-100 hover:bg-default-200 transition-colors flex items-center gap-2 text-sm text-default-700">
            <BiDownload className="text-lg" />
            Export Result
          </button>
        </div>
      </div>
    </div>
  );
}
