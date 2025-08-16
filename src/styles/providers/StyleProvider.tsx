import { HeroUIProvider } from "@heroui/system";

function StyleProvider({ children }: { children: React.ReactNode }) {
  return <HeroUIProvider>{children}</HeroUIProvider>;
}

export default StyleProvider;
