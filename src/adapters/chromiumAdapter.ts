import { EngineAdapter } from "./engine";

export const chromiumAdapter: EngineAdapter = {
  async createTab(url, containerId) {
    console.warn("Chromium engine not implemented yet");
    return Promise.resolve("cef-tab-stub");
  },
  destroyTab: async () => {},
  loadUrl: async () => {},
  goBack: async () => {},
  goForward: async () => {},
  reload: async () => {},
  getNavState: async () => ({ url: "", canGoBack: false, canGoForward: false }),
  openDevtools: async () => {},
  on() {},
  off() {},
};
