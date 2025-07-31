import { useState } from 'react';
import { FiUserCheck, FiUserMinus, FiLoader } from 'react-icons/fi';

const MemberItem = ({ member, isAdmin, currentUserId, onRemoveMember, onMakeAdmin }) => {
  const [loading, setLoading] = useState(false);

  const handleRemove = async () => {
    if (window.confirm(`Remove ${member.first_name} ${member.last_name} from this group?`)) {
      setLoading(true);
      try {
        await onRemoveMember(member.user_id);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleMakeAdmin = async () => {
    if (window.confirm(`Make ${member.first_name} ${member.last_name} an admin?`)) {
      setLoading(true);
      try {
        await onMakeAdmin(member.user_id);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex items-center gap-3 p-2 hover:bg-primary/5 rounded-xl transition-colors">
      <div
        className="w-8 h-8 rounded-full bg-cover bg-center border border-primary/20"
        style={{
          backgroundImage: member.profile_pic 
            ? `url(${member.profile_pic})` 
            : 'linear-gradient(135deg, #F9D769 0%, #E8C547 100%)'
        }}
      >
        {!member.profile_pic && (
          <div className="w-full h-full flex items-center justify-center rounded-full text-secondary text-xs font-bold">
            {member.first_name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-secondary truncate">
          {member.first_name} {member.last_name}
        </p>
        <div className="flex items-center gap-2">
          <p className="text-xs text-secondary/60 truncate">{member.email}</p>
          {member.role === 'admin' && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-primary/20 text-secondary">
              Admin
            </span>
          )}
        </div>
      </div>

      {isAdmin && member.user_id !== currentUserId && (
        <div className="flex items-center gap-1">
          {member.role !== 'admin' && (
            <button
              onClick={handleMakeAdmin}
              disabled={loading}
              className="p-1 hover:bg-green-100 rounded-full transition-colors"
              title="Make Admin"
            >
              <FiUserCheck className="w-3 h-3 text-green-600" />
            </button>
          )}
          <button
            onClick={handleRemove}
            disabled={loading}
            className="p-1 hover:bg-red-100 rounded-full transition-colors"
            title="Remove Member"
          >
            {loading ? (
              <FiLoader className="w-3 h-3 animate-spin text-red-600" />
            ) : (
              <FiUserMinus className="w-3 h-3 text-red-600" />
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default MemberItem;