"use client";

import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { post } from '../../utils/service';
import { Lock, Mail, EyeOff, Eye, Download } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative bg-white/95 backdrop-blur-lg rounded-lg p-6 w-full max-w-md shadow-2xl border border-white/20">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-secondary" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {step === 1 ? "Reset Password" : "Enter Reset Code"}
          </h3>
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
                className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50 text-xs"
                placeholder="Enter your email"
                disabled={loading}
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-primary text-secondary rounded-lg transition-colors text-xs font-medium disabled:opacity-50"
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
                className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50 text-xs text-center tracking-widest"
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
                className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50 text-xs"
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
                className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50 text-xs"
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
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs"
                disabled={loading}
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-primary text-secondary rounded-lg transition-colors text-xs font-medium disabled:opacity-50"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </form>
        )}
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
      {/* Desktop Layout */}
      <div className="min-h-screen lg:flex items-center justify-center overflow-hidden p-4 hidden">
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

          {/* LEFT CARD - EXACT COPY FROM SIGNUP */}
          <div className="relative md:w-1/2 rounded-bl-3xl overflow-hidden z-10 flex flex-col justify-between h-full">
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat rounded-bl-3xl"
              style={{ backgroundImage: `url(${assets.banner})` }}
            />
            {/* Lighter Dark Overlay for text visibility */}
            <div className="absolute inset-0 bg-black/20 rounded-bl-3xl"></div>
            
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

          <div className="p-8 md:p-12 md:w-1/2 flex flex-col bg-white z-20 text-black relative">
            <div className="flex flex-col items-left mb-8">
              <div className="text-primary mb-4">
                <img
                  src={assets.LogoIcon}
                  alt="Social Gems"
                  className="h-10 w-10 object-contain"
                />
              </div>
              <h2 className="text-3xl font-medium mb-2 tracking-tight">
                Welcome Back
              </h2>
              <p className="text-left opacity-80">
                Sign in to your Social Gems account
              </p>
            </div>

            <form
              className="flex flex-col gap-4"
              onSubmit={handleLogin}
              noValidate
            >
              <div>
                <label htmlFor="email" className="block text-sm mb-2">
                  Your email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="email"
                    id="email"
                    placeholder="hi@socialgems.com"
                    className={`text-sm w-full pl-10 pr-3 py-2 px-3 border rounded-lg focus:outline-none focus:ring-1 bg-white text-black focus:ring-primary ${
                      emailError ? "border-red-500" : "border-gray-300"
                    }`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={!!emailError}
                    aria-describedby="email-error"
                    disabled={loading}
                  />
                </div>
                {emailError && (
                  <p id="email-error" className="text-red-500 text-xs mt-1">
                    {emailError}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm mb-2">
                  Your password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="Enter your password"
                    className={`text-sm w-full pl-10 pr-10 py-2 px-3 border rounded-lg focus:outline-none focus:ring-1 bg-white text-black focus:ring-primary ${
                      passwordError ? "border-red-500" : "border-gray-300"
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordError && (
                  <p id="password-error" className="text-red-500 text-xs mt-1">
                    {passwordError}
                  </p>
                )}
              </div>

              <div className="w-full flex justify-end mb-2">
                <button 
                  type="button"
                  className="text-xs text-primary font-medium hover:underline transition-colors"
                  onClick={() => setShowForgotPassword(true)}
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-secondary font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign in to your account'}
              </button>

              <div className="text-center text-gray-600 text-sm">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate('/signup')}
                  className="text-black font-medium underline cursor-pointer"
                >
                  Sign up
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="min-h-screen flex flex-col lg:hidden bg-gray-50">
        {/* Mobile Logo Section */}
        <div className="flex-shrink-0 bg-secondary/90 py-8 px-4 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10">
            <img
              src={assets.MainLogo}
              alt="Social Gems Logo"
              className="h-fit w-32 object-contain mx-auto mb-4 drop-shadow-lg"
            />
          </div>
        </div>

        {/* Mobile Form Section */}
        <div className="flex-1 bg-white p-6">
          <div className="max-w-md mx-auto">
            <div className="flex flex-col items-left mb-8">
              <div className="text-primary mb-4">
                <img
                  src={assets.LogoIcon}
                  alt="Social Gems"
                  className="h-10 w-10 object-contain"
                />
              </div>
              <h2 className="text-2xl font-medium mb-2 tracking-tight">
                Welcome Back
              </h2>
              <p className="text-left opacity-80">
                Sign in to your Social Gems account
              </p>
            </div>

            <form
              className="flex flex-col gap-4 mb-8"
              onSubmit={handleLogin}
              noValidate
            >
              <div>
                <label htmlFor="email-mobile" className="block text-sm mb-2">
                  Your email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="email"
                    id="email-mobile"
                    placeholder="hi@socialgems.com"
                    className={`text-sm w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-1 bg-white text-black focus:ring-primary ${
                      emailError ? "border-red-500" : "border-gray-300"
                    }`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={!!emailError}
                    aria-describedby="email-error-mobile"
                    disabled={loading}
                  />
                </div>
                {emailError && (
                  <p id="email-error-mobile" className="text-red-500 text-xs mt-1">
                    {emailError}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="password-mobile" className="block text-sm mb-2">
                  Your password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password-mobile"
                    placeholder="Enter your password"
                    className={`text-sm w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-1 bg-white text-black focus:ring-primary ${
                      passwordError ? "border-red-500" : "border-gray-300"
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordError && (
                  <p id="password-error-mobile" className="text-red-500 text-xs mt-1">
                    {passwordError}
                  </p>
                )}
              </div>

              <div className="w-full flex justify-end mb-2">
                <button 
                  type="button"
                  className="text-xs text-primary font-medium hover:underline transition-colors"
                  onClick={() => setShowForgotPassword(true)}
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-secondary font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign in to your account'}
              </button>

              <div className="text-center text-gray-600 text-sm">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate('/signup')}
                  className="text-black font-medium underline cursor-pointer"
                >
                  Sign up
                </button>
              </div>
            </form>

            {/* Mobile Social Media Links */}
            <div className="text-center">
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