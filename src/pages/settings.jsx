"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState, useId, useRef, useCallback, useEffect, ChangeEvent } from "react";
import { useLocation } from "react-router-dom";
import { get, post, patch, upload } from '../utils/service';
import { toast } from 'sonner';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

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
  FiCamera as CameraIcon,
  FiUpload as UploadIcon,
  FiTrash2 as TrashIcon,
  FiCrop as CropIcon,
  FiMapPin as MapPinIcon,
} from 'react-icons/fi';

import { RiVerifiedBadgeFill } from "react-icons/ri";

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

// URL validation function
const isValidUrl = (string) => {
  if (!string || string.trim() === '') return true; // Allow empty for optional field
  
  try {
    // First try URL constructor (most reliable)
    new URL(string);
    return true;
  } catch (_) {
    // Fallback to regex for more permissive validation
    const urlPattern = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;
    return urlPattern.test(string);
  }
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

// Profile Image Crop Modal
const ProfileImageCropModal = ({ isOpen, onClose, imageSrc, onCropComplete }) => {
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState();
  const imgRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    // Set aspect ratio to 1:1 for square profile picture
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 80,
        },
        1, // 1:1 aspect ratio for square
        width,
        height
      ),
      width,
      height
    );
    setCrop(crop);
  };

  const getCroppedImg = useCallback(async (image, crop) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Set canvas to square 400x400 dimensions for profile picture
    canvas.width = 400;
    canvas.height = 400;

    ctx.imageSmoothingQuality = 'high';

    // Calculate the source dimensions
    const sourceWidth = crop.width * scaleX;
    const sourceHeight = crop.height * scaleY;
    const sourceX = crop.x * scaleX;
    const sourceY = crop.y * scaleY;

    ctx.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      400,
      400
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            console.error('Canvas is empty');
            return;
          }
          const croppedImageUrl = URL.createObjectURL(blob);
          resolve({ blob, url: croppedImageUrl });
        },
        'image/jpeg',
        0.95
      );
    });
  }, []);

  const handleCropComplete = useCallback(async () => {
    if (completedCrop && imgRef.current) {
      try {
        const { blob, url } = await getCroppedImg(imgRef.current, completedCrop);
        onCropComplete(url, blob);
        onClose();
      } catch (error) {
        console.error('Error cropping image:', error);
      }
    }
  }, [completedCrop, getCroppedImg, onCropComplete, onClose]);

  if (!isOpen) return null;

  // Mobile Drawer
  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 flex items-end">
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <div className="relative z-50 w-full bg-white rounded-t-xl max-h-[90vh] flex flex-col border-t border-gray-200">
          {/* Mobile Header */}
          <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-[#E8C547] rounded-lg flex items-center justify-center">
                  <CropIcon className="w-4 h-4 text-secondary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Crop Profile Picture</h3>
                  <p className="text-xs text-gray-600">Adjust to square format</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <XIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Mobile Content */}
          <div className="flex-1 overflow-y-auto p-4 bg-white">
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                <ImagePlusIcon className="w-3 h-3" />
                <span>Output: 400 × 400 pixels</span>
              </div>
              <p className="text-xs text-gray-500">
                Drag corners to adjust crop area
              </p>
            </div>

            <div className="flex justify-center mb-4">
              <div className="max-w-full overflow-hidden rounded-lg border border-gray-300">
                <ReactCrop
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={1} // 1:1 aspect ratio for square
                  className="max-w-full h-auto"
                >
                  <img
                    ref={imgRef}
                    src={imageSrc}
                    alt="Crop preview"
                    onLoad={onImageLoad}
                    className="max-w-full h-auto block"
                    style={{ maxHeight: '300px' }}
                  />
                </ReactCrop>
              </div>
            </div>

            {completedCrop && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-xs text-green-700">
                  <CheckIcon className="w-3 h-3" />
                  <span>
                    Ready to crop: {Math.round(completedCrop.width)} × {Math.round(completedCrop.height)} 
                    → 400 × 400
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Footer */}
          <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCropComplete}
                disabled={!completedCrop}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-primary to-[#E8C547] text-secondary rounded-lg hover:from-[#E8C547] hover:to-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <CheckIcon className="w-4 h-4" />
                Apply Crop
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop Modal
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-200">
        {/* Desktop Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-[#E8C547] rounded-lg flex items-center justify-center">
              <CropIcon className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Crop Profile Picture</h3>
              <p className="text-xs text-gray-600">Adjust your profile image to square format</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <XIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        {/* Desktop Content */}
        <div className="p-6 bg-white overflow-auto max-h-[calc(90vh-140px)]">
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
              <ImagePlusIcon className="w-4 h-4" />
              <span>Output Resolution: 400 × 400 pixels (Square Format)</span>
            </div>
            <p className="text-xs text-gray-500">
              Drag the corners to adjust the crop area. The final image will be optimized for profile display.
            </p>
          </div>

          <div className="flex justify-center">
            <div className="max-w-full max-h-96 overflow-hidden rounded-lg border border-gray-300">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1} // 1:1 aspect ratio for square
                className="max-w-full h-auto"
              >
                <img
                  ref={imgRef}
                  src={imageSrc}
                  alt="Crop preview"
                  onLoad={onImageLoad}
                  className="max-w-full h-auto block"
                  style={{ maxHeight: '400px' }}
                />
              </ReactCrop>
            </div>
          </div>

          {completedCrop && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-green-700">
                <CheckIcon className="w-4 h-4" />
                <span>
                  Crop area selected: {Math.round(completedCrop.width)} × {Math.round(completedCrop.height)} 
                  → will be resized to 400 × 400
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gradient-to-r from-primary to-[#E8C547] rounded-full"></div>
              <span>Perfect for profile pictures and avatars</span>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleCropComplete}
              disabled={!completedCrop}
              className="px-6 py-2 bg-gradient-to-r from-primary to-[#E8C547] text-secondary rounded-lg hover:from-[#E8C547] hover:to-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-medium flex items-center gap-2 shadow-sm"
            >
              <CheckIcon className="w-4 h-4" />
              Apply Crop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Skeleton Loading Components
const SkeletonLoader = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
);

// UI Components
const Button = ({ className, variant = "default", size = "default", children, disabled, ...props }) => {
  const variants = {
    default: "bg-gradient-to-r from-primary to-[#E8C547] text-secondary hover:from-[#E8C547] hover:to-primary",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
    ghost: "text-gray-700 hover:bg-gray-100",
    destructive: "bg-red-500 text-white hover:bg-red-600",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200"
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
        "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-xs font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
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
        "flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 transition-colors placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50",
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
        "flex min-h-[80px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 transition-colors placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
};

const Label = ({ className, required, children, ...props }) => (
  <label
    className={cn(
      "text-sm font-semibold text-gray-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className
    )}
    {...props}
  >
    {children}
    {required && <span className="text-red-500 ml-1">*</span>}
  </label>
);

const Badge = ({ className, children, variant = "default", ...props }) => {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-primary-scale-100 text-secondary",
    error: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
    gold: "bg-gradient-to-r from-primary to-[#E8C547] text-secondary",
    pending: "bg-orange-100 text-orange-800"
  };

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full px-2 py-1 text-xs font-medium whitespace-nowrap",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
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
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Profile Banner styled like cover image */}
          <div className="h-32">
            <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-r from-primary/20 to-[#E8C547]/20 rounded-t-xl">
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
                  className="z-50 flex size-10 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white outline-offset-2 transition-colors hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary/70"
                  onClick={profileImageUpload.handleThumbnailClick}
                  aria-label="Change profile image"
                >
                  <ImagePlusIcon className="w-4 h-4" />
                </button>
                {(profileImageUpload.previewUrl || userData?.profile_pic) && (
                  <button
                    type="button"
                    className="z-50 flex size-10 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white outline-offset-2 transition-colors hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary/70"
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
              <p className="text-xs text-gray-600">Update your profile information and settings</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`${id}-first-name`} required>First name</Label>
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
                  <Label htmlFor={`${id}-last-name`} required>Last name</Label>
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
                <Label htmlFor={`${id}-username`} required>Username</Label>
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
                  <Label htmlFor={`${id}-email`} required>Email Address</Label>
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
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-[#E8C547] rounded-lg flex items-center justify-center">
              <LockIcon className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Set Wallet PIN</h3>
              <p className="text-xs text-gray-600">Secure your wallet with a 5-digit PIN</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pin" required>Enter PIN</Label>
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
              <Label htmlFor="confirm-pin" required>Confirm PIN</Label>
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

// Main Settings Page Component
export default function SettingsPage() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [businessLoading, setBusinessLoading] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [verificationLoading, setVerificationLoading] = useState(false);

  // Profile image editing states
  const [showProfileImageModal, setShowProfileImageModal] = useState(false);
  const [profileImageCropSrc, setProfileImageCropSrc] = useState(null);
  const [profileImageUploading, setProfileImageUploading] = useState(false);
  const profileImageInputRef = useRef(null);
  const businessVerificationRef = useRef(null);

  // Business form validation errors
  const [businessFormErrors, setBusinessFormErrors] = useState({});

  const [businessFormData, setBusinessFormData] = useState({
    business_name: '',
    business_email: '',
    business_phone: '',
    business_website: '',
    street_address: '',
    city: '',
    state_province: '',
    postal_code: '',
    is_registered: 1,
    registration_number: '',
    business_description: ''
  });

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

  // Handle navigation state to focus on business verification
  useEffect(() => {
    if (location.state?.focusBusinessVerification && businessVerificationRef.current) {
      setTimeout(() => {
        businessVerificationRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 500);
    }
  }, [location.state, userData]);

  // Auto-populate business form data when userData changes
  useEffect(() => {
    if (userData) {
      setBusinessFormData(prev => ({
        ...prev,
        business_name: userData?.first_name || userData?.firstName || '',
        business_email: userData?.email || '',
        business_phone: userData?.phone || ''
      }));
    }
  }, [userData]);

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

  const handlePinSuccess = () => {
    fetchUserProfile(); // Refresh user data to update PIN status
  };

  // Profile image editing handlers
  const handleProfileImageClick = () => {
    profileImageInputRef.current?.click();
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setProfileImageCropSrc(url);
      setShowProfileImageModal(true);
    }
  };

  const handleProfileImageCropComplete = async (croppedUrl, croppedBlob) => {
    setProfileImageUploading(true);
    try {
      const formData = new FormData();
      formData.append('content', croppedBlob);
      
      const uploadResponse = await upload('media/uploadProfilePic', formData);
      if (uploadResponse?.status === 200) {
        toast.success('Profile picture updated successfully!');
        await fetchUserProfile(); // Refresh user data
      } else {
        toast.error('Failed to upload profile picture');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast.error('Failed to upload profile picture');
    } finally {
      setProfileImageUploading(false);
    }
  };

  const closeProfileImageModal = () => {
    if (profileImageCropSrc) {
      URL.revokeObjectURL(profileImageCropSrc);
    }
    setProfileImageCropSrc(null);
    setShowProfileImageModal(false);
  };

  // Business verification handlers
  const handleBusinessInputChange = (field, value) => {
    setBusinessFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field when user starts typing
    if (businessFormErrors[field]) {
      setBusinessFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    // Validate website URL in real-time
    if (field === 'business_website' && value && !isValidUrl(value)) {
      setBusinessFormErrors(prev => ({
        ...prev,
        [field]: 'Please enter a valid website URL (e.g., https://example.com)'
      }));
    }
  };

  const validateBusinessForm = () => {
    const errors = {};
    const requiredFields = [
      'business_name', 
      'business_email', 
      'business_phone', 
      'street_address', 
      'city', 
      'business_description'
    ];

    requiredFields.forEach(field => {
      if (!businessFormData[field] || businessFormData[field].trim() === '') {
        errors[field] = 'This field is required';
      }
    });

    // Validate email format
    if (businessFormData.business_email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(businessFormData.business_email)) {
        errors.business_email = 'Please enter a valid email address';
      }
    }

    // Validate website URL if provided
    if (businessFormData.business_website && !isValidUrl(businessFormData.business_website)) {
      errors.business_website = 'Please enter a valid website URL (e.g., https://example.com)';
    }

    // Validate registration number if business is registered
    if (businessFormData.is_registered === 1 && (!businessFormData.registration_number || businessFormData.registration_number.trim() === '')) {
      errors.registration_number = 'Registration number is required for registered businesses';
    }

    setBusinessFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBusinessSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateBusinessForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setBusinessLoading(true);
    
    try {
      // Combine address fields into business_address
      const addressParts = [
        businessFormData.street_address,
        businessFormData.city,
        businessFormData.state_province,
        businessFormData.postal_code
      ].filter(Boolean);
      
      const submitData = {
        ...businessFormData,
        business_address: addressParts.join(', ')
      };

      const response = await post('users/verifyBusiness', submitData);
      if (response?.status === 200) {
        toast.success('Business verification submitted successfully!');
        await fetchUserProfile();
      }
    } catch (error) {
      console.error('Error submitting business verification:', error);
      toast.error('Failed to submit business verification');
    } finally {
      setBusinessLoading(false);
    }
  };

  // Email verification handlers
  const handleSendEmailOtp = async () => {
    setVerificationLoading(true);
    try {
      await post('users/sendEmailOTP', { email: userData.email });
      setEmailOtpSent(true);
      toast.success('Email OTP sent successfully!');
    } catch (error) {
      toast.error('Failed to send email OTP');
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleSendPhoneOtp = async () => {
    setVerificationLoading(true);
    try {
      await post('users/sendPhoneOTP', { phone: userData.phone });
      setPhoneOtpSent(true);
      toast.success('Phone OTP sent successfully!');
    } catch (error) {
      toast.error('Failed to send phone OTP');
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    setVerificationLoading(true);
    try {
      await post('users/verifyEmail', { email: userData.email, otp: emailOtp });
      toast.success('Email verified successfully!');
      handleVerifyEmail();
      setEmailOtpSent(false);
      setEmailOtp('');
    } catch (error) {
      toast.error('Failed to verify email');
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleVerifyPhoneOtp = async () => {
    setVerificationLoading(true);
    try {
      await post('users/verifyPhone', { phone: userData.phone, otp: phoneOtp });
      toast.success('Phone verified successfully!');
      handleVerifyPhone();
      setPhoneOtpSent(false);
      setPhoneOtp('');
    } catch (error) {
      toast.error('Failed to verify phone');
    } finally {
      setVerificationLoading(false);
    }
  };

  // Get business verification status
  const getBusinessStatus = () => {
    if (!userData?.business_profile) {
      return {
        status: 'none',
        icon: AlertCircleIcon,
        title: 'Verification Required',
        description: 'Complete business verification to unlock campaign features',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50'
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
          color: 'text-green-600',
          bgColor: 'bg-green-50'
        };
      case 'pending':
        return {
          status: 'pending',
          icon: ClockIcon,
          title: 'Verification Pending',
          description: 'Your business verification is under review',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50'
        };
      case 'rejected':
        return {
          status: 'rejected',
          icon: XCircleIcon,
          title: 'Verification Rejected',
          description: 'Your business verification was rejected. Please resubmit with correct information.',
          color: 'text-red-600',
          bgColor: 'bg-red-50'
        };
      default:
        return {
          status: 'none',
          icon: AlertCircleIcon,
          title: 'Verification Required',
          description: 'Complete business verification to unlock campaign features',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50'
        };
    }
  };

  const businessStatus = getBusinessStatus();

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Profile Header Skeleton */}
        <div className="flex items-start gap-6 pb-8">
          <SkeletonLoader className="w-24 h-24 rounded-full" />
          <div className="flex-1 space-y-3">
            <SkeletonLoader className="h-8 w-64" />
            <SkeletonLoader className="h-4 w-32" />
            <SkeletonLoader className="h-4 w-96" />
            <div className="flex gap-4">
              <SkeletonLoader className="h-6 w-24" />
              <SkeletonLoader className="h-6 w-24" />
            </div>
          </div>
          <SkeletonLoader className="h-10 w-32" />
        </div>
        
        {/* Grid Skeletons */}
        <div className="space-y-6">
          <SkeletonLoader className="h-64 w-full" />
          <SkeletonLoader className="h-48 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto">
      {/* Profile Header */}
      <div className="flex flex-wrap items-start gap-6 pb-8 mb-4 border-b border-gray-200">
        <div className="relative">
          <div
            className="cursor-pointer relative group"
            onClick={handleProfileImageClick}
          >
            <img
              src={userData?.profile_pic || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.first_name || userData?.firstName || 'User')}&background=F9D769&color=734D20&size=96&rounded=true`}
              alt={`${userData?.first_name || userData?.firstName || 'User'} ${userData?.last_name || userData?.lastName || ''}`}
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <CameraIcon className="w-6 h-6 text-white" />
            </div>
            {profileImageUploading && (
              <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                />
              </div>
            )}
          </div>
          <button
            onClick={handleProfileImageClick}
            className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-primary to-[#E8C547] rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
          >
            <CameraIcon className="w-3 h-3 text-secondary" />
          </button>
          <input
            type="file"
            ref={profileImageInputRef}
            onChange={handleProfileImageChange}
            className="hidden"
            accept="image/*"
          />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-1 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">
              {userData?.first_name || userData?.firstName || 'User'} {userData?.last_name || userData?.lastName || ''}
            </h1>
            {userData?.email_verified === "yes" && (
              <RiVerifiedBadgeFill className="w-5 h-5 text-green-500" />
            )}
          </div>
          
          <p className="text-xs text-gray-600 mb-2">@{userData?.username || 'username'}</p>
          <p className="text-xs text-gray-700 mb-4 max-w-md leading-relaxed">
            {userData?.bio || 'No bio available'}
          </p>
        </div>
        
        <Button onClick={() => setIsProfileEditOpen(true)} className="shrink-0 font-semibold">
          <EditIcon className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      <div className="space-y-8">
        {/* Account Verification */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <ShieldIcon className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">Account Verification</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email Verification */}
            <div className="flex items-center justify-between py-4 px-5 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-4">
                <MailIcon className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Email Address</p>
                  <p className="text-xs text-gray-600">{userData?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {userData?.email_verified === "yes" ? (
                  <>
                    <CheckIcon className="w-4 h-4 text-green-600" />
                    <Badge variant="success">Verified</Badge>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    {!emailOtpSent ? (
                      <Button size="sm" onClick={handleSendEmailOtp} disabled={verificationLoading}>
                        Send OTP
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter OTP"
                          value={emailOtp}
                          onChange={(e) => setEmailOtp(e.target.value)}
                          className="w-20 h-8"
                        />
                        <Button size="sm" onClick={handleVerifyEmailOtp} disabled={verificationLoading || !emailOtp}>
                          Verify
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Phone Verification */}
            <div className="flex items-center justify-between py-4 px-5 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-4">
                <PhoneIcon className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Phone Number</p>
                  <p className="text-xs text-gray-600">{userData?.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {userData?.phone_verified === "yes" ? (
                  <>
                    <CheckIcon className="w-4 h-4 text-green-600" />
                    <Badge variant="success">Verified</Badge>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    {!phoneOtpSent ? (
                      <Button size="sm" onClick={handleSendPhoneOtp} disabled={verificationLoading}>
                        Send OTP
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter OTP"
                          value={phoneOtp}
                          onChange={(e) => setPhoneOtp(e.target.value)}
                          className="w-20 h-8"
                        />
                        <Button size="sm" onClick={handleVerifyPhoneOtp} disabled={verificationLoading || !phoneOtp}>
                          Verify
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Business Verification - Always show for brand users */}
        {userData?.user_type === "brand" && (
          <div ref={businessVerificationRef}>
            <div className="flex items-center gap-3 mb-6">
              <BriefcaseIcon className="w-5 h-5 text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">Business Verification</h2>
            </div>

            <div className={`p-5 ${businessStatus.bgColor} rounded-lg border border-gray-200 mb-6`}>
              <div className="flex items-center gap-3">
                <businessStatus.icon className={`w-5 h-5 ${businessStatus.color}`} />
                <div>
                  <p className={`text-sm font-semibold ${businessStatus.color}`}>{businessStatus.title}</p>
                  <p className="text-xs text-gray-600">{businessStatus.description}</p>
                </div>
              </div>
            </div>

            {/* Business Verification Form - Always visible */}
            <form onSubmit={handleBusinessSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Basic Information</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="business-name" required>Business Name</Label>
                    <Input 
                      id="business-name" 
                      placeholder="Your Business Name"
                      value={businessFormData.business_name}
                      onChange={(e) => handleBusinessInputChange('business_name', e.target.value)}
                      required
                      className={businessFormErrors.business_name ? 'border-red-500' : ''}
                    />
                    {businessFormErrors.business_name && (
                      <p className="text-xs text-red-500 mt-1">{businessFormErrors.business_name}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="business-registration" required>Is your business registered?</Label>
                    <select
                      id="business-registration"
                      value={businessFormData.is_registered}
                      onChange={(e) => handleBusinessInputChange('is_registered', parseInt(e.target.value))}
                      className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      required
                    >
                      <option value={1}>Yes, it's registered</option>
                      <option value={0}>No, not registered</option>
                    </select>
                  </div>
                </div>

                {/* Registration Number - Only show if business is registered */}
                {businessFormData.is_registered === 1 && (
                  <div>
                    <Label htmlFor="registration-number" required>Registration Number</Label>
                    <Input 
                      id="registration-number" 
                      placeholder="Business Registration Number"
                      value={businessFormData.registration_number}
                      onChange={(e) => handleBusinessInputChange('registration_number', e.target.value)}
                      required
                      className={businessFormErrors.registration_number ? 'border-red-500' : ''}
                    />
                    {businessFormErrors.registration_number && (
                      <p className="text-xs text-red-500 mt-1">{businessFormErrors.registration_number}</p>
                    )}
                  </div>
                )}

                <div>
                  <Label htmlFor="business-description" required>Business Description</Label>
                  <Textarea 
                    id="business-description" 
                    placeholder="Describe your business and services"
                    value={businessFormData.business_description}
                    onChange={(e) => handleBusinessInputChange('business_description', e.target.value)}
                    required
                    rows={4}
                    className={businessFormErrors.business_description ? 'border-red-500' : ''}
                  />
                  {businessFormErrors.business_description && (
                    <p className="text-xs text-red-500 mt-1">{businessFormErrors.business_description}</p>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Contact Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="business-email" required>Business Email</Label>
                    <Input 
                      id="business-email" 
                      type="email" 
                      placeholder="business@company.com"
                      value={businessFormData.business_email}
                      onChange={(e) => handleBusinessInputChange('business_email', e.target.value)}
                      required
                      className={businessFormErrors.business_email ? 'border-red-500' : ''}
                    />
                    {businessFormErrors.business_email && (
                      <p className="text-xs text-red-500 mt-1">{businessFormErrors.business_email}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="business-phone" required>Business Phone</Label>
                    <Input 
                      id="business-phone" 
                      placeholder="+256-772-123456"
                      value={businessFormData.business_phone}
                      onChange={(e) => handleBusinessInputChange('business_phone', e.target.value)}
                      required
                      className={businessFormErrors.business_phone ? 'border-red-500' : ''}
                    />
                    {businessFormErrors.business_phone && (
                      <p className="text-xs text-red-500 mt-1">{businessFormErrors.business_phone}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="business-website">Website</Label>
                  <Input 
                    id="business-website" 
                    placeholder="https://yourwebsite.com"
                    value={businessFormData.business_website}
                    onChange={(e) => handleBusinessInputChange('business_website', e.target.value)}
                    className={businessFormErrors.business_website ? 'border-red-500' : ''}
                  />
                  {businessFormErrors.business_website && (
                    <p className="text-xs text-red-500 mt-1">{businessFormErrors.business_website}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Optional - Include protocol (https://) for proper validation
                  </p>
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 flex items-center gap-2">
                  <MapPinIcon className="w-4 h-4" />
                  Business Address
                </h3>
                
                <div>
                  <Label htmlFor="street-address" required>Street Address</Label>
                  <Input 
                    id="street-address" 
                    placeholder="123 Main Street"
                    value={businessFormData.street_address}
                    onChange={(e) => handleBusinessInputChange('street_address', e.target.value)}
                    required
                    className={businessFormErrors.street_address ? 'border-red-500' : ''}
                  />
                  {businessFormErrors.street_address && (
                    <p className="text-xs text-red-500 mt-1">{businessFormErrors.street_address}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city" required>City</Label>
                    <Input 
                      id="city" 
                      placeholder="Kampala"
                      value={businessFormData.city}
                      onChange={(e) => handleBusinessInputChange('city', e.target.value)}
                      required
                      className={businessFormErrors.city ? 'border-red-500' : ''}
                    />
                    {businessFormErrors.city && (
                      <p className="text-xs text-red-500 mt-1">{businessFormErrors.city}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="state-province">State/Province</Label>
                    <Input 
                      id="state-province" 
                      placeholder="Central Region"
                      value={businessFormData.state_province}
                      onChange={(e) => handleBusinessInputChange('state_province', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="postal-code">Postal Code</Label>
                  <Input 
                    id="postal-code" 
                    placeholder="256000"
                    value={businessFormData.postal_code}
                    onChange={(e) => handleBusinessInputChange('postal_code', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t border-gray-200">
                <Button 
                  type="submit" 
                  disabled={businessLoading} 
                  className='font-semibold flex-1 sm:flex-none sm:px-8'
                >
                  {businessLoading ? (
                    <>
                      <motion.div 
                        animate={{ rotate: 360 }} 
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 mr-2"
                      >
                        <LoadingIcon className="w-4 h-4" />
                      </motion.div>
                      {businessStatus.status === 'rejected' ? 'Resubmitting...' : 'Submitting...'}
                    </>
                  ) : (
                    businessStatus.status === 'rejected' ? 'Resubmit for Review' : 'Submit for Review'
                  )}
                </Button>
                
                {businessStatus.status === 'pending' && (
                  <div className="flex items-center text-xs text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
                    <ClockIcon className="w-4 h-4 mr-2" />
                    Under Review
                  </div>
                )}
                
                {businessStatus.status === 'approved' && (
                  <div className="flex items-center text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                    Verified
                  </div>
                )}
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Modals */}
      <ProfileEditModal 
        isOpen={isProfileEditOpen}
        onClose={() => setIsProfileEditOpen(false)}
        userData={userData}
        onSave={handleSaveProfile}
        loading={profileLoading}
        onRefresh={fetchUserProfile}
      />

      <PinSetupModal 
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        onSuccess={handlePinSuccess}
      />

      <ProfileImageCropModal
        isOpen={showProfileImageModal}
        onClose={closeProfileImageModal}
        imageSrc={profileImageCropSrc}
        onCropComplete={handleProfileImageCropComplete}
      />
    </div>
  );
}