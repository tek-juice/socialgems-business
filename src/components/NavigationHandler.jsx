import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const NavigationHandler = () => {
  const location = useLocation();

  useEffect(() => {
    // Update tab manager when location changes
    const currentPath = location.pathname + location.search;
    
    if (window.tabManager) {
      window.tabManager.updateTabPath(currentPath);
    }
    
    // Broadcast URL change to other tabs
    const channel = new BroadcastChannel('social_gems_tabs');
    channel.postMessage({
      type: 'URL_UPDATED',
      path: currentPath,
      timestamp: Date.now()
    });
    
    return () => channel.close();
  }, [location]);

  return null;
};

export default NavigationHandler;