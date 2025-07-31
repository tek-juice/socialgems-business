import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  FiAlertCircle,
  FiTrash2
} from 'react-icons/fi';
import { IoSend, IoChatbubblesSharp } from "react-icons/io5";
import { get, post, upload } from '../utils/service';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

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

// WhatsApp-style Deleted Message Component with remove functionality
const DeletedMessage = ({ message, isOwn, showAvatar, showSenderName, currentUser, onRemoveDeleted }) => {
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const [showRemoveMenu, setShowRemoveMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const longPressTimerRef = useRef(null);
  const touchStartRef = useRef({ x: 0, y: 0 });

  const senderName = message.senderUserName || 'Someone';
  const deletedText = isOwn ? 'You deleted this message' : `${senderName} deleted this message`;

  const handleTouchStart = (e) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
    
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    setLongPressTriggered(false);
    
    longPressTimerRef.current = setTimeout(() => {
      setLongPressTriggered(true);
      setMenuPosition({ x: touch.clientX, y: touch.clientY });
      setShowRemoveMenu(true);
    }, 500);
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
    const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
    
    if (deltaX > 10 || deltaY > 10) {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    setMenuPosition({ x: e.clientX, y: e.clientY });
    setShowRemoveMenu(true);
  };

  const handleRemoveForever = () => {
    onRemoveDeleted(message.messageId);
    setShowRemoveMenu(false);
    toast.success('Deleted message removed');
  };

  useEffect(() => {
    const handleClickOutside = () => setShowRemoveMenu(false);
    if (showRemoveMenu) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showRemoveMenu]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "flex gap-2 mb-1 relative",
          isOwn ? "flex-row-reverse" : "flex-row",
          longPressTriggered && "ring-2 ring-red-300"
        )}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onContextMenu={handleContextMenu}
      >
        {showAvatar && !isOwn && (
          <div 
            className="w-6 h-6 rounded-full bg-gradient-primary-soft flex items-center justify-center text-secondary text-xs font-bold flex-shrink-0 mt-auto border border-primary/20"
          >
            {message.senderUserName?.charAt(0)?.toUpperCase() || message.senderId?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        )}
        
        {!showAvatar && !isOwn && (
          <div className="w-6 flex-shrink-0"></div>
        )}

        <div className={cn(
          "max-w-xs lg:max-w-md",
          isOwn ? "items-end" : "items-start"
        )}>
          {showSenderName && !isOwn && (
            <div className="mb-1 ml-2">
              <span className="text-xs font-normal text-black">
                {message.senderUserName || 'Unknown User'}
              </span>
            </div>
          )}

          <div className={cn(
            "p-3 rounded-2xl relative shadow-sm border cursor-pointer",
            isOwn 
              ? "bg-gray-100 text-gray-500 rounded-br-md border-gray-200" 
              : "bg-gray-50 text-gray-500 rounded-bl-md border-gray-200"
          )}>
            <div className="flex items-center gap-2">
              <FiAlertCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div className="flex items-end justify-between gap-5 flex-1">
                <span className="text-xs font-normal italic">{deletedText}</span>
                <div className={cn(
                  "flex items-center gap-1 justify-end text-gray-400"
                )}>
                  <span className="text-[10px]">{formatTimeOnly(message.timestamp)}</span>
                  {isOwn && (
                    <div className="ml-0.5">
                      <FiCheck className="w-2.5 h-2.5" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Remove menu */}
      {showRemoveMenu && (
        <div 
          className="fixed bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-[100]"
          style={{ 
            left: Math.min(menuPosition.x, window.innerWidth - 200), 
            top: Math.min(menuPosition.y, window.innerHeight - 100)
          }}
        >
          <button
            onClick={handleRemoveForever}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <FiTrash2 className="w-4 h-4" />
            Remove deleted message
          </button>
        </div>
      )}
    </>
  );
};

const GroupsWithWebSocket = () => {
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
  
  const [groupMessagesMap, setGroupMessagesMap] = useState(new Map());
  const [lastMessages, setLastMessages] = useState(new Map());
  const [loadingGroupMessages, setLoadingGroupMessages] = useState(new Set());
  const [hiddenDeletedMessages, setHiddenDeletedMessages] = useState(new Set());
  
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const queryClient = useQueryClient();

  const { isConnected, connectionStatus, typingUsers, sendMessage, addMessageListener } = useWebSocket();

  // Load persisted state on mount
  useEffect(() => {
    const loadPersistedState = () => {
      try {
        // Load selected group
        const cachedSelectedGroup = localStorage.getItem('socialGems_selectedGroup');
        if (cachedSelectedGroup) {
          const group = JSON.parse(cachedSelectedGroup);
          setSelectedGroup(group);
        }

        // Load show chat list state
        const cachedShowChatList = localStorage.getItem('socialGems_showChatList');
        if (cachedShowChatList !== null) {
          setShowChatList(JSON.parse(cachedShowChatList));
        }

        // Load hidden deleted messages
        const cachedHiddenDeleted = localStorage.getItem('socialGems_hiddenDeletedMessages');
        if (cachedHiddenDeleted) {
          const hiddenSet = new Set(JSON.parse(cachedHiddenDeleted));
          setHiddenDeletedMessages(hiddenSet);
        }

        console.log('🔄 [Cache] Persisted state loaded from localStorage');
      } catch (error) {
        console.error('Error loading persisted state:', error);
      }
    };

    loadPersistedState();
  }, []);

  // Persist state changes
  useEffect(() => {
    if (selectedGroup) {
      localStorage.setItem('socialGems_selectedGroup', JSON.stringify(selectedGroup));
    } else {
      localStorage.removeItem('socialGems_selectedGroup');
    }
  }, [selectedGroup]);

  useEffect(() => {
    localStorage.setItem('socialGems_showChatList', JSON.stringify(showChatList));
  }, [showChatList]);

  useEffect(() => {
    if (hiddenDeletedMessages.size > 0) {
      localStorage.setItem('socialGems_hiddenDeletedMessages', JSON.stringify([...hiddenDeletedMessages]));
    }
  }, [hiddenDeletedMessages]);

  // TanStack Query for user profile with persistence
  const { data: userData } = useQuery({
    queryKey: ['socialGems_userProfile'],
    queryFn: async () => {
      const response = await get('users/getUserProfile');
      if (response?.data) {
        return { 
          id: response.data.user_id,
          name: `${response.data.first_name} ${response.data.last_name}`,
          avatar: response.data.profile_pic,
          email: response.data.email
        };
      }
      throw new Error('Failed to fetch user profile');
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 2,
    onSuccess: (data) => {
      setCurrentUser(data);
    }
  });

  // TanStack Query for groups with persistence and background refresh
  const { data: backgroundGroups } = useQuery({
    queryKey: ['socialGems_groups'],
    queryFn: async () => {
      const response = await get('groups/myGroups');
      if (response?.data && Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    },
    enabled: !!userData,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 60 * 60 * 1000, // 1 hour cache time
    refetchInterval: 30 * 1000, // Background refresh every 30 seconds
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 2,
    onSuccess: (data) => {
      if (data && data.length > 0) {
        const currentGroupIds = groups.map(g => g.group_id).sort().join(',');
        const newGroupIds = data.map(g => g.group_id).sort().join(',');
        
        if (currentGroupIds !== newGroupIds) {
          console.log('🔄 [TanStack] Groups updated via background refresh');
          setGroups(data);
          
          // Load messages for any new groups
          const newGroups = data.filter(newGroup => 
            !groups.find(existingGroup => existingGroup.group_id === newGroup.group_id)
          );
          if (newGroups.length > 0) {
            newGroups.forEach(group => fetchMessagesForGroup(group.group_id, group.name));
          }
        }
      }
    }
  });

  // TanStack Query for messages with persistence and background refresh
  const { data: backgroundMessageRefresh } = useQuery({
    queryKey: ['socialGems_messages', groups.map(g => g.group_id).join(',')],
    queryFn: async () => {
      if (!groups || groups.length === 0) return null;
      
      console.log('🔄 [TanStack] Background message refresh...');
      
      const refreshPromises = groups.map(async (group) => {
        try {
          const response = await get(`chat/getChats/${group.group_id}`);
          
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
            
            // Check if messages have changed
            const existingMessages = groupMessagesMap.get(group.group_id) || [];
            const existingIds = existingMessages.map(m => m.messageId).join(',');
            const newIds = sortedMessages.map(m => m.messageId).join(',');
            
            if (existingIds !== newIds) {
              console.log(`📨 [TanStack] Messages updated for group ${group.group_id}`);
              
              // Update messages map
              setGroupMessagesMap(prevMap => {
                const newMap = new Map(prevMap);
                newMap.set(group.group_id, sortedMessages);
                return newMap;
              });
              
              // Update last messages
              const lastMessage = sortedMessages[sortedMessages.length - 1];
              if (lastMessage) {
                setLastMessages(prevMap => {
                  const newMap = new Map(prevMap);
                  newMap.set(group.group_id, lastMessage);
                  return newMap;
                });
              }
              
              // Update current view if this is the selected group
              if (selectedGroup?.group_id === group.group_id) {
                setMessages(sortedMessages);
                // Smart auto-scroll: only scroll if user is near bottom
                setTimeout(() => {
                  const container = messagesContainerRef.current;
                  if (container) {
                    const isNearBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 100;
                    if (isNearBottom) {
                      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }
                }, 100);
              }
            }
          }
          
          return { groupId: group.group_id, success: true };
        } catch (error) {
          console.error(`Background message refresh failed for group ${group.group_id}:`, error);
          return { groupId: group.group_id, success: false };
        }
      });
      
      await Promise.allSettled(refreshPromises);
      return Date.now();
    },
    enabled: !!groups && groups.length > 0 && !!userData,
    staleTime: 10 * 1000, // 10 seconds
    gcTime: 60 * 60 * 1000, // 1 hour cache time
    refetchInterval: 15 * 1000, // Background refresh every 15 seconds
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 1
  });

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

  const addMessageToGroup = useCallback((groupId, message) => {
    console.log('📝 [Groups] Adding message to group:', groupId, 'MessageID:', message.messageId, 'From:', message.senderId);
    
    setGroupMessagesMap(prevMap => {
      const newMap = new Map(prevMap);
      const currentMessages = newMap.get(groupId) || [];
      
      const messageExists = currentMessages.some(msg => msg.messageId === message.messageId);
      if (messageExists) {
        console.log('⚠️ [Groups] Duplicate message skipped:', message.messageId);
        return prevMap;
      }
      
      const updatedMessages = [...currentMessages, message].sort((a, b) => 
        new Date(a.timestamp) - new Date(b.timestamp)
      );
      
      newMap.set(groupId, updatedMessages);
      console.log('✅ [Groups] Message added. Total messages in group:', updatedMessages.length);
      
      return newMap;
    });
    
    setLastMessages(prevMap => {
      const newMap = new Map(prevMap);
      newMap.set(groupId, message);
      return newMap;
    });
    
    if (selectedGroup?.group_id === groupId) {
      console.log('🎯 [Groups] Updating current view for selected group');
      setMessages(prevMessages => {
        const messageExists = prevMessages.some(msg => msg.messageId === message.messageId);
        if (messageExists) {
          return prevMessages;
        }
        
        const newMessages = [...prevMessages, message].sort((a, b) => 
          new Date(a.timestamp) - new Date(b.timestamp)
        );
        
        setTimeout(() => {
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
        
        return newMessages;
      });
    }
    
    // Invalidate cache to trigger background refresh
    queryClient.invalidateQueries({ queryKey: ['socialGems_messages'] });
  }, [selectedGroup, queryClient]);

  useEffect(() => {
    if (!currentUser) return;
    
    const removeListener = addMessageListener((data) => {
      console.log('📨 [Groups] WebSocket message received:', data.type, data);
      
      const messageTypes = ['SEND_MESSAGE', 'MESSAGE_RECEIVED', 'NEW_MESSAGE', 'MESSAGE'];
      
      if (messageTypes.includes(data.type) && data.message) {
        const message = data.message;
        const groupId = message.conversationId;
        
        console.log('💬 [Groups] Processing message for group:', groupId, 'From user:', message.senderId);
        
        addMessageToGroup(groupId, message);
        
        if (message.senderId !== currentUser.id && selectedGroup?.group_id !== groupId) {
          const group = groups.find(g => g.group_id === groupId);
          toast.info(`New message in ${group?.name || 'Group'}`, {
            description: message.text?.substring(0, 50) || 'New message',
            duration: 4000
          });
        }
      }
      
      if (data.type === 'DELETE_MESSAGE' && data.messageId && data.conversationId) {
        const groupId = data.conversationId;
        console.log('🗑️ [Groups] Marking message as deleted:', data.messageId, 'from group:', groupId);
        
        // Mark message as deleted instead of removing it
        setGroupMessagesMap(prevMap => {
          const newMap = new Map(prevMap);
          const currentMessages = newMap.get(groupId) || [];
          const updatedMessages = currentMessages.map(msg => 
            msg.messageId === data.messageId 
              ? { ...msg, status: 'DELETED', deletedAt: new Date().toISOString() }
              : msg
          );
          newMap.set(groupId, updatedMessages);
          return newMap;
        });
        
        // Update last message to show as deleted
        const updatedMessages = groupMessagesMap.get(groupId) || [];
        const deletedMessage = updatedMessages.find(msg => msg.messageId === data.messageId);
        if (deletedMessage) {
          const updatedDeletedMessage = { ...deletedMessage, status: 'DELETED', text: 'This message was deleted' };
          setLastMessages(prevMap => {
            const newMap = new Map(prevMap);
            const currentLastMessage = newMap.get(groupId);
            if (currentLastMessage && currentLastMessage.messageId === data.messageId) {
              newMap.set(groupId, updatedDeletedMessage);
            }
            return newMap;
          });
        }
        
        if (selectedGroup?.group_id === groupId) {
          setMessages(prevMessages => 
            prevMessages.map(msg => 
              msg.messageId === data.messageId 
                ? { ...msg, status: 'DELETED', deletedAt: new Date().toISOString() }
                : msg
            )
          );
        }
        
        // Invalidate cache to sync changes
        queryClient.invalidateQueries({ queryKey: ['socialGems_messages'] });
      }
      
      if (data.type === 'MESSAGE_EDITED' && data.message) {
        const message = data.message;
        const groupId = message.conversationId;
        console.log('✏️ [Groups] Editing message:', message.messageId, 'in group:', groupId);
        
        setGroupMessagesMap(prevMap => {
          const newMap = new Map(prevMap);
          const currentMessages = newMap.get(groupId) || [];
          const updatedMessages = currentMessages.map(msg => 
            msg.messageId === message.messageId ? message : msg
          );
          newMap.set(groupId, updatedMessages);
          return newMap;
        });
        
        // Update last message if this was the last message
        setLastMessages(prevMap => {
          const newMap = new Map(prevMap);
          const currentLastMessage = newMap.get(groupId);
          if (currentLastMessage && currentLastMessage.messageId === message.messageId) {
            newMap.set(groupId, message);
          }
          return newMap;
        });
        
        if (selectedGroup?.group_id === groupId) {
          setMessages(prevMessages => 
            prevMessages.map(msg => 
              msg.messageId === message.messageId ? message : msg
            )
          );
        }
        
        // Invalidate cache to sync changes
        queryClient.invalidateQueries({ queryKey: ['socialGems_messages'] });
      }
    });

    return removeListener;
  }, [addMessageListener, currentUser, selectedGroup, groups, addMessageToGroup, groupMessagesMap, queryClient]);

  const fetchUserProfile = async () => {
    try {
      const response = await get('users/getUserProfile');
      if (response?.data) {
        const user = { 
          id: response.data.user_id,
          name: `${response.data.first_name} ${response.data.last_name}`,
          avatar: response.data.profile_pic,
          email: response.data.email
        };
        setCurrentUser(user);
        return user;
      }
    } catch (error) {
      return null;
    }
  };

  const fetchMessagesForGroup = async (groupId, groupName = 'Unknown') => {
    try {
      setLoadingGroupMessages(prev => new Set(prev).add(groupId));
      
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
        
        setGroupMessagesMap(prevMap => {
          const newMap = new Map(prevMap);
          newMap.set(groupId, sortedMessages);
          return newMap;
        });
        
        const lastMessage = sortedMessages[sortedMessages.length - 1];
        if (lastMessage) {
          setLastMessages(prevMap => {
            const newMap = new Map(prevMap);
            newMap.set(groupId, lastMessage);
            return newMap;
          });
        }
        
        return sortedMessages;
      } else {
        setGroupMessagesMap(prevMap => {
          const newMap = new Map(prevMap);
          newMap.set(groupId, []);
          return newMap;
        });
        return [];
      }
    } catch (error) {
      console.error(`Failed to fetch messages for group ${groupId}:`, error);
      return [];
    } finally {
      setLoadingGroupMessages(prev => {
        const newSet = new Set(prev);
        newSet.delete(groupId);
        return newSet;
      });
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await get('groups/myGroups');
      
      if (response?.data && Array.isArray(response.data)) {
        setGroups(response.data);
        
        // Load messages for all groups immediately
        const groupsData = response.data;
        console.log('📂 [Groups] Loading messages for all groups immediately...');
        
        // Fetch messages for all groups in parallel
        const messagePromises = groupsData.map(group => 
          fetchMessagesForGroup(group.group_id, group.name)
        );
        
        await Promise.allSettled(messagePromises);
        console.log('✅ [Groups] All group messages loaded');
        
        return groupsData;
      } else {
        setGroups([]);
        return [];
      }
    } catch (error) {
      toast.error('Failed to fetch groups');
      setGroups([]);
      return [];
    }
  };

  const handleGroupSelect = async (group) => {
    setSelectedGroup(group);
    
    const existingMessages = groupMessagesMap.get(group.group_id);
    if (existingMessages && existingMessages.length >= 0) {
      setMessages(existingMessages);
      
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
      }, 100);
    }
    
    if (isMobile) {
      setShowChatList(false);
      setShowGroupInfo(false);
    }
  };

  const handleBackToChatList = () => {
    setShowChatList(true);
    setSelectedGroup(null);
    setMessages([]);
    setShowGroupInfo(false);
  };

  // Close chat functionality
  const handleCloseChat = () => {
    setSelectedGroup(null);
    setMessages([]);
    setShowGroupInfo(false);
    if (isMobile) {
      setShowChatList(true);
    }
  };

  // Remove deleted message forever
  const handleRemoveDeletedMessage = (messageId) => {
    setHiddenDeletedMessages(prev => new Set(prev).add(messageId));
    
    // Remove from current messages view
    if (selectedGroup) {
      setMessages(prevMessages => prevMessages.filter(msg => msg.messageId !== messageId));
      
      // Remove from group messages map
      setGroupMessagesMap(prevMap => {
        const newMap = new Map(prevMap);
        const currentMessages = newMap.get(selectedGroup.group_id) || [];
        const filteredMessages = currentMessages.filter(msg => msg.messageId !== messageId);
        newMap.set(selectedGroup.group_id, filteredMessages);
        return newMap;
      });
      
      // Update last message if this was the last message
      const remainingMessages = groupMessagesMap.get(selectedGroup.group_id)?.filter(msg => msg.messageId !== messageId) || [];
      if (remainingMessages.length > 0) {
        const newLastMessage = remainingMessages[remainingMessages.length - 1];
        setLastMessages(prevMap => {
          const newMap = new Map(prevMap);
          newMap.set(selectedGroup.group_id, newLastMessage);
          return newMap;
        });
      } else {
        setLastMessages(prevMap => {
          const newMap = new Map(prevMap);
          newMap.delete(selectedGroup.group_id);
          return newMap;
        });
      }
    }
  };

  const handleGroupUpdated = () => {
    fetchGroups();
    // Invalidate TanStack queries to refresh background data
    queryClient.invalidateQueries({ queryKey: ['socialGems_groups'] });
  };

  const handleGroupDeleted = () => {
    fetchGroups();
    // Invalidate TanStack queries to refresh background data
    queryClient.invalidateQueries({ queryKey: ['socialGems_groups'] });
    setSelectedGroup(null);
    setMessages([]);
    if (isMobile) {
      setShowChatList(true);
    }
  };

  const handleTyping = () => {
    if (!isTyping && selectedGroup) {
      setIsTyping(true);
      sendMessage({
        type: 'TYPING',
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

  const handleMessageContextMenu = (e, message) => {
    e.preventDefault();
    
    // Don't show context menu for deleted messages
    if (message.status === 'DELETED') return;
    
    const rect = e.currentTarget?.getBoundingClientRect();
    setContextMenu({
      isOpen: true,
      position: {
        x: e.clientX || (rect ? rect.left + rect.width / 2 : 0),
        y: e.clientY || (rect ? rect.top : 0)
      },
      message
    });
  };

  const handleEditMessage = (message) => {
    setEditingMessage(message);
    setNewMessage(message.text);
    setContextMenu({ ...contextMenu, isOpen: false });
  };

  const handleDeleteMessage = async (message) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        // Call the delete API endpoint
        const response = await get(`chat/deleteMessage/${message.messageId}`, {
          body: JSON.stringify({
            conversationId: selectedGroup.group_id,
            text: message.text,
            receiverId: selectedGroup.group_id,
            media: message.media
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        });

        // Mark message as deleted locally for better UX
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.messageId === message.messageId 
              ? { ...msg, status: 'DELETED', deletedAt: new Date().toISOString() }
              : msg
          )
        );
        
        setGroupMessagesMap(prevMap => {
          const newMap = new Map(prevMap);
          const currentMessages = newMap.get(selectedGroup.group_id) || [];
          const updatedMessages = currentMessages.map(msg => 
            msg.messageId === message.messageId 
              ? { ...msg, status: 'DELETED', deletedAt: new Date().toISOString() }
              : msg
          );
          newMap.set(selectedGroup.group_id, updatedMessages);
          return newMap;
        });

        // Update last message if this was the last message
        setLastMessages(prevMap => {
          const newMap = new Map(prevMap);
          const currentLastMessage = newMap.get(selectedGroup.group_id);
          if (currentLastMessage && currentLastMessage.messageId === message.messageId) {
            newMap.set(selectedGroup.group_id, { ...message, status: 'DELETED', text: 'This message was deleted' });
          }
          return newMap;
        });

        // Broadcast delete via WebSocket
        sendMessage({
          type: 'DELETE_MESSAGE',
          messageId: message.messageId,
          conversationId: selectedGroup.group_id,
          fromUserId: currentUser?.id
        });

        toast.success('Message deleted successfully');
        
      } catch (error) {
        console.error('Failed to delete message:', error);
        toast.error('Failed to delete message');
      }
    }
    setContextMenu({ ...contextMenu, isOpen: false });
  };

  const handleCopyMessage = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Message copied to clipboard');
    setContextMenu({ ...contextMenu, isOpen: false });
  };

  const handleReplyMessage = (message) => {
    setNewMessage(`@${message.senderUserName} `);
    setContextMenu({ ...contextMenu, isOpen: false });
  };

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

      const uploadResponse = await upload('media/uploadFile', formData, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });

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
      throw error;
    } finally {
      setUploadingFile(false);
      setUploadProgress(0);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || !selectedGroup) return;

    if (selectedFile && !newMessage.trim()) {
      toast.error('Please add a message with the file');
      return;
    }

    const conversationId = selectedGroup.group_id;
    const isEditMode = editingMessage !== null;
    
    // Handle edit message with correct payload structure
    if (isEditMode) {
      try {
        const editPayload = {
          messageId: editingMessage.messageId,
          newContent: newMessage,
          userId: currentUser?.id,
          conversationId: conversationId,
          receiverId: selectedGroup.group_id,
          media: editingMessage.media
        };

        console.log('📤 [Groups] Editing message with payload:', editPayload);
        
        const response = await post(`chat/editMessage/${editingMessage.messageId}`, editPayload);

        // Update the message in local state
        const updatedMessage = {
          ...editingMessage,
          text: newMessage,
          timestamp: new Date().toISOString()
        };

        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.messageId === editingMessage.messageId ? updatedMessage : msg
          )
        );
        
        setGroupMessagesMap(prevMap => {
          const newMap = new Map(prevMap);
          const currentMessages = newMap.get(conversationId) || [];
          const updatedMessages = currentMessages.map(msg => 
            msg.messageId === editingMessage.messageId ? updatedMessage : msg
          );
          newMap.set(conversationId, updatedMessages);
          return newMap;
        });

        // Update last message if this was the last message
        setLastMessages(prevMap => {
          const newMap = new Map(prevMap);
          const currentLastMessage = newMap.get(conversationId);
          if (currentLastMessage && currentLastMessage.messageId === editingMessage.messageId) {
            newMap.set(conversationId, updatedMessage);
          }
          return newMap;
        });

        // Broadcast edit via WebSocket
        sendMessage({
          type: 'MESSAGE_EDITED',
          message: updatedMessage,
          fromUserId: currentUser?.id,
          conversationId: conversationId
        });

        setNewMessage('');
        setEditingMessage(null);
        toast.success('Message updated successfully');
        
      } catch (error) {
        console.error('Failed to edit message:', error);
        toast.error('Failed to edit message');
      }
      return;
    }

    // Handle new message
    const tempId = `temp_${Date.now()}_${Math.random()}`;
    
    let mediaData = null;
    
    if (selectedFile) {
      try {
        mediaData = await uploadFile(selectedFile);
      } catch (error) {
        toast.error('Failed to upload file');
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

    setMessages(prevMessages => [...prevMessages, tempMessage]);

    const messageText = newMessage;
    setNewMessage('');
    removeSelectedFile();

    if (isTyping) {
      setIsTyping(false);
      sendMessage({
        type: 'STOP_TYPING',
        fromUserId: currentUser?.id,
        conversationId: selectedGroup.group_id
      });
    }

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

      console.log('📤 [Groups] Sending message to API...');
      const response = await post('chat/sendMessage', messagePayload);

      if (response?.data) {
        const realMessage = {
          messageId: response.data.messageId,
          text: response.data.text,
          senderUserName: response.data.senderUserName,
          senderId: response.data.senderId,
          timestamp: response.data.timestamp,
          status: response.data.status || 'SENT',
          conversationId: response.data.conversationId,
          receiverId: response.data.receiverId,
          media: response.data.media
        };

        setMessages(prevMessages => 
          prevMessages.map(msg => msg.messageId === tempId ? realMessage : msg)
        );
        
        setGroupMessagesMap(prevMap => {
          const newMap = new Map(prevMap);
          const currentMessages = newMap.get(conversationId) || [];
          const updatedMessages = currentMessages.map(msg => 
            msg.messageId === tempId ? realMessage : msg
          );
          newMap.set(conversationId, updatedMessages);
          return newMap;
        });
        
        setLastMessages(prevMap => {
          const newMap = new Map(prevMap);
          newMap.set(conversationId, realMessage);
          return newMap;
        });

        console.log('✅ [Groups] Message sent successfully, broadcasting via WebSocket...');
        sendMessage({
          type: 'SEND_MESSAGE',
          message: realMessage,
          fromUserId: currentUser?.id,
          conversationId: conversationId
        });
      }
    } catch (error) {
      toast.error('Failed to send message');
      setMessages(prevMessages => prevMessages.filter(msg => msg.messageId !== tempId));
      setNewMessage(messageText);
    }
  };

  // Sort groups by most recent message
  const sortedGroups = [...groups].sort((a, b) => {
    const lastMessageA = lastMessages.get(a.group_id);
    const lastMessageB = lastMessages.get(b.group_id);
    
    if (!lastMessageA && !lastMessageB) return 0;
    if (!lastMessageA) return 1;
    if (!lastMessageB) return -1;
    
    return new Date(lastMessageB.timestamp) - new Date(lastMessageA.timestamp);
  });

  const filteredGroups = sortedGroups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLastMessage = (groupId) => {
    const lastMsg = lastMessages.get(groupId);
    if (lastMsg && lastMsg.status === 'DELETED') {
      return { ...lastMsg, text: 'This message was deleted' };
    }
    return lastMsg || null;
  };

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

  const renderMessages = () => {
    if (!messages.length) return null;

    const renderedMessages = [];
    const typingIndicator = getTypingIndicator(selectedGroup?.group_id);

    messages.forEach((message, index) => {
      // Skip hidden deleted messages
      if (message.status === 'DELETED' && hiddenDeletedMessages.has(message.messageId)) {
        return;
      }

      const previousMessage = index > 0 ? messages[index - 1] : null;
      const isOwn = message.senderId === currentUser?.id;
      
      if (needsDateSeparator(message, previousMessage)) {
        renderedMessages.push(
          <DateSeparator key={`date-${message.timestamp}`} timestamp={message.timestamp} />
        );
      }

      const shouldGroup = shouldGroupMessages(message, previousMessage);
      const showAvatar = !shouldGroup;
      const showSenderName = !isOwn && !shouldGroup;

      // Render deleted message or regular message based on status
      if (message.status === 'DELETED') {
        renderedMessages.push(
          <div key={message.messageId} data-message-id={message.messageId}>
            <DeletedMessage
              message={message}
              isOwn={isOwn}
              showAvatar={showAvatar}
              showSenderName={showSenderName}
              currentUser={currentUser}
              onRemoveDeleted={handleRemoveDeletedMessage}
            />
          </div>
        );
      } else {
        renderedMessages.push(
          <div key={message.messageId} data-message-id={message.messageId}>
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
      }
    });

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

  useEffect(() => {
    const initializeApp = async () => {
      setLoading(true);
      
      try {
        const user = await fetchUserProfile();
        if (!user) {
          throw new Error('Failed to load user profile');
        }
        
        await fetchGroups();
        
      } catch (error) {
        toast.error('Failed to initialize groups: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Restore messages for selected group after data loads
  useEffect(() => {
    if (selectedGroup && groupMessagesMap.has(selectedGroup.group_id)) {
      const existingMessages = groupMessagesMap.get(selectedGroup.group_id) || [];
      setMessages(existingMessages);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
      }, 100);
    }
  }, [selectedGroup, groupMessagesMap]);

  const isLoading = loading || !userData;

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-112px)] flex bg-primary-scale-50 border-2 border-primary/20 rounded-2xl">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full animate-pulse mx-auto mb-4"></div>
            <div className="h-6 bg-primary/20 rounded w-48 animate-pulse mb-2 mx-auto"></div>
            <div className="h-4 bg-primary/20 rounded w-32 animate-pulse mx-auto mb-4"></div>
            <p className="text-xs text-secondary/60">Loading groups and messages...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-112px)] flex bg-primary-scale-50 relative rounded-2xl border-2 border-primary/20">
      <div className={cn(
        "bg-white border-r border-primary/20 flex flex-col transition-all duration-300 rounded-l-2xl",
        isMobile 
          ? (showChatList ? "w-full" : "hidden") 
          : "w-80"
      )}>
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

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {filteredGroups.length > 0 ? (
            filteredGroups.map((group) => (
              <ChatListItem
                key={group.group_id}
                group={group}
                isActive={selectedGroup?.group_id === group.group_id}
                onClick={handleGroupSelect}
                lastMessage={getLastMessage(group.group_id)}
                isLoadingMessages={loadingGroupMessages.has(group.group_id)}
              />
            ))
          ) : (
            <div className="p-4 text-center text-secondary/60">
              <FiMessageCircle className="w-12 h-12 mx-auto mb-4 text-secondary/30" />
              <p className="text-xs">No groups found</p>
            </div>
          )}
        </div>

        <div className="p-3 border-t border-primary/20 bg-primary/5 rounded-bl-2xl">
          <p className="text-xs text-secondary/60 text-center">
            {groups.length} groups • {selectedGroup ? `${messages.length} messages` : 'Select a group to chat'}
          </p>

          {/* Web socket connection  */}
          {/* {isConnected && (
            <div className="flex items-center justify-center gap-1 mt-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-xs text-green-600 text-center">Real-time enabled</p>
            </div>
          )} */}
        </div>
      </div>

      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300 bg-white",
        isMobile && showChatList ? "hidden" : "flex"
      )}>
        {selectedGroup ? (
          <>
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
                <button 
                  onClick={() => setShowGroupInfo(true)}
                  className="p-2 hover:bg-secondary/10 rounded-full transition-colors"
                >
                  <FiInfo className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleCloseChat}
                  className="p-2 hover:bg-red-100 text-red-600 rounded-full transition-colors"
                  title="Close Chat"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div 
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-4 bg-white scrollbar-hide"
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

            <div className="p-4 bg-white border-t border-primary/20">
              <form onSubmit={handleSendMessage} className="flex items-end gap-3">
                {/* Button for file uploads  */}
                {/* <button
                  type="button"
                  onClick={handleFileSelect}
                  disabled={uploadingFile || editingMessage}
                  className="p-3 text-secondary/60 hover:text-secondary hover:bg-secondary/10 rounded-full transition-all duration-200 disabled:opacity-50"
                >
                  <FiPaperclip className="w-4 h-4" />
                </button> */}

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
                      if (!editingMessage) {
                        handleTyping();
                      }
                    }}
                    placeholder={editingMessage ? "Edit your message..." : "Type a message..."}
                    className="w-full pl-4 pr-12 py-3 bg-white border border-primary/30 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-xs text-secondary placeholder-secondary/60"
                    maxLength={1000}
                    disabled={uploadingFile}
                  />
                  
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || uploadingFile}
                    className={cn(
                      "absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-all duration-200",
                      newMessage.trim() && !uploadingFile
                        ? "bg-secondary text-white hover:shadow-lg"
                        : "bg-secondary/20 text-secondary/40 cursor-not-allowed"
                    )}
                  >
                    {uploadingFile ? (
                      <FiLoader className="w-4 h-4 animate-spin" />
                    ) : editingMessage ? (
                      <FiCheck className="w-4 h-4" />
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
                Select a group from the sidebar to start chatting.
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
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <GroupInfoDrawer
        isOpen={showGroupInfo}
        onClose={() => setShowGroupInfo(false)}
        group={selectedGroup}
        currentUser={currentUser}
        onGroupUpdated={handleGroupUpdated}
        onGroupDeleted={handleGroupDeleted}
      />

      <CreateGroupModal
        isOpen={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        onCreateGroup={fetchGroups}
      />

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

const Groups = () => {
  return (
    <WebSocketProvider>
      <GroupsWithWebSocket />
    </WebSocketProvider>
  );
};

export default Groups;