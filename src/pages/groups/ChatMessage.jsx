import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiClock, FiImage, FiFile, FiDownload } from 'react-icons/fi';
import { cn } from '../../lib/utils';
import { formatTimeOnly, extractUrls } from './helpers';
import LinkPreview from './LinkPreview';
import CustomVideoPlayer from './CustomVideoPlayer';

const ChatMessage = ({ message, isOwn, showAvatar, showSenderName, currentUser, onContextMenu }) => {
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const [isFullScreenVideo, setIsFullScreenVideo] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const longPressTimerRef = useRef(null);
  const touchStartRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  const handleTouchStart = (e) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
    
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    setLongPressTriggered(false);
    
    longPressTimerRef.current = setTimeout(() => {
      setLongPressTriggered(true);
      if (onContextMenu) {
        onContextMenu(e, message);
      }
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
    if (onContextMenu) {
      onContextMenu(e, message);
    }
  };

  const urls = message.text ? extractUrls(message.text) : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex gap-2 mb-1",
        isOwn ? "flex-row-reverse" : "flex-row"
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
          "p-0.5 rounded-2xl relative shadow-sm",
          isOwn 
            ? "bg-primary text-secondary rounded-br-[0px]" 
            : "bg-white text-secondary rounded-bl-md",
          longPressTriggered && "ring-2 ring-primary/50"
        )}>
          {message.media && (
            <div className="mb-2">
              {message.media.media_type === 'IMAGE' && (
                <div className="relative">
                  <img 
                    src={message.media.media_url} 
                    alt="Shared image"
                    className="rounded-xl max-w-full max-h-[300px] cursor-pointer border border-primary/10  overflow-hidden flex items-center justify-center"
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
                <div className="relative rounded-xl max-h-[300px] overflow-hidden flex items-center justify-center">
                <CustomVideoPlayer
                    src={message.media.media_url}
                    isFullScreen={isFullScreenVideo}
                    onToggleFullScreen={() => setIsFullScreenVideo(!isFullScreenVideo)}
                    isMobile={isMobile}
                  />
                </div>
              )}
              {message.media.media_type === 'FILE' && (
                <div className={cn(
                  "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors border",
                  isOwn 
                    ? "bg-primary/10 hover:bg-primary/20 border-primary/20" 
                    : "bg-secondary/5 hover:bg-secondary/10 border-secondary/20"
                )}
                onClick={() => window.open(message.media.media_url, '_blank')}
                >
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
            <div className="flex-1">
              {message.text && (
                <div className="text-xs whitespace-pre-wrap break-words">
                  {message.text}
                </div>
              )}
              
              {urls.map((url, index) => (
                <LinkPreview key={index} url={url} />
              ))}
            </div>

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

export default ChatMessage;