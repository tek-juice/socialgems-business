class CacheManager {
  constructor() {
    this.prefix = 'socialGems_';
    this.memoryCache = new Map();
    this.appStateKey = 'appState';
    this.messageStatusKey = 'messageStatus';
    this.scrollPositionKey = 'scrollPositions';
    this.lastActiveKey = 'lastActive';
  }

  set(key, data, expiry = null) {
    const item = {
      data,
      timestamp: Date.now(),
      expiry
    };

    this.memoryCache.set(key, item);

    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(item));
      console.log('💾 [Cache] Saved to localStorage:', key, typeof data === 'object' ? Object.keys(data).length + ' items' : data);
    } catch (error) {
      console.warn('⚠️ [Cache] Failed to save to localStorage:', key, error);
      try {
        sessionStorage.setItem(this.prefix + key, JSON.stringify(item));
        console.log('💾 [Cache] Fallback saved to sessionStorage:', key);
      } catch (sessionError) {
        console.error('❌ [Cache] Failed to save to both localStorage and sessionStorage:', sessionError);
      }
    }
  }

  get(key) {
    console.log('🔍 [Cache] Retrieving:', key);

    if (this.memoryCache.has(key)) {
      const item = this.memoryCache.get(key);
      if (!item.expiry || Date.now() <= item.expiry) {
        console.log('✅ [Cache] Found in memory:', key);
        return item.data;
      } else {
        console.log('⏰ [Cache] Memory cache expired:', key);
        this.remove(key);
        return null;
      }
    }

    try {
      const item = localStorage.getItem(this.prefix + key);
      if (item) {
        const parsed = JSON.parse(item);
        if (!parsed.expiry || Date.now() <= parsed.expiry) {
          this.memoryCache.set(key, parsed);
          console.log('✅ [Cache] Found in localStorage and restored to memory:', key);
          return parsed.data;
        } else {
          console.log('⏰ [Cache] localStorage cache expired:', key);
          this.remove(key);
          return null;
        }
      }
    } catch (error) {
      console.warn('⚠️ [Cache] Error reading from localStorage:', key, error);
    }

    try {
      const item = sessionStorage.getItem(this.prefix + key);
      if (item) {
        const parsed = JSON.parse(item);
        if (!parsed.expiry || Date.now() <= parsed.expiry) {
          this.memoryCache.set(key, parsed);
          console.log('✅ [Cache] Found in sessionStorage and restored to memory:', key);
          return parsed.data;
        }
      }
    } catch (error) {
      console.warn('⚠️ [Cache] Error reading from sessionStorage:', key, error);
    }

    console.log('❌ [Cache] Not found anywhere:', key);
    return null;
  }

  remove(key) {
    this.memoryCache.delete(key);
    localStorage.removeItem(this.prefix + key);
    sessionStorage.removeItem(this.prefix + key);
    console.log('🗑️ [Cache] Removed:', key);
  }

  clear() {
    this.memoryCache.clear();
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
    const sessionKeys = Object.keys(sessionStorage);
    sessionKeys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        sessionStorage.removeItem(key);
      }
    });
    console.log('🧹 [Cache] Cleared all cache');
  }

  saveAppState(state) {
    const appState = {
      selectedGroupId: state.selectedGroupId,
      showGroupInfo: state.showGroupInfo,
      showChatList: state.showChatList,
      searchTerm: state.searchTerm,
      lastActiveTimestamp: Date.now(),
      windowSize: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };

    this.set(this.appStateKey, appState, Date.now() + (7 * 24 * 60 * 60 * 1000));
    console.log('💾 [Cache] App state saved:', appState);
  }

  getAppState() {
    const state = this.get(this.appStateKey);
    console.log('📱 [Cache] App state retrieved:', state);
    return state;
  }

  setMessages(groupId, messages) {
    this.set(`messages_${groupId}`, messages, Date.now() + (30 * 24 * 60 * 60 * 1000));
    console.log(`💬 [Cache] Saved ${messages.length} messages for group ${groupId}`);
  }

  getMessages(groupId) {
    const messages = this.get(`messages_${groupId}`) || [];
    console.log(`💬 [Cache] Retrieved ${messages.length} messages for group ${groupId}`);
    return messages;
  }

  addMessage(groupId, message) {
    const messages = this.getMessages(groupId);
    const updatedMessages = [...messages, message];
    this.setMessages(groupId, updatedMessages);

    this.updateLastActivity(groupId);

    return updatedMessages;
  }

  updateMessage(groupId, messageId, updatedMessage) {
    const messages = this.getMessages(groupId);
    const updatedMessages = messages.map(msg =>
      msg.messageId === messageId ? { ...msg, ...updatedMessage } : msg
    );
    this.setMessages(groupId, updatedMessages);
    return updatedMessages;
  }

  removeMessage(groupId, messageId) {
    const messages = this.getMessages(groupId);
    const updatedMessages = messages.filter(msg => msg.messageId !== messageId);
    this.setMessages(groupId, updatedMessages);
    return updatedMessages;
  }

  saveMessageStatus(groupId, messageStatuses) {
    const allStatuses = this.get(this.messageStatusKey) || {};
    allStatuses[groupId] = messageStatuses;
    this.set(this.messageStatusKey, allStatuses, Date.now() + (30 * 24 * 60 * 60 * 1000));
    console.log(`👁️ [Cache] Saved message statuses for group ${groupId}:`, messageStatuses);
  }

  getMessageStatus(groupId) {
    const allStatuses = this.get(this.messageStatusKey) || {};
    return allStatuses[groupId] || {};
  }

  markMessageAsRead(groupId, messageId, userId) {
    const statuses = this.getMessageStatus(groupId);
    statuses[messageId] = {
      isRead: true,
      readAt: Date.now(),
      readBy: userId
    };
    this.saveMessageStatus(groupId, statuses);
    console.log(`✅ [Cache] Marked message ${messageId} as read in group ${groupId}`);
  }

  markAllMessagesAsRead(groupId, userId) {
    const messages = this.getMessages(groupId);
    const statuses = {};
    const now = Date.now();

    messages.forEach(msg => {
      if (msg.senderId !== userId) {
        statuses[msg.messageId] = {
          isRead: true,
          readAt: now,
          readBy: userId
        };
      }
    });

    this.saveMessageStatus(groupId, statuses);
    console.log(`✅ [Cache] Marked all messages as read in group ${groupId}`);
  }

  getUnreadMessages(groupId, userId) {
    const messages = this.getMessages(groupId);
    const statuses = this.getMessageStatus(groupId);

    const unreadMessages = messages.filter(msg => {
      if (msg.senderId === userId) return false;
      const status = statuses[msg.messageId];
      return !status || !status.isRead;
    });

    console.log(`📬 [Cache] Found ${unreadMessages.length} unread messages in group ${groupId}`);
    return unreadMessages;
  }

  getFirstUnreadMessage(groupId, userId) {
    const unreadMessages = this.getUnreadMessages(groupId, userId);
    return unreadMessages.length > 0 ? unreadMessages[0] : null;
  }

  saveScrollPosition(groupId, scrollTop, scrollHeight) {
    const positions = this.get(this.scrollPositionKey) || {};
    positions[groupId] = {
      scrollTop,
      scrollHeight,
      timestamp: Date.now()
    };
    this.set(this.scrollPositionKey, positions, Date.now() + (7 * 24 * 60 * 60 * 1000));
    console.log(`📜 [Cache] Saved scroll position for group ${groupId}:`, { scrollTop, scrollHeight });
  }

  getScrollPosition(groupId) {
    const positions = this.get(this.scrollPositionKey) || {};
    const position = positions[groupId];
    console.log(`📜 [Cache] Retrieved scroll position for group ${groupId}:`, position);
    return position;
  }


  updateLastActivity(groupId) {
    const activities = this.get(this.lastActiveKey) || {};
    activities[groupId] = Date.now();
    this.set(this.lastActiveKey, activities, Date.now() + (30 * 24 * 60 * 60 * 1000));
    console.log(`⏰ [Cache] Updated last activity for group ${groupId}`);
  }

  getLastActivity(groupId) {
    const activities = this.get(this.lastActiveKey) || {};
    return activities[groupId] || 0;
  }

  getMostRecentlyActiveGroup() {
    const activities = this.get(this.lastActiveKey) || {};
    let mostRecentGroupId = null;
    let mostRecentTime = 0;

    Object.entries(activities).forEach(([groupId, timestamp]) => {
      if (timestamp > mostRecentTime) {
        mostRecentTime = timestamp;
        mostRecentGroupId = groupId;
      }
    });

    console.log(`⭐ [Cache] Most recently active group: ${mostRecentGroupId} at ${new Date(mostRecentTime)}`);
    return mostRecentGroupId;
  }


  setGroups(groups) {
    this.set('groups', groups, Date.now() + (60 * 60 * 1000));
    console.log(`📂 [Cache] Saved ${groups.length} groups`);
  }

  getGroups() {
    const groups = this.get('groups') || [];
    console.log(`📂 [Cache] Retrieved ${groups.length} groups`);
    return groups;
  }

  setUser(user) {
    this.set('currentUser', user, Date.now() + (24 * 60 * 60 * 1000));
    console.log('👤 [Cache] Saved current user:', user);
  }

  getUser() {
    const user = this.get('currentUser');
    console.log('👤 [Cache] Retrieved current user:', user);
    return user;
  }


  getCacheStats() {
    const stats = {
      memoryEntries: this.memoryCache.size,
      localStorageEntries: 0,
      sessionStorageEntries: 0,
      totalSize: 0
    };

    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(this.prefix)) {
        stats.localStorageEntries++;
        try {
          stats.totalSize += localStorage.getItem(key).length;
        } catch (e) {
        }
      }
    });

    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith(this.prefix)) {
        stats.sessionStorageEntries++;
      }
    });

    console.log('📊 [Cache] Cache statistics:', stats);
    return stats;
  }

  cleanupExpiredEntries() {
    console.log('🧹 [Cache] Starting cleanup of expired entries...');
    let cleanedCount = 0;

    this.memoryCache.forEach((item, key) => {
      if (item.expiry && Date.now() > item.expiry) {
        this.memoryCache.delete(key);
        cleanedCount++;
      }
    });

    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(this.prefix)) {
        try {
          const item = JSON.parse(localStorage.getItem(key));
          if (item.expiry && Date.now() > item.expiry) {
            localStorage.removeItem(key);
            cleanedCount++;
          }
        } catch (e) {
          localStorage.removeItem(key);
          cleanedCount++;
        }
      }
    });

    console.log(`🧹 [Cache] Cleanup completed. Removed ${cleanedCount} expired entries.`);
    return cleanedCount;
  }
}

export default CacheManager;