import { invoke } from "@tauri-apps/api/tauri";
import { EngineAdapter, NavigationState } from "./engine";

export const webkitAdapter: EngineAdapter = {
  async createTab(url, containerId) {
    return invoke<string>("create_tab", { engine: "webkit", containerId, url });
  },
  async destroyTab(tabId) {
    return invoke("destroy_tab", { tabId });
  },
  async loadUrl(tabId, url) {
    return invoke("load_url", { tabId, url });
  },
  async goBack(tabId) {
    return invoke("go_back", { tabId });
  },
  async goForward(tabId) {
    return invoke("go_forward", { tabId });
  },
  async reload(tabId, hard) {
    return invoke("reload_tab", { tabId, hard });
  },
  async getNavState(tabId) {
    return invoke<NavigationState>("get_nav_state", { tabId });
  },
  async openDevtools(tabId) {
    return invoke("open_devtools", { tabId });
  },
  on() {},
  off() {},
};
