export type NavigationState = {
  url: string;
  canGoBack: boolean;
  canGoForward: boolean;
  title?: string;
  favicon?: string;
};

export interface EngineAdapter {
  createTab(initialUrl: string, containerId: string): Promise<string>;
  destroyTab(tabId: string): Promise<void>;
  loadUrl(tabId: string, url: string): Promise<void>;
  goBack(tabId: string): Promise<void>;
  goForward(tabId: string): Promise<void>;
  reload(tabId: string, hard?: boolean): Promise<void>;
  getNavState(tabId: string): Promise<NavigationState>;
  openDevtools(tabId: string): Promise<void>;
  on(tabId: string, evt: 'nav', cb: (s: NavigationState) => void): void;
  off(tabId: string, evt: 'nav', cb: (s: NavigationState) => void): void;
}
