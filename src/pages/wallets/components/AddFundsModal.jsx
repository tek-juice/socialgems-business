import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { post } from "../../../utils/service";
import { FiX, FiPlus } from "react-icons/fi";
import { Button, Input } from "./UIComponents";

const AddFundsModal = ({ isOpen, onClose, onSubmit, loading }) => {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CARD");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+256");
  const [exchangeRate, setExchangeRate] = useState(null);
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [loadingExchange, setLoadingExchange] = useState(false);

  useEffect(() => {
    if (paymentMethod === "MOBILE" && amount && isValidCountryCode(countryCode)) {
      fetchExchangeRate();
    }
  }, [paymentMethod, amount, countryCode]);

  const isValidCountryCode = (code) => {
    return code === "+256" || code === "+254";
  };

  const getCountryInfo = (code) => {
    switch (code) {
      case "+256":
        return { name: "Uganda", currency: "UGX" };
      case "+254":
        return { name: "Kenya", currency: "KES" };
      default:
        return null;
    }
  };

  const fetchExchangeRate = async () => {
    if (!amount || !isValidCountryCode(countryCode)) return;
    
    const countryInfo = getCountryInfo(countryCode);
    if (!countryInfo) return;

    setLoadingExchange(true);
    try {
      const response = await post('wallet/getExchangeRate', {
        from_currency: "USD",
        to_currency: countryInfo.currency
      });

      if (response?.status === 200 && response?.data?.rate) {
        const rate = parseFloat(response.data.rate);
        setExchangeRate(rate);
        const usdAmount = (parseFloat(amount) * rate).toFixed(2);
        setConvertedAmount(usdAmount);
      }
    } catch (error) {
      console.error('Exchange rate error:', error);
      toast.error('Failed to get exchange rate');
    } finally {
      setLoadingExchange(false);
    }
  };

  const handleCountryCodeChange = (value) => {
    let cleanValue = value.replace(/[^\d+]/g, "");
    
    if (!cleanValue.startsWith("+")) {
      cleanValue = "+" + cleanValue.replace(/\+/g, "");
    }
    
    if (cleanValue.length > 4) {
      cleanValue = cleanValue.substring(0, 4);
    }

    setCountryCode(cleanValue);
    
    if (cleanValue !== "+256" && cleanValue !== "+254" && cleanValue.length >= 4) {
      toast.error("Only Uganda (+256) and Kenya (+254) are supported for mobile money");
    }

    if (cleanValue.length >= 4 && !isValidCountryCode(cleanValue)) {
      return;
    }

    setExchangeRate(null);
    setConvertedAmount(null);
  };

  const handlePhoneChange = (value) => {
    let cleanValue = value.replace(/[^\d]/g, "");
    if (cleanValue.startsWith("0")) {
      cleanValue = cleanValue.substring(1);
    }
    setPhoneNumber(cleanValue);
  };

  const handleAmountChange = (value) => {
    setAmount(value);
    setExchangeRate(null);
    setConvertedAmount(null);
  };

  const getCurrencySymbol = () => {
    if (paymentMethod === "MOBILE" && isValidCountryCode(countryCode)) {
      const countryInfo = getCountryInfo(countryCode);
      return countryInfo ? countryInfo.currency : "$";
    }
    return "$";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (amount) {
      const submitData = { 
        amount: paymentMethod === "MOBILE" ? parseFloat(convertedAmount || amount) : parseFloat(amount), 
        paymentMethod
      };

      if (paymentMethod === "MOBILE") {
        if (!isValidCountryCode(countryCode)) {
          toast.error('Please enter a valid country code (+256 for Uganda or +254 for Kenya)');
          return;
        }
        if (!phoneNumber || phoneNumber.length < 9) {
          toast.error('Please enter a valid phone number for mobile money payment');
          return;
        }
        if (!convertedAmount) {
          toast.error('Unable to convert currency. Please try again.');
          return;
        }
        submitData.countryCode = countryCode;
        submitData.phoneNumber = phoneNumber;
        submitData.originalAmount = amount;
        const countryInfo = getCountryInfo(countryCode);
        submitData.originalCurrency = countryInfo.currency;
      }

      onSubmit(submitData);
    }
  };

  if (!isOpen) return null;

  const countryInfo = getCountryInfo(countryCode);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Add Funds</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => {
                setPaymentMethod(e.target.value);
                if (e.target.value !== "MOBILE") {
                  setPhoneNumber("");
                  setExchangeRate(null);
                  setConvertedAmount(null);
                }
              }}
              className="w-full h-12 px-3 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="CARD">Credit/Debit Card</option>
              {/* <option value="MOBILE">Mobile Money</option> */}
            </select>
          </div>

          {paymentMethod === "MOBILE" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              
              <div className="flex overflow-hidden items-center bg-white border border-gray-300 focus-within:border-primary rounded-lg transition-all">
                <input
                  type="text"
                  placeholder="+256"
                  value={countryCode}
                  onChange={(e) => handleCountryCodeChange(e.target.value)}
                  className="px-3 py-3 text-sm text-black font-medium border-r border-gray-300 w-20 text-center bg-gray-50 outline-none"
                  maxLength={4}
                />
                
                <input
                  type="tel"
                  placeholder="772906777"
                  value={phoneNumber}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className="flex-1 px-4 py-3 border-none bg-transparent outline-none text-black text-sm"
                  maxLength={9}
                  required
                />
              </div>
              
              <p className="text-xs text-gray-500 mt-1">
                Only +256 (Uganda) and +254 (Kenya) are supported
              </p>
              
              {isValidCountryCode(countryCode) && phoneNumber && (
                <p className="text-xs text-primary mt-1 font-medium">
                  Full number: {countryCode}{phoneNumber}
                </p>
              )}

              {!isValidCountryCode(countryCode) && countryCode.length >= 4 && (
                <p className="text-xs text-red-500 mt-1">
                  Invalid country code. Only +256 and +254 are supported.
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount {paymentMethod === "MOBILE" && countryInfo && `(in ${countryInfo.currency})`}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                {getCurrencySymbol()}
              </span>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="pl-12 text-lg h-12"
                min="1"
                step="0.01"
                required
              />
            </div>
            
            {paymentMethod === "MOBILE" && convertedAmount && countryInfo && (
              <div className="mt-2 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                <p className="text-xs text-secondary">
                  <strong>Conversion:</strong> {amount} {countryInfo.currency} = ${convertedAmount} USD
                </p>
              </div>
            )}

            {paymentMethod === "MOBILE" && loadingExchange && (
              <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-xs text-gray-600">
                  Converting currency...
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={
                loading || 
                !amount || 
                (paymentMethod === "MOBILE" && (!isValidCountryCode(countryCode) || !phoneNumber || phoneNumber.length < 9 || !convertedAmount))
              }
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  Processing...
                </div>
              ) : (
                <>
                  <FiPlus className="w-4 h-4 mr-2" />
                  Add Funds
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddFundsModal;