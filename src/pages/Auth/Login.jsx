"use client";

import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { post } from '../../utils/service';
import { Lock, Mail, EyeOff, Eye, X } from "lucide-react";
import { FaInstagram, FaXTwitter } from "react-icons/fa6";
import { PiTiktokLogoLight } from "react-icons/pi";
import { SlSocialFacebook } from "react-icons/sl";
import { PiYoutubeLogo } from "react-icons/pi";
import { assets } from "../../assets/assets";

const ForgotPasswordModal = ({ isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email || !validateEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const response = await post('users/resetPasswordRequest', { email });
      if (response.status === 200) {
        toast.success("Reset code sent to your email");
        setStep(2);
      } else {
        toast.error(response.message || "Failed to send reset code");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send reset code");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const response = await post('users/confirmResetPassword', {
        email,
        otp,
        newPassword,
        confirmNewPassword: confirmPassword
      });
      if (response.status === 200) {
        toast.success("Password reset successfully!");
        onComplete();
        onClose();
        setStep(1);
        setEmail("");
        setOtp("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(response.message || "Failed to reset password");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setEmail("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-labelledby="forgot-password-title">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleClose} />
      <div className="relative z-50 w-full max-w-md max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-lg rounded-lg shadow-lg border border-white/20">
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <h2 id="forgot-password-title" className="text-xl font-semibold">
            {step === 1 ? "Reset Password" : "Enter Reset Code"}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-secondary" />
            </div>
            <p className="text-xs text-gray-600">
              {step === 1 
                ? "Enter your email to receive a reset code" 
                : "Enter the code sent to your email and your new password"
              }
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 rounded-lg border-0 outline-0 bg-gray-200 focus:bg-white focus:border focus:border-primary text-black text-xs transition-all"
                  placeholder="Enter your email"
                  disabled={loading}
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 bg-gray-200 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-300 transition text-xs"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary text-secondary font-medium py-3 rounded-lg transition disabled:opacity-50 text-xs"
                >
                  {loading ? 'Sending...' : 'Send Code'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-3 rounded-lg border-0 outline-0 bg-gray-200 focus:bg-white focus:border focus:border-primary text-black text-xs text-center tracking-widest transition-all"
                  placeholder="Enter 4-digit code"
                  maxLength="4"
                  disabled={loading}
                  required
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 rounded-lg border-0 outline-0 bg-gray-200 focus:bg-white focus:border focus:border-primary text-black text-xs transition-all"
                  placeholder="New Password"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 rounded-lg border-0 outline-0 bg-gray-200 focus:bg-white focus:border focus:border-primary text-black text-xs transition-all"
                  placeholder="Confirm New Password"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-200 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-300 transition text-xs"
                  disabled={loading}
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary text-secondary font-medium py-3 rounded-lg transition disabled:opacity-50 text-xs"
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const validateEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const validatePassword = (value) => {
    return value.length >= 6;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    let valid = true;

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address.");
      valid = false;
    } else {
      setEmailError("");
    }

    if (!validatePassword(password)) {
      setPasswordError("Password must be at least 6 characters.");
      valid = false;
    } else {
      setPasswordError("");
    }

    setSubmitted(true);

    if (valid) {
      setLoading(true);
      
      try {
        const response = await post('users/login', { email, password });
        
        if (response.status === 200) {
          const { username, user_type: role, email: userEmail, jwt } = response.data;
          
          localStorage.setItem('name', username);
          localStorage.setItem('email', userEmail);
          localStorage.setItem('role', role);
          localStorage.setItem('jwt', jwt);
          localStorage.setItem('isLoggedIn', 'true');
          
          toast.success('Login successful!');
          navigate('/dashboard');
          
          setEmail("");
          setPassword("");
          setSubmitted(false);
        } else {
          toast.error(response.message || 'Login failed. Please check your credentials.');
        }
      } catch (error) {
        console.error('Login error:', error);
        
        if (error.response) {
          const errorMessage = error.response.data?.message || 'Invalid credentials';
          toast.error(errorMessage);
        } else if (error.request) {
          toast.error('No response from server. Please check your connection.');
        } else {
          toast.error('An error occurred while logging in. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAppStoreDownload = () => {
    window.open('https://apps.apple.com/app/socialgems', '_blank');
  };

  const handlePlayStoreDownload = () => {
    window.open('https://play.google.com/store/apps/details?id=com.socialgems.app', '_blank');
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

      {/* Desktop Layout - FULL SCREEN */}
      <div className="min-h-screen w-full lg:flex hidden">
        <div className="w-full h-screen flex">
          
          {/* LEFT SIDE - Image Section - FULL HEIGHT */}
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
                  <a href="#" className="w-12 h-12 bg-transparent hover:bg-white/20 rounded-full flex items-center justify-center transition-colors backdrop-blur-sm border border-primary">
                    <FaInstagram className="w-5 h-5 text-primary" />
                  </a>
                  <a href="#" className="w-12 h-12 bg-transparent hover:bg-white/20 rounded-full flex items-center justify-center transition-colors backdrop-blur-sm border border-primary">
                    <SlSocialFacebook className="w-5 h-5 text-primary" />
                  </a>
                  <a href="#" className="w-12 h-12 bg-transparent hover:bg-white/20 rounded-full flex items-center justify-center transition-colors backdrop-blur-sm border border-primary">
                    <PiTiktokLogoLight className="w-5 h-5 text-primary" />
                  </a>
                  <a href="#" className="w-12 h-12 bg-transparent hover:bg-white/20 rounded-full flex items-center justify-center transition-colors backdrop-blur-sm border border-primary">
                    <FaXTwitter className="w-5 h-5 text-primary" />
                  </a>
                  <a href="#" className="w-12 h-12 bg-transparent hover:bg-white/20 rounded-full flex items-center justify-center transition-colors backdrop-blur-sm border border-primary">
                    <PiYoutubeLogo className="w-5 h-5 text-primary" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE - Form Section - FULL HEIGHT */}
          <div className="w-1/2 bg-white flex flex-col h-screen">
            {/* Header */}
            <div className="flex-shrink-0 p-8 pb-6">
              <div className="flex justify-center mb-6">
                {/* Clean logo without background */}
                <img
                  src={assets.LogoIcon}
                  alt="Social Gems"
                  className="h-12 w-12 object-contain"
                />
              </div>
              
              <div className="text-center">
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                  Welcome Back
                </h1>
                <p className="text-gray-600 text-xs">
                  Don't have an account?{" "}
                  <button
                    onClick={() => navigate("/signup")}
                    className="text-primary hover:underline font-medium"
                  >
                    Sign up
                  </button>
                </p>
              </div>
            </div>

            {/* Form Content - SCROLLABLE */}
            <div className="flex-1 overflow-y-auto px-8 scrollbar-none">
              <form
                className="flex flex-col gap-5"
                onSubmit={handleLogin}
                noValidate
              >
                <div>
                  <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-2">
                    Email address
                  </label>
                  <input
                    type="email"
                    id="email"
                    placeholder="business@socialgems.me"
                    className={`w-full px-4 py-3 rounded-lg border-0 outline-0 bg-gray-200 focus:bg-white focus:border focus:border-primary text-black text-xs transition-all ${
                      emailError ? "border-red-500" : ""
                    }`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={!!emailError}
                    aria-describedby="email-error"
                    disabled={loading}
                  />
                  {emailError && (
                    <p id="email-error" className="text-red-500 text-xs mt-1">
                      {emailError}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      placeholder="Enter your password"
                      className={`w-full pr-10 py-3 px-4 rounded-lg border-0 outline-0 bg-gray-200 focus:bg-white focus:border focus:border-primary text-black text-xs transition-all ${
                        passwordError ? "border-red-500" : ""
                      }`}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      aria-invalid={!!passwordError}
                      aria-describedby="password-error"
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
                  {passwordError && (
                    <p id="password-error" className="text-red-500 text-xs mt-1">
                      {passwordError}
                    </p>
                  )}
                </div>

                <div className="flex justify-end">
                  <button 
                    type="button"
                    className="text-xs text-primary hover:underline font-medium"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-secondary font-medium py-3 rounded-lg transition disabled:opacity-50 text-xs hover:bg-primary"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </form>
            </div>

            {/* Download App Section - RIGHT SIDE BOTTOM */}
            <div className="flex-shrink-0 p-8 pt-6 border-t border-gray-100">
              <p className="text-center text-xs text-gray-600 mb-4">Download the app</p>
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
        </div>
      </div>

      {/* Mobile Layout - FULL SCREEN */}
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
                  Welcome Back
                </h2>
                <p className="text-gray-600 text-xs">
                  Don't have an account?{" "}
                  <button
                    onClick={() => navigate("/signup")}
                    className="text-primary hover:underline font-medium"
                  >
                    Sign up
                  </button>
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-none">
              <form
                className="flex flex-col gap-5 mb-8"
                onSubmit={handleLogin}
                noValidate
              >
                <div>
                  <label htmlFor="email-mobile" className="block text-xs font-medium text-gray-700 mb-2">
                    Email address
                  </label>
                  <input
                    type="email"
                    id="email-mobile"
                    placeholder="business@socialgems.me"
                    className={`w-full px-4 py-3 rounded-lg border-0 outline-0 bg-gray-200 focus:bg-white focus:border focus:border-primary text-black text-xs transition-all ${
                      emailError ? "border-red-500" : ""
                    }`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={!!emailError}
                    aria-describedby="email-error-mobile"
                    disabled={loading}
                  />
                  {emailError && (
                    <p id="email-error-mobile" className="text-red-500 text-xs mt-1">
                      {emailError}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="password-mobile" className="block text-xs font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password-mobile"
                      placeholder="Enter your password"
                      className={`w-full pr-10 py-3 px-4 rounded-lg border-0 outline-0 bg-gray-200 focus:bg-white focus:border focus:border-primary text-black text-xs transition-all ${
                        passwordError ? "border-red-500" : ""
                      }`}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      aria-invalid={!!passwordError}
                      aria-describedby="password-error-mobile"
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
                  {passwordError && (
                    <p id="password-error-mobile" className="text-red-500 text-xs mt-1">
                      {passwordError}
                    </p>
                  )}
                </div>

                <div className="flex justify-end">
                  <button 
                    type="button"
                    className="text-xs text-primary hover:underline font-medium"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-secondary font-medium py-3 rounded-lg transition disabled:opacity-50 text-xs"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </form>

              {/* Mobile Social Media Links */}
              <div className="text-center">
                <p className="text-sm opacity-80 mb-4 text-gray-600">Follow us on social media</p>
                <div className="flex items-center justify-center gap-4 mb-6">
                  <a href="#" className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
                    <FaInstagram className="w-4 h-4 text-primary" />
                  </a>
                  <a href="#" className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
                    <SlSocialFacebook className="w-4 h-4 text-primary" />
                  </a>
                  <a href="#" className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
                    <PiTiktokLogoLight className="w-4 h-4 text-primary" />
                  </a>
                  <a href="#" className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
                    <FaXTwitter className="w-4 h-4 text-primary" />
                  </a>
                  <a href="#" className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
                    <PiYoutubeLogo className="w-4 h-4 text-primary" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal 
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onComplete={() => {
          toast.success("You can now sign in with your new password");
        }}
      />
    </>
  );
};

export default Login;