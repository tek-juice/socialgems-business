import { motion } from 'framer-motion';
import { FiCheck, FiImage } from 'react-icons/fi';
import { cn } from '../../lib/utils';
import { formatMessageTime, truncateText } from './helpers';

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

export default ChatListItem;