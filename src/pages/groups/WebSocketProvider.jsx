import { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [ws, setWs] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [messageQueue, setMessageQueue] = useState([]);
  
  const reconnectTimeoutRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);
  const messageListeners = useRef(new Set());
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 10;
  const lastLogTime = useRef({});
  const isConnectingRef = useRef(false);

  const log = useCallback((type, message, data = null) => {
    const now = Date.now();
    const key = `${type}-${message}`;
    
    if (['debug', 'heartbeat', 'typing'].includes(type)) {
      if (lastLogTime.current[key] && now - lastLogTime.current[key] < 10000) {
        return;
      }
      lastLogTime.current[key] = now;
    }

    const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
    const emoji = {
      error: '❌',
      warn: '⚠️', 
      success: '✅',
      info: 'ℹ️',
      connection: '🔌',
      message: '💬',
      heartbeat: '💓'
    };

    const logMessage = `${timestamp} ${emoji[type] || '📝'} [WS] ${message}`;
    
    if (type === 'error') {
      console.error(logMessage, data || '');
    } else if (type === 'warn') {
      console.warn(logMessage, data || '');
    } else if (['success', 'connection', 'info'].includes(type)) {
      console.log(logMessage, data || '');
    }
  }, []);

  const getAuthToken = useCallback(() => {
    const jwtToken = localStorage.getItem('jwt');
    if (jwtToken && jwtToken.trim()) {
      return jwtToken.trim();
    }
    
    const sessionJwtToken = sessionStorage.getItem('jwt');
    if (sessionJwtToken && sessionJwtToken.trim()) {
      return sessionJwtToken.trim();
    }
    
    const tokenKeys = ['token', 'authToken', 'accessToken', 'bearerToken'];
    for (const key of tokenKeys) {
      const token = localStorage.getItem(key) || sessionStorage.getItem(key);
      if (token && token.trim()) {
        return token.trim();
      }
    }
    
    return null;
  }, []);

  const getCurrentUser = useCallback(() => {
    const name = localStorage.getItem('name');
    const email = localStorage.getItem('email');
    const role = localStorage.getItem('role');
    
    if (name && email) {
      const user = {
        id: email,
        name: name,
        email: email,
        role: role,
        avatar: null
      };
      return user;
    }
    
    return null;
  }, []);

  const addMessageListener = useCallback((listener) => {
    messageListeners.current.add(listener);
    return () => {
      messageListeners.current.delete(listener);
    };
  }, []);

  const notifyListeners = useCallback((message) => {
    messageListeners.current.forEach(listener => {
      try {
        listener(message);
      } catch (error) {
        log('error', 'Listener error:', error);
      }
    });
  }, [log]);

  const processMessageQueue = useCallback(() => {
    if (ws && ws.readyState === WebSocket.OPEN && messageQueue.length > 0) {
      messageQueue.forEach((message) => {
        try {
          ws.send(JSON.stringify(message));
        } catch (error) {
          log('error', 'Failed to send queued message:', error);
        }
      });
      setMessageQueue([]);
    }
  }, [ws, messageQueue, log]);

  const connect = useCallback(() => {
    if (isConnectingRef.current) {
      return;
    }

    const token = getAuthToken();
    const user = getCurrentUser();
    
    if (!token) {
      log('error', 'No JWT token found - please login first');
      setConnectionStatus('error');
      return;
    }

    if (!user?.id) {
      log('error', 'No user data found - please login first');
      setConnectionStatus('error');
      return;
    }

    if (!window.WebSocket) {
      log('error', 'WebSocket not supported by browser');
      setConnectionStatus('error');
      return;
    }

    isConnectingRef.current = true;

    try {
      setConnectionStatus('connecting');
      
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsHost = 'gems.tekjuice.xyz';
      const wsUrl = `${wsProtocol}//${wsHost}?token=${encodeURIComponent(token)}`;
      
      log('connection', `Connecting to ${wsHost}...`);
      const websocket = new WebSocket(wsUrl);

      websocket.onopen = (event) => {
        isConnectingRef.current = false;
        log('success', 'WebSocket connected successfully!');
        
        setIsConnected(true);
        setConnectionStatus('connected');
        reconnectAttempts.current = 0;
        
        const connectMessage = {
          type: 'USER_CONNECTED',
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          timestamp: new Date().toISOString()
        };
        websocket.send(JSON.stringify(connectMessage));

        const onlineUsersMessage = { 
          type: 'GET_ONLINE_USERS',
          timestamp: new Date().toISOString()
        };
        websocket.send(JSON.stringify(onlineUsersMessage));

        processMessageQueue();

        heartbeatIntervalRef.current = setInterval(() => {
          if (websocket.readyState === WebSocket.OPEN) {
            const pingMessage = { 
              type: 'PING', 
              timestamp: new Date().toISOString(),
              userId: user.id
            };
            websocket.send(JSON.stringify(pingMessage));
          }
        }, 30000);
      };

      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (['SEND_MESSAGE', 'MESSAGE_RECEIVED', 'DELETE_MESSAGE', 'MESSAGE_EDITED'].includes(data.type)) {
            console.log('📨 [WS] Message event:', data.type, data);
          }
          
          switch (data.type) {
            case 'SEND_MESSAGE':
            case 'MESSAGE_RECEIVED':
              if (data.message) {
                notifyListeners(data);
              }
              break;
              
            case 'DELETE_MESSAGE':
              if (data.messageId && data.conversationId) {
                notifyListeners(data);
              }
              break;
              
            case 'MESSAGE_EDITED':
              if (data.message) {
                notifyListeners(data);
              }
              break;
              
            case 'USER_TYPING':
            case 'TYPING':
              setTypingUsers(prev => {
                const conversationTyping = prev[data.conversationId] || [];
                const newTyping = [...new Set([...conversationTyping, data.userId || data.fromUserId])];
                return {
                  ...prev,
                  [data.conversationId]: newTyping
                };
              });
              break;
              
            case 'USER_STOPPED_TYPING':
            case 'STOP_TYPING':
              setTypingUsers(prev => {
                const conversationTyping = prev[data.conversationId] || [];
                const newTyping = conversationTyping.filter(id => id !== (data.userId || data.fromUserId));
                return {
                  ...prev,
                  [data.conversationId]: newTyping
                };
              });
              break;
              
            case 'ONLINE_USERS':
              setOnlineUsers(data.users || []);
              break;
              
            case 'READ_RECEIPT':
            case 'MESSAGE_DELIVERED':
              notifyListeners(data);
              break;
              
            case 'PONG':
              break;

            case 'ERROR':
              log('error', `Server error: ${data.message || 'Unknown error'}`);
              break;

            case 'AUTHENTICATION_FAILED':
              log('error', 'Authentication failed - token invalid/expired');
              setConnectionStatus('error');
              break;

            case 'CONNECTION_ACKNOWLEDGED':
              break;
              
            default:
              notifyListeners(data);
              break;
          }
        } catch (error) {
          log('error', 'Failed to parse WebSocket message:', error);
        }
      };

      websocket.onclose = (event) => {
        isConnectingRef.current = false;
        setIsConnected(false);
        setConnectionStatus('disconnected');
        clearInterval(heartbeatIntervalRef.current);
        
        if (event.code === 1005) {
          return;
        }
        
        const closeReasons = {
          1000: 'Normal closure',
          1001: 'Going away', 
          1006: 'Connection lost',
          1011: 'Server error'
        };
        
        const reason = closeReasons[event.code] || `Code ${event.code}`;
        
        if (event.code !== 1000) {
          log('warn', `Connection closed: ${reason}`);
        }
        
        const shouldReconnect = event.code !== 1000 && 
                               event.code !== 1001 && 
                               event.code !== 1005 && 
                               reconnectAttempts.current < maxReconnectAttempts;
        
        if (shouldReconnect) {
          reconnectAttempts.current += 1;
          const delay = Math.min(2000 * Math.pow(1.5, reconnectAttempts.current - 1), 15000);
          
          setConnectionStatus('reconnecting');
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          log('error', 'Max reconnection attempts reached');
          setConnectionStatus('error');
        }
      };

      websocket.onerror = (error) => {
        isConnectingRef.current = false;
        log('error', 'WebSocket connection error');
        setConnectionStatus('error');
      };

      setWs(websocket);
      
    } catch (error) {
      isConnectingRef.current = false;
      log('error', 'Failed to create WebSocket connection:', error.message);
      setConnectionStatus('error');
      
      if (reconnectAttempts.current < maxReconnectAttempts) {
        reconnectAttempts.current += 1;
        const delay = Math.min(2000 * Math.pow(1.5, reconnectAttempts.current - 1), 15000);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, delay);
      }
    }
  }, [getAuthToken, getCurrentUser, processMessageQueue, notifyListeners, log]);

  const disconnect = useCallback(() => {
    if (ws) {
      ws.close(1000, 'Manual disconnect');
    }
    clearTimeout(reconnectTimeoutRef.current);
    clearInterval(heartbeatIntervalRef.current);
    setIsConnected(false);
    setConnectionStatus('disconnected');
    reconnectAttempts.current = 0;
    isConnectingRef.current = false;
  }, [ws]);

  const sendMessage = useCallback((message) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(message));
        
        if (['SEND_MESSAGE', 'DELETE_MESSAGE'].includes(message.type)) {
          console.log('📤 [WS] Sent message:', message.type, message);
        }
      } catch (error) {
        log('error', 'Failed to send message:', error);
      }
    } else {
      setMessageQueue(prev => [...prev, message]);
    }
  }, [ws, log]);

  useEffect(() => {
    let reconnectTimer = null;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isConnected && connectionStatus !== 'connecting') {
        reconnectTimer = setTimeout(() => {
          if (!isConnected && !isConnectingRef.current) {
            connect();
          }
        }, 3000);
      }
    };

    const handleOnline = () => {
      if (!isConnected && connectionStatus !== 'connecting') {
        setTimeout(() => {
          if (!isConnected && !isConnectingRef.current) {
            connect();
          }
        }, 2000);
      }
    };

    const handleOffline = () => {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isConnected, connectionStatus, connect]);

  useEffect(() => {
    const user = getCurrentUser();
    const token = getAuthToken();
    
    if (user?.id && token && !isConnected && connectionStatus === 'disconnected' && !isConnectingRef.current) {
      setTimeout(() => connect(), 1000);
    }
  }, [getCurrentUser, getAuthToken, isConnected, connectionStatus, connect]);

  useEffect(() => {
    return () => {
      clearTimeout(reconnectTimeoutRef.current);
      clearInterval(heartbeatIntervalRef.current);
      if (ws) {
        ws.close();
      }
    };
  }, [ws]);

  const value = {
    ws,
    isConnected,
    connectionStatus,
    onlineUsers,
    typingUsers,
    sendMessage,
    addMessageListener,
    connect,
    disconnect
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    return {
      ws: null,
      isConnected: false,
      connectionStatus: 'disconnected',
      onlineUsers: [],
      typingUsers: {},
      sendMessage: () => {},
      addMessageListener: () => () => {},
      connect: () => {},
      disconnect: () => {}
    };
  }
  return context;
};