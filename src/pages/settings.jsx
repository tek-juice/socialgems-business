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
  FiCamera as CameraIcon,
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

const Label = ({ className, ...props }) => (
  <label
    className={cn(
      "text-xs font-medium text-gray-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className
    )}
    {...props}
  />
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

// Main Settings Page Component
export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showBusinessForm, setShowBusinessForm] = useState(false);
  const [businessLoading, setBusinessLoading] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [verificationLoading, setVerificationLoading] = useState(false);

  const [businessFormData, setBusinessFormData] = useState({
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

  const handlePinSuccess = () => {
    fetchUserProfile(); // Refresh user data to update PIN status
  };

  // Business verification handlers
  const handleBusinessInputChange = (field, value) => {
    setBusinessFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBusinessSubmit = async (e) => {
    e.preventDefault();
    setBusinessLoading(true);
    
    try {
      const response = await post('users/verifyBusiness', businessFormData);
      if (response?.status === 200) {
        toast.success('Business verification submitted successfully!');
        setShowBusinessForm(false);
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <SkeletonLoader className="h-64 w-full" />
            <SkeletonLoader className="h-48 w-full" />
          </div>
          <div className="space-y-6">
            <SkeletonLoader className="h-48 w-full" />
            <SkeletonLoader className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto">
      {/* Profile Header */}
      <div className="flex flex-wrap items-start gap-6 pb-8 mb-4 border-b border-gray-200">
        <div className="relative">
          <img
            src={userData?.profile_pic || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.first_name || userData?.firstName || 'User')}&background=F9D769&color=734D20&size=96&rounded=true`}
            alt={`${userData?.first_name || userData?.firstName || 'User'} ${userData?.last_name || userData?.lastName || ''}`}
            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
          />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-primary to-[#E8C547] rounded-full flex items-center justify-center">
            <CameraIcon className="w-3 h-3 text-secondary" />
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-1 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">
              {userData?.first_name || userData?.firstName || 'User'} {userData?.last_name || userData?.lastName || ''}
            </h1>
            {/* <Badge variant="gold">{userData?.level_name || 'Member'}</Badge> */}
            {userData?.email_verified === "yes" && (
              <RiVerifiedBadgeFill className="w-5 h-5 text-green-500" />
            )}
          </div>
          
          <p className="text-xs text-gray-600 mb-2">@{userData?.username || 'username'}</p>
          <p className="text-xs text-gray-700 mb-4 max-w-md leading-relaxed">
            {userData?.bio || 'No bio available'}
          </p>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <WalletIcon className="w-4 h-4 text-gray-500" />
              <span className="text-xs font-semibold text-gray-900">{userData?.wallet?.balance || '0'}</span>
              <span className="text-xs text-gray-500">GEMS</span>
            </div>
            <div className="flex items-center gap-2">
              <CrownIcon className="w-4 h-4 text-gray-500" />
              <span className="text-xs font-semibold text-gray-900">Level {userData?.level_id || '1'}</span>
            </div>
            <div className="flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-gray-500" />
              <span className="text-xs text-gray-500 capitalize">{userData?.user_type || 'User'}</span>
            </div>
          </div>
        </div>
        
        <Button onClick={() => setIsProfileEditOpen(true)} className="shrink-0 font-semibold">
          <EditIcon className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Account Verification */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <ShieldIcon className="w-5 h-5 text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">Account Verification</h2>
            </div>
            
            <div className="space-y-4">
              {/* Email Verification */}
              <div className="flex items-center justify-between py-4 px-5 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-4">
                  <MailIcon className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-xs font-medium text-gray-900">Email Address</p>
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
                    <p className="text-xs font-medium text-gray-900">Phone Number</p>
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

              {/* Account Level */}
              <div className="py-4 px-5 bg-gradient-to-r from-primary/10 to-[#E8C547]/10 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <CrownIcon className="w-5 h-5 text-secondary" />
                    <div>
                      <p className="text-xs font-medium text-gray-900">Account Level</p>
                      <p className="text-xs text-gray-600">Level {userData?.level_id || 1} - Enhanced features unlocked</p>
                    </div>
                  </div>
                  <Badge variant="gold">{userData?.level_name || 'Member'}</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Business Verification - Only show for brand users */}
          {userData?.user_type === "brand" && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <BriefcaseIcon className="w-5 h-5 text-gray-700" />
                <h2 className="text-lg font-semibold text-gray-900">Business Verification</h2>
              </div>

              <div className={`p-5 ${businessStatus.bgColor} rounded-lg border border-gray-200 mb-6`}>
                <div className="flex items-center gap-3">
                  <businessStatus.icon className={`w-5 h-5 ${businessStatus.color}`} />
                  <div>
                    <p className={`text-xs font-medium ${businessStatus.color}`}>{businessStatus.title}</p>
                    <p className="text-xs text-gray-600">{businessStatus.description}</p>
                  </div>
                </div>
              </div>

              {(businessStatus.status === 'none' || businessStatus.status === 'rejected') && (
                <div>
                  {!showBusinessForm ? (
                    <Button onClick={() => setShowBusinessForm(true)} className='font-semibold'>
                      {businessStatus.status === 'rejected' ? 'Resubmit Verification' : 'Start Business Verification'}
                    </Button>
                  ) : (
                    <form onSubmit={handleBusinessSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="business-name">Business Name</Label>
                          <Input 
                            id="business-name" 
                            placeholder="Your Business Name"
                            value={businessFormData.business_name}
                            onChange={(e) => handleBusinessInputChange('business_name', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="business-email">Business Email</Label>
                          <Input 
                            id="business-email" 
                            type="email" 
                            placeholder="business@company.com"
                            value={businessFormData.business_email}
                            onChange={(e) => handleBusinessInputChange('business_email', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="business-website">Website (Optional)</Label>
                          <Input 
                            id="business-website" 
                            placeholder="https://yourwebsite.com"
                            value={businessFormData.business_website}
                            onChange={(e) => handleBusinessInputChange('business_website', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="business-phone">Business Phone</Label>
                          <Input 
                            id="business-phone" 
                            placeholder="+256-772-123456"
                            value={businessFormData.business_phone}
                            onChange={(e) => handleBusinessInputChange('business_phone', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="business-address">Business Address</Label>
                        <Textarea 
                          id="business-address" 
                          placeholder="Full business address"
                          value={businessFormData.business_address}
                          onChange={(e) => handleBusinessInputChange('business_address', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="business-description">Business Description</Label>
                        <Textarea 
                          id="business-description" 
                          placeholder="Describe your business and services"
                          value={businessFormData.business_description}
                          onChange={(e) => handleBusinessInputChange('business_description', e.target.value)}
                          required
                        />
                      </div>
                      <div className="flex gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setShowBusinessForm(false)} disabled={businessLoading}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={businessLoading}>
                          {businessLoading ? 'Submitting...' : 'Submit for Review'}
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <UserIcon className="w-5 h-5 text-gray-700" />
              <h3 className="text-sm font-semibold text-gray-900">Account Overview</h3>
            </div>
            
            <div className="space-y-4">
              <div className="py-3 px-4 bg-gradient-to-r from-primary/10 to-[#E8C547]/10 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">Account Type</p>
                    <p className="text-sm font-bold text-secondary capitalize">{userData?.user_type || 'User'}</p>
                  </div>
                  <BriefcaseIcon className="w-6 h-6 text-secondary" />
                </div>
              </div>

              <div className="py-3 px-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">Member Since</p>
                    <p className="text-sm font-bold text-gray-900">
                      {userData?.created_on 
                        ? new Date(userData.created_on).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                        : 'Unknown'
                      }
                    </p>
                  </div>
                  <ClockIcon className="w-6 h-6 text-gray-600" />
                </div>
              </div>

              <div className="py-3 px-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">Referral Code</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-secondary">{userData?.referral_code || 'N/A'}</p>
                      {userData?.referral_code && (
                        <button 
                          className="text-gray-500 hover:text-secondary transition-colors"
                          onClick={() => {
                            navigator.clipboard.writeText(userData.referral_code);
                            toast.success('Referral code copied!');
                          }}
                        >
                          <CopyIcon className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <SettingsIcon className="w-5 h-5 text-gray-700" />
              <h3 className="text-sm font-semibold text-gray-900">Security & Privacy</h3>
            </div>

            <div className="space-y-4">
              <div className="py-3 px-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {userData?.has_pin ? (
                      <LockIcon className="w-4 h-4 text-green-600" />
                    ) : (
                      <UnlockIcon className="w-4 h-4 text-red-600" />
                    )}
                    <div>
                      <p className="text-xs font-medium text-gray-900">Wallet PIN</p>
                      <p className="text-xs text-gray-600">Secure your wallet transactions</p>
                    </div>
                  </div>
                  <div>
                    {userData?.has_pin ? (
                      <Badge variant="success">Enabled</Badge>
                    ) : (
                      <Button size="sm" onClick={() => setShowPinModal(true)}>
                        Enable PIN
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="py-3 px-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <WalletIcon className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-xs font-medium text-gray-900">Wallet Balance</p>
                      <p className="text-xs text-gray-600">{userData?.wallet?.balance || '0'} GEMS available</p>
                    </div>
                  </div>
                  <Badge variant="info">{userData?.wallet?.balance || '0'} GEMS</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
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
    </div>
  );
}