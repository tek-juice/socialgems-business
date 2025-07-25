"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState, useId, useRef, useCallback, useEffect, ChangeEvent } from "react";
import { get, post, patch, upload } from '../utils/service';
import { toast } from 'sonner';

// All icon imports from react-icons/fi to match sidebar
import {
  FiCheck as CheckIcon,
  FiX as XIcon,
  FiImage as ImagePlusIcon,
  FiUser as UserIcon,
  FiShield as ShieldIcon,
  FiSettings as SettingsIcon,
  FiCreditCard as WalletIcon,
  FiPhone as PhoneIcon,
  FiMail as MailIcon,
  FiExternalLink as ExternalLinkIcon,
  FiBriefcase as BriefcaseIcon,
  FiShare as ShareIcon,
  FiGlobe as GlobeIcon,
  FiEdit as EditIcon,
  FiLoader as LoadingIcon,
  FiCopy as CopyIcon,
  FiAward as CrownIcon,
  FiLock as LockIcon,
  FiUnlock as UnlockIcon,
  FiCheckCircle as CheckCircleIcon,
  FiAlertCircle as AlertCircleIcon,
  FiXCircle as XCircleIcon,
  FiClock as ClockIcon,
} from 'react-icons/fi';

// Social media icons from react-icons/fi
import {
  FiInstagram as InstagramIcon,
} from 'react-icons/fi';

// Additional social icons from react-icons/fa for specific platforms
import {
  FaTwitter as TwitterIcon,
  FaTiktok as TikTokIcon,
} from 'react-icons/fa';

// Custom utility function
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

// Helper function to compress and resize image
const compressImage = (file, maxWidth = 800, maxHeight = 600, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to blob with compression
      canvas.toBlob(resolve, 'image/jpeg', quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

// Updated hooks - no immediate upload
function useImageUpload() {
  const previewRef = useRef(null);
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleThumbnailClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (event) => {
      const file = event.target.files?.[0];
      if (file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast.error('Please select a valid image file');
          return;
        }
        
        // Validate file size (max 10MB original)
        if (file.size > 10 * 1024 * 1024) {
          toast.error('Image size should be less than 10MB');
          return;
        }

        setFileName(file.name);
        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        previewRef.current = url;
      }
    },
    [],
  );

  const handleRemove = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setFileName(null);
    setSelectedFile(null);
    previewRef.current = null;
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [previewUrl]);

  const resetUpload = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setFileName(null);
    setSelectedFile(null);
    previewRef.current = null;
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current);
      }
    };
  }, []);

  return {
    previewUrl,
    fileName,
    selectedFile,
    fileInputRef,
    handleThumbnailClick,
    handleFileChange,
    handleRemove,
    resetUpload,
  };
}

function useCharacterLimit({ maxLength, initialValue = "" }) {
  const [value, setValue] = useState(initialValue);
  const [characterCount, setCharacterCount] = useState(initialValue.length);

  const handleChange = (e) => {
    const newValue = e.target.value;
    if (newValue.length <= maxLength) {
      setValue(newValue);
      setCharacterCount(newValue.length);
    }
  };

  // Update when initialValue changes
  useEffect(() => {
    setValue(initialValue);
    setCharacterCount(initialValue.length);
  }, [initialValue]);

  return {
    value,
    characterCount,
    handleChange,
    maxLength,
  };
}

// Skeleton Loading Components
const SkeletonCard = ({ height = "h-96", className = "" }) => (
  <div className={`${height} rounded-3xl border border-gray-200 bg-white shadow-xl shadow-black/5 animate-pulse overflow-hidden ${className}`}>
    <div className="relative h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200"></div>
      <div className="absolute bottom-0 left-0 right-0 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-8 bg-gray-300 rounded w-48"></div>
          <div className="h-6 bg-gray-300 rounded-full w-20"></div>
        </div>
        <div className="space-y-2">
          <div className="h-5 bg-gray-300 rounded w-32"></div>
          <div className="h-4 bg-gray-300 rounded w-64"></div>
          <div className="h-4 bg-gray-300 rounded w-48"></div>
        </div>
        <div className="flex gap-6">
          <div className="h-4 bg-gray-300 rounded w-24"></div>
          <div className="h-4 bg-gray-300 rounded w-20"></div>
        </div>
        <div className="h-10 bg-gray-300 rounded w-full"></div>
      </div>
    </div>
  </div>
);

const SkeletonQuickStats = () => (
  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 space-y-6 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-gray-300 rounded-lg"></div>
      <div>
        <div className="h-5 bg-gray-300 rounded w-28 mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-32"></div>
      </div>
    </div>
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4 bg-gray-50 rounded-lg">
          <div className="h-4 bg-gray-300 rounded w-20 mb-2"></div>
          <div className="h-6 bg-gray-300 rounded w-16"></div>
        </div>
      ))}
    </div>
  </div>
);

const SkeletonVerificationCard = () => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6 animate-pulse">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 bg-gray-300 rounded-lg"></div>
      <div>
        <div className="h-5 bg-gray-300 rounded w-40 mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-48"></div>
      </div>
    </div>
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-gray-300 rounded"></div>
            <div>
              <div className="h-4 bg-gray-300 rounded w-24 mb-1"></div>
              <div className="h-3 bg-gray-300 rounded w-32"></div>
            </div>
          </div>
          <div className="h-6 bg-gray-300 rounded w-20"></div>
        </div>
      ))}
    </div>
  </div>
);

// UI Components
const Button = ({ className, variant = "default", size = "default", children, disabled, ...props }) => {
  const variants = {
    default: "bg-gradient-to-r from-[#F9D769] to-[#E8C547] text-[#734D20] hover:from-[#E8C547] hover:to-[#F9D769] shadow-sm shadow-black/5",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 shadow-sm shadow-black/5",
    ghost: "text-gray-700 hover:bg-gray-100",
    destructive: "bg-red-500 text-white hover:bg-red-600 shadow-sm shadow-black/5",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 shadow-sm shadow-black/5"
  };

  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-8 px-3 text-xs",
    lg: "h-12 px-6 text-sm",
    icon: "h-10 w-10"
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#F9D769] focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

const Input = ({ className, type, ...props }) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm shadow-black/5 transition-shadow placeholder:text-gray-500 focus-visible:border-[#F9D769] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#F9D769]/20 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
};

const Textarea = ({ className, ...props }) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm shadow-black/5 transition-shadow placeholder:text-gray-500 focus-visible:border-[#F9D769] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#F9D769]/20 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
};

const Label = ({ className, ...props }) => (
  <label
    className={cn(
      "text-sm font-medium leading-4 text-gray-900 peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className
    )}
    {...props}
  />
);

const Badge = ({ className, children, variant = "default", ...props }) => {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
    gold: "bg-gradient-to-r from-[#F9D769] to-[#E8C547] text-[#734D20]",
    pending: "bg-orange-100 text-orange-800"
  };

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Profile Card Component
const ProfileOverviewCard = ({ userData, onEditProfile, loading }) => {
  const [hovered, setHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    rest: { scale: 1, y: 0 },
    hover: !shouldReduceMotion ? { 
      scale: 1.02, 
      y: -4,
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 28,
        mass: 0.6,
      }
    } : {},
  };

  if (loading) {
    return <SkeletonCard />;
  }

  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      initial="rest"
      whileHover="hover"
      variants={containerVariants}
      className="relative h-96 rounded-3xl border border-gray-200 text-card-foreground overflow-hidden shadow-xl shadow-black/5 cursor-pointer group backdrop-blur-sm"
    >
      {/* Full Cover Image */}
      <motion.img
        src={userData?.profile_pic || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.first_name || userData?.firstName || 'User')}&background=F9D769&color=734D20&size=400&rounded=true`}
        alt={`${userData?.first_name || userData?.firstName || 'User'} ${userData?.last_name || userData?.lastName || ''}`}
        className="absolute inset-0 w-full h-full object-cover"
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />

      {/* Smooth Blur Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 via-background/20 via-background/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-background/90 via-background/60 via-background/30 via-background/15 via-background/8 to-transparent backdrop-blur-[1px]" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background/85 via-background/40 to-transparent backdrop-blur-sm" />

      {/* Content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="absolute bottom-0 left-0 right-0 p-6 space-y-4"
      >
        {/* Name and Verification */}
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-foreground">
            {userData?.first_name || userData?.firstName || 'User'} {userData?.last_name || userData?.lastName || ''}
          </h2>
          <div className="flex items-center gap-2">
            <Badge variant="gold">{userData?.level_name || 'Member'}</Badge>
            {userData?.email_verified === "yes" && (
              <div className="flex items-center justify-center w-4 h-4 rounded-full bg-green-500 text-white">
                <CheckIcon className="w-2.5 h-2.5" />
              </div>
            )}
          </div>
        </div>

        {/* Username and Bio */}
        <div className="space-y-2">
          <p className="text-[#734D20] font-medium">@{userData?.username || 'username'}</p>
          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
            {userData?.bio || 'No bio available'}
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 pt-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <WalletIcon className="w-4 h-4" />
            <span className="font-semibold text-foreground">{userData?.wallet?.balance || '0'}</span>
            <span className="text-sm">GEMS</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <CrownIcon className="w-4 h-4" />
            <span className="font-semibold text-foreground">Level {userData?.level_id || '1'}</span>
          </div>
        </div>

        {/* Edit Profile Button */}
        <Button
          onClick={onEditProfile}
          className="w-full bg-foreground text-background hover:bg-foreground/90"
        >
          <EditIcon className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      </motion.div>
    </motion.div>
  );
};

// Profile Edit Modal
const ProfileEditModal = ({ isOpen, onClose, userData, onSave, loading, onRefresh }) => {
  const id = useId();
  const maxLength = 180;
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    dob: '',
    country_id: ''
  });

  const profileImageUpload = useImageUpload();

  const {
    value: bioValue,
    characterCount,
    handleChange: handleBioChange,
    maxLength: limit,
  } = useCharacterLimit({
    maxLength,
    initialValue: formData.bio,
  });

  // Update form data when userData changes
  useEffect(() => {
    if (userData) {
      const newFormData = {
        firstName: userData?.first_name || userData?.firstName || '',
        lastName: userData?.last_name || userData?.lastName || '',
        username: userData?.username || '',
        email: userData?.email || '',
        phone: userData?.phone || '',
        address: userData?.address || '',
        bio: userData?.bio || '',
        dob: userData?.dob ? userData.dob.split('T')[0] : '',
        country_id: userData?.country_id || ''
      };
      setFormData(newFormData);
    }
  }, [userData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // First upload profile picture if one is selected
      if (profileImageUpload.selectedFile) {
        const formData = new FormData();
        formData.append('content', profileImageUpload.selectedFile);
        
        const uploadResponse = await upload('media/uploadProfilePic', formData);
        if (uploadResponse?.status !== 200) {
          toast.error('Failed to upload profile picture');
          return;
        }
      }
      
      // Then save profile data
      await onSave(formData, bioValue);
      
      // Reset the image upload state
      profileImageUpload.resetUpload();
      
    } catch (error) {
      console.error('Error in form submission:', error);
      toast.error('Failed to save profile');
    }
  };

  const handleCancel = () => {
    profileImageUpload.resetUpload();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden">
          {/* Profile Banner styled like cover image */}
          <div className="h-32">
            <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-r from-[#F9D769]/20 to-[#E8C547]/20 rounded-t-xl">
              {profileImageUpload.previewUrl && (
                <img
                  className="h-full w-full object-cover"
                  src={profileImageUpload.previewUrl}
                  alt="Preview of uploaded profile image"
                  width={512}
                  height={96}
                />
              )}
              {!profileImageUpload.previewUrl && userData?.profile_pic && (
                <img
                  className="h-full w-full object-cover"
                  src={userData.profile_pic}
                  alt="Current profile image"
                  width={512}
                  height={96}
                />
              )}
              <div className="absolute inset-0 flex items-center justify-center gap-2">
                <button
                  type="button"
                  className="z-50 flex size-10 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white outline-offset-2 transition-colors hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F9D769]/70"
                  onClick={profileImageUpload.handleThumbnailClick}
                  aria-label="Change profile image"
                >
                  <ImagePlusIcon className="w-4 h-4" />
                </button>
                {(profileImageUpload.previewUrl || userData?.profile_pic) && (
                  <button
                    type="button"
                    className="z-50 flex size-10 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white outline-offset-2 transition-colors hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F9D769]/70"
                    onClick={profileImageUpload.handleRemove}
                    aria-label="Remove profile image"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <input
              type="file"
              ref={profileImageUpload.fileInputRef}
              onChange={profileImageUpload.handleFileChange}
              className="hidden"
              accept="image/*"
              aria-label="Upload profile image"
            />
          </div>
          
          <div className="px-6 pb-6 pt-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Edit Profile</h2>
              <p className="text-sm text-gray-600">Update your profile information and settings</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`${id}-first-name`}>First name</Label>
                  <Input
                    id={`${id}-first-name`}
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    type="text"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${id}-last-name`}>Last name</Label>
                  <Input
                    id={`${id}-last-name`}
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    type="text"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`${id}-username`}>Username</Label>
                <div className="relative">
                  <Input
                    id={`${id}-username`}
                    className="peer pe-9"
                    placeholder="Username"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    type="text"
                    required
                  />
                  <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-gray-500 peer-disabled:opacity-50">
                    <CheckIcon className="w-4 h-4 text-green-500" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`${id}-email`}>Email Address</Label>
                  <Input
                    id={`${id}-email`}
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    type="email"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`${id}-phone`}>Phone Number</Label>
                  <Input
                    id={`${id}-phone`}
                    placeholder="Phone number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    type="tel"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${id}-address`}>Address</Label>
                <Input
                  id={`${id}-address`}
                  placeholder="Address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  type="text"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${id}-dob`}>Date of Birth</Label>
                <Input
                  id={`${id}-dob`}
                  value={formData.dob}
                  onChange={(e) => handleInputChange('dob', e.target.value)}
                  type="date"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`${id}-bio`}>Biography</Label>
                <Textarea
                  id={`${id}-bio`}
                  placeholder="Write a few sentences about yourself"
                  value={bioValue}
                  maxLength={maxLength}
                  onChange={handleBioChange}
                  aria-describedby={`${id}-description`}
                  rows={4}
                />
                <p
                  id={`${id}-description`}
                  className="mt-2 text-right text-xs text-gray-500"
                  role="status"
                  aria-live="polite"
                >
                  <span className="tabular-nums">{limit - characterCount}</span> characters left
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={handleCancel} disabled={loading} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <motion.div 
                        animate={{ rotate: 360 }} 
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 mr-2"
                      >
                        <LoadingIcon className="w-4 h-4" />
                      </motion.div>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Quick Stats Card Component
const QuickStatsCard = ({ userData, loading }) => {
  if (loading) {
    return <SkeletonQuickStats />;
  }

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 space-y-6"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-r from-[#F9D769] to-[#E8C547] rounded-lg flex items-center justify-center">
          <UserIcon className="w-5 h-5 text-[#734D20]" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Quick Stats</h3>
          <p className="text-sm text-gray-600">Account overview</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-gradient-to-r from-[#F9D769]/10 to-[#E8C547]/10 rounded-lg border border-[#F9D769]/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Account Type</p>
              <p className="text-lg font-bold text-[#734D20] capitalize">{userData?.user_type || 'User'}</p>
            </div>
            <BriefcaseIcon className="w-8 h-8 text-[#734D20]" />
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Member Since</p>
              <p className="text-lg font-bold text-gray-900">
                {userData?.created_on 
                  ? new Date(userData.created_on).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                  : 'Unknown'
                }
              </p>
            </div>
            <MailIcon className="w-8 h-8 text-gray-600" />
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Referral Code</p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold text-[#734D20]">{userData?.referral_code || 'N/A'}</p>
                {userData?.referral_code && (
                  <button 
                    className="text-gray-500 hover:text-[#734D20] transition-colors"
                    onClick={() => {
                      navigator.clipboard.writeText(userData.referral_code);
                      toast.success('Referral code copied!');
                    }}
                  >
                    <CopyIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// PIN Setup Modal
const PinSetupModal = ({ isOpen, onClose, onSuccess }) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (pin !== confirmPin) {
      toast.error('PINs do not match');
      return;
    }
    
    if (pin.length !== 5) {
      toast.error('PIN must be 5 digits');
      return;
    }

    setLoading(true);
    try {
      const response = await post('wallet/setTransactionPin', {
        pin: pin,
        confirm_pin: confirmPin
      });
      
      if (response?.status === 200) {
        toast.success('Wallet PIN set successfully!');
        onSuccess();
        onClose();
        setPin('');
        setConfirmPin('');
      }
    } catch (error) {
      console.error('Error setting PIN:', error);
      toast.error('Failed to set PIN');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl max-w-md w-full"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-[#F9D769] to-[#E8C547] rounded-lg flex items-center justify-center">
              <LockIcon className="w-5 h-5 text-[#734D20]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Set Wallet PIN</h3>
              <p className="text-sm text-gray-600">Secure your wallet with a 5-digit PIN</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pin">Enter PIN</Label>
              <Input
                id="pin"
                type="password"
                placeholder="12345"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 5))}
                maxLength={5}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-pin">Confirm PIN</Label>
              <Input
                id="confirm-pin"
                type="password"
                placeholder="12345"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 5))}
                maxLength={5}
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <motion.div 
                      animate={{ rotate: 360 }} 
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 mr-2"
                    >
                      <LoadingIcon className="w-4 h-4" />
                    </motion.div>
                    Setting PIN...
                  </>
                ) : (
                  'Set PIN'
                )}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

// Business Verification Component with proper status handling
function BusinessVerification({ userData }) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    business_name: '',
    business_address: '',
    business_phone: '',
    business_email: '',
    business_website: '',
    country: 'UG',
    is_registered: 1,
    registration_number: '',
    business_description: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await post('users/verifyBusiness', formData);
      if (response?.status === 200) {
        toast.success('Business verification submitted successfully!');
        setShowForm(false);
      }
    } catch (error) {
      console.error('Error submitting business verification:', error);
      toast.error('Failed to submit business verification');
    } finally {
      setLoading(false);
    }
  };

  // Get business verification status from the API response
  const getBusinessStatus = () => {
    if (!userData?.business_profile) {
      return {
        status: 'none',
        icon: AlertCircleIcon,
        title: 'Verification Required',
        description: 'Complete business verification to unlock campaign features',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-900',
        iconColor: 'text-yellow-600'
      };
    }

    const verificationStatus = userData.business_profile.verification_status;
    
    switch (verificationStatus) {
      case 'approved':
        return {
          status: 'approved',
          icon: CheckCircleIcon,
          title: 'Business Verified',
          description: 'Your business account has been successfully verified',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-900',
          iconColor: 'text-green-600'
        };
      case 'pending':
        return {
          status: 'pending',
          icon: ClockIcon,
          title: 'Verification Pending',
          description: 'Your business verification is under review',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          textColor: 'text-orange-900',
          iconColor: 'text-orange-600'
        };
      case 'rejected':
        return {
          status: 'rejected',
          icon: XCircleIcon,
          title: 'Verification Rejected',
          description: 'Your business verification was rejected. Please resubmit with correct information.',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-900',
          iconColor: 'text-red-600'
        };
      default:
        return {
          status: 'none',
          icon: AlertCircleIcon,
          title: 'Verification Required',
          description: 'Complete business verification to unlock campaign features',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-900',
          iconColor: 'text-yellow-600'
        };
    }
  };

  const businessStatus = getBusinessStatus();

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl border border-gray-200 shadow-lg p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-[#F9D769] to-[#E8C547] rounded-lg flex items-center justify-center">
          <BriefcaseIcon className="w-5 h-5 text-[#734D20]" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Business Verification</h3>
          <p className="text-sm text-gray-600">Verify your business to create campaigns</p>
        </div>
      </div>

      <div className={`p-4 ${businessStatus.bgColor} rounded-lg border ${businessStatus.borderColor} mb-6`}>
        <div className="flex items-center gap-3">
          <businessStatus.icon className={`w-5 h-5 ${businessStatus.iconColor}`} />
          <div>
            <p className={`font-medium ${businessStatus.textColor}`}>{businessStatus.title}</p>
            <p className={`text-sm ${businessStatus.iconColor}`}>{businessStatus.description}</p>
          </div>
        </div>
      </div>

      {/* Show business details if verified or pending */}
      {/* {userData?.business_profile && (businessStatus.status === 'approved' || businessStatus.status === 'pending') && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Business Details</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-600">Name:</span>
              <span className="ml-2 font-medium">{userData.business_profile.name}</span>
            </div>
            <div>
              <span className="text-gray-600">Email:</span>
              <span className="ml-2 font-medium">{userData.business_profile.email}</span>
            </div>
            <div>
              <span className="text-gray-600">Phone:</span>
              <span className="ml-2 font-medium">{userData.business_profile.phone}</span>
            </div>
            <div>
              <span className="text-gray-600">Website:</span>
              <span className="ml-2 font-medium">{userData.business_profile.website || 'N/A'}</span>
            </div>
          </div>
        </div>
      )} */}

      {/* Show form or start button based on status */}
      {(businessStatus.status === 'none' || businessStatus.status === 'rejected') && (
        <div className="space-y-4">
          {!showForm ? (
            <Button onClick={() => setShowForm(true)} className="w-full">
              {businessStatus.status === 'rejected' ? 'Resubmit Verification' : 'Start Business Verification'}
            </Button>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900">Business Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="business-name">Business Name</Label>
                  <Input 
                    id="business-name" 
                    placeholder="Your Business Name"
                    value={formData.business_name}
                    onChange={(e) => handleInputChange('business_name', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business-email">Business Email</Label>
                  <Input 
                    id="business-email" 
                    type="email" 
                    placeholder="business@company.com"
                    value={formData.business_email}
                    onChange={(e) => handleInputChange('business_email', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business-website">Website (Optional)</Label>
                  <Input 
                    id="business-website" 
                    placeholder="https://yourwebsite.com"
                    value={formData.business_website}
                    onChange={(e) => handleInputChange('business_website', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business-phone">Business Phone</Label>
                  <Input 
                    id="business-phone" 
                    placeholder="+256-772-123456"
                    value={formData.business_phone}
                    onChange={(e) => handleInputChange('business_phone', e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="business-address">Business Address</Label>
                <Textarea 
                  id="business-address" 
                  placeholder="Full business address"
                  value={formData.business_address}
                  onChange={(e) => handleInputChange('business_address', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business-description">Business Description</Label>
                <Textarea 
                  id="business-description" 
                  placeholder="Describe your business and services"
                  value={formData.business_description}
                  onChange={(e) => handleInputChange('business_description', e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} disabled={loading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit for Review'}
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
    </motion.div>
  );
}

// Verification Status Component
function VerificationStatus({ userData, onVerifyEmail, onVerifyPhone }) {
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendEmailOtp = async () => {
    setLoading(true);
    try {
      await post('users/sendEmailOTP', { email: userData.email });
      setEmailOtpSent(true);
      toast.success('Email OTP sent successfully!');
    } catch (error) {
      toast.error('Failed to send email OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSendPhoneOtp = async () => {
    setLoading(true);
    try {
      await post('users/sendPhoneOTP', { phone: userData.phone });
      setPhoneOtpSent(true);
      toast.success('Phone OTP sent successfully!');
    } catch (error) {
      toast.error('Failed to send phone OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    setLoading(true);
    try {
      await post('users/verifyEmail', { email: userData.email, otp: emailOtp });
      toast.success('Email verified successfully!');
      onVerifyEmail();
    } catch (error) {
      toast.error('Failed to verify email');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPhone = async () => {
    setLoading(true);
    try {
      await post('users/verifyPhone', { phone: userData.phone, otp: phoneOtp });
      toast.success('Phone verified successfully!');
      onVerifyPhone();
    } catch (error) {
      toast.error('Failed to verify phone');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !userData) {
    return <SkeletonVerificationCard />;
  }

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl border border-gray-200 shadow-lg p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-[#F9D769] to-[#E8C547] rounded-lg flex items-center justify-center">
          <ShieldIcon className="w-5 h-5 text-[#734D20]" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Account Verification</h3>
          <p className="text-sm text-gray-600">Secure and verify your account details</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Email Verification */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <MailIcon className="w-5 h-5 text-gray-600" />
            <div>
              <p className="font-medium text-gray-900">Email Address</p>
              <p className="text-sm text-gray-600">{userData?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {userData?.email_verified === "yes" ? (
              <>
                <CheckIcon className="w-4 h-4 text-green-600" />
                <Badge variant="success">Verified</Badge>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                {!emailOtpSent ? (
                  <Button size="sm" onClick={handleSendEmailOtp} disabled={loading}>
                    Send OTP
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter OTP"
                      value={emailOtp}
                      onChange={(e) => setEmailOtp(e.target.value)}
                      className="w-20 h-8 text-sm"
                    />
                    <Button size="sm" onClick={handleVerifyEmail} disabled={loading || !emailOtp}>
                      Verify
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Phone Verification */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <PhoneIcon className="w-5 h-5 text-gray-600" />
            <div>
              <p className="font-medium text-gray-900">Phone Number</p>
              <p className="text-sm text-gray-600">{userData?.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {userData?.phone_verified === "yes" ? (
              <>
                <CheckIcon className="w-4 h-4 text-green-600" />
                <Badge variant="success">Verified</Badge>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                {!phoneOtpSent ? (
                  <Button size="sm" onClick={handleSendPhoneOtp} disabled={loading}>
                    Send OTP
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter OTP"
                      value={phoneOtp}
                      onChange={(e) => setPhoneOtp(e.target.value)}
                      className="w-20 h-8 text-sm"
                    />
                    <Button size="sm" onClick={handleVerifyPhone} disabled={loading || !phoneOtp}>
                      Verify
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Account Level */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#F9D769]/10 to-[#E8C547]/10 rounded-lg border border-[#F9D769]/20">
          <div className="flex items-center gap-3">
            <CrownIcon className="w-5 h-5 text-[#734D20]" />
            <div>
              <p className="font-medium text-gray-900">Account Level</p>
              <p className="text-sm text-gray-600">Level {userData?.level_id || 1} - Enhanced features unlocked</p>
            </div>
          </div>
          <Badge variant="gold">{userData?.level_name || 'Member'}</Badge>
        </div>
      </div>
    </motion.div>
  );
}

// Security Settings Component with wallet PIN functionality
function SecuritySettings({ userData, onRefresh }) {
  const [showPinModal, setShowPinModal] = useState(false);

  const handleSetPin = () => {
    setShowPinModal(true);
  };

  const handlePinSuccess = () => {
    onRefresh(); // Refresh user data to update PIN status
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -5 }}
        className="bg-white rounded-xl border border-gray-200 shadow-lg p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-[#F9D769] to-[#E8C547] rounded-lg flex items-center justify-center">
            <SettingsIcon className="w-5 h-5 text-[#734D20]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Security & Privacy</h3>
            <p className="text-sm text-gray-600">Manage your account security settings</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {userData?.has_pin ? (
                <LockIcon className="w-5 h-5 text-green-600" />
              ) : (
                <UnlockIcon className="w-5 h-5 text-red-600" />
              )}
              <div>
                <p className="font-medium text-gray-900">Wallet PIN</p>
                <p className="text-sm text-gray-600">Secure your wallet transactions</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {userData?.has_pin ? (
                <>
                  <CheckIcon className="w-4 h-4 text-green-600" />
                  <Badge variant="success">Enabled</Badge>
                </>
              ) : (
                <Button size="sm" onClick={handleSetPin}>
                  <LockIcon className="w-4 h-4 mr-2" />
                  Enable PIN
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <WalletIcon className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">Wallet Balance</p>
                <p className="text-sm text-gray-600">{userData?.wallet?.balance || '0'} GEMS available</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="info">{userData?.wallet?.balance || '0'} GEMS</Badge>
            </div>
          </div>
        </div>
      </motion.div>

      <PinSetupModal 
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        onSuccess={handlePinSuccess}
      />
    </>
  );
}

// Main Settings Page Component
export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // Fetch user profile data
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await get('users/getUserProfile');
      if (response?.status === 200 && response.data) {
        setUserData(response.data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleSaveProfile = async (formData, bioValue) => {
    setProfileLoading(true);
    try {
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        bio: bioValue,
        address: formData.address,
        phone: formData.phone,
        dob: formData.dob,
        country_id: formData.country_id || userData?.country_id
      };

      const response = await patch('users/updateProfile', updateData);
      if (response?.status === 200) {
        toast.success('Profile updated successfully!');
        setIsProfileEditOpen(false);
        await fetchUserProfile(); // Refresh data
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleVerifyEmail = () => {
    setUserData(prev => ({ ...prev, email_verified: 'yes' }));
  };

  const handleVerifyPhone = () => {
    setUserData(prev => ({ ...prev, phone_verified: 'yes' }));
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen">
        <div className="container mx-auto">
          <div className="flex flex-col gap-10">
            {/* Row 1: Profile Overview (left) + Quick Stats (right) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <SkeletonCard />
              </div>
              <div className="lg:col-span-1">
                <SkeletonQuickStats />
              </div>
            </div>

            {/* Row 2: Account Verification - Full Width */}
            <SkeletonVerificationCard />

            {/* Row 3: Business Verification */}
            <SkeletonVerificationCard />

            {/* Row 4: Security Settings */}
            <SkeletonVerificationCard />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen">
      <div className="container mx-auto">
        <div className="flex flex-col gap-10">
          {/* Row 1: Profile Overview (left) + Quick Stats (right) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Profile Overview Card - Takes 2/3 width */}
            <div className="lg:col-span-2">
              <ProfileOverviewCard 
                userData={userData} 
                onEditProfile={() => setIsProfileEditOpen(true)}
                loading={loading}
              />
            </div>

            {/* Quick Stats Card - Takes 1/3 width */}
            <div className="lg:col-span-1">
              <QuickStatsCard userData={userData} loading={loading} />
            </div>
          </div>

          {/* Row 2: Account Verification - Full Width */}
          <VerificationStatus 
            userData={userData} 
            onVerifyEmail={handleVerifyEmail}
            onVerifyPhone={handleVerifyPhone}
          />

          {/* Row 3: Business Verification - Only show for brand users */}
          {userData?.user_type === "brand" && (
            <BusinessVerification userData={userData} />
          )}

          {/* Row 4: Security Settings - Full Width */}
          <SecuritySettings userData={userData} onRefresh={fetchUserProfile} />

        </div>
      </div>

      {/* Profile Edit Modal */}
      <ProfileEditModal 
        isOpen={isProfileEditOpen}
        onClose={() => setIsProfileEditOpen(false)}
        userData={userData}
        onSave={handleSaveProfile}
        loading={profileLoading}
        onRefresh={fetchUserProfile}
      />
    </div>
  );
}