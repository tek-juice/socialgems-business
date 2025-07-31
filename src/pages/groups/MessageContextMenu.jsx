import { useEffect, useRef } from 'react';
import { FiCopy, FiEdit, FiTrash2 } from 'react-icons/fi';
import { MdOutlineReply } from "react-icons/md";


const MessageContextMenu = ({ isOpen, onClose, position, message, isOwn, onEdit, onDelete, onCopy, onReply }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="fixed bg-white rounded-xl shadow-lg border border-primary/20 py-2 z-50 min-w-[160px]"
      style={{
        top: position.y,
        left: position.x,
        transform: 'translate(-50%, -10px)'
      }}
    >

      
      <button
        onClick={() => { onCopy(message.text); onClose(); }}
        className="w-full px-4 py-2 text-left text-sm text-secondary hover:bg-primary/5 flex items-center gap-3"
      >
        <FiCopy className="w-4 h-4" />
        Copy
      </button>

      {isOwn && (
        <>
          <button
            onClick={() => { onEdit(message); onClose(); }}
            className="w-full px-4 py-2 text-left text-sm text-secondary hover:bg-primary/5 flex items-center gap-3"
          >
            <FiEdit className="w-4 h-4" />
            Edit
          </button>
          
          <button
            onClick={() => { onDelete(message); onClose(); }}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
          >
            <FiTrash2 className="w-4 h-4" />
            Delete
          </button>
        </>
      )}
    </div>
  );
};

export default MessageContextMenu;