import { useState, useEffect } from 'react';
import { FiX, FiLoader } from 'react-icons/fi';
import { toast } from 'sonner';
import { patch, upload } from '../../utils/service';
import { cn } from '../../lib/utils';
import ImageUpload from './ImageUpload';

const EditGroupModal = ({ isOpen, onClose, group, onGroupUpdated }) => {
  const [groupData, setGroupData] = useState({
    name: '',
    description: '',
    rules: '',
    membership_type: 'open',
    icon_image_url: '',
    banner_image_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [iconFile, setIconFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  useEffect(() => {
    if (group) {
      setGroupData({
        name: group.name || '',
        description: group.description || '',
        rules: group.rules || '',
        membership_type: group.membership_type || 'open',
        icon_image_url: group.icon_image_url || '',
        banner_image_url: group.banner_image_url || ''
      });
      setIconFile(null);
      setBannerFile(null);
    }
  }, [group]);

  const uploadImage = async (file, setUploading) => {
    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('file_type', 'STATUS_POST');
      formData.append('content', file);

      const uploadResponse = await upload('media/uploadFile', formData);
      
      if (uploadResponse?.status === 200 && uploadResponse?.data) {
        let fileUrl = null;
        
        if (Array.isArray(uploadResponse.data)) {
          fileUrl = uploadResponse.data[0]?.file_url || uploadResponse.data[0]?.url;
        } else if (uploadResponse.data.file_url) {
          fileUrl = uploadResponse.data.file_url;
        } else if (uploadResponse.data.url) {
          fileUrl = uploadResponse.data.url;
        }

        if (!fileUrl) {
          throw new Error('No URL returned from upload');
        }

        return fileUrl;
      } else {
        throw new Error('Upload failed - invalid response');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupData.name.trim()) {
      toast.error('Group name is required');
      return;
    }

    try {
      setLoading(true);
      
      let iconUrl = groupData.icon_image_url;
      let bannerUrl = groupData.banner_image_url;

      if (iconFile) {
        try {
          iconUrl = await uploadImage(iconFile, setUploadingIcon);
        } catch (error) {
          toast.error('Failed to upload group icon');
          return;
        }
      }

      if (bannerFile) {
        try {
          bannerUrl = await uploadImage(bannerFile, setUploadingBanner);
        } catch (error) {
          toast.error('Failed to upload banner image');
          return;
        }
      }

      const response = await patch('groups/editGroup', {
        ...groupData,
        icon_image_url: iconUrl,
        banner_image_url: bannerUrl,
        groupId: group.group_id
      });
      
      if (response?.status === 200 || response) {
        toast.success('Group updated successfully');
        onGroupUpdated();
        onClose();
      }
    } catch (error) {
      console.error('Failed to update group:', error);
      toast.error('Failed to update group');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentIcon = () => {
    if (iconFile) return iconFile;
    if (groupData.icon_image_url) return groupData.icon_image_url;
    return null;
  };

  const getCurrentBanner = () => {
    if (bannerFile) return bannerFile;
    if (groupData.banner_image_url) return groupData.banner_image_url;
    return null;
  };

  if (!isOpen || !group) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-primary/20">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-secondary">Edit Group</h2>
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

          <ImageUpload
            label="Group Icon"
            currentImage={getCurrentIcon()}
            onImageSelect={setIconFile}
            onImageRemove={() => {
              setIconFile(null);
              setGroupData({ ...groupData, icon_image_url: '' });
            }}
            loading={uploadingIcon}
          />

          <ImageUpload
            label="Banner Image"
            currentImage={getCurrentBanner()}
            onImageSelect={setBannerFile}
            onImageRemove={() => {
              setBannerFile(null);
              setGroupData({ ...groupData, banner_image_url: '' });
            }}
            loading={uploadingBanner}
          />

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
              disabled={loading || !groupData.name.trim() || uploadingIcon || uploadingBanner}
              className={cn(
                "flex-1 py-2 px-4 rounded-xl transition-colors text-xs font-medium",
                loading || !groupData.name.trim() || uploadingIcon || uploadingBanner
                  ? "bg-secondary/20 text-secondary/40 cursor-not-allowed"
                  : "bg-secondary text-white hover:bg-secondary/90"
              )}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <FiLoader className="w-3 h-3 animate-spin" />
                  Updating...
                </div>
              ) : uploadingIcon || uploadingBanner ? (
                <div className="flex items-center justify-center gap-2">
                  <FiLoader className="w-3 h-3 animate-spin" />
                  Uploading...
                </div>
              ) : (
                'Update Group'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditGroupModal;