"use client";

import * as React from "react";
import { useState, useEffect, useRef, memo, forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { post, get, patch } from "../../utils/service";
import {
  UserPlus,
  Lock,
  Mail,
  User,
  Phone,
  Plus,
  Check,
  ArrowLeft,
  Eye,
  EyeOff,
  Globe,
  ChevronDown,
  Search,
  X,
  ExternalLink,
} from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "../../components/ui/input-otp";

import { TiBusinessCard } from "react-icons/ti";
import { CiAt } from "react-icons/ci";
import { assets } from "../../assets/assets";

// Terms and Privacy Modal Component
const TermsPrivacyModal = ({ isOpen, onClose }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isOpen) return null;

  // Mobile Drawer
  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 flex items-end">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative z-50 w-full bg-white/95 backdrop-blur-lg rounded-t-lg max-h-[80vh] flex flex-col border border-white/20">
          <div className="flex-shrink-0 p-4 border-b border-white/20">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Terms & Privacy</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 scrollbar-none">
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                By creating an account, you agree to our terms and policies:
              </p>
              <div className="space-y-3">
                <a
                  href="https://www.socialgems.me/terms-of-use"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-700">Terms of Use</span>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </a>
                <a
                  href="https://www.socialgems.me/privacypolicy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-700">Privacy Policy</span>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </a>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0 p-4 border-t border-white/20">
            <button
              onClick={onClose}
              className="w-full bg-primary text-secondary font-medium py-3 rounded-lg transition text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop Modal
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-labelledby="terms-title">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative z-50 w-full max-w-md max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-lg rounded-lg shadow-lg border border-white/20 scrollbar-none">
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <h2 id="terms-title" className="text-xl font-semibold">Terms & Privacy</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              By creating an account, you agree to our terms and policies:
            </p>
            <div className="space-y-3">
              <a
                href="https://www.socialgems.me/terms-of-use"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">Terms of Use</span>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>
              <a
                href="https://www.socialgems.me/privacypolicy"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">Privacy Policy</span>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>
            </div>
          </div>
          <div className="mt-6">
            <button
              onClick={onClose}
              className="w-full bg-primary text-secondary font-medium py-3 rounded-lg transition text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Industries Selection Modal Component
const IndustriesModal = ({ isOpen, onClose, onSkip, onContinue, industries, selectedIndustries, onToggleIndustry, loading }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [selectionCount, setSelectionCount] = useState(0);

  // Group industries by category
  const groupedIndustries = industries.reduce((acc, industry) => {
    if (!acc[industry.category]) {
      acc[industry.category] = [];
    }
    acc[industry.category].push(industry);
    return acc;
  }, {});

  // Update selection count when selectedIndustries changes
  useEffect(() => {
    setSelectionCount(selectedIndustries.length);
  }, [selectedIndustries]);

  const handleIndustryToggle = (industryId) => {
    if (selectedIndustries.includes(industryId) || selectionCount < 5) {
      onToggleIndustry(industryId);
    } else {
      toast.error("You can select a maximum of 5 industries");
    }
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Skeleton loader for categories that matches the final design
  const renderSkeletonLoader = () => {
    return (
      <div className="animate-pulse space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="mb-6">
            <div className="h-4 w-1/3 bg-gray-200 rounded mb-3"></div>
            <div className="flex flex-wrap gap-2">
              {[...Array(6)].map((_, j) => (
                <div key={j} className="px-3 py-1 h-7 w-20 bg-gray-200 rounded-md"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Mobile Drawer
  if (isMobile) {
    return isOpen ? (
      <div className="fixed inset-0 z-50 flex items-end">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative z-50 w-full bg-white/95 backdrop-blur-lg rounded-t-lg max-h-[80vh] flex flex-col border border-white/20">
          <div className="flex-shrink-0 p-4 border-b border-white/20">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Choose Your Industries</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 scrollbar-none">
            {loading ? (
              renderSkeletonLoader()
            ) : (
              Object.entries(groupedIndustries).map(([category, subcategories]) => (
                <div key={category} className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">{category}</h3>
                  <div className="flex flex-wrap gap-2">
                    {subcategories.map((industry) => (
                      <button
                        key={industry.id}
                        type="button"
                        onClick={() => handleIndustryToggle(industry.id)}
                        className={`px-3 py-1 rounded-md border transition-all text-xs ${
                          selectedIndustries.includes(industry.id)
                            ? "border-primary bg-primary/70 text-black"
                            : "border-gray-200 hover:border-gray-300 text-gray-700"
                        }`}
                      >
                        {industry.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="flex-shrink-0 p-4 border-t border-white/20">
            <div className="flex gap-3">
              <button
                onClick={onSkip}
                className="flex-1 bg-gray-200 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-300 transition text-sm"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Skip for now'}
              </button>
              <button
                onClick={onContinue}
                disabled={loading}
                className="flex-1 bg-primary text-secondary font-medium py-3 rounded-lg shadow hover:shadow-md transition disabled:opacity-50 text-sm"
              >
                {loading ? 'Loading...' : 'Continue'}
              </button>
            </div>
          </div>
        </div>
      </div>
    ) : null;
  }

  // Desktop Modal
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-labelledby="industries-title">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative z-50 w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-lg rounded-lg shadow-lg border border-white/20 scrollbar-none">
        <div className="flex items-center justify-between px-6 pt-6 border-b border-white/20">
          <h2 id="industries-title" className="text-xl font-semibold">Choose Your Industries</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">
          <div className="max-h-64 overflow-y-auto mb-6 scrollbar-none">
            {loading ? (
              renderSkeletonLoader()
            ) : (
              Object.entries(groupedIndustries).map(([category, subcategories]) => (
                <div key={category} className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">{category}</h3>
                  <div className="flex flex-wrap gap-2">
                    {subcategories.map((industry) => (
                      <button
                        key={industry.id}
                        type="button"
                        onClick={() => handleIndustryToggle(industry.id)}
                        className={`px-3 py-1 rounded-md border transition-all text-xs ${
                          selectedIndustries.includes(industry.id)
                            ? "border-primary bg-primary/70 text-black"
                            : "border-gray-200 hover:border-gray-300 text-gray-700"
                        }`}
                      >
                        {industry.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onSkip}
              className="flex-1 bg-gray-200 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-300 transition text-sm"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Skip for now'}
            </button>
            <button
              onClick={onContinue}
              disabled={loading}
              className="flex-1 bg-primary text-secondary font-medium py-3 rounded-lg shadow hover:shadow-md transition disabled:opacity-50 text-sm"
            >
              {loading ? 'Loading...' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Username Suggestions Dropdown Component
const UsernameSuggestionsDropdown = ({
  businessName,
  value,
  onChange,
  disabled
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || "");
  const [isUserTyping, setIsUserTyping] = useState(false);

  // Update input value when prop value changes
  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  const generateUsernameSuggestions = (name) => {
    if (!name) return [];
    
    const cleanName = name
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const words = cleanName.split(' ');
    const suggestions = new Set();

    // Basic transformations
    const transformations = [
      cleanName.replace(/\s+/g, '_'),
      cleanName.replace(/\s+/g, ''),
      words[0],
      words.map(w => w[0]).join(''),
      words[0] + words.slice(1).map(w => w[0]).join(''),
      words.join('.'),
      words[0] + (words.length > 1 ? words[words.length-1] : ''),
    ];

    // Add common business suffixes
    const suffixes = ['hq', 'official', 'app', 'co', 'inc', 'ltd'];
    transformations.forEach(base => {
      suffixes.forEach(suffix => {
        suggestions.add(`${base}_${suffix}`);
        suggestions.add(`${base}${suffix}`);
      });
    });

    // Add all transformations
    transformations.forEach(t => suggestions.add(t));

    // Filter valid usernames
    const validSuggestions = Array.from(suggestions)
      .filter(s => /^[a-z0-9_]{3,30}$/.test(s))
      .slice(0, 10);

    return validSuggestions;
  };

  const suggestions = generateUsernameSuggestions(businessName);
  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleInputChange = (e) => {
    // Remove spaces and convert to lowercase
    const newValue = e.target.value.replace(/\s+/g, '').toLowerCase();
    setInputValue(newValue);
    onChange(newValue);
    setIsUserTyping(true);
    
    // Hide dropdown when user starts typing
    if (newValue.length > 0) {
      setIsOpen(false);
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    setInputValue(suggestion);
    onChange(suggestion);
    setIsOpen(false);
    setIsUserTyping(false);
  };

  const handleInputFocus = () => {
    if (!disabled && !isUserTyping) {
      setIsOpen(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding to allow for suggestion clicks
    setTimeout(() => {
      setIsOpen(false);
      setIsUserTyping(false);
    }, 150);
  };

  const handleChevronClick = () => {
    if (!disabled) {
      setIsUserTyping(false);
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        placeholder="Username"
        disabled={disabled}
        className={`w-full pl-10 pr-8 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50 focus:bg-white text-black text-xs ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
      />
      
      <ChevronDown
        className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-transform cursor-pointer ${
          isOpen ? "rotate-180" : ""
        }`}
        onClick={handleChevronClick}
      />

      {isOpen && !isUserTyping && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <div className="text-xs text-gray-600 font-medium">
              Select or customize Username
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto scrollbar-none">
            {filteredSuggestions.length > 0 ? (
              filteredSuggestions.map((suggestion) => (
                <div
                  key={suggestion}
                  className="px-3 py-2 text-xs hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-b-0"
                  onClick={() => handleSuggestionSelect(suggestion)}
                >
                  {suggestion}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-xs text-gray-500">
                {businessName ? "No valid usernames generated" : "Enter business name first"}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const Signup = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1); // Start from step 1 (Details)
  const [loading, setLoading] = useState(false);
  const [industries, setIndustries] = useState([]);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localPhoneNumber, setLocalPhoneNumber] = useState("");
  const [isIndustriesModalOpen, setIsIndustriesModalOpen] = useState(false);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [countrySearchTerm, setCountrySearchTerm] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [username, setUsername] = useState("");

  const [signupData, setSignupData] = useState({
    email: "",
    phone_number: "",
    business_name: "",
    first_name: "",
    country_id: "256",
    user_type: "brand",
  });

  const [otpData, setOtpData] = useState({
    otp: "",
    user_id: "",
  });

  const [passwordData, setPasswordData] = useState({
    password: "",
    confirm_password: "",
  });

  // Fetch industries and countries on component mount
  useEffect(() => {
    fetchIndustries();
    fetchCountries();
    // Show industries modal when component mounts
    setIsIndustriesModalOpen(true);
  }, []);

  // Set default country when countries are loaded
  useEffect(() => {
    if (countries.length > 0 && !selectedCountry) {
      const defaultCountry =
        countries.find((country) => country.iso2 === "UG") || countries[0];
      setSelectedCountry(defaultCountry);
      setSignupData((prev) => ({
        ...prev,
        country_id: defaultCountry.iso2 === "UG" ? "256" : defaultCountry.id.toString(),
      }));
    }
  }, [countries, selectedCountry]);

  const fetchIndustries = async () => {
    try {
      const response = await get("users/industries");
      if (response.status === 200) {
        setIndustries(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching industries:", error);
      toast.error("Failed to load industries");
      setIndustries([
        { id: 1, name: "Technology" },
        { id: 2, name: "Fashion" },
        { id: 3, name: "Food & Beverage" },
        { id: 4, name: "Travel" },
        { id: 5, name: "Health & Fitness" },
        { id: 6, name: "Beauty" },
        { id: 7, name: "Automotive" },
        { id: 8, name: "Education" },
        { id: 9, name: "Entertainment" },
      ]);
    }
  };

  const fetchCountries = async () => {
    try {
      const response = await get("users/countries");
      if (response.status === 200) {
        let countriesData = response.data || [];
        const hasUganda = countriesData.find(
          (country) => country.iso2 === "UG"
        );

        if (!hasUganda) {
          countriesData.unshift({
            id: 999,
            iso2: "UG",
            iso3: "UGA",
            name: "Uganda",
            phone_code: "256",
            has_payouts: "no",
            status: "active",
          });
        }

        setCountries(countriesData);
      }
    } catch (error) {
      console.error("Error fetching countries:", error);
      toast.error("Failed to load countries");
      setCountries([
        {
          id: 999,
          name: "Uganda",
          iso2: "UG",
          phone_code: "256",
          has_payouts: "no",
          status: "active",
        },
        {
          id: 1,
          name: "Afghanistan",
          iso2: "AF",
          phone_code: "93",
          has_payouts: "no",
          status: "active",
        },
        {
          id: 2,
          name: "Kenya",
          iso2: "KE",
          phone_code: "254",
          has_payouts: "no",
          status: "active",
        },
        {
          id: 3,
          name: "Tanzania",
          iso2: "TZ",
          phone_code: "255",
          has_payouts: "no",
          status: "active",
        },
        {
          id: 4,
          name: "Rwanda",
          iso2: "RW",
          phone_code: "250",
          has_payouts: "no",
          status: "active",
        },
      ]);
    }
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone) => {
    const cleanPhone = phone.replace(/[^\d]/g, "");
    return cleanPhone.length >= 10 && cleanPhone.length <= 15;
  };

  const handleIndustryToggle = (industryId) => {
    setSelectedIndustries((prev) => {
      if (prev.includes(industryId)) {
        return prev.filter((id) => id !== industryId);
      } else {
        return [...prev, industryId];
      }
    });
  };

  const handleCountryChange = (country) => {
    setSelectedCountry(country);
    setSignupData((prev) => ({ 
      ...prev, 
      country_id: country.iso2 === "UG" ? "256" : country.id.toString()
    }));
    setIsCountryDropdownOpen(false);
    setCountrySearchTerm("");

    // Clear the phone number when country changes
    setLocalPhoneNumber("");
    setSignupData((prev) => ({ ...prev, phone_number: "" }));
  };

  const handlePhoneChange = (value) => {
    // Remove any non-digit characters except the '+' at the beginning
    let cleanValue = value.replace(/[^\d]/g, "");

    // Remove leading zero if present
    if (cleanValue.startsWith("0")) {
      cleanValue = cleanValue.substring(1);
    }

    setLocalPhoneNumber(cleanValue);

    // Update the full phone number with country code
    if (selectedCountry && cleanValue) {
      const fullNumber = `+${selectedCountry.phone_code}${cleanValue}`;
      setSignupData((prev) => ({ ...prev, phone_number: fullNumber }));
    } else {
      setSignupData((prev) => ({ ...prev, phone_number: "" }));
    }
  };

  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(countrySearchTerm.toLowerCase())
  );

  const handleIndustriesSkip = () => {
    setIsIndustriesModalOpen(false);
    setCurrentStep(1);
  };

  const handleIndustriesContinue = () => {
    setIsIndustriesModalOpen(false);
    setCurrentStep(1);
  };

  const handleStepTwo = async () => {
    const {
      email,
      phone_number,
      business_name,
    } = signupData;

    if (
      !email.trim() ||
      !phone_number.trim() ||
      !business_name.trim()
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!agreedToTerms) {
      toast.error("Please agree to our Terms of Use and Privacy Policy");
      return;
    }

    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!validatePhone(phone_number)) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setLoading(true);

    try {
      // Send business_name as first_name in the signup request
      const signupPayload = {
        ...signupData,
        first_name: signupData.business_name,
      };

      const response = await post("users/signup", signupPayload);

      if (response.status === 200 || response.status === 201) {
        const userId = response.data?.user_id || response.data?.id;
        
        setOtpData((prev) => ({ ...prev, user_id: userId }));

        toast.success("Account created! Please check your email for OTP");
        setCurrentStep(2);
      } else {
        toast.error(response.message || "Signup failed. Please try again");
      }
    } catch (error) {
      console.error("Signup error:", error);
      if (error.response) {
        const errorMessage = error.response.data?.message || "Signup failed";
        toast.error(errorMessage);
      } else {
        toast.error("An error occurred during signup. Please try again");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStepThree = async () => {
    if (!otpData.otp.trim() || otpData.otp.length !== 4) {
      toast.error("Please enter the complete 4-digit OTP");
      return;
    }

    setLoading(true);

    try {
      const response = await post("users/verifyEmail", {
        user_id: otpData.user_id,
        email: signupData.email,
        username: username,
        otp: otpData.otp,
      });

      if (response.status === 200) {
        const token = response.data?.token;
        const responseUsername = response.data?.username;
        
        if (token) {
          localStorage.setItem("jwt", token);
          localStorage.setItem("user_id", response.data.user_id);
          localStorage.setItem("username", responseUsername || username);
          localStorage.setItem("status", response.data.status);
        }

        toast.success("Email verified successfully!");
        setCurrentStep(3);
      } else {
        toast.error(response.message || "Invalid OTP. Please try again");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      if (error.response) {
        const errorMessage = error.response.data?.message || "Invalid OTP";
        toast.error(errorMessage);
      } else {
        toast.error("An error occurred during verification. Please try again");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStepFour = async () => {
    const { password, confirm_password } = passwordData;

    if (!username.trim()) {
      toast.error("Please enter a username");
      return;
    }

    if (!password || !confirm_password) {
      toast.error("Please enter both password and confirmation");
      return;
    }

    if (password !== confirm_password) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("jwt");

      if (!token) {
        toast.error("Session expired. Please restart the signup process");
        setCurrentStep(1);
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // Include the user's selected username in the secure account request
      const secureAccountData = {
        ...passwordData,
        username: username,
      };

      const response = await post("users/secureAccount", secureAccountData, headers);

      if (response.status === 200) {
        const loginResponse = await post("users/login", {
          email: signupData.email,
          password: passwordData.password,
        });

        if (loginResponse.status === 200) {
          const {
            username: loginUsername,
            user_type: role,
            email: userEmail,
            jwt,
          } = loginResponse.data;

          localStorage.setItem("name", loginUsername);
          localStorage.setItem("email", userEmail);
          localStorage.setItem("role", role);
          localStorage.setItem("jwt", jwt);
          localStorage.setItem("isLoggedIn", "true");

          // Update industries if selected
          if (selectedIndustries.length > 0) {
            try {
              await patch(
                "users/updateProfile",
                {
                  industry_ids: selectedIndustries,
                  username: username || loginUsername,
                  first_name: signupData.business_name,
                },
                {
                  headers: {
                    Authorization: `Bearer ${jwt}`,
                    "Content-Type": "application/json",
                  },
                }
              );
              toast.success("Account setup completed successfully!");
            } catch (industryError) {
              console.warn("Failed to update industries:", industryError);
              toast.success(
                "Account setup completed! You can update industries later in your profile."
              );
            }
          } else {
            // Even if no industries selected, still update with business name as last name
            try {
              await patch(
                "users/updateProfile",
                {
                  username: username || loginUsername,
                  first_name: signupData.business_name,
                },
                {
                  headers: {
                    Authorization: `Bearer ${jwt}`,
                    "Content-Type": "application/json",
                  },
                }
              );
              toast.success("Account setup completed successfully!");
            } catch (profileError) {
              console.warn("Failed to update profile:", profileError);
              toast.success("Account setup completed successfully!");
            }
          }

          navigate("/dashboard");
        } else {
          toast.error(
            "Account created but login failed. Please login manually."
          );
          navigate("/login");
        }
      } else {
        toast.error(response.message || "Failed to secure account");
      }
    } catch (error) {
      console.error("Secure account error:", error);
      if (error.response) {
        const errorMessage =
          error.response.data?.message || "Failed to secure account";
        toast.error(errorMessage);
      } else {
        toast.error("An error occurred while securing your account");
      }
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    setLoading(true);
    try {
      await post("users/sendEmailOTP", {
        userId: otpData.user_id,
        email: signupData.email,
      });
      toast.success("OTP resent successfully!");
    } catch (error) {
      toast.error("Failed to resend OTP. Please try again");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    switch (currentStep) {
      case 1:
        handleStepTwo();
        break;
      case 2:
        handleStepThree();
        break;
      case 3:
        handleStepFour();
        break;
      default:
        break;
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAppStoreDownload = () => {
    window.open('https://apps.apple.com/app/socialgems', '_blank');
  };

  const handlePlayStoreDownload = () => {
    window.open('https://play.google.com/store/apps/details?id=com.socialgems.app', '_blank');
  };

  const stepTitles = {
    1: {
      title: "Get Started",
      description: "Enter your business details to get started with your brand account."
    },
    2: {
      title: "Verify Email",
      description: "Enter the 4-digit code sent to your email address."
    },
    3: {
      title: "Secure Account",
      description: "Create a unique username and password for your account."
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 mt-2">
            <div className="space-y-4">
              {/* BUSINESS NAME ONLY */}
              <div className="relative">
                <TiBusinessCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  placeholder="Business Name"
                  type="text"
                  value={signupData.business_name}
                  className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50 focus:bg-white text-black text-xs"
                  onChange={(e) =>
                    setSignupData((prev) => ({
                      ...prev,
                      business_name: e.target.value,
                    }))
                  }
                  disabled={loading}
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  placeholder="Email"
                  type="email"
                  value={signupData.email}
                  className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50 focus:bg-white text-black text-xs"
                  onChange={(e) =>
                    setSignupData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  disabled={loading}
                />
              </div>

              {/* COMBINED PHONE AND COUNTRY FIELD */}
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                
                <div className="flex w-full border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-primary focus-within:border-primary bg-gray-50 focus-within:bg-white">
                  {/* Country Selector */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                      disabled={loading}
                      className="pl-10 pr-3 py-3 text-xs text-black border-r border-gray-200 bg-transparent focus:outline-none flex items-center gap-1 hover:bg-gray-100 transition-colors"
                    >
                      <span>
                        {selectedCountry ? `${selectedCountry.name} +${selectedCountry.phone_code}` : "Select"}
                      </span>
                      <ChevronDown
                        className={`w-3 h-3 text-gray-400 transition-transform ${
                          isCountryDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isCountryDropdownOpen && (
                      <div className="absolute z-50 left-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden">
                        <div className="p-2 border-b border-gray-100">
                          <div className="relative">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search countries..."
                              value={countrySearchTerm}
                              onChange={(e) => setCountrySearchTerm(e.target.value)}
                              className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </div>
                        </div>
                        <div className="max-h-48 overflow-y-auto scrollbar-none">
                          {filteredCountries.length > 0 ? (
                            filteredCountries.map((country) => (
                              <button
                                key={country.id}
                                type="button"
                                className="w-full px-3 py-2 text-xs hover:bg-gray-50 text-left border-b border-gray-50 last:border-b-0 flex items-center justify-between"
                                onClick={() => handleCountryChange(country)}
                              >
                                <span>{country.name}</span>
                                <span className="text-gray-500">+{country.phone_code}</span>
                              </button>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-xs text-gray-500">
                              No countries found
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Phone Number Input */}
                  <input
                    placeholder="Phone Number"
                    type="tel"
                    value={localPhoneNumber}
                    className="flex-1 px-3 py-3 border-none text-black bg-transparent text-xs focus:outline-none"
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    disabled={loading || !selectedCountry}
                  />
                </div>
              </div>

              {/* Terms and Privacy Agreement */}
              <div className="flex items-center gap-1.5">
              <input
                type="checkbox"
                id="terms-agreement"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-4 h-4 rounded border-secondary text-secondary focus:ring-primary focus:ring-2 checked:bg-secondary checked:border-secondary checked:text-white hover:none"
                disabled={loading}
              />
                <label htmlFor="terms-agreement" className="text-xs text-gray-700 cursor-pointer">
                  I agree to Social Gems'{" "}
                  <button
                    type="button"
                    onClick={() => setIsTermsModalOpen(true)}
                    className="text-secondary hover:underline font-semibold"
                  >
                    Terms of Use
                  </button>{" "}
                  and{" "}
                  <button
                    type="button"
                    onClick={() => setIsTermsModalOpen(true)}
                    className="text-secondary hover:underline font-semibold"
                  >
                    Privacy Policy
                  </button>
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={nextStep}
                disabled={loading}
                className="flex-1 bg-primary text-secondary font-medium py-3 rounded-lg shadow hover:shadow-md transition disabled:opacity-50 text-xs"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </div>

            {/* Already have account section moved inside */}
            <div className="text-center pt-4 border-t border-gray-200">
              <span className="text-xs text-black/80">
                Already have an account?{" "}
              </span>
              <button
                onClick={() => navigate("/login")}
                className="text-xs text-primary hover:text-primary-scale-600 font-medium hover:underline transition-colors"
              >
                Sign in
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 mt-2">
            <div className="flex justify-center">
              <InputOTP
                maxLength={4}
                value={otpData.otp}
                onChange={(value) => {
                  setOtpData((prev) => ({ ...prev, otp: value }));
                  if (value.length === 4) {
                    setTimeout(() => {
                      if (!loading) {
                        handleStepThree();
                      }
                    }, 100);
                  }
                }}
                disabled={loading}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <div className="text-center">
              <span className="text-xs text-black/80">
                Didn't receive the code?{" "}
              </span>
              <button
                onClick={resendOTP}
                disabled={loading}
                className="text-xs text-primary hover:text-primary-scale-600 font-medium hover:underline disabled:opacity-50 transition-colors"
              >
                Resend
              </button>
            </div>

            <button
              onClick={nextStep}
              disabled={loading || otpData.otp.length !== 4}
              className="w-full bg-primary text-secondary font-medium py-3 rounded-lg shadow hover:shadow-md transition disabled:opacity-50 text-xs"
            >
              {loading ? "Verifying..." : "Verify Email"}
            </button>

            {/* Already have account section moved inside */}
            <div className="text-center pt-4 border-t border-gray-200">
              <span className="text-xs text-black/80">
                Already have an account?{" "}
              </span>
              <button
                onClick={() => navigate("/login")}
                className="text-xs text-primary hover:text-primary-scale-600 font-medium hover:underline transition-colors"
              >
                Sign in
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 mt-2">

            <div className="space-y-4">
              <div className="relative">
                <CiAt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                <UsernameSuggestionsDropdown
                  businessName={signupData.business_name}
                  value={username}
                  onChange={setUsername}
                  disabled={loading}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  placeholder="Password"
                  type={showPassword ? "text" : "password"}
                  value={passwordData.password}
                  className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50 focus:bg-white text-black text-xs"
                  onChange={(e) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  placeholder="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordData.confirm_password}
                  className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50 focus:bg-white text-black text-xs"
                  onChange={(e) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      confirm_password: e.target.value,
                    }))
                  }
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              onClick={nextStep}
              disabled={
                loading ||
                !username.trim() ||
                !passwordData.password ||
                !passwordData.confirm_password
              }
              className="w-full bg-primary text-secondary font-medium py-3 rounded-lg shadow hover:shadow-md transition disabled:opacity-50 text-xs"
            >
              {loading ? "Completing Setup..." : "Complete Setup"}
            </button>

            {/* Already have account section moved inside */}
            <div className="text-center pt-4 border-t border-gray-200">
              <span className="text-xs text-black/80">
                Already have an account?{" "}
              </span>
              <button
                onClick={() => navigate("/login")}
                className="text-xs text-primary hover:text-primary-scale-600 font-medium hover:underline transition-colors"
              >
                Sign in
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <style jsx>{`
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-none::-webkit-scrollbar { 
          display: none;
        }
      `}</style>

      {/* Desktop Layout */}
      <div className="min-h-screen lg:flex items-center justify-center overflow-hidden p-4 hidden">
        {/* FIXED HEIGHT CONTAINER */}
        <div className="w-full relative max-w-5xl h-[600px] overflow-hidden flex flex-col md:flex-row shadow-xl">
          <div className="w-full h-full z-0 absolute bg-linear-to-t from-transparent to-black pointer-events-none"></div>
          <div className="flex absolute z-0 overflow-hidden backdrop-blur-2xl pointer-events-none">
            <div className="h-[40rem] z-0 w-[4rem] bg-linear-90 from-[#ffffff00] via-[#000000] via-[69%] to-[#ffffff30] opacity-30 overflow-hidden"></div>
            <div className="h-[40rem] z-0 w-[4rem] bg-linear-90 from-[#ffffff00] via-[#000000] via-[69%] to-[#ffffff30] opacity-30 overflow-hidden"></div>
            <div className="h-[40rem] z-0 w-[4rem] bg-linear-90 from-[#ffffff00] via-[#000000] via-[69%] to-[#ffffff30] opacity-30 overflow-hidden"></div>
            <div className="h-[40rem] z-0 w-[4rem] bg-linear-90 from-[#ffffff00] via-[#000000] via-[69%] to-[#ffffff30] opacity-30 overflow-hidden"></div>
            <div className="h-[40rem] z-0 w-[4rem] bg-linear-90 from-[#ffffff00] via-[#000000] via-[69%] to-[#ffffff30] opacity-30 overflow-hidden"></div>
            <div className="h-[40rem] z-0 w-[4rem] bg-linear-90 from-[#ffffff00] via-[#000000] via-[69%] to-[#ffffff30] opacity-30 overflow-hidden"></div>
          </div>
          <div className="w-[15rem] h-[15rem] bg-primary absolute z-0 rounded-full bottom-0 pointer-events-none"></div>
          <div className="w-[8rem] h-[5rem] bg-white absolute z-0 rounded-full bottom-0 pointer-events-none"></div>
          <div className="w-[8rem] h-[5rem] bg-white absolute z-0 rounded-full bottom-0 pointer-events-none"></div>

          {/* LEFT CARD - FIXED HEIGHT */}
          <div className="relative md:w-1/2 rounded-bl-3xl overflow-hidden z-10 flex flex-col justify-between h-full">
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat rounded-bl-3xl"
              style={{ backgroundImage: `url(${assets.banner})` }}
            />
            {/* Lighter Dark Overlay for text visibility */}
            <div className="absolute inset-0 bg-black/30 rounded-bl-3xl"></div>
            
            <div className="relative z-20 flex flex-col items-center justify-center flex-1 w-full px-4 text-white p-8 md:p-12">
              <img
                src={assets.MainLogo}
                alt="Social Gems Logo"
                className="h-fit w-60 object-contain mb-8 drop-shadow-lg"
              />

              <div className="relative z-20 w-full px-4 text-white">
                <p className="text-center text-sm opacity-90 mb-4">Follow us on social media</p>
                <div className="flex items-center justify-center gap-4 mb-8">
                  <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors backdrop-blur-sm">
                    <span className="text-blue-400 text-sm font-bold">f</span>
                  </a>
                  <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors backdrop-blur-sm">
                    <img src={assets.instagram} alt="Instagram" className="w-4 h-4 object-contain" />
                  </a>
                  <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors backdrop-blur-sm">
                    <img src={assets.twitter} alt="X (Twitter)" className="w-4 h-4 object-contain" />
                  </a>
                  <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors backdrop-blur-sm">
                    <img src={assets.youtube} alt="YouTube" className="w-4 h-4 object-contain" />
                  </a>
                  <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors backdrop-blur-sm">
                    <img src={assets.tiktok} alt="TikTok" className="w-4 h-4 object-contain" />
                  </a>
                </div>
              </div>
            </div>
            
            <div className="relative z-20 w-full px-4 text-white p-8">
              <p className="text-center text-sm opacity-90 mb-6">📱 Download our mobile app</p>
              <div className="flex gap-3 w-full max-w-lg mx-auto">
                <button
                  onClick={handleAppStoreDownload}
                  className="bg-gradient-to-r from-gray-900 to-black hover:from-black hover:to-gray-900 text-white rounded-xl px-4 py-3 flex items-center transition-all duration-300 w-full shadow-lg hover:shadow-xl border border-gray-800"
                >
                  <img 
                    src={assets.applelogo}
                    alt="Apple Logo"
                    className="w-5 h-5 mr-3 flex-shrink-0 object-contain"
                  />
                  <div className="text-left">
                    <div className="text-xs text-gray-300">Get it on</div>
                    <div className="text-sm font-semibold">App Store</div>
                  </div>
                </button>
                
                <button
                  onClick={handlePlayStoreDownload}
                  className="bg-gradient-to-r from-gray-900 to-black hover:from-black hover:to-gray-900 text-white rounded-xl px-4 py-3 flex items-center transition-all duration-300 w-full shadow-lg hover:shadow-xl border border-gray-800"
                >
                  <img 
                    src={assets.playstorelogo}
                    alt="Play Store Logo"
                    className="w-5 h-5 mr-3 flex-shrink-0 object-contain"
                  />
                  <div className="text-left">
                    <div className="text-xs text-gray-300">Get it on</div>
                    <div className="text-sm font-semibold">Google Play</div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT CARD - FIXED HEIGHT WITH SCROLLABLE CONTENT */}
          <div className="md:w-1/2 flex flex-col bg-white z-20 text-black relative h-full">
            {/* HEADER - FIXED */}
            {/* HEADER - FIXED */}
            <div className="flex-shrink-0 p-8 md:p-8 mb-2 pb-4">
              <div className="flex flex-col items-left">
                <div className="text-primary mb-4">
                  <img
                    src={assets.LogoIcon}
                    alt="Social Gems"
                    className="h-10 w-10 object-contain"
                  />
                </div>
                <h2 className="text-3xl font-medium mb-2 tracking-tight">
                  {stepTitles[currentStep].title}
                </h2>
                <p className="text-left opacity-80">
                  {stepTitles[currentStep].description}
                </p>
              </div>
            </div>

            {/* SCROLLABLE FORM CONTENT */}
            <div className="flex-1 overflow-y-auto px-8 md:px-12 pb-8 scrollbar-none">
              {renderStepContent()}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout - FIXED HEIGHT */}
      <div className="min-h-screen flex flex-col lg:hidden bg-gray-50">
        <div className="h-screen flex flex-col max-w-md mx-auto w-full">
          {/* Mobile Logo Section - FIXED HEIGHT */}
          <div className="flex-shrink-0 bg-secondary/90 py-6 px-4 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10">
              <img
                src={assets.MainLogo}
                alt="Social Gems Logo"
                className="h-fit w-24 object-contain mx-auto drop-shadow-lg"
              />
            </div>
          </div>

          {/* Mobile Form Section - SCROLLABLE */}
          <div className="flex-1 bg-white overflow-hidden flex flex-col">
            {/* HEADER - FIXED */}
            <div className="flex-shrink-0 p-6 pb-4">
              <div className="flex flex-col items-left">
                <div className="text-primary mb-4">
                  <img
                    src={assets.LogoIcon}
                    alt="Social Gems"
                    className="h-10 w-10 object-contain"
                  />
                </div>
                <h2 className="text-2xl font-medium mb-2 tracking-tight">
                  {stepTitles[currentStep].title}
                </h2>
                <p className="text-left opacity-80">
                  {stepTitles[currentStep].description}
                </p>
              </div>
            </div>

            {/* SCROLLABLE CONTENT */}
            <div className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-none">
              {renderStepContent()}

              {/* Mobile Social Media Links */}
              <div className="text-center mt-8">
                <p className="text-sm opacity-80 mb-4 text-gray-600">Follow us on social media</p>
                <div className="flex items-center justify-center gap-4 mb-6">
                  <a href="#" className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
                    <span className="text-blue-500 text-sm font-bold">f</span>
                  </a>
                  <a href="#" className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
                    <img src={assets.instagram} alt="Instagram" className="w-4 h-4 object-contain" />
                  </a>
                  <a href="#" className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
                    <img src={assets.twitter} alt="X (Twitter)" className="w-4 h-4 object-contain" />
                  </a>
                  <a href="#" className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
                    <img src={assets.youtube} alt="YouTube" className="w-4 h-4 object-contain" />
                  </a>
                  <a href="#" className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
                    <img src={assets.tiktok} alt="TikTok" className="w-4 h-4 object-contain" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Industries Selection Modal */}
      <IndustriesModal
        isOpen={isIndustriesModalOpen}
        onClose={() => setIsIndustriesModalOpen(false)}
        onSkip={handleIndustriesSkip}
        onContinue={handleIndustriesContinue}
        industries={industries}
        selectedIndustries={selectedIndustries}
        onToggleIndustry={handleIndustryToggle}
        loading={loading}
      />

      {/* Terms and Privacy Modal */}
      <TermsPrivacyModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
      />
    </>
  );
};

export default Signup;