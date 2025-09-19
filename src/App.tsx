import { Route, Routes, useLocation } from "react-router-dom";
import { Layout } from "@/components";
import { TextPage } from "./pages/text-page";
import { AudioPage, MarketplacePage, ToolsPage } from "./pages";
import ImagePage from "./pages/image-page";
import { AnimatePresence } from "framer-motion";

function App() {
  const location = useLocation();
  return (
    <Layout>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/text" element={<TextPage />} />
          <Route path="/audio" element={<AudioPage />} />
          <Route path="/images" element={<ImagePage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/tools" element={<ToolsPage />} />
        </Routes>
      </AnimatePresence>
    </Layout>
  );
}

export default App;
