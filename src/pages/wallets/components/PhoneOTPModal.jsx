import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { post } from "../../../utils/service";
import { FiPhone } from "react-icons/fi";
import { Button, Input, Label } from "./UIComponents";
import { SkeletonLine } from "./Skeletons";

const maskPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return '';
  if (phone.length <= 5) return phone;
  const firstThree = phone.slice(0, 3);
  const lastTwo = phone.slice(-2);
  return firstThree + '*'.repeat(phone.length - 5) + lastTwo;
};

const PhoneOTPModal = ({ isOpen, onClose, onSuccess, phone, loading }) => {
  const [otp, setOtp] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const maskedPhone = maskPhone(phone);

  const sendPhoneOTP = async () => {
    setSendingOtp(true);
    try {
      const response = await post('users/sendPhoneOTP', {
        phone: phone
      });
      
      if (response?.status === 200) {
        setOtpSent(true);
        toast.success('Phone OTP sent successfully!');
      } else {
        toast.error(response?.data?.message || 'Failed to send phone OTP');
      }
    } catch (error) {
      console.error('Error sending phone OTP:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
      } else {
        toast.error('Failed to send phone OTP');
      }
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (otp.length !== 4) {
      toast.error('OTP must be 4 digits');
      return;
    }

    onSuccess(otp);
  };

  const handleCancel = () => {
    setOtp('');
    setOtpSent(false);
    onClose();
  };

  useEffect(() => {
    if (isOpen && !otpSent) {
      sendPhoneOTP();
    }
  }, [isOpen]);

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
              <FiPhone className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Phone Verification</h3>
              <p className="text-xs text-gray-600">Enter the OTP sent to your phone</p>
            </div>
          </div>

          {sendingOtp ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center space-y-4">
                <div className="space-y-2">
                  <SkeletonLine className="h-4 w-full" />
                  <SkeletonLine className="h-4 w-3/4 mx-auto" />
                  <SkeletonLine className="h-4 w-1/2 mx-auto" />
                </div>
                <p className="text-sm text-gray-600">Sending OTP to {maskedPhone}...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                <p className="text-xs text-secondary">
                  We've sent a 4-digit OTP to <strong>{maskedPhone}</strong>
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone-otp">Phone OTP</Label>
                  <Input
                    id="phone-otp"
                    type="text"
                    placeholder="1234"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    maxLength={4}
                    required
                    disabled={verifyingOtp}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={handleCancel} disabled={verifyingOtp} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={verifyingOtp || otp.length !== 4} className="flex-1">
                    {verifyingOtp ? (
                      <>
                        <div className="flex space-x-1 mr-2">
                          <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                        </div>
                        Verifying...
                      </>
                    ) : (
                      'Verify Phone'
                    )}
                  </Button>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={sendPhoneOTP}
                    className="w-full text-center text-sm text-secondary transition-colors"
                    disabled={verifyingOtp || sendingOtp}
                  >
                    Resend Phone OTP
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PhoneOTPModal;