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
  Gift,
} from "lucide-react";

import { FaInstagram, FaXTwitter } from "react-icons/fa6";
import { PiTiktokLogoLight } from "react-icons/pi";
import { SlSocialFacebook } from "react-icons/sl";
import { PiYoutubeLogo } from "react-icons/pi";


import { TiBusinessCard } from "react-icons/ti";
import { CiAt } from "react-icons/ci";
import { assets } from "../../assets/assets";

// Simple OTP Input Component
const OTPInput = ({ value, onChange, disabled, maxLength = 4 }) => {
  const inputRefs = useRef([]);

  const handleChange = (index, val) => {
    if (val.length > 1) {
      // Handle paste
      const pastedValue = val.slice(0, maxLength);
      onChange(pastedValue);
      
      // Focus on the last filled input or the next empty one
      const nextIndex = Math.min(pastedValue.length - 1, maxLength - 1);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    // Handle single character input
    const newValue = value.split('');
    newValue[index] = val;
    
    // Remove any undefined values and join
    const finalValue = newValue.slice(0, maxLength).join('').replace(/undefined/g, '');
    onChange(finalValue);

    // Move to next input
    if (val && index < maxLength - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: maxLength }, (_, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          disabled={disabled}
          className="w-12 h-12 text-center text-lg font-semibold border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none disabled:bg-gray-100"
        />
      ))}
    </div>
  );
};

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
              <p className="text-xs text-gray-600">
                By creating an account, you agree to our terms and policies:
              </p>
              <div className="space-y-3">
                <a
                  href="https://www.socialgems.me/terms-of-use"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-xs font-medium text-gray-700">Terms of Use</span>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </a>
                <a
                  href="https://www.socialgems.me/privacypolicy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-xs font-medium text-gray-700">Privacy Policy</span>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </a>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0 p-4 border-t border-white/20">
            <button
              onClick={onClose}
              className="w-full bg-primary text-secondary font-medium py-3 rounded-lg transition text-xs"
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
            <p className="text-xs text-gray-600">
              By creating an account, you agree to our terms and policies:
            </p>
            <div className="space-y-3">
              <a
                href="https://www.socialgems.me/terms-of-use"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-xs font-medium text-gray-700">Terms of Use</span>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>
              <a
                href="https://www.socialgems.me/privacypolicy"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-xs font-medium text-gray-700">Privacy Policy</span>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>
            </div>
          </div>
          <div className="mt-6">
            <button
              onClick={onClose}
              className="w-full bg-primary text-secondary font-medium py-3 rounded-lg transition text-xs"
            >
              Close
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
        className={`w-full pr-8 py-3 px-4 rounded-lg border-0 outline-0 bg-gray-200 focus:bg-white focus:border focus:border-primary text-black text-xs transition-all ${
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
  const [selectedBusinessCountry, setSelectedBusinessCountry] = useState(null);
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]); // New state for selected categories
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localPhoneNumber, setLocalPhoneNumber] = useState("");
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [isBusinessCountryDropdownOpen, setIsBusinessCountryDropdownOpen] = useState(false);
  const [countrySearchTerm, setCountrySearchTerm] = useState("");
  const [businessCountrySearchTerm, setBusinessCountrySearchTerm] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [referralCode, setReferralCode] = useState("");

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

  // Password validation
  const validatePassword = (password) => {
    const minLength = 8;
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return {
      isValid: password.length >= minLength && hasNumber && hasSpecialChar,
      errors: {
        minLength: password.length < minLength,
        hasNumber: !hasNumber,
        hasSpecialChar: !hasSpecialChar,
      }
    };
  };

  // Fetch industries and countries on component mount
  useEffect(() => {
    fetchIndustries();
    fetchCountries();
  }, []);

  // Set default country when countries are loaded
  useEffect(() => {
    if (countries.length > 0 && !selectedCountry) {
      const defaultCountry =
        countries.find((country) => country.iso2 === "UG") || countries[0];
      setSelectedCountry(defaultCountry);
      setSelectedBusinessCountry(defaultCountry);
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
        { id: 1, name: "Technology", category: "Tech" },
        { id: 2, name: "Fashion", category: "Retail" },
        { id: 3, name: "Food & Beverage", category: "Food" },
        { id: 4, name: "Travel", category: "Travel" },
        { id: 5, name: "Health & Fitness", category: "Health" },
        { id: 6, name: "Beauty", category: "Beauty" },
        { id: 7, name: "Automotive", category: "Automotive" },
        { id: 8, name: "Education", category: "Education" },
        { id: 9, name: "Entertainment", category: "Entertainment" },
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

  // New function to handle category selection
  const handleCategoryToggle = (category) => {
    setSelectedCategories((prev) => {
      const isCurrentlySelected = prev.includes(category);
      let newSelectedCategories;
      
      if (isCurrentlySelected) {
        // Remove category
        newSelectedCategories = prev.filter(cat => cat !== category);
      } else {
        // Add category
        newSelectedCategories = [...prev, category];
      }

      // Update selectedIndustries based on selected categories
      const industriesInSelectedCategories = industries.filter(industry => 
        newSelectedCategories.includes(industry.category)
      ).map(industry => industry.id);
      
      setSelectedIndustries(industriesInSelectedCategories);
      
      return newSelectedCategories;
    });
  };

  const handleIndustryToggle = (industryId) => {
    setSelectedIndustries((prev) => {
      if (prev.includes(industryId)) {
        return prev.filter((id) => id !== industryId);
      } else if (prev.length < 200) {
        return [...prev, industryId];
      } else {
        toast.error("You can select a maximum of 200 industries");
        return prev;
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

  const handleBusinessCountryChange = (country) => {
    setSelectedBusinessCountry(country);
    setIsBusinessCountryDropdownOpen(false);
    setBusinessCountrySearchTerm("");
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

  const filteredBusinessCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(businessCountrySearchTerm.toLowerCase())
  );

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
      toast.error("Please fill in all required fields");
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
        referral_code: referralCode || undefined,
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

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      toast.error("Password must be at least 8 characters long and contain at least 1 number and 1 special character");
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
        toast.success("Password set successfully!");
        setCurrentStep(4);
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

  const handleStepFive = async () => {
    setLoading(true);

    try {
      // Login the user
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
                country_id: selectedBusinessCountry?.id || selectedCountry?.id,
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
          // Even if no industries selected, still update with business name
          try {
            await patch(
              "users/updateProfile",
              {
                username: username || loginUsername,
                first_name: signupData.business_name,
                country_id: selectedBusinessCountry?.id || selectedCountry?.id,
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
        toast.error("Login failed. Please login manually.");
        navigate("/login");
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error.response) {
        const errorMessage = error.response.data?.message || "Login failed";
        toast.error(errorMessage);
      } else {
        toast.error("An error occurred during login");
      }
      navigate("/login");
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
      case 4:
        handleStepFive();
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
    window.open('https://apps.apple.com/ug/app/social-gems/id6736918664', '_blank');
  };

  const handlePlayStoreDownload = () => {
    window.open('https://play.google.com/store/apps/details?id=com.tekjuice.social_gems', '_blank');
  };

  const stepTitles = {
    1: {
      title: "Create an account",
      description: "Already have an account ?"
    },
    2: {
      title: "Verify Email",
      description: "Enter the 4-digit code sent to your email address."
    },
    3: {
      title: "Secure Account",
      description: "Create a unique username and password for your account."
    },
    4: {
      title: "Choose Industries",
      description: "Select the industry categories that best describe your business (optional)."
    }
  };

  // Group industries by category and get unique categories
  const groupedIndustries = industries.reduce((acc, industry) => {
    if (!acc[industry.category]) {
      acc[industry.category] = [];
    }
    acc[industry.category].push(industry);
    return acc;
  }, {});

  // Get unique categories
  const uniqueCategories = Object.keys(groupedIndustries);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-2">
            {/* Business Name Field */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Business name
              </label>
              <input
                placeholder="Social Gems Group"
                type="text"
                value={signupData.business_name}
                className="w-full px-4 py-3 rounded-lg border-0 outline-0 bg-gray-200 focus:bg-white focus:border focus:border-primary text-black text-xs transition-all"
                onChange={(e) =>
                  setSignupData((prev) => ({
                    ...prev,
                    business_name: e.target.value,
                  }))
                }
                disabled={loading}
              />
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Email address
              </label>
              <input
                placeholder="business@socialgems.me"
                type="email"
                value={signupData.email}
                className="w-full px-4 py-3 rounded-lg border-0 outline-0 bg-gray-200 focus:bg-white focus:border focus:border-primary text-black text-xs transition-all"
                onChange={(e) =>
                  setSignupData((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                disabled={loading}
              />
            </div>

            {/* Country and Phone Number Row - Responsive */}
            <div className="flex flex-col lg:flex-row gap-2">
              {/* Select Country Field */}
              <div className="w-full lg:flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Select country
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                    disabled={loading}
                    className="w-full px-4 py-3 text-xs text-black rounded-lg border-0 outline-0 bg-gray-200 focus:bg-white focus:border focus:border-primary text-left flex items-center justify-between transition-all"
                  >
                    <span>
                      {selectedCountry ? selectedCountry.name : "Uganda"}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform ${
                        isCountryDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isCountryDropdownOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden">
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
              </div>

              {/* Phone Number Field */}
              <div className="w-full lg:flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Phone number
                </label>
                {/* Unified Phone Input Field */}
                <div className="flex overflow-hidden items-center bg-gray-200 focus-within:bg-white focus-within:border focus-within:border-primary rounded-lg transition-all">
                  {/* Country Code Section */}
                  <div className="px-3 py-3 text-xs text-black font-medium border-r border-gray-300">
                    +{selectedCountry ? selectedCountry.phone_code : "256"}
                  </div>
                  
                  {/* Phone Number Input */}
                  <input
                    placeholder="772906777"
                    type="tel"
                    value={localPhoneNumber}
                    className="flex-1 px-4 py-3 border-none bg-transparent outline-none text-black text-xs"
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    disabled={loading || !selectedCountry}
                  />
                </div>
              </div>
            </div>

            {/* Referral Code Field (Optional) */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Referral code <span className="text-gray-400">(optional)</span>
              </label>
              <input
                placeholder="Enter referral code"
                type="text"
                value={referralCode}
                className="w-full px-4 py-3 rounded-lg border-0 outline-0 bg-gray-200 focus:bg-white focus:border focus:border-primary text-black text-xs transition-all"
                onChange={(e) => setReferralCode(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms-agreement"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-gray-300 text-primary focus:ring-primary focus:ring-2"
                disabled={loading}
              />
              <label htmlFor="terms-agreement" className="text-xs text-gray-700 cursor-pointer leading-relaxed">
                I agree to our{" "}
                <button
                  type="button"
                  onClick={() => setIsTermsModalOpen(true)}
                  className="text-primary hover:underline font-medium"
                >
                  Terms and Conditions
                </button>
              </label>
            </div>

            {/* Sign Up Button */}
            <button
              onClick={nextStep}
              disabled={loading}
              className="w-full bg-primary text-secondary font-medium py-3 rounded-lg transition disabled:opacity-50 text-xs hover:bg-primary"
            >
              {loading ? "Creating Account..." : "Sign up"}
            </button>

            {/* Download App Section - RIGHT SIDE BOTTOM */}
            <div className="flex-shrink-0">
            <div className="flex items-center w-full py-2">
              <div className="flex-grow h-px bg-gray-300"></div>
              <p className="mx-4 text-center text-xs text-gray-600">Download the app</p>
              <div className="flex-grow h-px bg-gray-300"></div>
            </div>

              <div className="flex gap-3 justify-center w-full">
                <button
                  onClick={handleAppStoreDownload}
                  className="bg-black hover:bg-gray-900 text-white rounded-lg px-4 py-2 flex items-center w-full transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <img 
                    src={assets.applelogo}
                    alt="Apple Logo"
                    className="w-6 h-6 mr-2 object-contain"
                  />
                  <div className="text-left">
                    <div className="text-xs text-gray-300">Get it on</div>
                    <div className="text-xs font-semibold">App Store</div>
                  </div>
                </button>
                
                <button
                  onClick={handlePlayStoreDownload}
                  className="bg-black hover:bg-gray-900 text-white w-full rounded-lg px-4 py-2 flex items-center transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <img 
                    src={assets.playstorelogo}
                    alt="Play Store Logo"
                    className="w-6 h-6 mr-2 object-contain"
                  />
                  <div className="text-left">
                    <div className="text-xs text-gray-300">Get it on</div>
                    <div className="text-xs font-semibold">Google Play</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 mt-2">
            <OTPInput
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
              maxLength={4}
            />

            <div className="text-center">
              <span className="text-xs text-gray-600">
                Didn't receive the code?{" "}
              </span>
              <button
                onClick={resendOTP}
                disabled={loading}
                className="text-xs text-primary hover:underline font-medium disabled:opacity-50"
              >
                Resend
              </button>
            </div>

            <button
              onClick={nextStep}
              disabled={loading || otpData.otp.length !== 4}
              className="w-full bg-primary text-secondary font-medium py-3 rounded-lg transition disabled:opacity-50 text-xs"
            >
              {loading ? "Verifying..." : "Verify Email"}
            </button>
          </div>
        );

      case 3:
        const passwordValidation = validatePassword(passwordData.password);
        
        return (
          <div className="space-y-6 mt-2">
            <div className="space-y-4">
              <div className="relative">
                <UsernameSuggestionsDropdown
                  businessName={signupData.business_name}
                  value={username}
                  onChange={setUsername}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <input
                    placeholder="Password"
                    type={showPassword ? "text" : "password"}
                    value={passwordData.password}
                    className="w-full pr-10 py-3 px-4 rounded-lg border-0 outline-0 bg-gray-200 focus:bg-white focus:border focus:border-primary text-black text-xs transition-all"
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
                
                {/* Password requirements */}
                {passwordData.password && (
                  <div className="text-xs space-y-1">
                    <div className={`flex items-center gap-1 ${passwordData.password.length >= 8 ? 'text-green-600' : 'text-red-500'}`}>
                      <div className={`w-1 h-1 rounded-full ${passwordData.password.length >= 8 ? 'bg-green-600' : 'bg-red-500'}`}></div>
                      At least 8 characters
                    </div>
                    <div className={`flex items-center gap-1 ${/\d/.test(passwordData.password) ? 'text-green-600' : 'text-red-500'}`}>
                      <div className={`w-1 h-1 rounded-full ${/\d/.test(passwordData.password) ? 'bg-green-600' : 'bg-red-500'}`}></div>
                      At least 1 number
                    </div>
                    <div className={`flex items-center gap-1 ${/[!@#$%^&*(),.?":{}|<>]/.test(passwordData.password) ? 'text-green-600' : 'text-red-500'}`}>
                      <div className={`w-1 h-1 rounded-full ${/[!@#$%^&*(),.?":{}|<>]/.test(passwordData.password) ? 'bg-green-600' : 'bg-red-500'}`}></div>
                      At least 1 special character
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <input
                  placeholder="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordData.confirm_password}
                  className="w-full pr-10 py-3 px-4 rounded-lg border-0 outline-0 bg-gray-200 focus:bg-white focus:border focus:border-primary text-black text-xs transition-all"
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
                !passwordData.confirm_password ||
                !passwordValidation.isValid ||
                passwordData.password !== passwordData.confirm_password
              }
              className="w-full bg-primary text-secondary font-medium py-3 rounded-lg transition disabled:opacity-50 text-xs"
            >
              {loading ? "Setting Password..." : "Set Password"}
            </button>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 mt-2">
            <div className="max-h-64 overflow-y-auto scrollbar-none">
              <div className="flex flex-wrap gap-3">
                {uniqueCategories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleCategoryToggle(category)}
                    className={`px-4 py-2 rounded-lg border transition-all text-xs font-medium ${
                      selectedCategories.includes(category)
                        ? "border-primary bg-primary text-black"
                        : "border-gray-200 hover:border-gray-300 text-gray-700 bg-white"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={nextStep}
                className="flex-1 bg-gray-200 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-300 transition text-xs"
                disabled={loading}
              >
                {loading ? 'Completing...' : 'Skip for now'}
              </button>
              <button
                onClick={nextStep}
                disabled={loading}
                className="flex-1 bg-primary text-secondary font-medium py-3 rounded-lg transition disabled:opacity-50 text-xs"
              >
                {loading ? 'Completing...' : 'Complete Setup'}
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

      {/* Desktop Layout - 80vh and 80vw with Shadow */}
      <div className="min-h-screen w-full hidden xl:flex items-center justify-center bg-gray-100">
        <div className="w-[90vw] h-[80vh] flex shadow-2xl rounded-2xl overflow-hidden bg-white">
          
          {/* LEFT SIDE - Image Section */}
          <div className="w-1/2 relative overflow-hidden">
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${assets.banner})` }}
            />
            
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/40"></div>
            
            {/* Content - CENTERED SOCIALS AT BOTTOM */}
            <div className="relative z-20 h-full flex flex-col justify-end items-center pb-12">
              <div className="text-white text-center">
                <h2 className="text-sm font-medium mb-6">Follow us on social media</h2>
                
                <div className="flex items-center justify-center gap-4">
                  <a href="https://www.instagram.com/socialgems.ug/" className="w-12 h-12 bg-transparent hover:bg-secondary rounded-full flex items-center justify-center transition-colors backdrop-blur-sm border border-primary">
                    <FaInstagram className="w-5 h-5 text-primary" />
                  </a>
                  <a href="https://www.tiktok.com/@social_gems_" className="w-12 h-12 bg-transparent hover:bg-secondary rounded-full flex items-center justify-center transition-colors backdrop-blur-sm border border-primary">
                    <PiTiktokLogoLight className="w-5 h-5 text-primary" />
                  </a>
                  <a href="https://x.com/socialgems_ug" className="w-12 h-12 bg-transparent hover:bg-secondary rounded-full flex items-center justify-center transition-colors backdrop-blur-sm border border-primary">
                    <FaXTwitter className="w-5 h-5 text-primary" />
                  </a>
                  <a href="https://www.youtube.com/@socialgems.africa" className="w-12 h-12 bg-transparent hover:bg-secondary rounded-full flex items-center justify-center transition-colors backdrop-blur-sm border border-primary">
                    <PiYoutubeLogo className="w-5 h-5 text-primary" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE - Form Section */}
          <div className="w-1/2 flex flex-col h-full justify-center">
            {/* Centered Content Container */}
            <div className="flex-1 flex items-center justify-center px-[50px]">
              <div className="w-full max-w-md">
                {/* Header */}
                <div className="flex-shrink-0 mb-6">
                  <div className="flex justify-center mb-4">
                    {/* Clean logo without background */}
                    <img
                      src={assets.LogoIcon}
                      alt="Social Gems"
                      className="h-16 w-16 object-contain"
                    />
                  </div>
                  
                  <div className="text-center">
                    <h1 className="text-2xl font-semibold text-secondary mb-2">
                      {stepTitles[currentStep].title}
                    </h1>
                    <p className="text-gray-600 text-xs">
                      {currentStep === 1 ? (
                        <>
                          {stepTitles[currentStep].description}{" "}
                          <button
                            onClick={() => navigate("/login")}
                            className="text-primary hover:underline font-bold"
                          >
                            Login
                          </button>
                        </>
                      ) : (
                        stepTitles[currentStep].description
                      )}
                    </p>
                  </div>
                </div>

                {/* Form Content */}
                <div className={currentStep !== 1 ? "max-h-96 overflow-y-auto scrollbar-none" : ""}>
                  {renderStepContent()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tablet Layout - Slightly Smaller but Full Coverage */}
      <div className="min-h-screen w-full lg:flex hidden xl:hidden bg-gray-50">
        <div className="w-full h-screen flex shadow-xl">
          
          {/* LEFT SIDE - Image Section */}
          <div className="w-1/2 relative overflow-hidden">
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${assets.banner})` }}
            />
            
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/40"></div>
            
            {/* Content - CENTERED SOCIALS AT BOTTOM */}
            <div className="relative z-20 h-full flex flex-col justify-end items-center pb-12">
              <div className="text-white text-center">
                <h2 className="text-sm font-medium mb-6">Follow us on social media</h2>
                
                <div className="flex items-center justify-center gap-4">
                  <a href="https://www.instagram.com/socialgems.ug/" className="w-12 h-12 bg-transparent hover:bg-secondary rounded-full flex items-center justify-center transition-colors backdrop-blur-sm border border-primary">
                    <FaInstagram className="w-5 h-5 text-primary" />
                  </a>
                  <a href="https://www.tiktok.com/@social_gems_" className="w-12 h-12 bg-transparent hover:bg-secondary rounded-full flex items-center justify-center transition-colors backdrop-blur-sm border border-primary">
                    <PiTiktokLogoLight className="w-5 h-5 text-primary" />
                  </a>
                  <a href="https://x.com/socialgems_ug" className="w-12 h-12 bg-transparent hover:bg-secondary rounded-full flex items-center justify-center transition-colors backdrop-blur-sm border border-primary">
                    <FaXTwitter className="w-5 h-5 text-primary" />
                  </a>
                  <a href="https://www.youtube.com/@socialgems.africa" className="w-12 h-12 bg-transparent hover:bg-secondary rounded-full flex items-center justify-center transition-colors backdrop-blur-sm border border-primary">
                    <PiYoutubeLogo className="w-5 h-5 text-primary" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE - Form Section */}
          <div className="w-1/2 flex flex-col h-full justify-center bg-white">
            {/* Centered Content Container */}
            <div className="flex-1 flex items-center justify-center px-[40px]">
              <div className="w-full max-w-sm">
                {/* Header */}
                <div className="flex-shrink-0 mb-6">
                  <div className="flex justify-center mb-4">
                    {/* Clean logo without background */}
                    <img
                      src={assets.LogoIcon}
                      alt="Social Gems"
                      className="h-14 w-14 object-contain"
                    />
                  </div>
                  
                  <div className="text-center">
                    <h1 className="text-xl font-semibold text-secondary mb-2">
                      {stepTitles[currentStep].title}
                    </h1>
                    <p className="text-gray-600 text-xs">
                      {currentStep === 1 ? (
                        <>
                          {stepTitles[currentStep].description}{" "}
                          <button
                            onClick={() => navigate("/login")}
                            className="text-primary hover:underline font-bold"
                          >
                            Login
                          </button>
                        </>
                      ) : (
                        stepTitles[currentStep].description
                      )}
                    </p>
                  </div>
                </div>

                {/* Form Content */}
                <div className={currentStep !== 1 ? "max-h-80 overflow-y-auto scrollbar-none" : ""}>
                  {renderStepContent()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout - Full Screen (unchanged) */}
      <div className="min-h-screen w-full flex flex-col lg:hidden bg-gray-50">
        <div className="w-full h-screen flex flex-col">
          {/* Mobile Logo Section */}
          <div className="flex-shrink-0 bg-primary py-8 px-4 text-center">
            <img
              src={assets.MainLogo}
              alt="Social Gems Logo"
              className="h-16 w-auto object-contain mx-auto"
            />
          </div>

          {/* Mobile Form Section */}
          <div className="flex-1 bg-white overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex-shrink-0 p-6 pb-4">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {stepTitles[currentStep].title}
                </h2>
                <p className="text-gray-600 text-xs">
                  {currentStep === 1 ? (
                    <>
                      {stepTitles[currentStep].description}{" "}
                      <button
                        onClick={() => navigate("/login")}
                        className="text-primary hover:underline font-medium"
                      >
                        Login
                      </button>
                    </>
                  ) : (
                    stepTitles[currentStep].description
                  )}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-none">
              {renderStepContent()}
            </div>
          </div>
        </div>
      </div>

      {/* Terms and Privacy Modal */}
      <TermsPrivacyModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
      />
    </>
  );
};

export default Signup;