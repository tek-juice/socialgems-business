import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiX, 
  FiEdit3, 
  FiTrash2, 
  FiUserPlus, 
  FiUsers, 
  FiCalendar, 
  FiGlobe, 
  FiLock, 
  FiLoader 
} from 'react-icons/fi';
import { get, post, patch } from '../../utils/service';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { cn } from '../../lib/utils';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from './Drawer';
import EditGroupModal from './EditGroupModal';
import AddMembersModal from './AddMembersModal';
import MemberItem from './MemberItem';

const GroupInfoDrawer = ({ isOpen, onClose, group, currentUser, onGroupUpdated, onGroupDeleted }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddMembersModal, setShowAddMembersModal] = useState(false);
  const [deletingGroup, setDeletingGroup] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const fetchMembers = async () => {
    if (!group?.group_id) return;
    
    try {
      setLoadingMembers(true);
      const response = await get(`groups/getGroupMembers/${group.group_id}`);
      
      if (response?.data && Array.isArray(response.data)) {
        setMembers(response.data);
      } else if (Array.isArray(response)) {
        setMembers(response);
      } else {
        setMembers([]);
      }
    } catch (error) {
      console.error('Failed to fetch members:', error);
      toast.error('Failed to load members');
      setMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  };

  useEffect(() => {
    if (isOpen && group) {
      fetchMembers();
    }
  }, [isOpen, group]);

  const handleDeleteGroup = async () => {
    if (!window.confirm(`Are you sure you want to delete "${group.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingGroup(true);
      const response = await post('groups/deleteGroup', { groupId: group.group_id });
      
      if (response?.status === 200 || response) {
        toast.success('Group deleted successfully');
        onGroupDeleted();
        onClose();
      }
    } catch (error) {
      console.error('Failed to delete group:', error);
      toast.error('Failed to delete group');
    } finally {
      setDeletingGroup(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      const response = await post('groups/removeMember', {
        groupId: group.group_id,
        userId: userId,
        removedBy: currentUser.id
      });
      
      if (response?.status === 200 || response) {
        toast.success('Member removed successfully');
        fetchMembers();
      }
    } catch (error) {
      console.error('Failed to remove member:', error);
      toast.error('Failed to remove member');
    }
  };

  const handleMakeAdmin = async (userId) => {
    try {
      const response = await patch('groups/updateMember', {
        groupId: group.group_id,
        userId: userId,
        role: 'admin',
        updatedBy: currentUser.id
      });
      
      if (response?.status === 200 || response) {
        toast.success('Member promoted to admin');
        fetchMembers();
      }
    } catch (error) {
      console.error('Failed to update member:', error);
      toast.error('Failed to update member');
    }
  };

  if (!group) return null;

  const createdDate = group.created_at ? format(parseISO(group.created_at), 'MMMM d, yyyy') : 'Unknown';
  const isAdmin = group.role === 'admin' || group.created_by === currentUser?.id;

  const GroupContent = () => (
    <div className="space-y-4">
      <div className="text-center">
        {group.banner_image_url && (
          <div 
            className="w-full h-24 bg-cover bg-center rounded-xl mb-3 border border-primary/20"
            style={{ backgroundImage: `url(${group.banner_image_url})` }}
          />
        )}
        
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
        <p className="text-xs text-secondary/70">Group • {members.length} members</p>
        <p className="text-xs text-secondary/70">Since • {createdDate}</p>
      </div>

      {/* <div className="flex gap-2">
        {isAdmin && (
          <button 
            onClick={() => setShowAddMembersModal(true)}
            className="flex-1 flex items-center justify-center gap-2 py-2 bg-primary/10 text-secondary rounded-xl hover:bg-primary/20 transition-colors"
          >
            <FiUserPlus className="w-4 h-4" />
            <span className="text-xs font-medium">Add Members</span>
          </button>
        )}
      </div> */}

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

      {/* {group.rules && (
        <div className="bg-primary/5 rounded-xl p-3">
          <h3 className="text-xs font-semibold text-secondary mb-2">Rules</h3>
          <p className="text-xs text-secondary/80 leading-relaxed whitespace-pre-wrap">
            {group.rules}
          </p>
        </div>
      )} */}

      <div className="space-y-3">
        {/* <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <FiCalendar className="w-4 h-4 text-secondary" />
          </div>
          <div>
            <p className="text-xs font-medium text-secondary">Created</p>
            <p className="text-xs text-secondary/70">{createdDate}</p>
          </div>
        </div> */}

        {/* <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <FiUsers className="w-4 h-4 text-secondary" />
          </div>
          <div>
            <p className="text-xs font-medium text-secondary">{members.length} members</p>
            <p className="text-xs text-secondary/70">Active group members</p>
          </div>
        </div> */}

        {/* <div className="flex items-center gap-3">
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
        </div> */}
      </div>

      <div className="pt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-secondary">Members ({members.length})</h3>
          {isAdmin && (
            <button
              onClick={() => setShowAddMembersModal(true)}
              className="p-1 hover:bg-primary/10 rounded-full transition-colors"
            >
              <FiUserPlus className="w-3 h-3 text-secondary" />
            </button>
          )}
        </div>
        
        <div className="space-y-1 max-h-48 overflow-y-auto scrollbar-hide">
          {loadingMembers ? (
            <div className="flex items-center justify-center py-4">
              <FiLoader className="w-4 h-4 animate-spin text-secondary" />
            </div>
          ) : members.length > 0 ? (
            members.map((member) => (
              <MemberItem
                key={member.user_id}
                member={member}
                isAdmin={isAdmin}
                currentUserId={currentUser?.id}
                onRemoveMember={handleRemoveMember}
                onMakeAdmin={handleMakeAdmin}
              />
            ))
          ) : (
            <p className="text-xs text-secondary/60 text-center py-2">No members found</p>
          )}
        </div>
      </div>

      {isAdmin && (
        <div className="border-t border-secondary/20 pt-3 space-y-1">
          <button 
            onClick={() => setShowEditModal(true)}
            className="w-full flex items-center gap-3 py-2 px-3 text-secondary hover:bg-primary/5 rounded-xl transition-colors"
          >
            <FiEdit3 className="w-4 h-4" />
            <span className="text-xs">Edit Group Info</span>
          </button>
          <button 
            onClick={handleDeleteGroup}
            disabled={deletingGroup}
            className="w-full flex items-center gap-3 py-2 px-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            {deletingGroup ? (
              <FiLoader className="w-4 h-4 animate-spin" />
            ) : (
              <FiTrash2 className="w-4 h-4" />
            )}
            <span className="text-xs">
              {deletingGroup ? 'Deleting...' : 'Delete Group'}
            </span>
          </button>
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <>
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

        <EditGroupModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          group={group}
          onGroupUpdated={() => {
            onGroupUpdated();
            fetchMembers();
          }}
        />

        <AddMembersModal
          isOpen={showAddMembersModal}
          onClose={() => setShowAddMembersModal(false)}
          group={group}
          onMembersAdded={fetchMembers}
        />
      </>
    );
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="w-80 bg-white border-l border-primary/20 flex flex-col rounded-l-2xl"
          >
            <div className="p-4 bg-gradient-primary-soft border-b border-primary/20 flex items-center justify-between rounded-tl-2xl">
              <h2 className="text-sm font-bold text-secondary">Group Info</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-secondary/10 rounded-full transition-colors"
              >
                <FiX className="w-4 h-4 text-secondary" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
              <GroupContent />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <EditGroupModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        group={group}
        onGroupUpdated={() => {
          onGroupUpdated();
          fetchMembers();
        }}
      />

      <AddMembersModal
        isOpen={showAddMembersModal}
        onClose={() => setShowAddMembersModal(false)}
        group={group}
        onMembersAdded={fetchMembers}
      />
    </>
  );
};

export default GroupInfoDrawer;