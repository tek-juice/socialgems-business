class TabManager {
  constructor() {
    this.tabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.channel = new BroadcastChannel('social_gems_tabs');
    this.setupEventListeners();
  }

  setupEventListeners() {

    this.channel.addEventListener('message', this.handleMessage.bind(this));


    window.addEventListener('storage', this.handleStorageChange.bind(this));


    window.addEventListener('beforeunload', this.cleanup.bind(this));
  }

  registerTab(path) {
    const existingTabs = this.getOpenTabs();
    const duplicateTab = existingTabs.find(tab => tab.path === path && tab.tabId !== this.tabId);

    if (duplicateTab) {
      return this.handleDuplicateTab(duplicateTab, path);
    }


    const tabInfo = {
      tabId: this.tabId,
      path,
      timestamp: Date.now(),
      url: window.location.href
    };

    const allTabs = [...existingTabs.filter(tab => tab.tabId !== this.tabId), tabInfo];
    localStorage.setItem('social_gems_open_tabs', JSON.stringify(allTabs));

    return { isDuplicate: false, action: 'continue' };
  }

  getOpenTabs() {
    try {
      const tabs = localStorage.getItem('social_gems_open_tabs');
      if (!tabs) return [];

      const parsedTabs = JSON.parse(tabs);
      const now = Date.now();


      const activeTabs = parsedTabs.filter(tab => now - tab.timestamp < 30000);

      if (activeTabs.length !== parsedTabs.length) {
        localStorage.setItem('social_gems_open_tabs', JSON.stringify(activeTabs));
      }

      return activeTabs;
    } catch (error) {
      return [];
    }
  }

  handleDuplicateTab(existingTab, currentPath) {

    this.channel.postMessage({
      type: 'FOCUS_REQUEST',
      targetTabId: existingTab.tabId,
      newTabId: this.tabId,
      path: currentPath
    });

    return {
      isDuplicate: true,
      existingTab,
      action: 'redirect_or_close'
    };
  }

  handleMessage(event) {
    const { type, targetTabId, newTabId, path } = event.data;

    if (type === 'FOCUS_REQUEST' && targetTabId === this.tabId) {

      window.focus();


      this.channel.postMessage({
        type: 'FOCUS_CONFIRMED',
        originalTabId: this.tabId,
        newTabId: newTabId
      });
    }
  }

  handleStorageChange(event) {
    if (event.key === 'social_gems_open_tabs') {

    }
  }

  updateTabPath(newPath) {
    const existingTabs = this.getOpenTabs();
    const updatedTabs = existingTabs.map(tab =>
      tab.tabId === this.tabId
        ? { ...tab, path: newPath, timestamp: Date.now(), url: window.location.href }
        : tab
    );

    localStorage.setItem('social_gems_open_tabs', JSON.stringify(updatedTabs));
  }

  cleanup() {
    const existingTabs = this.getOpenTabs();
    const filteredTabs = existingTabs.filter(tab => tab.tabId !== this.tabId);
    localStorage.setItem('social_gems_open_tabs', JSON.stringify(filteredTabs));

    if (this.channel) {
      this.channel.close();
    }
  }
}

export default TabManager;