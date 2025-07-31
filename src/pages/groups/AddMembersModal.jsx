import { useState } from 'react';
import { FiX, FiLoader } from 'react-icons/fi';
import { toast } from 'sonner';
import { post } from '../../utils/service';
import { cn } from '../../lib/utils';

const AddMembersModal = ({ isOpen, onClose, group, onMembersAdded }) => {
  const [userIds, setUserIds] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userIds.trim()) {
      toast.error('Please enter user IDs');
      return;
    }

    try {
      setLoading(true);
      const userIdArray = userIds.split(',').map(id => id.trim()).filter(id => id);
      
      const response = await post('groups/addMembersToGroup', {
        group_id: group.group_id,
        user_ids: userIdArray
      });
      
      if (response?.status === 200 || response) {
        toast.success('Members added successfully');
        onMembersAdded();
        onClose();
        setUserIds('');
      }
    } catch (error) {
      console.error('Failed to add members:', error);
      toast.error('Failed to add members');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !group) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="p-4 border-b border-primary/20">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-secondary">Add Members</h2>
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
              User IDs (comma separated)
            </label>
            <textarea
              value={userIds}
              onChange={(e) => setUserIds(e.target.value)}
              className="w-full px-3 py-2 border border-primary/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-xs text-secondary resize-none"
              placeholder="Enter user IDs separated by commas (e.g., user1, user2, user3)"
              rows={3}
              required
            />
            <p className="text-xs text-secondary/60 mt-1">
              Enter the user IDs of people you want to add to {group.name}
            </p>
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
              disabled={loading || !userIds.trim()}
              className={cn(
                "flex-1 py-2 px-4 rounded-xl transition-colors text-xs font-medium",
                loading || !userIds.trim()
                  ? "bg-secondary/20 text-secondary/40 cursor-not-allowed"
                  : "bg-secondary text-white hover:bg-secondary/90"
              )}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <FiLoader className="w-3 h-3 animate-spin" />
                  Adding...
                </div>
              ) : (
                'Add Members'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMembersModal;