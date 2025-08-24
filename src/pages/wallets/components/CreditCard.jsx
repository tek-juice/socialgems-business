import { useState } from "react";
import { motion } from "framer-motion";
import { FiCreditCard, FiWifi, FiShield, FiEye, FiEyeOff } from "react-icons/fi";

const CreditCard = ({ balance, currency, walletId }) => {
  const [showBalance, setShowBalance] = useState(true);

  return (
    <div className="relative w-full">
      <motion.div
        className="relative w-full h-56 rounded-2xl p-6 text-white shadow-2xl overflow-hidden"
        style={{
          background: `linear-gradient(135deg, #734D20 0%, #5a3a1a 25%, #3d2512 50%, #2a1a0d 75%, #1a1008 100%)`,
        }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `linear-gradient(45deg, #F9D769 0%, transparent 50%, #F9D769 100%)`,
          }}
        />

        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-white/30 to-transparent rounded-full -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-white/20 to-transparent rounded-full -ml-16 -mb-16"></div>
        </div>

        <div className="relative z-10 flex justify-between items-start mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-[#E8C547] rounded-lg flex items-center justify-center">
              <FiCreditCard className="w-4 h-4 text-secondary" />
            </div>
            <span className="text-xs font-medium text-white">Social Gems</span>
          </div>
          <div className="flex items-center gap-2">
            <FiWifi className="w-4 h-4 text-white/60" />
            <FiShield className="w-4 h-4 text-white/60" />
          </div>
        </div>

        <div className="relative z-10 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-white">Available Balance</span>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="text-white/60 hover:text-white transition-colors"
            >
              {showBalance ? (
                <FiEye className="w-3 h-3" />
              ) : (
                <FiEyeOff className="w-3 h-3" />
              )}
            </button>
          </div>
          <div className="text-2xl font-bold text-white">
            {showBalance ? `${currency} ${balance}` : "••••••"}
          </div>
        </div>

        <div className="relative z-10 flex justify-between items-end">
          <div>
            <div className="text-xs text-white/60 mb-1">Wallet ID</div>
            <div className="font-mono text-sm tracking-wider text-white">
              {walletId
                ? `${walletId.slice(0, 4)} •••• •••• ${walletId.slice(-4)}`
                : "•••• •••• •••• ••••"}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-white/60 mb-1">Member Since</div>
            <div className="font-mono text-sm text-white">
              {new Date().getFullYear()}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CreditCard;