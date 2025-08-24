import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const useTabManager = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const channelRef = useRef(null);
  const tabIdRef = useRef(null);

  useEffect(() => {

    tabIdRef.current = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;


    channelRef.current = new BroadcastChannel('social_gems_tabs');

    const currentPath = location.pathname + location.search;
    const currentUrl = window.location.href;


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


    const handleMessage = (event) => {
      const { type, path, url, tabId, timestamp, focusTabId } = event.data;

      switch (type) {
        case 'CHECK_EXISTING_TAB':

          if (path === currentPath && tabId !== tabIdRef.current) {

            channelRef.current.postMessage({
              type: 'TAB_EXISTS',
              path: currentPath,
              url: currentUrl,
              tabId: tabIdRef.current,
              focusTabId: tabId,
              timestamp: Date.now()
            });
          }
          break;

        case 'TAB_EXISTS':

          if (focusTabId === tabIdRef.current) {




            const shouldRedirect = window.confirm(
              'This page is already open in another tab. Would you like to go to that tab instead?'
            );

            if (shouldRedirect) {

              channelRef.current.postMessage({
                type: 'FOCUS_TAB',
                tabId: tabId
              });


              if (window.history.length > 1) {
                window.close();
              } else {

                navigate('/dashboard');
              }
            }
          }
          break;

        case 'FOCUS_TAB':

          if (tabId === tabIdRef.current) {
            window.focus();


            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Social Gems', {
                body: 'Switched to existing tab',
                icon: '/favicon.ico'
              });
            }
          }
          break;

        case 'URL_CHANGED':

          if (tabId !== tabIdRef.current && path !== currentPath) {


          }
          break;
      }
    };

    channelRef.current.addEventListener('message', handleMessage);


    setTimeout(checkExistingTabs, 100);


    const tabInfo = {
      tabId: tabIdRef.current,
      path: currentPath,
      url: currentUrl,
      timestamp: Date.now()
    };

    sessionStorage.setItem('current_tab_info', JSON.stringify(tabInfo));


    return () => {
      if (channelRef.current) {
        channelRef.current.removeEventListener('message', handleMessage);
        channelRef.current.close();
      }
      sessionStorage.removeItem('current_tab_info');
    };
  }, [location.pathname, location.search, navigate]);


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