"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { post, get, patch } from "../../utils/service";
import {
  UserPlus,
  Lock,
  Mail,
  User,
  Phone,
  Building,
  Plus,
  Check,
  ArrowLeft,
  Eye,
  EyeOff,
  Globe,
  ChevronDown,
  Search,
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

// Searchable Dropdown Component
const SearchableDropdown = ({
  options,
  value,
  onChange,
  placeholder,
  disabled,
  displayField = "name",
  valueField = "id",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions = options.filter((option) =>
    option[displayField].toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find((option) => option[valueField] === value);

  const handleSelect = (option) => {
    onChange(option[valueField]);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="relative">
      <div
        className={`w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50 focus:bg-white text-black text-xs cursor-pointer flex items-center justify-between ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={selectedOption ? "text-black" : "text-gray-500"}>
          {selectedOption
            ? `${selectedOption[displayField]} (+${selectedOption.phone_code})`
            : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search countries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option[valueField]}
                  className="px-3 py-2 text-xs hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-b-0"
                  onClick={() => handleSelect(option)}
                >
                  {option[displayField]} (+{option.phone_code})
                </div>
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
        placeholder="Display Business As (Username)"
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
          <div className="max-h-48 overflow-y-auto">
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
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [industries, setIndustries] = useState([]);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localPhoneNumber, setLocalPhoneNumber] = useState("");
  const [verifiedUsername, setVerifiedUsername] = useState(""); // Store username from verify email response

  const [signupData, setSignupData] = useState({
    email: "",
    phone_number: "",
    business_name: "",
    username: "",
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

  // Steps definition
  const steps = [
    {
      id: 0,
      title: "Industries",
      subtitle: "Choose your focus",
      icon: Building,
      description: "Select industries your brand operates in",
      color: "from-primary to-primary-scale-600",
    },
    {
      id: 1,
      title: "Details",
      subtitle: "Business information",
      icon: UserPlus,
      description: "Create your brand account",
      color: "from-secondary to-secondary-scale-600",
    },
    {
      id: 2,
      title: "Verify",
      subtitle: "Email verification",
      icon: Mail,
      description: "Confirm your email address",
      color: "from-primary to-primary-scale-600",
    },
    {
      id: 3,
      title: "Secure",
      subtitle: "Set password",
      icon: Lock,
      description: "Protect your account",
      color: "from-secondary to-secondary-scale-600",
    },
  ];

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
      setSignupData((prev) => ({
        ...prev,
        country_id: defaultCountry.phone_code,
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

  const handleCountryChange = (countryId) => {
    const country = countries.find((c) => c.id === parseInt(countryId));
    setSelectedCountry(country);
    setSignupData((prev) => ({ ...prev, country_id: country.phone_code }));

    setLocalPhoneNumber("");
    setSignupData((prev) => ({ ...prev, phone_number: "" }));
  };

  const handlePhoneChange = (value) => {
    let cleanValue = value.replace(/[^\d]/g, "");

    if (cleanValue.startsWith("0")) {
      cleanValue = cleanValue.substring(1);
    }

    setLocalPhoneNumber(cleanValue);

    if (selectedCountry && cleanValue) {
      const fullNumber = `+${selectedCountry.phone_code}${cleanValue}`;
      setSignupData((prev) => ({ ...prev, phone_number: fullNumber }));
    } else {
      setSignupData((prev) => ({ ...prev, phone_number: "" }));
    }
  };

  const handleStepOne = async () => {
    setCurrentStep(1);
  };

  const handleStepTwo = async () => {
    const {
      email,
      phone_number,
      business_name,
      username,
    } = signupData;

    if (
      !email.trim() ||
      !phone_number.trim() ||
      !business_name.trim() ||
      !username.trim()
    ) {
      toast.error("Please fill in all fields");
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
      const response = await post("users/signup", signupData);

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
        username: signupData.username,
        otp: otpData.otp,
      });

      if (response.status === 200) {
        const token = response.data?.token;
        const username = response.data?.username;
        
        if (token) {
          localStorage.setItem("jwt", token);
          localStorage.setItem("user_id", response.data.user_id);
          localStorage.setItem("username", username);
          localStorage.setItem("status", response.data.status);
          
          // Store the username from verify email response for later use
          setVerifiedUsername(username);
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

  const changeUsername = async (jwt) => {
    try {
      const headers = {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      };

      const changeUsernameData = {
        currentUsername: verifiedUsername,
        newUsername: signupData.username,
      };

      const response = await post("users/changeUsername", changeUsernameData, headers);
      
      if (response.status === 200) {
        console.log("Username changed successfully");
        return true;
      } else {
        console.warn("Username change failed:", response.message);
        return false;
      }
    } catch (error) {
      console.error("Username change error:", error);
      return false;
    }
  };

  const handleStepFour = async () => {
    const { password, confirm_password } = passwordData;

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
        setCurrentStep(0);
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const response = await post("users/secureAccount", passwordData, headers);

      if (response.status === 200) {
        const loginResponse = await post("users/login", {
          email: signupData.email,
          password: passwordData.password,
        });

        if (loginResponse.status === 200) {
          const {
            username,
            user_type: role,
            email: userEmail,
            jwt,
          } = loginResponse.data;

          localStorage.setItem("name", username);
          localStorage.setItem("email", userEmail);
          localStorage.setItem("role", role);
          localStorage.setItem("jwt", jwt);
          localStorage.setItem("isLoggedIn", "true");

          // Handle username change and industry updates after successful login
          const promises = [];

          // Change username if user selected a different one
          if (signupData.username && signupData.username !== verifiedUsername) {
            promises.push(changeUsername(jwt));
          }

          // Update industries if selected
          if (selectedIndustries.length > 0) {
            promises.push(
              patch(
                "users/updateProfile",
                {
                  industry_ids: selectedIndustries,
                  username: signupData.username || username,
                },
                {
                  headers: {
                    Authorization: `Bearer ${jwt}`,
                    "Content-Type": "application/json",
                  },
                }
              )
            );
          }

          try {
            await Promise.allSettled(promises);
            toast.success("Account setup completed successfully!");
          } catch (updateError) {
            console.warn("Some updates failed:", updateError);
            toast.success(
              "Account setup completed! Some preferences can be updated in your profile."
            );
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
      case 0:
        handleStepOne();
        break;
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
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                <Building className="w-6 h-6 text-secondary" />
              </div>
              <h2 className="text-xl font-semibold mb-2">
                Choose Your Industries
              </h2>
              <p className="text-gray-600 text-xs mb-6 max-w-sm mx-auto">
                Select the industries your brand operates in. You can skip this
                step and add them later.
              </p>
            </div>

            <div className="max-h-64 overflow-y-auto">
              <div className="grid gap-3">
                {industries.map((industry) => (
                  <button
                    key={industry.id}
                    type="button"
                    onClick={() => handleIndustryToggle(industry.id)}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                      selectedIndustries.includes(industry.id)
                        ? "border-primary bg-primary/10"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-xs text-gray-700 font-medium">
                      {industry.name}
                    </span>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedIndustries.includes(industry.id)
                          ? "border-primary bg-primary"
                          : "border-gray-300"
                      }`}
                    >
                      {selectedIndustries.includes(industry.id) ? (
                        <Check className="w-3 h-3 text-secondary" />
                      ) : (
                        <Plus className="w-3 h-3 text-gray-300" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStep(1)}
                className="flex-1 bg-gray-200 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-300 transition text-xs"
              >
                Skip for now
              </button>
              <button
                onClick={handleStepOne}
                disabled={selectedIndustries.length === 0}
                className="flex-1 bg-primary text-secondary font-medium py-3 rounded-lg shadow hover:shadow-md transition disabled:opacity-50 text-xs"
              >
                Continue
              </button>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="flex justify-between mb-2 border-b border-b-secondary/20 pb-3">
              <button
                onClick={prevStep}
                className="flex items-center justify-center h-fit p-3 rounded-full border border-gray-200 bg-primary text-secondary hover:bg-secondary hover:text-white transition"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <img
                src={assets.LogoIcon}
                alt="Logo"
                className="h-20 w-20 object-contain"
              />
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-6 h-6 text-secondary" />
              </div>
              <h2 className="text-xl font-semibold mb-2">
                Create Your Account
              </h2>
              <p className="text-gray-600 text-xs mb-6 max-w-sm mx-auto">
                Enter your business details to get started with your brand account.
              </p>
            </div>

            <div className="space-y-4">
              <div className="relative flex-1">
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

              <div className="relative flex-1">
                <CiAt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                <UsernameSuggestionsDropdown
                  businessName={signupData.business_name}
                  value={signupData.username}
                  onChange={(username) => setSignupData(prev => ({...prev, username}))}
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

              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                <SearchableDropdown
                  options={countries}
                  value={selectedCountry?.id || ""}
                  onChange={handleCountryChange}
                  placeholder="Select Country"
                  disabled={loading}
                  displayField="name"
                  valueField="id"
                />
              </div>

              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  placeholder={
                    selectedCountry
                      ? `Phone Number (without leading 0)`
                      : "Phone Number"
                  }
                  type="tel"
                  value={localPhoneNumber}
                  className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50 focus:bg-white text-black text-xs"
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  disabled={loading}
                />
                {selectedCountry && localPhoneNumber && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                    +{selectedCountry.phone_code}
                    {localPhoneNumber}
                  </div>
                )}
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
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-secondary" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Verify Your Email</h2>
              <p className="text-gray-600 text-xs mb-6 max-w-sm mx-auto">
                We've sent a 4-digit verification code to {signupData.email}.
                Please enter it below.
              </p>
            </div>

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
              <span className="text-xs text-gray-600">
                Didn't receive the code?{" "}
              </span>
              <button
                onClick={resendOTP}
                disabled={loading}
                className="text-xs text-secondary hover:text-secondary-scale-600 font-medium hover:underline disabled:opacity-50 transition-colors"
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
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                <Lock className="w-6 h-6 text-secondary" />
              </div>
              <h2 className="text-xl font-semibold mb-2">
                Secure Your Account
              </h2>
              <p className="text-gray-600 text-xs mb-6 max-w-sm mx-auto">
                Create a strong password to protect your account.
              </p>
            </div>

            <div className="space-y-4">
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
                !passwordData.password ||
                !passwordData.confirm_password
              }
              className="w-full bg-primary text-secondary font-medium py-3 rounded-lg shadow hover:shadow-md transition disabled:opacity-50 text-xs"
            >
              {loading ? "Completing Setup..." : "Complete Setup"}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-white md:bg-gray-50">
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-lg">
          <div className="bg-white md:rounded-lg md:shadow-xl md:border border-gray-100 p-6 md:p-8">
            <div className="md:hidden mb-6">
              <div className="flex justify-center space-x-2">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index <= currentStep ? "bg-primary" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
              <div className="text-center mt-3">
                <div className="text-xs font-medium text-gray-700">
                  Step {currentStep + 1} of {steps.length}
                </div>
              </div>
            </div>

            {renderStepContent()}
          </div>

          <div className="text-center mt-6">
            <span className="text-xs text-gray-600">
              Already have an account?{" "}
            </span>
            <button
              onClick={() => navigate("/login")}
              className="text-xs text-secondary hover:text-secondary-scale-600 font-medium hover:underline transition-colors"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;