import { HeroUIProvider } from "@heroui/system";
import { useNavigate, useHref } from "react-router-dom";

function StyleProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  return (
    <HeroUIProvider useHref={useHref} navigate={navigate}>
      {children}
    </HeroUIProvider>
  );
}

export default StyleProvider;
