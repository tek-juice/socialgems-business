import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMessageCircle, 
  FiTrash2, 
  FiClock,
  FiLoader,
  FiSearch,
  FiMoreHorizontal,
  FiPlus,
  FiX,
  FiSend,
  FiInfo,
  FiCheck,
  FiSettings,
  FiArrowLeft,
  FiImage,
  FiFile,
  FiDownload,
  FiUsers,
  FiCalendar,
  FiLock,
  FiGlobe,
  FiEdit3,
  FiPaperclip
} from 'react-icons/fi';
import { get, post, patch, upload } from '../utils/service'; // Added upload
import { toast } from 'sonner';
import { 
  format, 
  isToday, 
  isYesterday, 
  differenceInMinutes, 
  isSameDay,
  parseISO 
} from 'date-fns';
import { cn } from '../lib/utils';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from './groups/Drawer';
import { IoChatbubblesSharp } from "react-icons/io5";
import { IoSend } from "react-icons/io5";

// Helper functions
const formatMessageTime = (timestamp) => {
  if (!timestamp) return '';
  const date = parseISO(timestamp);
  
  if (isToday(date)) {
    return format(date, 'HH:mm');
  } else if (isYesterday(date)) {
    return 'Yesterday';
  } else {
    return format(date, 'dd/MM/yyyy');
  }
};

const formatTimeOnly = (timestamp) => {
  if (!timestamp) return '';
  const date = parseISO(timestamp);
  return format(date, 'HH:mm');
};

const formatDateSeparator = (timestamp) => {
  if (!timestamp) return '';
  const date = parseISO(timestamp);
  
  if (isToday(date)) {
    return 'Today';
  } else if (isYesterday(date)) {
    return 'Yesterday';
  } else {
    return format(date, 'EEEE, MMMM d, yyyy');
  }
};

const needsDateSeparator = (currentMessage, previousMessage) => {
  if (!previousMessage) return true;
  
  const currentDate = parseISO(currentMessage.timestamp);
  const previousDate = parseISO(previousMessage.timestamp);
  
  return !isSameDay(currentDate, previousDate);
};

const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  return text.length <= maxLength ? text : text.substring(0, maxLength) + '...';
};

const shouldGroupMessages = (currentMessage, previousMessage) => {
  if (!previousMessage) return false;
  
  if (currentMessage.senderId !== previousMessage.senderId) return false;
  
  const currentTime = parseISO(currentMessage.timestamp);
  const previousTime = parseISO(previousMessage.timestamp);
  
  return differenceInMinutes(currentTime, previousTime) <= 5;
};

// Create Group Modal Component
const CreateGroupModal = ({ isOpen, onClose, onCreateGroup }) => {
  const [groupData, setGroupData] = useState({
    name: '',
    description: '',
    rules: '',
    membership_type: 'open',
    icon_image_url: '',
    banner_image_url: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupData.name.trim()) {
      toast.error('Group name is required');
      return;
    }

    try {
      setLoading(true);
      const response = await post('groups/createGroup', groupData);
      
      if (response?.data || response) {
        toast.success('Group created successfully');
        onCreateGroup();
        onClose();
        setGroupData({
          name: '',
          description: '',
          rules: '',
          membership_type: 'open',
          icon_image_url: '',
          banner_image_url: ''
        });
      }
    } catch (error) {
      console.error('Failed to create group:', error);
      toast.error('Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-primary/20">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-secondary">Create New Group</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary/10 rounded-full transition-colors"
            >
              <FiX className="w-4 h-4 text-secondary" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-secondary mb-2">
              Group Name *
            </label>
            <input
              type="text"
              value={groupData.name}
              onChange={(e) => setGroupData({ ...groupData, name: e.target.value })}
              className="w-full px-3 py-2 border border-primary/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-xs text-secondary"
              placeholder="Enter group name"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary mb-2">
              Description
            </label>
            <textarea
              value={groupData.description}
              onChange={(e) => setGroupData({ ...groupData, description: e.target.value })}
              className="w-full px-3 py-2 border border-primary/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-xs text-secondary resize-none"
              placeholder="Describe your group"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary mb-2">
              Group Rules
            </label>
            <textarea
              value={groupData.rules}
              onChange={(e) => setGroupData({ ...groupData, rules: e.target.value })}
              className="w-full px-3 py-2 border border-primary/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-xs text-secondary resize-none"
              placeholder="Set group rules"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary mb-2">
              Membership Type
            </label>
            <select
              value={groupData.membership_type}
              onChange={(e) => setGroupData({ ...groupData, membership_type: e.target.value })}
              className="w-full px-3 py-2 border border-primary/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-xs text-secondary"
            >
              <option value="open">Open</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 bg-secondary/10 text-secondary rounded-xl hover:bg-secondary/20 transition-colors text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !groupData.name.trim()}
              className={cn(
                "flex-1 py-2 px-4 rounded-xl transition-colors text-xs font-medium",
                loading || !groupData.name.trim()
                  ? "bg-secondary/20 text-secondary/40 cursor-not-allowed"
                  : "bg-secondary text-white hover:bg-secondary/90"
              )}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <FiLoader className="w-3 h-3 animate-spin" />
                  Creating...
                </div>
              ) : (
                'Create Group'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Group Info Drawer Component
const GroupInfoDrawer = ({ isOpen, onClose, group, currentUser }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  if (!group) return null;

  const createdDate = group.created_at ? format(parseISO(group.created_at), 'MMMM d, yyyy') : 'Unknown';
  const isAdmin = group.role === 'admin' || group.created_by === currentUser?.id;

  const GroupContent = () => (
    <div className="space-y-4">
      {/* Group Header */}
      <div className="text-center">
        <div
          className="w-20 h-20 rounded-full mx-auto mb-3 bg-cover bg-center border-4 border-primary/20"
          style={{
            backgroundImage: group.icon_image_url 
              ? `url(${group.icon_image_url})` 
              : 'linear-gradient(135deg, #F9D769 0%, #E8C547 100%)'
          }}
        >
          {!group.icon_image_url && (
            <div className="w-full h-full flex items-center justify-center rounded-full text-secondary text-xl font-bold">
              {group.name?.charAt(0)?.toUpperCase() || 'G'}
            </div>
          )}
        </div>
        <h2 className="text-lg font-bold text-secondary mb-1">{group.name}</h2>
        <p className="text-xs text-secondary/70">Group • {group.members} members</p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-primary/10 text-secondary rounded-xl hover:bg-primary/20 transition-colors">
          <FiUsers className="w-4 h-4" />
          <span className="text-xs font-medium">Members</span>
        </button>
      </div>

      {/* Group Description */}
      {group.description && (
        <div className="bg-primary/5 rounded-xl p-3">
          <h3 className="text-xs font-semibold text-secondary mb-2">Description</h3>
          <p className="text-xs text-secondary/80 leading-relaxed whitespace-pre-wrap">
            {group.description.length > 150 
              ? `${group.description.substring(0, 150)}...` 
              : group.description
            }
          </p>
        </div>
      )}

      {/* Group Info */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <FiCalendar className="w-4 h-4 text-secondary" />
          </div>
          <div>
            <p className="text-xs font-medium text-secondary">Created</p>
            <p className="text-xs text-secondary/70">{createdDate}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <FiUsers className="w-4 h-4 text-secondary" />
          </div>
          <div>
            <p className="text-xs font-medium text-secondary">{group.members} members</p>
            <p className="text-xs text-secondary/70">Tap to view all members</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            {group.membership_type === 'open' ? (
              <FiGlobe className="w-4 h-4 text-secondary" />
            ) : (
              <FiLock className="w-4 h-4 text-secondary" />
            )}
          </div>
          <div>
            <p className="text-xs font-medium text-secondary">
              {group.membership_type === 'open' ? 'Public' : 'Private'} Group
            </p>
            <p className="text-xs text-secondary/70">
              {group.membership_type === 'open' 
                ? 'Anyone can join this group' 
                : 'Only admins can add members'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Admin Actions */}
      {isAdmin && (
        <div className="border-t border-secondary/20 pt-3 space-y-1">
          <button className="w-full flex items-center gap-3 py-2 px-3 text-secondary hover:bg-primary/5 rounded-xl transition-colors">
            <FiEdit3 className="w-4 h-4" />
            <span className="text-xs">Edit Group Info</span>
          </button>
          <button className="w-full flex items-center gap-3 py-2 px-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors">
            <FiTrash2 className="w-4 h-4" />
            <span className="text-xs">Delete Group</span>
          </button>
        </div>
      )}

    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle>Group Info</DrawerTitle>
            <DrawerDescription className="sr-only">View group information and settings</DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-8 overflow-y-auto max-h-[75vh] scrollbar-hide">
            <GroupContent />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop sidebar
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'tween', duration: 0.3 }}
          className="w-80 bg-white border-l border-primary/20 flex flex-col rounded-l-2xl"
        >
          {/* Header */}
          <div className="p-4 bg-gradient-primary-soft border-b border-primary/20 flex items-center justify-between rounded-tl-2xl">
            <h2 className="text-sm font-bold text-secondary">Group Info</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary/10 rounded-full transition-colors"
            >
              <FiX className="w-4 h-4 text-secondary" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
            <GroupContent />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Date Separator Component
const DateSeparator = ({ timestamp }) => (
  <div className="flex items-center justify-center my-4">
    <div className="bg-white backdrop-blur-sm rounded-full px-3 py-0.5 shadow-sm border border-primary/20">
      <span className="text-xs text-secondary font-semibold">
        {formatDateSeparator(timestamp)}
      </span>
    </div>
  </div>
);

// Chat List Item Component - FIXED DOM NESTING
const ChatListItem = ({ group, isActive, onClick, lastMessage, isLoadingMessages }) => {
  const isOnline = group.members > 0;

  return (
    <motion.div
      layout
      onClick={() => onClick(group)}
      className={cn(
        "flex items-center gap-3 p-3 cursor-pointer transition-all duration-200 hover:bg-primary/5 border-b border-primary/10 rounded-xl mx-2 my-1",
        isActive && "bg-primary/10"
      )}
    >
      {/* Profile Picture */}
      <div className="relative flex-shrink-0">
        <div
          className="w-12 h-12 rounded-full bg-cover bg-center border border-primary/20"
          style={{
            backgroundImage: group.icon_image_url 
              ? `url(${group.icon_image_url})` 
              : 'linear-gradient(135deg, #F9D769 0%, #E8C547 100%)'
          }}
        >
          {!group.icon_image_url && (
            <div className="w-full h-full flex items-center justify-center rounded-full text-secondary text-sm font-normal">
              {group.name?.charAt(0)?.toUpperCase() || 'G'}
            </div>
          )}
        </div>
        {isOnline && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
        )}
        {isLoadingMessages && (
          <div className="absolute -top-1 -right-1 w-4 h-4">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Chat Info - FIXED: Changed <p> to <div> to avoid nesting issues */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-xs font-semibold text-secondary truncate">
            {group.name}
          </h3>
          <span className="text-xs text-secondary/60 flex-shrink-0">
            {lastMessage?.timestamp && formatMessageTime(lastMessage.timestamp)}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-xs text-secondary/70 truncate">
            {isLoadingMessages ? (
              <span className="text-primary">Loading messages...</span>
            ) : lastMessage ? (
              <div className="flex items-center gap-1">
                {lastMessage.senderId === group.user_id && (
                  <div className="flex">
                    {lastMessage.status === 'read' ? (
                      <div className="flex">
                        <FiCheck className="w-3 h-3 text-primary -mr-1" />
                        <FiCheck className="w-3 h-3 text-primary" />
                      </div>
                    ) : lastMessage.status === 'DELIVERED' ? (
                      <div className="flex">
                        <FiCheck className="w-3 h-3 text-secondary/60 -mr-1" />
                        <FiCheck className="w-3 h-3 text-secondary/60" />
                      </div>
                    ) : (
                      <FiCheck className="w-3 h-3 text-secondary/60" />
                    )}
                  </div>
                )}
                {lastMessage.media ? (
                  <>
                    <FiImage className="w-3 h-3 text-secondary/60" />
                    <span>{lastMessage.text ? truncateText(lastMessage.text, 30) : 'Photo'}</span>
                  </>
                ) : (
                  <span>{truncateText(lastMessage.text || 'No messages', 40)}</span>
                )}
              </div>
            ) : (
              'No messages yet'
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Chat Message Component
const ChatMessage = ({ message, isOwn, showAvatar, showSenderName, currentUser }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex gap-2 mb-1",
        isOwn ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar for received messages */}
      {showAvatar && !isOwn && (
        <div 
          className="w-6 h-6 rounded-full bg-gradient-primary-soft flex items-center justify-center text-secondary text-xs font-bold flex-shrink-0 mt-auto border border-primary/20"
        >
          {message.senderUserName?.charAt(0)?.toUpperCase() || message.senderId?.charAt(0)?.toUpperCase() || 'U'}
        </div>
      )}
      
      {/* Spacer for grouped messages */}
      {!showAvatar && !isOwn && (
        <div className="w-6 flex-shrink-0"></div>
      )}

      <div className={cn(
        "max-w-xs lg:max-w-md",
        isOwn ? "items-end" : "items-start"
      )}>
        {/* Sender Name (for group chats) */}
        {showSenderName && !isOwn && (
          <div className="mb-1 ml-2">
            <span className="text-xs font-normal text-black">
              {message.senderUserName || 'Unknown User'}
            </span>
          </div>
        )}

        {/* Message Bubble */}
        <div className={cn(
          "p-0.5 rounded-2xl relative shadow-sm",
          isOwn 
            ? "bg-primary text-secondary rounded-br-[0px]" 
            : "bg-white text-secondary rounded-bl-md"
        )}>
          {/* Media attachments */}
          {message.media && (
            <div className="mb-2">
              {message.media.media_type === 'IMAGE' && (
                <div className="relative">
                  <img 
                    src={message.media.media_url} 
                    alt="Shared image"
                    className="rounded-xl max-w-full h-auto cursor-pointer border border-primary/10"
                    onClick={() => window.open(message.media.media_url, '_blank')}
                  />
                  {message.status === 'SENDING' && (
                    <div className="absolute inset-0 bg-black bg-opacity-30 rounded-xl flex items-center justify-center">
                      <FiLoader className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}
                </div>
              )}
              {message.media.media_type === 'VIDEO' && (
                <div className="relative">
                  <video 
                    src={message.media.media_url} 
                    controls
                    className="rounded-xl max-w-full h-auto border border-primary/10"
                  />
                </div>
              )}
              {message.media.media_type === 'FILE' && (
                <div className={cn(
                  "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors border",
                  isOwn 
                    ? "bg-primary/10 hover:bg-primary/20 border-primary/20" 
                    : "bg-secondary/5 hover:bg-secondary/10 border-secondary/20"
                )}>
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    isOwn ? "bg-primary/20" : "bg-secondary/10"
                  )}>
                    <FiFile className={cn("w-4 h-4", "text-secondary")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate text-secondary">
                      {message.media.filename || 'File attachment'}
                    </p>
                    <p className="text-xs text-secondary/60">
                      {message.media.size || 'Unknown size'}
                    </p>
                  </div>
                  <FiDownload className="w-3 h-3 text-secondary/60" />
                </div>
              )}
            </div>
          )}
          
          <div className="flex items-end p-2 justify-between gap-5">
            {/* Message Text */}
          {message.text && (
            <div className="text-xs whitespace-pre-wrap break-words">
              {message.text}
            </div>
          )}

          {/* Message Time & Status */}
          <div className={cn(
            "flex items-center gap-1 justify-end",
            isOwn ? "text-secondary/70" : "text-secondary/60"
          )}>
            <span className="text-[10px]">{formatTimeOnly(message.timestamp)}</span>
            {isOwn && (
              <div className="ml-0.5">
                {message.status === 'read' ? (
                  <div className="flex">
                    <FiCheck className="w-2.5 h-2.5 text-primary -mr-1" />
                    <FiCheck className="w-2.5 h-2.5 text-primary" />
                  </div>
                ) : message.status === 'DELIVERED' ? (
                  <div className="flex">
                    <FiCheck className="w-2.5 h-2.5 text-secondary/60 -mr-1" />
                    <FiCheck className="w-2.5 h-2.5 text-secondary/60" />
                  </div>
                ) : message.status === 'SENT' ? (
                  <FiCheck className="w-2.5 h-2.5 text-secondary/60" />
                ) : (
                  <FiClock className="w-2.5 h-2.5 text-secondary/40" />
                )}
              </div>
            )}
          </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Main Groups Component
const Groups = () => {
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
  
  // Cache for messages by group ID
  const [groupMessages, setGroupMessages] = useState({});
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

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

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      const response = await get('users/getUserProfile');
      if (response?.data) {
        setCurrentUser({ 
          id: response.data.user_id,
          name: `${response.data.first_name} ${response.data.last_name}`,
          avatar: response.data.profile_pic,
          email: response.data.email
        });
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  // Fetch groups
  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await get('groups/myGroups');
      
      if (response?.data && Array.isArray(response.data)) {
        setGroups(response.data);
      } else {
        setGroups([]);
      }
    } catch (error) {
      console.error('❌ Failed to fetch groups:', error);
      toast.error('Failed to fetch groups');
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for group
  const fetchMessagesForGroup = async (groupId) => {
    if (groupMessages[groupId]) {
      setMessages(groupMessages[groupId]);
      return;
    }

    try {
      setMessagesLoading(true);
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
        
        setMessages(sortedMessages);
        setGroupMessages(prev => ({
          ...prev,
          [groupId]: sortedMessages
        }));
      } else {
        setMessages([]);
        setGroupMessages(prev => ({
          ...prev,
          [groupId]: []
        }));
      }
    } catch (error) {
      console.error('❌ Failed to load messages for group:', groupId, error);
      toast.error('Failed to load messages');
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  };

  // Handle group selection
  const handleGroupSelect = async (group) => {
    setSelectedGroup(group);
    setMessages([]);
    
    if (isMobile) {
      setShowChatList(false);
      setShowGroupInfo(false);
    }

    await fetchMessagesForGroup(group.group_id);
  };

  // Handle back to chat list (mobile)
  const handleBackToChatList = () => {
    setShowChatList(true);
    setSelectedGroup(null);
    setShowGroupInfo(false);
  };

  // Handle file selection
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (30MB max)
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

  // Upload file - FIXED: Using the upload service utility
  const uploadFile = async (file) => {
    try {
      setUploadingFile(true);
      
      // Determine file type
      let fileType = 'STATUS_POST'; // Default file type for chat files
      if (file.type.startsWith('image/')) {
        fileType = 'STATUS_POST'; // Use STATUS_POST for images
      } else if (file.type.startsWith('video/')) {
        fileType = 'VIDEO';
      }

      const formData = new FormData();
      formData.append('file_type', fileType);
      formData.append('content', file);

      console.log('Uploading file:', file.name, 'Type:', fileType);

      // Use the upload service utility instead of raw fetch
      const uploadResponse = await upload('media/uploadFile', formData);
      
      console.log('Upload response:', uploadResponse);

      if (uploadResponse?.status === 200 && uploadResponse?.data) {
        let mediaUrl = null;
        
        // Handle different response formats
        if (Array.isArray(uploadResponse.data)) {
          // Array format: look for thumbnail_url or url in first item
          mediaUrl = uploadResponse.data[0]?.file_url || uploadResponse.data[0]?.url;
        } else if (uploadResponse.data.url) {
          // Direct url property
          mediaUrl = uploadResponse.data.url;
        } else if (uploadResponse.data.file_url) {
          // thumbnail_url property
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
      console.error('File upload error:', error);
      throw error;
    } finally {
      setUploadingFile(false);
    }
  };

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || !selectedGroup) return;

    // Files must be sent with text
    if (selectedFile && !newMessage.trim()) {
      toast.error('Please add a message with the file');
      return;
    }

    const conversationId = selectedGroup.group_id;
    const tempId = `temp_${Date.now()}_${Math.random()}`;
    
    let mediaData = null;
    
    // Upload file first if selected
    if (selectedFile) {
      try {
        mediaData = await uploadFile(selectedFile);
      } catch (error) {
        toast.error('Failed to upload file');
        console.error('Upload error:', error);
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
    
    setGroupMessages(prev => ({
      ...prev,
      [selectedGroup.group_id]: updatedMessages
    }));

    const messageText = newMessage;
    setNewMessage('');
    removeSelectedFile();

    try {
      const messagePayload = {
        conversationId: conversationId,
        text: messageText,
        receiverId: selectedGroup.group_id
      };

      if (mediaData) {
        messagePayload.media = mediaData;
      }

      const response = await post('chat/sendMessage', messagePayload);

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
        setGroupMessages(prev => ({
          ...prev,
          [selectedGroup.group_id]: [...updatedMessages]
        }));
      }
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      toast.error('Failed to send message');
      
      const filteredMessages = updatedMessages.filter(msg => msg.messageId !== tempId);
      setMessages(filteredMessages);
      setGroupMessages(prev => ({
        ...prev,
        [selectedGroup.group_id]: filteredMessages
      }));
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

  // Render messages
  const renderMessages = () => {
    if (!messages.length) return null;

    const renderedMessages = [];

    messages.forEach((message, index) => {
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

      renderedMessages.push(
        <ChatMessage
          key={message.messageId}
          message={message}
          isOwn={isOwn}
          showAvatar={showAvatar}
          showSenderName={showSenderName}
          currentUser={currentUser}
        />
      );
    });

    return renderedMessages;
  };

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize
  useEffect(() => {
    fetchGroups();
    fetchUserProfile();
  }, []);

  if (loading) {
    return (
      <div className="h-[calc(100vh-112px)] flex bg-primary-scale-50 border-2 border-primary/20 rounded-2xl">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full animate-pulse mx-auto mb-4"></div>
            <div className="h-6 bg-primary/20 rounded w-48 animate-pulse mb-2 mx-auto"></div>
            <div className="h-4 bg-primary/20 rounded w-32 animate-pulse mx-auto"></div>
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
            <h1 className="text-sm font-bold">Social Gems Chat</h1>
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
            filteredGroups.map((group) => (
              <ChatListItem
                key={group.group_id}
                group={group}
                isActive={selectedGroup?.group_id === group.group_id}
                onClick={handleGroupSelect}
                lastMessage={getLastMessage(group.group_id)}
                isLoadingMessages={messagesLoading && selectedGroup?.group_id === group.group_id}
              />
            ))
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
                <button 
                  onClick={() => setShowGroupInfo(true)}
                  className="p-2 hover:bg-secondary/10 rounded-full transition-colors"
                >
                  <FiInfo className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-white scrollbar-hide">
              {messagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : messages.length > 0 ? (
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

            {/* Selected File Preview */}
            {selectedFile && (
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

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-primary/20">
              <form onSubmit={handleSendMessage} className="flex items-end gap-3">
                {/* File attachment button */}
                <button
                  type="button"
                  onClick={handleFileSelect}
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
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="w-full pl-4 pr-12 py-3 bg-white border border-primary/30 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-xs text-secondary placeholder-secondary/60"
                    maxLength={1000}
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
                Select a group from the sidebar to start chatting.
              </p>
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
      />

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        onCreateGroup={fetchGroups}
      />
    </div>
  );
};

export default Groups;