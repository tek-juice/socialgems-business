import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  FiMessageCircle, 
  FiSearch,
  FiMoreHorizontal,
  FiPlus,
  FiArrowLeft,
  FiInfo,
  FiPaperclip,
  FiX,
  FiLoader,
  FiImage,
  FiFile,
  FiEdit,
  FiCheck,
  FiWifiOff,
  FiBookmark
} from 'react-icons/fi';
import { IoSend, IoChatbubblesSharp } from "react-icons/io5";
import { get, post, upload } from '../utils/service';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

// Import all components
import { WebSocketProvider, useWebSocket } from './groups/WebSocketProvider';
import ConnectionStatus from './groups/ConnectionStatus';
import CreateGroupModal from './groups/CreateGroupModal';
import GroupInfoDrawer from './groups/GroupInfoDrawer';
import MessageContextMenu from './groups/MessageContextMenu';
import UploadProgress from './groups/UploadProgress';
import ChatListItem from './groups/ChatListItem';
import ChatMessage from './groups/ChatMessage';
import DateSeparator from './groups/DateSeparator';
import { 
  formatMessageTime, 
  formatTimeOnly, 
  needsDateSeparator, 
  shouldGroupMessages,
  truncateText 
} from './groups/helpers';

// Main Groups Component with Complete State Persistence
const GroupsWithWebSocket = () => {
  // Core state
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [showGroupInfo, setShowGroupInfo] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showChatList, setShowChatList] = useState(true);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [editingMessage, setEditingMessage] = useState(null);
  const [contextMenu, setContextMenu] = useState({ isOpen: false, position: { x: 0, y: 0 }, message: null });
  const [isTyping, setIsTyping] = useState(false);
  
  // Enhanced state for persistence
  const [stateRestored, setStateRestored] = useState(false);
  const [autoScrollToUnread, setAutoScrollToUnread] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [lastScrollPositions, setLastScrollPositions] = useState({});
  
  // Loading states
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingAllMessages, setLoadingAllMessages] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState({ current: 0, total: 0 });
  
  // Cache for messages by group ID
  const [groupMessages, setGroupMessages] = useState({});
  
  // Refs
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const stateUpdateTimeoutRef = useRef(null);

  // WebSocket integration
  const { isConnected, connectionStatus, typingUsers, sendMessage, addMessageListener, cache } = useWebSocket();

  // =============================================================================
  // STATE PERSISTENCE SYSTEM
  // =============================================================================

  // Save app state with debouncing
  const saveAppState = useCallback(() => {
    if (stateUpdateTimeoutRef.current) {
      clearTimeout(stateUpdateTimeoutRef.current);
    }
    
    stateUpdateTimeoutRef.current = setTimeout(() => {
      const state = {
        selectedGroupId: selectedGroup?.group_id || null,
        showGroupInfo,
        showChatList,
        searchTerm,
        lastActiveTimestamp: Date.now()
      };
      
      cache.saveAppState(state);
      console.log('💾 [Groups] App state saved automatically');
    }, 1000); // Debounce for 1 second
  }, [selectedGroup, showGroupInfo, showChatList, searchTerm, cache]);

  // Restore app state
  const restoreAppState = useCallback(async () => {
    console.log('🔄 [Groups] ============ RESTORING APP STATE ============');
    
    try {
      const savedState = cache.getAppState();
      
      if (savedState) {
        console.log('📱 [Groups] Found saved app state:', savedState);
        
        // Restore UI state
        setShowGroupInfo(savedState.showGroupInfo !== undefined ? savedState.showGroupInfo : true);
        setShowChatList(savedState.showChatList !== undefined ? savedState.showChatList : true);
        setSearchTerm(savedState.searchTerm || '');
        
        // Get groups first
        const cachedGroups = cache.getGroups();
        if (cachedGroups && cachedGroups.length > 0) {
          setGroups(cachedGroups);
          
          // Restore selected group
          if (savedState.selectedGroupId) {
            const group = cachedGroups.find(g => g.group_id === savedState.selectedGroupId);
            if (group) {
              console.log('🎯 [Groups] Restoring selected group:', group.name);
              setSelectedGroup(group);
              
              // Load messages for restored group
              const cachedMessages = cache.getMessages(group.group_id);
              setMessages(cachedMessages);
              
              // Check for unread messages
              const user = cache.getUser();
              if (user) {
                const firstUnread = cache.getFirstUnreadMessage(group.group_id, user.id);
                if (firstUnread) {
                  console.log('📬 [Groups] Found unread messages, will auto-scroll');
                  setAutoScrollToUnread(true);
                }
              }
            }
          } else {
            // No selected group, maybe auto-select most recent or group with unread messages
            await autoSelectGroup(cachedGroups);
          }
        }
        
        console.log('✅ [Groups] App state restored successfully');
      } else {
        console.log('ℹ️ [Groups] No saved app state found, starting fresh');
        // Try to auto-select a group
        const cachedGroups = cache.getGroups();
        if (cachedGroups && cachedGroups.length > 0) {
          await autoSelectGroup(cachedGroups);
        }
      }
    } catch (error) {
      console.error('❌ [Groups] Failed to restore app state:', error);
    } finally {
      setStateRestored(true);
    }
  }, [cache]);

  // Auto-select group based on unread messages or recent activity
  const autoSelectGroup = useCallback(async (groupsList) => {
    const user = cache.getUser();
    if (!user || !groupsList.length) return;
    
    console.log('🔍 [Groups] Auto-selecting group...');
    let groupToSelect = null;
    
    // First, look for groups with unread messages
    for (const group of groupsList) {
      const unreadMessages = cache.getUnreadMessages(group.group_id, user.id);
      if (unreadMessages.length > 0) {
        console.log(`📬 [Groups] Found ${unreadMessages.length} unread messages in ${group.name}`);
        groupToSelect = group;
        setAutoScrollToUnread(true);
        break;
      }
    }
    
    // If no unread messages, select most recently active group
    if (!groupToSelect) {
      const mostRecentGroupId = cache.getMostRecentlyActiveGroup();
      if (mostRecentGroupId) {
        groupToSelect = groupsList.find(g => g.group_id === mostRecentGroupId);
        console.log('⭐ [Groups] Selected most recently active group:', groupToSelect?.name);
      }
    }
    
    // Fallback to first group
    if (!groupToSelect && groupsList.length > 0) {
      groupToSelect = groupsList[0];
      console.log('🎯 [Groups] Fallback to first group:', groupToSelect.name);
    }
    
    if (groupToSelect) {
      setSelectedGroup(groupToSelect);
      const cachedMessages = cache.getMessages(groupToSelect.group_id);
      setMessages(cachedMessages);
    }
  }, [cache]);

  // Calculate unread counts for all groups
  const calculateUnreadCounts = useCallback(() => {
    const user = cache.getUser();
    if (!user) return;
    
    const counts = {};
    groups.forEach(group => {
      const unreadMessages = cache.getUnreadMessages(group.group_id, user.id);
      counts[group.group_id] = unreadMessages.length;
    });
    
    setUnreadCounts(counts);
    console.log('📊 [Groups] Updated unread counts:', counts);
  }, [groups, cache]);

  // =============================================================================
  // SCROLL POSITION MANAGEMENT
  // =============================================================================

  // Save scroll position
  const saveScrollPosition = useCallback(() => {
    if (!selectedGroup || !messagesContainerRef.current) return;
    
    const container = messagesContainerRef.current;
    cache.saveScrollPosition(
      selectedGroup.group_id,
      container.scrollTop,
      container.scrollHeight
    );
  }, [selectedGroup, cache]);

  // Restore scroll position
  const restoreScrollPosition = useCallback(() => {
    if (!selectedGroup || !messagesContainerRef.current) return;
    
    const container = messagesContainerRef.current;
    const savedPosition = cache.getScrollPosition(selectedGroup.group_id);
    
    if (savedPosition) {
      // Calculate the relative position
      const relativePosition = savedPosition.scrollTop / savedPosition.scrollHeight;
      const newScrollTop = relativePosition * container.scrollHeight;
      
      container.scrollTop = newScrollTop;
      console.log('📜 [Groups] Restored scroll position for', selectedGroup.name);
    }
  }, [selectedGroup, cache]);

  // Scroll to first unread message
  const scrollToFirstUnread = useCallback(() => {
    if (!selectedGroup || !messagesContainerRef.current || !currentUser) return;
    
    const firstUnreadMessage = cache.getFirstUnreadMessage(selectedGroup.group_id, currentUser.id);
    if (!firstUnreadMessage) {
      // No unread messages, scroll to bottom
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    
    // Find the unread message element and scroll to it
    const messageElement = document.querySelector(`[data-message-id="${firstUnreadMessage.messageId}"]`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Highlight the unread message briefly
      messageElement.classList.add('animate-pulse', 'bg-yellow-100');
      setTimeout(() => {
        messageElement.classList.remove('animate-pulse', 'bg-yellow-100');
      }, 2000);
      
      console.log('📬 [Groups] Scrolled to first unread message:', firstUnreadMessage.messageId);
    } else {
      // Fallback to bottom
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedGroup, currentUser, cache]);

  // Handle scroll events with debouncing
  const handleScroll = useCallback(() => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      saveScrollPosition();
    }, 500); // Debounce scroll saving
  }, [saveScrollPosition]);

  // =============================================================================
  // MESSAGE READ STATUS MANAGEMENT
  // =============================================================================

  // Mark messages as read when they come into view
  const markVisibleMessagesAsRead = useCallback(() => {
    if (!selectedGroup || !currentUser || !messagesContainerRef.current) return;
    
    const container = messagesContainerRef.current;
    const messageElements = container.querySelectorAll('[data-message-id]');
    
    messageElements.forEach(element => {
      const rect = element.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      
      // Check if message is visible in viewport
      if (rect.top >= containerRect.top && rect.bottom <= containerRect.bottom) {
        const messageId = element.getAttribute('data-message-id');
        const message = messages.find(m => m.messageId === messageId);
        
        if (message && message.senderId !== currentUser.id) {
          cache.markMessageAsRead(selectedGroup.group_id, messageId, currentUser.id);
        }
      }
    });
    
    // Recalculate unread counts
    calculateUnreadCounts();
  }, [selectedGroup, currentUser, messages, cache, calculateUnreadCounts]);

  // =============================================================================
  // COMPONENT LIFECYCLE
  // =============================================================================

  // Check if mobile
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setShowChatList(true);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Auto-save state when key values change
  useEffect(() => {
    if (stateRestored) {
      saveAppState();
    }
  }, [selectedGroup, showGroupInfo, showChatList, searchTerm, stateRestored, saveAppState]);

  // Handle scroll position restoration and unread message navigation
  useEffect(() => {
    if (!selectedGroup || !messages.length) return;
    
    // Small delay to ensure DOM is updated
    setTimeout(() => {
      if (autoScrollToUnread) {
        scrollToFirstUnread();
        setAutoScrollToUnread(false);
      } else {
        restoreScrollPosition();
      }
      
      // Mark visible messages as read after a delay
      setTimeout(markVisibleMessagesAsRead, 1000);
    }, 100);
  }, [selectedGroup, messages, autoScrollToUnread, scrollToFirstUnread, restoreScrollPosition, markVisibleMessagesAsRead]);

  // Calculate unread counts when groups or messages change
  useEffect(() => {
    if (groups.length > 0 && currentUser) {
      calculateUnreadCounts();
    }
  }, [groups, groupMessages, currentUser, calculateUnreadCounts]);

  // WebSocket message handler
  useEffect(() => {
    const removeListener = addMessageListener((data) => {
      console.log('📨 [Groups] Received WebSocket message:', data.type);
      
      switch (data.type) {
        case 'MESSAGE_RECEIVED':
          if (data.message) {
            const groupId = data.message.conversationId;
            console.log('💬 [Groups] Adding new message to group:', groupId);
            
            // Update both state and cache
            setGroupMessages(prev => {
              const updatedMessages = [...(prev[groupId] || []), data.message];
              cache.setMessages(groupId, updatedMessages);
              return { ...prev, [groupId]: updatedMessages };
            });
            
            if (selectedGroup?.group_id === groupId) {
              setMessages(prev => [...prev, data.message]);
              
              // Auto-scroll to new message if we're at the bottom
              setTimeout(() => {
                if (messagesContainerRef.current) {
                  const container = messagesContainerRef.current;
                  const isNearBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 100;
                  if (isNearBottom) {
                    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                  }
                }
              }, 100);
            }
            
            // Update last activity
            cache.updateLastActivity(groupId);
          }
          break;
          
        case 'MESSAGE_DELETED':
          if (data.messageId) {
            const groupId = data.conversationId;
            console.log('🗑️ [Groups] Removing message from group:', groupId, 'messageId:', data.messageId);
            
            setGroupMessages(prev => {
              const updatedMessages = (prev[groupId] || []).filter(msg => msg.messageId !== data.messageId);
              cache.setMessages(groupId, updatedMessages);
              return { ...prev, [groupId]: updatedMessages };
            });
            
            if (selectedGroup?.group_id === groupId) {
              setMessages(prev => prev.filter(msg => msg.messageId !== data.messageId));
            }
          }
          break;
          
        case 'MESSAGE_EDITED':
          if (data.message) {
            const groupId = data.message.conversationId;
            console.log('✏️ [Groups] Updating message in group:', groupId);
            
            setGroupMessages(prev => {
              const updatedMessages = (prev[groupId] || []).map(msg => 
                msg.messageId === data.message.messageId ? data.message : msg
              );
              cache.setMessages(groupId, updatedMessages);
              return { ...prev, [groupId]: updatedMessages };
            });
            
            if (selectedGroup?.group_id === groupId) {
              setMessages(prev => prev.map(msg => 
                msg.messageId === data.message.messageId ? data.message : msg
              ));
            }
          }
          break;
          
        case 'READ_RECEIPT':
        case 'MESSAGE_DELIVERED':
          if (data.messageId) {
            const groupId = data.conversationId;
            const status = data.type === 'READ_RECEIPT' ? 'read' : 'DELIVERED';
            console.log('📬 [Groups] Updating message status:', status, 'for group:', groupId);
            
            setGroupMessages(prev => {
              const updatedMessages = (prev[groupId] || []).map(msg => 
                msg.messageId === data.messageId ? { ...msg, status } : msg
              );
              cache.setMessages(groupId, updatedMessages);
              return { ...prev, [groupId]: updatedMessages };
            });
            
            if (selectedGroup?.group_id === groupId) {
              setMessages(prev => prev.map(msg => 
                msg.messageId === data.messageId ? { ...msg, status } : msg
              ));
            }
          }
          break;
      }
    });

    return removeListener;
  }, [selectedGroup, addMessageListener, cache]);

  // Fetch user profile and store for WebSocket
  const fetchUserProfile = async () => {
    try {
      console.log('👤 [Groups] Fetching user profile...');
      
      // Check cache first
      const cachedUser = cache.getUser();
      if (cachedUser) {
        console.log('✅ [Groups] Using cached user profile:', cachedUser);
        setCurrentUser(cachedUser);
        return cachedUser;
      }
      
      const response = await get('users/getUserProfile');
      if (response?.data) {
        const user = { 
          id: response.data.user_id,
          name: `${response.data.first_name} ${response.data.last_name}`,
          avatar: response.data.profile_pic,
          email: response.data.email
        };
        console.log('✅ [Groups] User profile loaded:', user);
        setCurrentUser(user);
        
        // Store user for WebSocket and persistence
        cache.setUser(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        return user;
      }
    } catch (error) {
      console.error('❌ [Groups] Failed to fetch user profile:', error);
      return null;
    }
  };

  // Fetch all groups
  const fetchGroups = async () => {
    try {
      console.log('📂 [Groups] ============ FETCHING GROUPS ============');
      setLoadingGroups(true);
      
      // Check cache first
      const cachedGroups = cache.getGroups();
      if (cachedGroups && cachedGroups.length > 0) {
        console.log('✅ [Groups] Using cached groups:', cachedGroups.length, 'groups');
        setGroups(cachedGroups);
        
        // Still fetch fresh data in background
        setTimeout(() => fetchGroupsFromServer(), 1000);
        
        return cachedGroups;
      }
      
      return await fetchGroupsFromServer();
    } finally {
      setLoadingGroups(false);
    }
  };

  const fetchGroupsFromServer = async () => {
    try {
      console.log('🌐 [Groups] Fetching groups from server...');
      const response = await get('groups/myGroups');
      
      if (response?.data && Array.isArray(response.data)) {
        console.log('✅ [Groups] Groups loaded successfully:', response.data.length, 'groups');
        setGroups(response.data);
        cache.setGroups(response.data);
        return response.data;
      } else {
        console.log('⚠️ [Groups] No groups found in response');
        setGroups([]);
        return [];
      }
    } catch (error) {
      console.error('❌ [Groups] Failed to fetch groups:', error);
      toast.error('Failed to fetch groups');
      setGroups([]);
      return [];
    }
  };

  // Fetch messages for a specific group
  const fetchMessagesForGroup = async (groupId, groupName = 'Unknown') => {
    try {
      console.log(`📨 [Groups] Fetching messages for group: ${groupName} (${groupId})`);
      
      // Check cache first
      const cachedMessages = cache.getMessages(groupId);
      if (cachedMessages && cachedMessages.length > 0) {
        console.log(`✅ [Groups] Using cached messages for ${groupName}:`, cachedMessages.length, 'messages');
        return cachedMessages;
      }
      
      const response = await get(`chat/getChats/${groupId}`);
      
      let messagesData = null;
      
      if (Array.isArray(response)) {
        messagesData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        messagesData = response.data;
      } else if (response && typeof response === 'object' && response.length !== undefined) {
        messagesData = Object.values(response);
      }
      
      if (messagesData && messagesData.length > 0) {
        const sortedMessages = messagesData.sort((a, b) => 
          new Date(a.timestamp) - new Date(b.timestamp)
        );
        
        console.log(`✅ [Groups] Messages loaded for ${groupName}:`, sortedMessages.length, 'messages');
        
        // Cache messages
        cache.setMessages(groupId, sortedMessages);
        
        return sortedMessages;
      } else {
        console.log(`📭 [Groups] No messages found for ${groupName}`);
        cache.setMessages(groupId, []);
        return [];
      }
    } catch (error) {
      console.error(`❌ [Groups] Failed to load messages for ${groupName} (${groupId}):`, error);
      return [];
    }
  };

  // Load ALL messages for ALL groups automatically
  const loadAllGroupMessages = async (groupsList) => {
    if (!groupsList || groupsList.length === 0) {
      console.log('ℹ️ [Groups] No groups to load messages for');
      return {};
    }
    
    console.log('🔄 [Groups] ============ LOADING ALL GROUP MESSAGES ============');
    console.log('🔄 [Groups] Total groups to process:', groupsList.length);
    setLoadingAllMessages(true);
    setLoadingProgress({ current: 0, total: groupsList.length });
    
    const allGroupMessages = {};
    
    // First, load from cache
    groupsList.forEach(group => {
      const cachedMessages = cache.getMessages(group.group_id);
      if (cachedMessages) {
        allGroupMessages[group.group_id] = cachedMessages;
      }
    });
    
    console.log(`📋 [Groups] Loaded ${Object.keys(allGroupMessages).length} groups from cache`);
    setGroupMessages(allGroupMessages);
    
    // Then fetch fresh data for groups without cache or update existing
    const groupsToFetch = groupsList.filter(group => 
      !allGroupMessages[group.group_id] || allGroupMessages[group.group_id].length === 0
    );
    
    if (groupsToFetch.length === 0) {
      console.log('✅ [Groups] All messages already cached');
      setLoadingAllMessages(false);
      setInitialLoadComplete(true);
      return allGroupMessages;
    }
    
    // Process groups in batches to avoid overwhelming the server
    const batchSize = 3;
    for (let i = 0; i < groupsToFetch.length; i += batchSize) {
      const batch = groupsToFetch.slice(i, i + batchSize);
      console.log(`📦 [Groups] Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(groupsToFetch.length/batchSize)}`);
      
      const batchPromises = batch.map(async (group, batchIndex) => {
        const globalIndex = i + batchIndex;
        console.log(`📨 [Groups] Loading messages for ${group.name} (${globalIndex + 1}/${groupsToFetch.length})`);
        
        try {
          const messages = await fetchMessagesForGroup(group.group_id, group.name);
          setLoadingProgress({ current: globalIndex + 1, total: groupsToFetch.length });
          return { groupId: group.group_id, messages, groupName: group.name };
        } catch (error) {
          console.error(`❌ [Groups] Failed to load messages for ${group.name}:`, error);
          return { groupId: group.group_id, messages: [], groupName: group.name };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      
      batchResults.forEach(({ groupId, messages, groupName }) => {
        allGroupMessages[groupId] = messages;
        console.log(`✅ [Groups] Cached ${messages.length} messages for ${groupName}`);
      });

      // Update state with latest data
      setGroupMessages({ ...allGroupMessages });

      // Small delay between batches to avoid overwhelming the server
      if (i + batchSize < groupsToFetch.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    setLoadingAllMessages(false);
    setInitialLoadComplete(true);
    
    const totalMessages = Object.values(allGroupMessages).reduce((total, msgs) => total + msgs.length, 0);
    console.log('✅ [Groups] ============ ALL MESSAGES LOADED ============');
    console.log('✅ [Groups] Total groups processed:', Object.keys(allGroupMessages).length);
    console.log('✅ [Groups] Total messages loaded:', totalMessages);
    
    return allGroupMessages;
  };

  // Handle group selection
  const handleGroupSelect = (group) => {
    console.log('🎯 [Groups] Group selected:', group.name, '(' + group.group_id + ')');
    
    // Save scroll position of current group before switching
    if (selectedGroup) {
      saveScrollPosition();
    }
    
    setSelectedGroup(group);
    
    // Load messages from cache immediately
    const cachedMessages = groupMessages[group.group_id] || [];
    console.log('📋 [Groups] Loading', cachedMessages.length, 'cached messages for', group.name);
    setMessages(cachedMessages);
    
    // Check for unread messages and set auto-scroll flag
    if (currentUser) {
      const firstUnread = cache.getFirstUnreadMessage(group.group_id, currentUser.id);
      if (firstUnread) {
        console.log('📬 [Groups] Found unread messages, will auto-scroll to first unread');
        setAutoScrollToUnread(true);
      }
    }
    
    // Update last activity
    cache.updateLastActivity(group.group_id);
    
    if (isMobile) {
      setShowChatList(false);
      setShowGroupInfo(false);
    }
  };

  // Handle back to chat list (mobile)
  const handleBackToChatList = () => {
    // Save current scroll position before leaving
    if (selectedGroup) {
      saveScrollPosition();
    }
    
    setShowChatList(true);
    setSelectedGroup(null);
    setShowGroupInfo(false);
  };

  // Handle group updated
  const handleGroupUpdated = () => {
    fetchGroups();
  };

  // Handle group deleted
  const handleGroupDeleted = () => {
    fetchGroups();
    setSelectedGroup(null);
    if (isMobile) {
      setShowChatList(true);
    }
  };

  // Handle typing indicator
  const handleTyping = () => {
    if (!isTyping && selectedGroup) {
      setIsTyping(true);
      sendMessage({
        type: 'START_TYPING',
        fromUserId: currentUser?.id,
        conversationId: selectedGroup.group_id
      });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (selectedGroup) {
        sendMessage({
          type: 'STOP_TYPING',
          fromUserId: currentUser?.id,
          conversationId: selectedGroup.group_id
        });
      }
    }, 3000);
  };

  // Handle message context menu
  const handleMessageContextMenu = (e, message) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    setContextMenu({
      isOpen: true,
      position: {
        x: e.clientX || rect.left + rect.width / 2,
        y: e.clientY || rect.top
      },
      message
    });
  };

  // Handle edit message
  const handleEditMessage = (message) => {
    setEditingMessage(message);
    setNewMessage(message.text);
  };

  // Handle delete message
  const handleDeleteMessage = (message) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      sendMessage({
        type: 'DELETE_MESSAGE',
        messageId: message.messageId,
        conversationId: selectedGroup.group_id,
        fromUserId: currentUser?.id
      });
    }
  };

  // Handle copy message
  const handleCopyMessage = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Message copied to clipboard');
  };

  // Handle reply to message
  const handleReplyMessage = (message) => {
    setNewMessage(`@${message.senderUserName} `);
  };

  // Handle file selection
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 30 * 1024 * 1024) {
        toast.error('File size cannot exceed 30MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Upload file for messages
  const uploadFile = async (file) => {
    try {
      setUploadingFile(true);
      setUploadProgress(0);
      
      let fileType = 'STATUS_POST';
      if (file.type.startsWith('image/')) {
        fileType = 'STATUS_POST';
      } else if (file.type.startsWith('video/')) {
        fileType = 'VIDEO';
      }

      const formData = new FormData();
      formData.append('file_type', fileType);
      formData.append('content', file);

      console.log('📤 [Groups] Uploading file:', file.name, 'Type:', fileType);

      const uploadResponse = await upload('media/uploadFile', formData, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });
      
      console.log('✅ [Groups] Upload response:', uploadResponse);

      if (uploadResponse?.status === 200 && uploadResponse?.data) {
        let mediaUrl = null;
        
        if (Array.isArray(uploadResponse.data)) {
          mediaUrl = uploadResponse.data[0]?.file_url || uploadResponse.data[0]?.url;
        } else if (uploadResponse.data.url) {
          mediaUrl = uploadResponse.data.url;
        } else if (uploadResponse.data.file_url) {
          mediaUrl = uploadResponse.data.file_url;
        }

        if (!mediaUrl) {
          throw new Error('No URL returned from upload');
        }

        return {
          media_url: mediaUrl,
          media_type: file.type.startsWith('image/') ? 'IMAGE' : file.type.startsWith('video/') ? 'VIDEO' : 'FILE',
          mime_type: file.type,
          size: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
          filename: file.name
        };
      } else {
        throw new Error('Upload failed - invalid response');
      }
    } catch (error) {
      console.error('❌ [Groups] File upload error:', error);
      throw error;
    } finally {
      setUploadingFile(false);
      setUploadProgress(0);
    }
  };

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || !selectedGroup) return;

    if (selectedFile && !newMessage.trim()) {
      toast.error('Please add a message with the file');
      return;
    }

    const conversationId = selectedGroup.group_id;
    const tempId = `temp_${Date.now()}_${Math.random()}`;
    
    let mediaData = null;
    
    if (selectedFile) {
      try {
        mediaData = await uploadFile(selectedFile);
      } catch (error) {
        toast.error('Failed to upload file');
        console.error('❌ [Groups] Upload error:', error);
        return;
      }
    }

    const tempMessage = {
      messageId: tempId,
      text: newMessage,
      senderUserName: currentUser?.name || 'You',
      senderId: currentUser?.id,
      timestamp: new Date().toISOString(),
      status: 'SENDING',
      conversationId: conversationId,
      receiverId: selectedGroup.group_id,
      media: mediaData
    };

    const updatedMessages = [...messages, tempMessage];
    setMessages(updatedMessages);
    
    // Update cache and state
    setGroupMessages(prev => {
      const newGroupMessages = { ...prev, [selectedGroup.group_id]: updatedMessages };
      cache.setMessages(selectedGroup.group_id, updatedMessages);
      return newGroupMessages;
    });

    const messageText = newMessage;
    setNewMessage('');
    removeSelectedFile();
    setEditingMessage(null);

    // Stop typing indicator
    if (isTyping) {
      setIsTyping(false);
      sendMessage({
        type: 'STOP_TYPING',
        fromUserId: currentUser?.id,
        conversationId: selectedGroup.group_id
      });
    }

    // Auto-scroll to new message
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    try {
      const messagePayload = {
        conversationId: conversationId,
        text: messageText,
        receiverId: selectedGroup.group_id
      };

      if (mediaData) {
        messagePayload.media = mediaData;
      }

      if (editingMessage) {
        messagePayload.messageId = editingMessage.messageId;
      }

      console.log('📤 [Groups] Sending message:', messagePayload);
      const response = await post(editingMessage ? 'chat/editMessage' : 'chat/sendMessage', messagePayload);

      if (response?.data) {
        const realMessage = {
          messageId: response.data.messageId,
          text: response.data.text,
          senderUserName: response.data.senderUserName,
          senderId: response.data.senderId,
          timestamp: response.data.timestamp,
          status: response.data.status,
          conversationId: response.data.conversationId,
          receiverId: response.data.receiverId,
          media: response.data.media
        };

        const messageIndex = updatedMessages.findIndex(msg => msg.messageId === tempId);
        if (messageIndex !== -1) {
          updatedMessages[messageIndex] = realMessage;
        } else {
          updatedMessages.push(realMessage);
        }

        setMessages([...updatedMessages]);
        setGroupMessages(prev => {
          const newGroupMessages = { ...prev, [selectedGroup.group_id]: [...updatedMessages] };
          cache.setMessages(selectedGroup.group_id, [...updatedMessages]);
          return newGroupMessages;
        });

        console.log('✅ [Groups] Message sent successfully:', realMessage.messageId);

        // Update last activity
        cache.updateLastActivity(selectedGroup.group_id);

        // Send WebSocket notification
        sendMessage({
          type: editingMessage ? 'MESSAGE_EDITED' : 'MESSAGE_SENT',
          message: realMessage,
          fromUserId: currentUser?.id,
          conversationId: conversationId
        });
      }
    } catch (error) {
      console.error('❌ [Groups] Failed to send message:', error);
      toast.error('Failed to send message');
      
      const filteredMessages = updatedMessages.filter(msg => msg.messageId !== tempId);
      setMessages(filteredMessages);
      setGroupMessages(prev => {
        const newGroupMessages = { ...prev, [selectedGroup.group_id]: filteredMessages };
        cache.setMessages(selectedGroup.group_id, filteredMessages);
        return newGroupMessages;
      });
      setNewMessage(messageText);
    }
  };

  // Filter groups
  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get last message
  const getLastMessage = (groupId) => {
    const messages = groupMessages[groupId];
    if (!messages || messages.length === 0) return null;
    return messages[messages.length - 1];
  };

  // Get typing indicator for group
  const getTypingIndicator = (groupId) => {
    const typing = typingUsers[groupId];
    if (!typing || typing.length === 0) return null;
    
    const typingNames = typing
      .filter(userId => userId !== currentUser?.id)
      .map(userId => `User ${userId}`)
      .slice(0, 3);
    
    if (typingNames.length === 0) return null;
    
    if (typingNames.length === 1) {
      return `${typingNames[0]} is typing...`;
    } else if (typingNames.length === 2) {
      return `${typingNames[0]} and ${typingNames[1]} are typing...`;
    } else {
      return `${typingNames[0]}, ${typingNames[1]} and ${typingNames.length - 2} others are typing...`;
    }
  };

  // Enhanced render messages with read status tracking
  const renderMessages = () => {
    if (!messages.length) return null;

    const renderedMessages = [];
    const typingIndicator = getTypingIndicator(selectedGroup?.group_id);
    const messageStatuses = selectedGroup ? cache.getMessageStatus(selectedGroup.group_id) : {};

    messages.forEach((message, index) => {
      const previousMessage = index > 0 ? messages[index - 1] : null;
      const isOwn = message.senderId === currentUser?.id;
      const messageStatus = messageStatuses[message.messageId];
      const isUnread = !isOwn && (!messageStatus || !messageStatus.isRead);
      
      if (needsDateSeparator(message, previousMessage)) {
        renderedMessages.push(
          <DateSeparator key={`date-${message.timestamp}`} timestamp={message.timestamp} />
        );
      }

      const shouldGroup = shouldGroupMessages(message, previousMessage);
      const showAvatar = !shouldGroup;
      const showSenderName = !isOwn && !shouldGroup;

      renderedMessages.push(
        <div 
          key={message.messageId}
          data-message-id={message.messageId}
          className={cn(
            "relative",
            isUnread && "bg-blue-50/30 border-l-2 border-l-blue-400 pl-2 rounded-r-lg"
          )}
        >
          {isUnread && (
            <div className="absolute -left-6 top-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
          )}
          <ChatMessage
            message={message}
            isOwn={isOwn}
            showAvatar={showAvatar}
            showSenderName={showSenderName}
            currentUser={currentUser}
            onContextMenu={handleMessageContextMenu}
          />
        </div>
      );
    });

    // Add typing indicator
    if (typingIndicator) {
      renderedMessages.push(
        <div key="typing-indicator" className="flex items-center gap-2 mb-2 px-2">
          <div className="w-6 flex-shrink-0"></div>
          <div className="bg-white rounded-2xl px-3 py-2 shadow-sm border border-primary/20">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-secondary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-secondary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-secondary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span className="text-xs text-secondary/70">{typingIndicator}</span>
            </div>
          </div>
        </div>
      );
    }

    return renderedMessages;
  };

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      console.log('🚀 [Groups] ============ INITIALIZING GROUPS APP ============');
      console.log('🚀 [Groups] Timestamp:', new Date().toISOString());
      setLoading(true);
      
      try {
        // Step 1: Fetch user profile (required for WebSocket and state restoration)
        console.log('👤 [Groups] Step 1: Loading user profile...');
        const user = await fetchUserProfile();
        if (!user) {
          throw new Error('Failed to load user profile');
        }
        
        // Step 2: Restore app state first (this might set selected group)
        console.log('📱 [Groups] Step 2: Restoring app state...');
        await restoreAppState();
        
        // Step 3: Fetch all groups
        console.log('📂 [Groups] Step 3: Loading groups...');
        const groupsList = await fetchGroups();
        if (!groupsList || groupsList.length === 0) {
          console.log('ℹ️ [Groups] No groups found, initialization complete');
          setInitialLoadComplete(true);
          return;
        }
        
        // Step 4: Load ALL messages for ALL groups
        console.log('📨 [Groups] Step 4: Loading all conversations...');
        await loadAllGroupMessages(groupsList);
        
        console.log('✅ [Groups] ============ INITIALIZATION COMPLETE ============');
        
      } catch (error) {
        console.error('❌ [Groups] Initialization failed:', error);
        toast.error('Failed to initialize groups: ' + error.message);
        setInitialLoadComplete(true);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Cleanup and state saving on unmount
  useEffect(() => {
    return () => {
      console.log('🧹 [Groups] Component unmounting, saving final state...');
      
      // Save current scroll position
      if (selectedGroup) {
        saveScrollPosition();
      }
      
      // Save app state
      if (stateRestored) {
        saveAppState();
      }
      
      // Clear timeouts
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      if (stateUpdateTimeoutRef.current) clearTimeout(stateUpdateTimeoutRef.current);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      
      console.log('✅ [Groups] Cleanup completed');
    };
  }, [selectedGroup, stateRestored, saveScrollPosition, saveAppState]);

  // Loading screen
  if (loading) {
    return (
      <div className="h-[calc(100vh-112px)] flex bg-primary-scale-50 border-2 border-primary/20 rounded-2xl">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full animate-pulse mx-auto mb-4"></div>
            <div className="h-6 bg-primary/20 rounded w-48 animate-pulse mb-2 mx-auto"></div>
            <div className="h-4 bg-primary/20 rounded w-32 animate-pulse mx-auto mb-4"></div>
            
            {loadingGroups && (
              <p className="text-xs text-secondary/60 mb-2">Loading groups...</p>
            )}
            
            {loadingAllMessages && (
              <div className="mt-4">
                <p className="text-xs text-secondary/60 mb-2">
                  Loading conversations ({loadingProgress.current}/{loadingProgress.total})
                </p>
                <div className="w-48 bg-primary/20 rounded-full h-2 mx-auto">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(loadingProgress.current / loadingProgress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}
            
            {!loadingGroups && !loadingAllMessages && (
              <p className="text-xs text-secondary/60">Restoring your session...</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-112px)] flex bg-primary-scale-50 relative rounded-2xl border-2 border-primary/20">
      {/* Chat List - Left Sidebar or Mobile Full Screen */}
      <div className={cn(
        "bg-white border-r border-primary/20 flex flex-col transition-all duration-300 rounded-l-2xl",
        isMobile 
          ? (showChatList ? "w-full" : "hidden") 
          : (showGroupInfo ? "w-80" : "w-80")
      )}>
        {/* Header */}
        <div className="p-4 bg-gradient-primary-soft text-secondary border-b border-primary/20 rounded-tl-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold">Social Gems Chat</h1>
              <ConnectionStatus status={connectionStatus} isConnected={isConnected} />
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowCreateGroup(true)}
                className="p-2 hover:bg-secondary/10 rounded-full transition-colors"
              >
                <FiPlus className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-secondary/10 rounded-full transition-colors">
                <FiMoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary/60 w-4 h-4" />
            <input
              type="text"
              placeholder="Search groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-secondary/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-xs text-secondary placeholder-secondary/60"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {filteredGroups.length > 0 ? (
            filteredGroups.map((group) => {
              const unreadCount = unreadCounts[group.group_id] || 0;
              return (
                <div key={group.group_id} className="relative">
                  <ChatListItem
                    group={group}
                    isActive={selectedGroup?.group_id === group.group_id}
                    onClick={handleGroupSelect}
                    lastMessage={getLastMessage(group.group_id)}
                    isLoadingMessages={false}
                  />
                  {unreadCount > 0 && (
                    <div className="absolute top-2 right-4">
                      <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-4 text-center text-secondary/60">
              <FiMessageCircle className="w-12 h-12 mx-auto mb-4 text-secondary/30" />
              <p className="text-xs">No groups found</p>
            </div>
          )}
        </div>

        {/* Status info */}
        <div className="p-3 border-t border-primary/20 bg-primary/5 rounded-bl-2xl">
          <p className="text-xs text-secondary/60 text-center">
            {groups.length} groups • {selectedGroup ? `${messages.length} messages` : 'Select a group to chat'}
          </p>
          {!initialLoadComplete && (
            <p className="text-xs text-primary text-center mt-1">
              Loading conversations... ({loadingProgress.current}/{loadingProgress.total})
            </p>
          )}
          {initialLoadComplete && stateRestored && (
            <div className="flex items-center justify-center gap-1 mt-1">
              <FiBookmark className="w-3 h-3 text-green-600" />
              <p className="text-xs text-green-600 text-center">
                Session restored
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Interface - Center */}
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300 bg-white",
        isMobile && showChatList ? "hidden" : "flex"
      )}>
        {selectedGroup ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-gradient-primary-soft text-secondary flex items-center justify-between border-b border-primary/20">
              <div className="flex items-center gap-3">
                {isMobile && (
                  <button
                    onClick={handleBackToChatList}
                    className="p-2 hover:bg-secondary/10 rounded-full transition-colors mr-2"
                  >
                    <FiArrowLeft className="w-4 h-4" />
                  </button>
                )}
                <div
                  className="w-8 h-8 rounded-full bg-cover bg-center border border-primary/30 cursor-pointer"
                  style={{
                    backgroundImage: selectedGroup.icon_image_url 
                      ? `url(${selectedGroup.icon_image_url})` 
                      : 'linear-gradient(135deg, #F9D769 0%, #E8C547 100%)'
                  }}
                  onClick={() => setShowGroupInfo(true)}
                >
                  {!selectedGroup.icon_image_url && (
                    <div className="w-full h-full flex items-center justify-center rounded-full text-secondary text-xs font-bold">
                      {selectedGroup.name?.charAt(0)?.toUpperCase() || 'G'}
                    </div>
                  )}
                </div>
                <div onClick={() => setShowGroupInfo(true)} className="cursor-pointer">
                  <h2 className="text-xs font-semibold">{selectedGroup.name}</h2>
                  <p className="text-xs text-secondary/80">
                    {selectedGroup.members} members • Click for group info
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Mark all as read button */}
                {currentUser && unreadCounts[selectedGroup.group_id] > 0 && (
                  <button
                    onClick={() => {
                      cache.markAllMessagesAsRead(selectedGroup.group_id, currentUser.id);
                      calculateUnreadCounts();
                      toast.success('All messages marked as read');
                    }}
                    className="p-2 hover:bg-secondary/10 rounded-full transition-colors"
                    title="Mark all as read"
                  >
                    <FiCheck className="w-4 h-4" />
                  </button>
                )}
                
                <button 
                  onClick={() => setShowGroupInfo(true)}
                  className="p-2 hover:bg-secondary/10 rounded-full transition-colors"
                >
                  <FiInfo className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div 
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-4 bg-white scrollbar-hide"
              onScroll={handleScroll}
            >
              {messagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : messages.length > 0 || getTypingIndicator(selectedGroup?.group_id) ? (
                <>
                  {renderMessages()}
                  <div ref={messagesEndRef} />
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-secondary/60">
                  <div className="text-center">
                    <IoChatbubblesSharp className="w-16 h-16 mx-auto mb-4 text-secondary/30" />
                    <p className="text-sm mb-2">No messages here yet...</p>
                    <p className="text-xs">Send a message to start the conversation</p>
                  </div>
                </div>
              )}
            </div>

            {/* Upload Progress */}
            {uploadingFile && (
              <UploadProgress
                fileName={selectedFile?.name || 'File'}
                progress={uploadProgress}
                onCancel={() => {
                  setUploadingFile(false);
                  removeSelectedFile();
                }}
              />
            )}

            {/* Selected File Preview */}
            {selectedFile && !uploadingFile && (
              <div className="px-4 py-2 border-t border-primary/10 bg-primary/5">
                <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-primary/20">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    {selectedFile.type.startsWith('image/') ? (
                      <FiImage className="w-4 h-4 text-secondary" />
                    ) : (
                      <FiFile className="w-4 h-4 text-secondary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate text-secondary">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-secondary/60">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={removeSelectedFile}
                    className="p-1 hover:bg-secondary/10 rounded-full transition-colors"
                  >
                    <FiX className="w-3 h-3 text-secondary" />
                  </button>
                </div>
              </div>
            )}

            {/* Edit Message Indicator */}
            {editingMessage && (
              <div className="px-4 py-2 border-t border-primary/10 bg-yellow-50">
                <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-yellow/20">
                  <div className="flex items-center gap-2">
                    <FiEdit className="w-4 h-4 text-yellow-600" />
                    <span className="text-xs text-secondary">Editing message</span>
                  </div>
                  <button
                    onClick={() => {
                      setEditingMessage(null);
                      setNewMessage('');
                    }}
                    className="p-1 hover:bg-secondary/10 rounded-full transition-colors"
                  >
                    <FiX className="w-3 h-3 text-secondary" />
                  </button>
                </div>
              </div>
            )}

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-primary/20">
              <form onSubmit={handleSendMessage} className="flex items-end gap-3">
                {/* File attachment button */}
                <button
                  type="button"
                  onClick={handleFileSelect}
                  disabled={uploadingFile}
                  className="p-3 text-secondary/60 hover:text-secondary hover:bg-secondary/10 rounded-full transition-all duration-200"
                >
                  <FiPaperclip className="w-4 h-4" />
                </button>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*,video/*,.pdf,.docx,.doc,.txt"
                />

                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    placeholder={editingMessage ? "Edit your message..." : "Type a message..."}
                    className="w-full pl-4 pr-12 py-3 bg-white border border-primary/30 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-xs text-secondary placeholder-secondary/60"
                    maxLength={1000}
                    disabled={uploadingFile}
                  />
                  
                  {/* Send button inside input */}
                  <button
                    type="submit"
                    disabled={(!newMessage.trim() && !selectedFile) || uploadingFile}
                    className={cn(
                      "absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-all duration-200",
                      (newMessage.trim() || selectedFile) && !uploadingFile
                        ? "bg-secondary text-white hover:shadow-lg"
                        : "bg-secondary/20 text-secondary/40 cursor-not-allowed"
                    )}
                  >
                    {uploadingFile ? (
                      <FiLoader className="w-4 h-4 animate-spin" />
                    ) : (
                      <IoSend className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-primary-soft rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
                <IoChatbubblesSharp className="w-10 h-10 text-secondary" />
              </div>
              <h3 className="text-lg font-bold text-secondary mb-2">
                Social Gems Chat
              </h3>
              <p className="text-xs text-secondary/70 max-w-md">
                Connect with your team and collaborate seamlessly.<br />
                {stateRestored ? 'Welcome back! Your session has been restored.' : 'Select a group from the sidebar to start chatting.'}
              </p>
              {!isConnected && (
                <div className="mt-4 p-3 bg-red-50 rounded-xl border border-red-200">
                  <p className="text-xs text-red-600">
                    <FiWifiOff className="w-4 h-4 inline mr-2" />
                    Realtime messaging unavailable - check your connection
                  </p>
                  <p className="text-xs text-red-500 mt-1">
                    WebSocket Status: {connectionStatus}
                  </p>
                  <div className="mt-2 text-xs text-red-500">
                    <p>Debug Info:</p>
                    <p>• Check if WebSocket server is running on localhost:3005</p>
                    <p>• Check console for detailed connection logs</p>
                    <p>• Verify authentication token is available</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Group Info Drawer/Sidebar */}
      <GroupInfoDrawer
        isOpen={showGroupInfo}
        onClose={() => setShowGroupInfo(false)}
        group={selectedGroup}
        currentUser={currentUser}
        onGroupUpdated={handleGroupUpdated}
        onGroupDeleted={handleGroupDeleted}
      />

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        onCreateGroup={fetchGroups}
      />

      {/* Message Context Menu */}
      <MessageContextMenu
        isOpen={contextMenu.isOpen}
        onClose={() => setContextMenu({ ...contextMenu, isOpen: false })}
        position={contextMenu.position}
        message={contextMenu.message}
        isOwn={contextMenu.message?.senderId === currentUser?.id}
        onEdit={handleEditMessage}
        onDelete={handleDeleteMessage}
        onCopy={handleCopyMessage}
        onReply={handleReplyMessage}
      />
    </div>
  );
};

// Main Groups Component wrapped with WebSocket Provider
const Groups = () => {
  return (
    <WebSocketProvider>
      <GroupsWithWebSocket />
    </WebSocketProvider>
  );
};

export default Groups;