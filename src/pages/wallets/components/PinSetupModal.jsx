import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { post } from "../../../utils/service";
import { FiLock } from "react-icons/fi";
import { Button, Input, Label } from "./UIComponents";

const PinSetupModal = ({ isOpen, onClose, onSuccess }) => {
  const [newPin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPin !== confirmPin) {
      toast.error('PINs do not match');
      return;
    }
    
    if (newPin.length !== 5) {
      toast.error('PIN must be 5 digits');
      return;
    }

    setLoading(true);
    try {
      const response = await post('wallet/setTransactionPin', {
        pin: newPin,
        confirm_pin: confirmPin
      });
      
      if (response?.status === 200) {
        toast.success('Wallet PIN set successfully!');
        onSuccess();
        onClose();
        setPin('');
        setConfirmPin('');
      } else {
        toast.error(response?.data?.message || 'Failed to set PIN');
      }
    } catch (error) {
      console.error('Error setting PIN:', error);
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to set PIN');
      }
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
              <FiLock className="w-5 h-5 text-secondary" />
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
                value={newPin}
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
                    <div className="flex space-x-1 mr-2">
                      <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    </div>
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

export default PinSetupModal;