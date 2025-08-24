import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { get, post } from "../utils/service";

import {
  FiCreditCard,
  FiTrendingUp,
  FiRefreshCw,
  FiCalendar,
  FiActivity,
  FiX,
  FiPlus,
  FiWifi,
  FiShield,
  FiEye,
  FiEyeOff,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiMoreHorizontal,
  FiCheck,
  FiFilter,
  FiDollarSign,
  FiUsers,
  FiTarget,
  FiCheckCircle,
  FiClock,
  FiBarChart,
  FiArrowUpRight,
  FiArrowDownLeft,
  FiAlertCircle,
  FiInfo,
  FiLock,
  FiLoader,
  FiMail,
  FiPhone,
  FiKey,
  FiSmartphone,
} from "react-icons/fi";

import { HiArrowsRightLeft } from "react-icons/hi2";
import { FaCheckCircle, FaHourglassHalf, FaTimesCircle } from "react-icons/fa";
import { MdAccessTimeFilled, MdError } from "react-icons/md";

import PaymentStatusBanner from "./wallets/components/PaymentStatusBanner";
import CreditCard from "./wallets/components/CreditCard";
import TransactionCard from "./wallets/components/TransactionCard";
import TransactionTableRow from "./wallets/components/TransactionTableRow";
import TransactionDetailModal from "./wallets/components/TransactionDetailModal";
import PinVerificationModal from "./wallets/components/PinVerificationModal";
import EmailOTPModal from "./wallets/components/EmailOTPModal";
import PhoneOTPModal from "./wallets/components/PhoneOTPModal";
import NewPinSetupModal from "./wallets/components/NewPinSetupModal";
import AddFundsModal from "./wallets/components/AddFundsModal";
import PinSetupModal from "./wallets/components/PinSetupModal";
import FilterDropdownMenu from "./wallets/components/FilterDropdownMenu";
import AnimatedTabs from "./wallets/components/AnimatedTabs";
import { SkeletonCard, SkeletonLine, SkeletonCircle, SkeletonButton } from "./wallets/components/Skeletons";
import { Button, Input, Badge, Label } from "./wallets/components/UIComponents";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "./wallets/components/Table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis } from "./wallets/components/Pagination";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10,
    },
  },
};

const formatBalance = (balance) => {
  const numBalance = parseFloat(balance);
  return numBalance.toFixed(2);
};

export default function WalletPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [walletData, setWalletData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [addingFunds, setAddingFunds] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showPinVerification, setShowPinVerification] = useState(false);

  const [showEmailOtp, setShowEmailOtp] = useState(false);
  const [showPhoneOtp, setShowPhoneOtp] = useState(false);
  const [showNewPinSetup, setShowNewPinSetup] = useState(false);
  const [emailOtpCode, setEmailOtpCode] = useState('');
  const [phoneOtpCode, setPhoneOtpCode] = useState('');

  const [paymentStatus, setPaymentStatus] = useState({
    show: false,
    status: null,
    refId: null,
    sessionId: null
  });

  const [transactionDetailModal, setTransactionDetailModal] = useState({
    isOpen: false,
    transaction: null,
    details: null,
    loading: false
  });

  const [activeTab, setActiveTab] = useState("all");
  const [columnFilters, setColumnFilters] = useState({
    type: 'all',
    amount: 'all'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  useEffect(() => {
    const refId = searchParams.get('refId');
    const status = searchParams.get('status');
    const sessionId = searchParams.get('session_id');

    if (refId || status || sessionId) {
      const cleanStatus = status?.replace(/['"]/g, '');
      
      setPaymentStatus({
        show: true,
        status: cleanStatus,
        refId: refId,
        sessionId: sessionId
      });

      switch (cleanStatus?.toLowerCase()) {
        case 'success':
          toast.success('Payment completed successfully!');
          break;
        case 'failed':
        case 'error':
        case 'cancelled':
          toast.error('Payment failed or was cancelled.');
          break;
        case 'pending':
          toast.info('Payment is being processed.');
          break;
        default:
          toast.info('Payment status received.');
      }

      setTimeout(() => {
        setSearchParams({});
      }, 100);
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    document.title = "Your Wallet | Social Gems";

    const fetchWalletData = async () => {
      try {
        setLoading(true);

        const userProfileResponse = await get("users/getUserProfile");
        if (userProfileResponse?.status === 200 && userProfileResponse?.data) {
          setUserData(userProfileResponse.data);
        } else {
          toast.error("Failed to load user profile");
        }

        const walletResponse = await get("wallet/getWallets");
        if (walletResponse?.status === 200 && walletResponse?.data) {
          setWalletData(walletResponse.data);
        } else {
          toast.error("Failed to load wallet data");
        }

        const transactionsResponse = await post("wallet/accountStatement", {
          currency: "USD",
        });
        if (
          transactionsResponse?.status === 200 &&
          transactionsResponse?.data
        ) {
          setTransactions(transactionsResponse.data);
        } else {
          toast.error("Failed to load transactions");
        }

        if (!searchParams.get('refId') && !searchParams.get('status')) {
          toast.success("Wallet data loaded successfully");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load wallet data");
        console.error("Error fetching wallet data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, [searchParams]);

  useEffect(() => {
    if (paymentStatus.show && paymentStatus.status?.toLowerCase() === 'success') {
      const timer = setTimeout(() => {
        handleRefresh();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [paymentStatus]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const userProfileResponse = await get("users/getUserProfile");
      if (userProfileResponse?.status === 200 && userProfileResponse?.data) {
        setUserData(userProfileResponse.data);
      }

      const walletResponse = await get("wallet/getWallets");
      if (walletResponse?.status === 200 && walletResponse?.data) {
        setWalletData(walletResponse.data);
      }

      const transactionsResponse = await post("wallet/accountStatement", {
        currency: "USD",
      });
      if (transactionsResponse?.status === 200 && transactionsResponse?.data) {
        setTransactions(transactionsResponse.data);
      }

      toast.success("Wallet data refreshed");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  };

  const getCountryCurrency = (countryCode) => {
    switch (countryCode) {
      case '+256':
        return 'UGX';
      case '+254':
        return 'KES';
      default:
        return null;
    }
  };

  const handleAddFunds = async (data) => {
    setAddingFunds(true);
    try {
      let finalAmount = data.amount;
      let finalCurrency = "USD";
      let convertedAmount = null;
      if (data.paymentMethod === 'MOBILE') {
        if (!data.countryCode) {
          toast.error('Please select your country code for mobile money payment');
          return;
        }
        if (!data.phoneNumber) {
          toast.error('Please enter your phone number for mobile money payment');
          return;
        }
        const toCurrency = getCountryCurrency(data.countryCode);
        if (!toCurrency) {
          toast.error('Mobile money is only available for Uganda (+256) and Kenya (+254)');
          return;
        }
        try {
          const exchangeResponse = await post('wallet/getExchangeRate', {
            from_currency: "USD",
            to_currency: toCurrency
          });
          if (exchangeResponse?.status === 200 && exchangeResponse?.data?.rate) {
            const exchangeRate = parseFloat(exchangeResponse.data.rate);
            convertedAmount = (data.amount / exchangeRate).toFixed(2);
            
            toast.success(`Amount converted: $${data.amount} = ${convertedAmount} ${toCurrency}`);
          } else {
            throw new Error('Failed to get exchange rate');
          }
        } catch (exchangeError) {
          console.error('Exchange rate error:', exchangeError);
          toast.error(exchangeError.response?.data?.message || 'Failed to get exchange rate for mobile money');
          return;
        }
      }
      const depositData = {
        amount: finalAmount,
        paymentMethod: data.paymentMethod,
        currency: finalCurrency,
        payment_method_id: "",
        ...(data.paymentMethod === 'MOBILE' && {
          converted_amount: convertedAmount,
          account_number: `${data.countryCode}${data.phoneNumber}`
        })
      };
      const response = await post("wallet/depositRequest", depositData);
      if (response?.status === 200) {
        if (response.data?.paymentUrl) {
          window.open(response.data.paymentUrl, "_blank");
          toast.success("Redirecting to payment gateway...");
        } else {
          toast.success(response.data?.message || "Payment request processed successfully");
        }
        setShowAddFunds(false);
      } else {
        toast.error(response?.data?.message || "Payment request failed");
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
        navigate('/login');
        return;
      }
      
      if (error.response?.data?.message) {
        const errorMessage = error.response.data.message;
        
        if (data.paymentMethod === 'MOBILE' && errorMessage.includes('Failed to request payment')) {
          toast.error('Mobile Money payment failed. Please check your mobile money account and try again.');
        } else {
          toast.error(errorMessage);
        }
      } else {
        const paymentMethodText = data.paymentMethod === 'MOBILE' ? 'Mobile Money' : 'Card';
        toast.error(`${paymentMethodText} payment failed. Please try again.`);
      }
    } finally {
      setAddingFunds(false);
    }
  };

  const handleTransactionClick = async (transaction) => {
    setTransactionDetailModal({
      isOpen: true,
      transaction,
      details: null,
      loading: true
    });

    try {
      const response = await get(`wallet/getTransactionById/${transaction.trans_id}`);
      if (response?.status === 200 && response?.data) {
        setTransactionDetailModal(prev => ({
          ...prev,
          details: response.data,
          loading: false
        }));
        toast.success("Transaction details loaded");
      } else {
        setTransactionDetailModal(prev => ({
          ...prev,
          loading: false
        }));
        toast.error("Failed to load transaction details");
      }
    } catch (error) {
      console.error("Error fetching transaction details:", error);
      toast.error(error.response?.data?.message || "Failed to load transaction details");
      setTransactionDetailModal(prev => ({
        ...prev,
        loading: false
      }));
    }
  };

  const handleCloseTransactionDetail = () => {
    setTransactionDetailModal({
      isOpen: false,
      transaction: null,
      details: null,
      loading: false
    });
  };

  const handlePinSuccess = async () => {
    try {
      const userProfileResponse = await get("users/getUserProfile");
      if (userProfileResponse?.status === 200 && userProfileResponse?.data) {
        setUserData(userProfileResponse.data);
        toast.success("PIN setup successful");
      }
    } catch (error) {
      console.error("Error refreshing user profile:", error);
      toast.error("Failed to refresh user profile");
    }
  };

  const handlePinVerificationSuccess = () => {
    setShowPinVerification(false);
    setShowAddFunds(true);
    toast.success("PIN verified successfully");
  };

  const handleClosePaymentStatus = () => {
    setPaymentStatus(prev => ({ ...prev, show: false }));
  };

  const handleRetryPayment = () => {
    setPaymentStatus(prev => ({ ...prev, show: false }));
    if (hasPinSet) {
      setShowPinVerification(true);
    } else {
      setShowPinModal(true);
    }
  };

  const handleForgotPin = () => {
    setShowPinVerification(false);
    setShowEmailOtp(true);
  };

  const handleEmailOtpSuccess = (otp) => {
    setEmailOtpCode(otp);
    setShowEmailOtp(false);
    setShowPhoneOtp(true);
  };

  const handlePhoneOtpSuccess = (otp) => {
    setPhoneOtpCode(otp);
    setShowPhoneOtp(false);
    setShowNewPinSetup(true);
  };

  const handleNewPinSuccess = async () => {
    setShowNewPinSetup(false);
    setEmailOtpCode('');
    setPhoneOtpCode('');
    
    try {
      const userProfileResponse = await get("users/getUserProfile");
      if (userProfileResponse?.status === 200 && userProfileResponse?.data) {
        setUserData(userProfileResponse.data);
        toast.success("PIN reset successful");
      }
    } catch (error) {
      console.error("Error refreshing user profile:", error);
      toast.error("Failed to refresh user profile");
    }
  };

  const handleRestartOtpFlow = () => {
    setShowNewPinSetup(false);
    setEmailOtpCode('');
    setPhoneOtpCode('');
    setShowEmailOtp(true);
  };

  const hasPinSet = userData?.wallet_pin && Object.keys(userData.wallet_pin).length > 0;

  const handleAddFundsOrSetPin = () => {
    if (hasPinSet) {
      setShowPinVerification(true);
    } else {
      setShowPinModal(true);
    }
  };

  const getTabCounts = () => {
    const all = transactions.length;
    const success = transactions.filter(t => t.status.toUpperCase() === 'SUCCESS').length;
    const pending = transactions.filter(t => t.status.toUpperCase() === 'PENDING').length;
    
    return { all, success, pending };
  };

  const tabCounts = getTabCounts();

  const statusTabs = [
    { label: `All ${tabCounts.all}`, value: "all" },
    { label: `Success ${tabCounts.success}`, value: "success" },
    { label: `Pending ${tabCounts.pending}`, value: "pending" },
  ];

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesTabStatus = 
      activeTab === 'all' ? true :
      activeTab === 'success' ? transaction.status.toUpperCase() === 'SUCCESS' :
      activeTab === 'pending' ? transaction.status.toUpperCase() === 'PENDING' :
      activeTab === 'failed' ? transaction.status.toUpperCase() === 'FAILED' :
      true;

    const matchesColumnType = 
      !columnFilters.type || columnFilters.type === 'all' ? true :
      columnFilters.type === 'deposit' ? transaction.trans_type.toUpperCase() === 'DEPOSIT' :
      columnFilters.type === 'withdrawal' ? transaction.trans_type.toUpperCase() === 'WITHDRAWAL' :
      columnFilters.type === 'campaign_payment' ? transaction.trans_type.toUpperCase() === 'CAMPAIGN_PAYMENT' :
      true;

    const matchesColumnAmount = 
      !columnFilters.amount || columnFilters.amount === 'all' ? true :
      columnFilters.amount === 'positive' ? parseFloat(transaction.amount) > 0 :
      columnFilters.amount === 'negative' ? parseFloat(transaction.amount) < 0 :
      true;

    return matchesTabStatus && matchesColumnType && matchesColumnAmount;
  });

  const totalItems = filteredTransactions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredTransactions.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-8"
          >
            <motion.div variants={itemVariants} className="flex gap-4 flex-col items-start">
              <SkeletonLine className="h-6 w-32" />
              <div className="flex gap-2 flex-col">
                <SkeletonLine className="h-10 w-64" />
                <SkeletonLine className="h-5 w-96" />
              </div>
            </motion.div>

            <div className="grid grid-cols-1 gap-6">
              <motion.div variants={itemVariants}>
                <SkeletonCard>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <SkeletonCircle className="w-6 h-6" />
                      <div>
                        <SkeletonLine className="h-5 w-24 mb-1" />
                        <SkeletonLine className="h-4 w-32" />
                      </div>
                    </div>
                  </div>
                  <div className="relative w-full h-56 rounded-2xl bg-gray-200 animate-pulse p-6">
                    <div className="flex justify-between items-start mb-8">
                      <div className="flex items-center gap-2">
                        <SkeletonCircle className="w-8 h-8" />
                        <SkeletonLine className="h-4 w-20" />
                      </div>
                      <div className="flex items-center gap-2">
                        <SkeletonCircle className="w-4 h-4" />
                        <SkeletonCircle className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mb-6">
                      <SkeletonLine className="h-3 w-24 mb-2" />
                      <SkeletonLine className="h-8 w-32" />
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <SkeletonLine className="h-3 w-16 mb-1" />
                        <SkeletonLine className="h-4 w-40" />
                      </div>
                      <div className="text-right">
                        <SkeletonLine className="h-3 w-20 mb-1" />
                        <SkeletonLine className="h-4 w-12" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <SkeletonButton className="w-full h-10" />
                  </div>
                </SkeletonCard>
              </motion.div>
            </div>

            <motion.div variants={itemVariants}>
              <SkeletonLine className="h-12 w-80" />
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex gap-2 flex-wrap">
                  <SkeletonCircle className="w-4 h-4 mt-2" />
                  <SkeletonButton className="h-8 w-16" />
                  <SkeletonButton className="h-8 w-16" />
                </div>
                <div className="flex items-center gap-2">
                  <SkeletonLine className="h-3 w-10" />
                  <SkeletonButton className="h-8 w-12" />
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: 6 }, (_, index) => (
                  <div key={index} className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <SkeletonCircle className="w-12 h-12" />
                        <div>
                          <SkeletonLine className="h-4 w-24 mb-1" />
                          <SkeletonLine className="h-3 w-32" />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <SkeletonLine className="h-4 w-16 mb-1" />
                          <SkeletonLine className="h-6 w-14" />
                        </div>
                        <SkeletonCircle className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen">
      <div className="container mx-auto">
        <div className="flex flex-col gap-8">
          <AnimatePresence>
            {paymentStatus.show && (
              <PaymentStatusBanner
                status={paymentStatus.status}
                refId={paymentStatus.refId}
                sessionId={paymentStatus.sessionId}
                onClose={handleClosePaymentStatus}
                onRetry={handleRetryPayment}
              />
            )}
          </AnimatePresence>

          <div className="flex gap-4 flex-col items-start">
            <div>
              <Badge variant="gold">Social Gems Wallet</Badge>
            </div>
            <div className="flex gap-2 flex-col">
              <h2 className="text-3xl md:text-4xl tracking-tighter max-w-4xl font-bold text-left text-gray-900">
                Your Wallet
              </h2>
              <p className="text-lg max-w-xl lg:max-w-2xl leading-relaxed tracking-tight text-gray-600 text-left">
                Manage your balance and transactions seamlessly with real-time insights.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div>
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <FiCreditCard className="w-6 h-6 text-secondary" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Your Card</h3>
                      <p className="text-sm text-gray-600">Digital wallet card</p>
                    </div>
                  </div>
                  <Button
                    onClick={handleRefresh}
                    variant="ghost"
                    size="sm"
                    disabled={refreshing}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <motion.div
                      animate={refreshing ? { rotate: 360 } : {}}
                      transition={refreshing ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
                    >
                      <FiRefreshCw className="w-4 h-4" />
                    </motion.div>
                  </Button>
                </div>

                <CreditCard
                  balance={
                    walletData ? formatBalance(walletData.balance) : "0.00"
                  }
                  currency={walletData?.asset || "USD"}
                  walletId={walletData?.wallet_id}
                />

                <div className="mt-6">
                  <Button
                    onClick={handleAddFundsOrSetPin}
                    className="w-full"
                  >
                    {hasPinSet ? (
                      <>
                        <FiPlus className="w-4 h-4 mr-2" />
                        Add Funds
                      </>
                    ) : (
                      <>
                        <FiLock className="w-4 h-4 mr-2" />
                        Set PIN
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>

          <motion.div variants={itemVariants}>
            <AnimatedTabs 
              tabs={statusTabs} 
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
          </motion.div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-2 flex-wrap">
              <FiFilter className="text-gray-600 w-4 h-4 mt-2" />
              
              <FilterDropdownMenu
                options={[
                  {
                    label: 'All Types',
                    onClick: () => setColumnFilters(prev => ({ ...prev, type: 'all' })),
                    checked: !columnFilters.type || columnFilters.type === 'all'
                  },
                  {
                    label: 'Deposit',
                    onClick: () => setColumnFilters(prev => ({ ...prev, type: 'deposit' })),
                    checked: columnFilters.type === 'deposit'
                  },
                  {
                    label: 'Withdrawal',
                    onClick: () => setColumnFilters(prev => ({ ...prev, type: 'withdrawal' })),
                    checked: columnFilters.type === 'withdrawal'
                  },
                  {
                    label: 'Campaign Payment',
                    onClick: () => setColumnFilters(prev => ({ ...prev, type: 'campaign_payment' })),
                    checked: columnFilters.type === 'campaign_payment'
                  }
                ]}
                className="text-secondary border-primary/50 hover:bg-primary/20"
              >
                Type
              </FilterDropdownMenu>

              <FilterDropdownMenu
                options={[
                  {
                    label: 'All Amounts',
                    onClick: () => setColumnFilters(prev => ({ ...prev, amount: 'all' })),
                    checked: !columnFilters.amount || columnFilters.amount === 'all'
                  },
                  {
                    label: 'Positive Amounts',
                    onClick: () => setColumnFilters(prev => ({ ...prev, amount: 'positive' })),
                    checked: columnFilters.amount === 'positive'
                  },
                  {
                    label: 'Negative Amounts',
                    onClick: () => setColumnFilters(prev => ({ ...prev, amount: 'negative' })),
                    checked: columnFilters.amount === 'negative'
                  }
                ]}
                className="text-secondary border-primary/50 hover:bg-primary/20"
              >
                Amount
              </FilterDropdownMenu>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">Show:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(e.target.value)}
                className="h-8 px-2 rounded-lg border border-gray-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value={6}>6</option>
                <option value={12}>12</option>
                <option value={24}>24</option>
              </select>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.length ? (
                    currentItems.map((transaction) => (
                      <TransactionTableRow
                        key={transaction.trans_id}
                        transaction={transaction}
                        onClick={handleTransactionClick}
                      />
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12">
                        <div className="flex flex-col items-center justify-center space-y-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-[#E8C547]/20 rounded-full flex items-center justify-center">
                            <FiCreditCard className="w-8 h-8 text-secondary" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-secondary">
                              No Transactions Available
                            </h3>
                            <p className="text-sm text-gray-600 max-w-md">
                              Your transaction history is empty. Add funds to your wallet to get started with transactions.
                            </p>
                          </div>
                          <Button 
                            onClick={handleAddFundsOrSetPin}
                            className="mt-4"
                          >
                            {hasPinSet ? (
                              <>
                                <FiPlus className="w-4 h-4 mr-2" />
                                Add Funds
                              </>
                            ) : (
                              <>
                                <FiLock className="w-4 h-4 mr-2" />
                                Set PIN
                              </>
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="md:hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentItems.length ? (
                <AnimatePresence mode="wait">
                  {currentItems.map((transaction, index) => {
                    const isLastOdd = currentItems.length % 2 !== 0 && index === currentItems.length - 1;
                    return (
                      <TransactionCard
                        key={transaction.trans_id}
                        transaction={transaction}
                        onClick={handleTransactionClick}
                        isLastOdd={isLastOdd}
                      />
                    );
                  })}
                </AnimatePresence>
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-[#E8C547]/20 rounded-full flex items-center justify-center">
                      <FiCreditCard className="w-8 h-8 text-secondary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-secondary">
                        No Transactions Available
                      </h3>
                      <p className="text-sm text-gray-600 max-w-md">
                        Your transaction history is empty. Add funds to your wallet to get started with transactions.
                      </p>
                    </div>
                    <Button 
                      onClick={handleAddFundsOrSetPin}
                      className="mt-4"
                    >
                      {hasPinSet ? (
                        <>
                          <FiPlus className="w-4 h-4 mr-2" />
                          Add Funds
                        </>
                      ) : (
                        <>
                          <FiLock className="w-4 h-4 mr-2" />
                          Set PIN
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-row flex-wrap pt-4 items-center justify-between w-full">
            <div className="text-xs text-gray-600">
              Showing {Math.min(startIndex + 1, totalItems)} to {Math.min(endIndex, totalItems)} of{" "}
              {totalItems} transactions
            </div>

            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        handlePageChange(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                    />
                  </PaginationItem>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }

                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          onClick={() => handlePageChange(pageNumber)}
                          isActive={currentPage === pageNumber}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        handlePageChange(
                          Math.min(totalPages, currentPage + 1)
                        )
                      }
                      disabled={currentPage === totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showPinVerification && (
          <PinVerificationModal
            isOpen={showPinVerification}
            onClose={() => setShowPinVerification(false)}
            onSuccess={handlePinVerificationSuccess}
            onForgotPin={handleForgotPin}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEmailOtp && (
          <EmailOTPModal
            isOpen={showEmailOtp}
            onClose={() => setShowEmailOtp(false)}
            onSuccess={handleEmailOtpSuccess}
            email={userData?.email}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPhoneOtp && (
          <PhoneOTPModal
            isOpen={showPhoneOtp}
            onClose={() => setShowPhoneOtp(false)}
            onSuccess={handlePhoneOtpSuccess}
            phone={userData?.phone}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNewPinSetup && (
          <NewPinSetupModal
            isOpen={showNewPinSetup}
            onClose={() => setShowNewPinSetup(false)}
            onSuccess={handleNewPinSuccess}
            emailOtp={emailOtpCode}
            phoneOtp={phoneOtpCode}
            onRestartFlow={handleRestartOtpFlow}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddFunds && (
          <AddFundsModal
            isOpen={showAddFunds}
            onClose={() => setShowAddFunds(false)}
            onSubmit={handleAddFunds}
            loading={addingFunds}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPinModal && (
          <PinSetupModal
            isOpen={showPinModal}
            onClose={() => setShowPinModal(false)}
            onSuccess={handlePinSuccess}
          />
        )}
      </AnimatePresence>

      <TransactionDetailModal
        isOpen={transactionDetailModal.isOpen}
        onClose={handleCloseTransactionDetail}
        transaction={transactionDetailModal.transaction}
        transactionDetails={transactionDetailModal.details}
        loading={transactionDetailModal.loading}
      />
    </div>
  );
}