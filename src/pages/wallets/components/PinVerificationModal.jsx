import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { post } from "../../../utils/service";
import { FiLock } from "react-icons/fi";
import { Button, Input, Label } from "./UIComponents";

const PinVerificationModal = ({ isOpen, onClose, onSuccess, loading, onForgotPin }) => {
  const [pin, setPin] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (pin.length !== 5) {
      toast.error('PIN must be 5 digits');
      return;
    }

    setVerifyLoading(true);
    try {
      const response = await post('wallet/pinlogin', {
        pin: pin
      });
      
      if (response?.status === 200) {
        toast.success('PIN verified successfully!');
        onSuccess();
        setPin('');
      } else {
        toast.error(response?.data?.message || 'Invalid PIN. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying PIN:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
      } else {
        toast.error('Invalid PIN. Please try again.');
      }
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleCancel = () => {
    setPin('');
    onClose();
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
              <FiLock className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Verify Wallet PIN</h3>
              <p className="text-xs text-gray-600">Enter your 5-digit PIN to continue</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="verify-pin">Enter PIN</Label>
              <Input
                id="verify-pin"
                type="password"
                placeholder="12345"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 5))}
                maxLength={5}
                required
                disabled={verifyLoading}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleCancel} disabled={verifyLoading} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={verifyLoading || pin.length !== 5} className="flex-1">
                {verifyLoading ? (
                  <>
                    <div className="flex space-x-1 mr-2">
                      <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    Verifying...
                  </>
                ) : (
                  'Verify PIN'
                )}
              </Button>
            </div>

            <div className="pt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={onForgotPin}
                className="w-full text-center text-xs text-secondary transition-colors"
                disabled={verifyLoading}
              >
                Forgot PIN ? <span className="font-semibold">Reset via OTP</span>
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default PinVerificationModal;