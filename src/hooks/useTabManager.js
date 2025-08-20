import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const useTabManager = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const channelRef = useRef(null);
  const tabIdRef = useRef(null);

  useEffect(() => {
    // Generate unique tab ID
    tabIdRef.current = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create broadcast channel for cross-tab communication
    channelRef.current = new BroadcastChannel('social_gems_tabs');
    
    const currentPath = location.pathname + location.search;
    const currentUrl = window.location.href;
    
    // Check if this URL is already open in another tab
    const checkExistingTabs = () => {
      const message = {
        type: 'CHECK_EXISTING_TAB',
        path: currentPath,
        url: currentUrl,
        tabId: tabIdRef.current,
        timestamp: Date.now()
      };
      
      channelRef.current.postMessage(message);
    };

    // Listen for messages from other tabs
    const handleMessage = (event) => {
      const { type, path, url, tabId, timestamp, focusTabId } = event.data;
      
      switch (type) {
        case 'CHECK_EXISTING_TAB':
          // If another tab is checking for our current path and it's not from us
          if (path === currentPath && tabId !== tabIdRef.current) {
            // Respond that we have this tab open
            channelRef.current.postMessage({
              type: 'TAB_EXISTS',
              path: currentPath,
              url: currentUrl,
              tabId: tabIdRef.current,
              focusTabId: tabId, // The tab that should be redirected/closed
              timestamp: Date.now()
            });
          }
          break;
          
        case 'TAB_EXISTS':
          // If we're the tab that should be redirected/closed
          if (focusTabId === tabIdRef.current) {
            // Option 1: Close this tab and focus the existing one
            // window.close();
            
            // Option 2: Redirect to dashboard or show a message
            const shouldRedirect = window.confirm(
              'This page is already open in another tab. Would you like to go to that tab instead?'
            );
            
            if (shouldRedirect) {
              // Tell the existing tab to focus
              channelRef.current.postMessage({
                type: 'FOCUS_TAB',
                tabId: tabId
              });
              
              // Close this tab (may not work due to browser restrictions)
              if (window.history.length > 1) {
                window.close();
              } else {
                // Redirect to dashboard if can't close
                navigate('/dashboard');
              }
            }
          }
          break;
          
        case 'FOCUS_TAB':
          // Focus this tab if we're the target
          if (tabId === tabIdRef.current) {
            window.focus();
            
            // Optional: Show notification that tab was focused
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Social Gems', {
                body: 'Switched to existing tab',
                icon: '/favicon.ico'
              });
            }
          }
          break;
          
        case 'URL_CHANGED':
          // Another tab changed URL, we can sync if needed
          if (tabId !== tabIdRef.current && path !== currentPath) {
            // Optional: Update current tab to match
            // navigate(path);
          }
          break;
      }
    };

    channelRef.current.addEventListener('message', handleMessage);
    
    // Check for existing tabs when component mounts
    setTimeout(checkExistingTabs, 100);
    
    // Store tab info in sessionStorage
    const tabInfo = {
      tabId: tabIdRef.current,
      path: currentPath,
      url: currentUrl,
      timestamp: Date.now()
    };
    
    sessionStorage.setItem('current_tab_info', JSON.stringify(tabInfo));
    
    // Cleanup
    return () => {
      if (channelRef.current) {
        channelRef.current.removeEventListener('message', handleMessage);
        channelRef.current.close();
      }
      sessionStorage.removeItem('current_tab_info');
    };
  }, [location.pathname, location.search, navigate]);

  // Function to broadcast URL changes to other tabs
  const broadcastUrlChange = (newPath) => {
    if (channelRef.current) {
      channelRef.current.postMessage({
        type: 'URL_CHANGED',
        path: newPath,
        tabId: tabIdRef.current,
        timestamp: Date.now()
      });
    }
  };

  return { broadcastUrlChange, tabId: tabIdRef.current };
};