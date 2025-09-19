import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@heroui/use-theme";
import {
  BiImage,
  BiUndo,
  BiRedo,
  BiZoomIn,
  BiZoomOut,
  BiMove,
  BiEraser,
  BiPaint,
  BiReset,
  BiTrash,
} from "react-icons/bi";

interface InpaintingToolProps {
  prompt: string;
}

type ToolMode = "move" | "paint" | "erase";

export function InpaintingTool({ prompt }: InpaintingToolProps) {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [toolMode, setToolMode] = useState<ToolMode>("move");
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(20);
  const [zoom, setZoom] = useState(1);
  const [gridPosition, setGridPosition] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const [isOverImage, setIsOverImage] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case "v":
          setToolMode("move");
          break;
        case "p":
          setToolMode("paint");
          break;
        case "e":
          setToolMode("erase");
          break;
        case "z":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            undo();
          }
          break;
        case "y":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            redo();
          }
          break;
        case "0":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            resetView();
          }
          break;
        case "=":
        case "+":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleZoom(0.1);
          }
          break;
        case "-":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleZoom(-0.1);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setImage(img);
          drawImageOnCanvas(img);
          saveToHistory();
          // Reset view when new image is loaded
          setGridPosition({ x: 0, y: 0 });
          setImagePosition({ x: 0, y: 0 });
          setZoom(1);
        };
        img.onerror = () => {
          console.error("Failed to load image");
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const drawImageOnCanvas = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Calculate the maximum size that fits in the container while maintaining aspect ratio
    const maxWidth = 800;
    const maxHeight = 600;

    let { width, height } = img;

    // Scale down if image is too large
    if (width > maxWidth || height > maxHeight) {
      const scale = Math.min(maxWidth / width, maxHeight / height);
      width = width * scale;
      height = height * scale;
    }

    // Set canvas size
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Clear canvas and draw image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, width, height);

    console.log("Image drawn on canvas:", {
      width,
      height,
      originalWidth: img.width,
      originalHeight: img.height,
    });
  };

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(imageData);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const imageData = history[historyIndex - 1];
      ctx.putImageData(imageData, 0, 0);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const imageData = history[historyIndex + 1];
      ctx.putImageData(imageData, 0, 0);
      setHistoryIndex(historyIndex + 1);
    }
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / zoom,
      y: (e.clientY - rect.top) / zoom,
    };
  };

  const isMouseOverImage = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!image || !canvasRef.current) return false;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Check if mouse is within canvas bounds
    return (
      mouseX >= 0 &&
      mouseX <= rect.width &&
      mouseY >= 0 &&
      mouseY <= rect.height
    );
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (toolMode === "move") {
      // Check if mouse is over image
      const overImage = isMouseOverImage(e);
      setIsOverImage(overImage);

      // Start panning
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      return;
    }

    setIsDrawing(true);
    const pos = getMousePos(e);

    if (toolMode === "paint" || toolMode === "erase") {
      draw(e);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (toolMode === "move") {
      // Handle panning
      if (isPanning) {
        const deltaX = e.clientX - lastPanPoint.x;
        const deltaY = e.clientY - lastPanPoint.y;

        if (isOverImage) {
          // Move only the image
          setImagePosition((prev) => ({
            x: prev.x + deltaX,
            y: prev.y + deltaY,
          }));
        } else {
          // Move the entire grid
          setGridPosition((prev) => ({
            x: prev.x + deltaX,
            y: prev.y + deltaY,
          }));
        }

        setLastPanPoint({ x: e.clientX, y: e.clientY });
      }
      return;
    }

    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pos = getMousePos(e);

    ctx.globalCompositeOperation =
      toolMode === "erase" ? "destination-out" : "source-over";
    ctx.globalAlpha = toolMode === "erase" ? 1 : 0.5;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveToHistory();
    }
    if (isPanning) {
      setIsPanning(false);
      setIsOverImage(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (toolMode === "move" && !isPanning) {
      const overImage = isMouseOverImage(e);
      setIsOverImage(overImage);
    }
  };

  const handleZoom = (delta: number) => {
    setZoom((prev) => Math.max(0.1, Math.min(5, prev + delta)));
  };

  const resetView = () => {
    setGridPosition({ x: 0, y: 0 });
    setImagePosition({ x: 0, y: 0 });
    setZoom(1);
  };

  const clearCanvas = () => {
    if (image) {
      drawImageOnCanvas(image);
      saveToHistory();
    }
  };

  const getDotGridStyle = () => {
    const isDark = theme === "dark";
    return {
      backgroundImage: `
        radial-gradient(circle at 1px 1px, ${
          isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.15)"
        } 1px, transparent 0)
      `,
      backgroundSize: "20px 20px",
    };
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();

    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.max(0.1, Math.min(5, zoom + delta));

    if (newZoom !== zoom) {
      // Get mouse position relative to canvas
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Calculate zoom point relative to canvas center
      const canvasCenterX = rect.width / 2;
      const canvasCenterY = rect.height / 2;

      // Calculate the offset from center
      const offsetX = mouseX - canvasCenterX;
      const offsetY = mouseY - canvasCenterY;

      // Calculate zoom factor
      const zoomFactor = newZoom / zoom;

      // Adjust position to zoom towards mouse cursor
      setGridPosition((prev) => ({
        x: prev.x - offsetX * (zoomFactor - 1),
        y: prev.y - offsetY * (zoomFactor - 1),
      }));

      setZoom(newZoom);
    }
  };

  const tools = [
    { mode: "move" as ToolMode, icon: BiMove, shortcut: "V", name: "Move" },
    { mode: "paint" as ToolMode, icon: BiPaint, shortcut: "P", name: "Paint" },
    { mode: "erase" as ToolMode, icon: BiEraser, shortcut: "E", name: "Erase" },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-default-50">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-default-200">
        <div className="flex items-center gap-4">
          {/* Tool Selection */}
          <div className="flex items-center gap-2">
            {tools.map((tool) => (
              <button
                key={tool.mode}
                onClick={() => setToolMode(tool.mode)}
                className={`p-2 rounded-lg transition-colors ${
                  toolMode === tool.mode
                    ? "bg-primary text-primary-foreground"
                    : "bg-default-100 hover:bg-default-200 text-default-700"
                }`}
                title={`${tool.name} (${tool.shortcut})`}
              >
                <tool.icon className="text-lg" />
              </button>
            ))}
          </div>

          {/* Brush Size */}
          {toolMode !== "move" && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-default-600">Brush:</span>
              <input
                type="range"
                min="5"
                max="100"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-20"
              />
              <span className="text-sm text-default-600 w-8">
                {brushSize}px
              </span>
            </div>
          )}

          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleZoom(-0.1)}
              className="p-2 rounded-lg bg-default-100 hover:bg-default-200 text-default-700"
              title="Zoom Out (Ctrl+-)"
            >
              <BiZoomOut className="text-lg" />
            </button>
            <span className="text-sm text-default-600 w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => handleZoom(0.1)}
              className="p-2 rounded-lg bg-default-100 hover:bg-default-200 text-default-700"
              title="Zoom In (Ctrl++)"
            >
              <BiZoomIn className="text-lg" />
            </button>
            <button
              onClick={resetView}
              className="p-2 rounded-lg bg-default-100 hover:bg-default-200 text-default-700"
              title="Reset View (Ctrl+0)"
            >
              <BiReset className="text-lg" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Undo/Redo */}
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="p-2 rounded-lg bg-default-100 hover:bg-default-200 text-default-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Undo (Ctrl+Z)"
          >
            <BiUndo className="text-lg" />
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 rounded-lg bg-default-100 hover:bg-default-200 text-default-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Redo (Ctrl+Y)"
          >
            <BiRedo className="text-lg" />
          </button>
          <button
            onClick={clearCanvas}
            disabled={!image}
            className="p-2 rounded-lg bg-default-100 hover:bg-default-200 text-default-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Clear Canvas"
          >
            <BiTrash className="text-lg" />
          </button>

          {/* Upload Image */}
          <label className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer transition-colors">
            <BiImage className="text-lg" />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 relative overflow-hidden">
        {!image ? (
          <div className="w-full h-full relative overflow-hidden">
            {/* Dot Matrix Background for empty state */}
            <div className="absolute inset-0" style={getDotGridStyle()} />

            <div className="flex items-center justify-center h-full relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-center backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-default-200 ${
                  theme === "dark"
                    ? "bg-default-900/90 text-default-100"
                    : "bg-white/90 text-default-900"
                }`}
              >
                <BiImage className="text-6xl text-default-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-default-700 mb-2">
                  No image loaded
                </h3>
                <p className="text-default-500 mb-4">
                  Upload an image to start inpainting
                </p>
                <label className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 cursor-pointer transition-colors">
                  <BiImage className="mr-2" />
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </motion.div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full relative overflow-hidden">
            {/* Dot Matrix Background */}
            <div
              className="absolute inset-0"
              style={{
                ...getDotGridStyle(),
                transform: `translate(${gridPosition.x}px, ${gridPosition.y}px)`,
              }}
            />

            <div
              className="absolute inset-0 flex items-center justify-center p-4"
              style={{
                transform: `translate(${gridPosition.x}px, ${gridPosition.y}px)`,
              }}
            >
              <div
                className={`relative border border-default-200 rounded-lg overflow-hidden shadow-lg ${
                  theme === "dark" ? "bg-default-900" : "bg-white"
                }`}
                style={{
                  transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${zoom})`,
                  transformOrigin: "center",
                }}
              >
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={(e) => {
                    handleMouseMove(e);
                    draw(e);
                  }}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onWheel={handleWheel}
                  className={`${
                    toolMode === "move"
                      ? isOverImage
                        ? "cursor-move"
                        : "cursor-grab active:cursor-grabbing"
                      : "cursor-crosshair"
                  }`}
                  style={{
                    display: "block",
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between p-2 bg-white border-t border-default-200 text-sm text-default-600">
        <div className="flex items-center gap-4">
          <span>Tool: {tools.find((t) => t.mode === toolMode)?.name}</span>
          {toolMode !== "move" && <span>Brush: {brushSize}px</span>}
          <span>Zoom: {Math.round(zoom * 100)}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span>V: Move</span>
          <span>P: Paint</span>
          <span>E: Erase</span>
          <span>Scroll: Zoom</span>
          <span>Ctrl+0: Reset</span>
        </div>
      </div>
    </div>
  );
}
