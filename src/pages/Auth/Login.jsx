"use client";

import * as React from "react";
import { useState, memo } from "react";
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { post } from '../../utils/service';
import { LogIn, Lock, Mail, EyeOff, Eye } from "lucide-react";
import { assets } from "../../assets/assets";

// Animation Components
const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

// Ripple Component
const Ripple = memo(function Ripple({
  mainCircleSize = 210,
  mainCircleOpacity = 0.24,
  numCircles = 8,
  className = '',
}) {
  return (
    <section
      className={`max-w-[50%] absolute inset-0 flex items-center justify-center
        dark:bg-white/5 bg-neutral-50
        [mask-image:linear-gradient(to_bottom,black,transparent)]
        dark:[mask-image:linear-gradient(to_bottom,white,transparent)] ${className}`}
    >
      {Array.from({ length: numCircles }, (_, i) => {
        const size = mainCircleSize + i * 70;
        const opacity = mainCircleOpacity - i * 0.03;
        const animationDelay = `${i * 0.1}s`;
        const borderStyle = i === numCircles - 1 ? 'dashed' : 'solid';
        const borderOpacity = 5 + i * 5;

        return (
          <span
            key={i}
            className='absolute animate-ripple rounded-full bg-foreground/15 border'
            style={{
              width: `${size}px`,
              height: `${size}px`,
              opacity: opacity,
              animationDelay: animationDelay,
              borderStyle: borderStyle,
              borderWidth: '1px',
              borderColor: `var(--foreground) dark:var(--background) / ${
                borderOpacity / 100
              })`,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              willChange: 'transform',
              backfaceVisibility: 'hidden',
            }}
          />
        );
      })}
    </section>
  );
});

// OrbitingCircles Component
const OrbitingCircles = memo(function OrbitingCircles({
  className,
  children,
  reverse = false,
  duration = 25, // Slower animation
  delay = 10,
  radius = 50,
  path = true,
}) {
  return (
    <>
      {path && (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          version='1.1'
          className='pointer-events-none absolute inset-0 size-full'
        >
          <circle
            className='stroke-black/5 stroke-1 dark:stroke-white/5' // Reduced opacity
            cx='50%'
            cy='50%'
            r={radius}
            fill='none'
          />
        </svg>
      )}
      <section
        style={
          {
            '--duration': duration,
            '--radius': radius,
            '--delay': -delay,
          }
        }
        className={cn(
          'absolute flex size-full transform-gpu animate-orbit items-center justify-center rounded-full border-0 bg-transparent [animation-delay:calc(var(--delay)*1000ms)]',
          { '[animation-direction:reverse]': reverse },
          className
        )}
        css={{
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          transform: 'translate3d(0, 0, 0)', // Force hardware acceleration
        }}
      >
        {children}
      </section>
    </>
  );
});


// TechOrbitDisplay Component
const TechOrbitDisplay = memo(function TechOrbitDisplay({
  iconsArray,
  text = 'SOCIAL GEMS',
}) {
  return (
    <section className='relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-lg'>
      <div className='pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-primary to-secondary bg-clip-text text-center text-4xl lg:text-7xl font-semibold leading-none text-transparent z-20 relative flex items-center gap-3'>
        <img
          src={assets.LogoIcon}
          alt="Logo"
          className="h-8 w-8 lg:h-12 lg:w-12 object-contain"
        />
        <span>{text}</span>
      </div>

      <div className="absolute inset-0 z-10">
        {iconsArray.map((icon, index) => (
          <OrbitingCircles
            key={index}
            className={icon.className}
            duration={icon.duration}
            delay={icon.delay}
            radius={icon.radius}
            path={icon.path}
            reverse={icon.reverse}
          >
            {icon.component()}
          </OrbitingCircles>
        ))}
      </div>
    </section>
  );
});

// Social Media Icons Array - Same as login page
const iconsArray = [
  // Inner circle - 80px radius
  {
    component: () => (
      <div className="h-8 overflow-hidden">
        <img
          src={assets.facebook}
          alt='Facebook'
          className="h-full w-auto object-contain"
        />
      </div>
    ),
    className: 'border-none bg-transparent',
    duration: 12,
    delay: 0,
    radius: 80,
    path: false,
    reverse: false,
  },
  {
    component: () => (
      <div className="h-8 overflow-hidden">
        <img
          src={assets.instagram}
          alt='Instagram'
          className="h-full w-auto object-contain"
        />
      </div>
    ),
    className: 'border-none bg-transparent',
    duration: 10,
    delay: 10, // 180 degrees apart (half of 20s)
    radius: 80,
    path: false,
    reverse: false,
  },
  
  // Middle circle - 130px radius
  {
    component: () => (
      <div className="w-8 h-8 rounded-full overflow-hidden bg-transparent">
        <img
          src={assets.twitter}
          alt='Twitter'
          className="w-full h-full object-cover p-1"
        />
      </div>
    ),
    className: 'size-[32px] border-none bg-transparent',
    radius: 130,
    duration: 25,
    delay: 0,
    path: false,
    reverse: true,
  },
  {
    component: () => (
      <div className="w-16 h-16 overflow-hidden bg-transparent">
        <img
          src={assets.tiktok}
          alt='TikTok'
          className="w-full h-full object-cover"
        />
      </div>
    ),
    className: 'size-[32px] border-none bg-transparent',
    radius: 130,
    duration: 35,
    delay: 12.5, // 180 degrees apart (half of 25s)
    path: false,
    reverse: true,
  },
  
  // Outer circle - 180px radius

  
  // Far outer circle - 230px radius
  {
    component: () => (
      <div className="h-8 overflow-hidden">
        <img
          src={assets.youtube}
          alt='YouTube Alt'
          className="h-full w-auto object-contain"
        />
      </div>
    ),
    className: 'border-none bg-transparent',
    duration: 30,
    delay: 0, // 180 degrees apart (half of 35s)
    radius: 230,
    path: false,
    reverse: true,
  },

  {
    component: () => (
      <div className="w-8 h-8 overflow-hidden bg-transparent">
        <img
          src={assets.Logo}
          alt='TikTok'
          className="w-full h-full object-cover"
        />
      </div>
    ),
    className: 'size-[32px] border-none bg-transparent',
    radius: 130,
    duration: 15,
    delay: 12.5, // 180 degrees apart (half of 25s)
    path: false,
    reverse: true,
  },
];

const ForgotPasswordModal = ({ isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState(1); // 1: email, 2: otp + new password
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
        // Reset form
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
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }
    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

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
      <section 
        className='flex max-lg:justify-center min-h-screen relative'
        style={{
          backgroundImage: `url(${assets.banner})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Background overlay for better readability */}
        <div className="absolute inset-0 bg-black/30"></div>
        
        {/* Left Side - Animation (Desktop only) */}
        <span className='flex flex-col justify-center w-1/2 lg:flex hidden relative z-10'>
          <Ripple mainCircleSize={100} />
          <TechOrbitDisplay iconsArray={iconsArray} />
        </span>

        {/* Right Side - Form (Desktop) */}
        <span className='w-1/2 h-[100dvh] lg:flex hidden flex-col justify-center items-center relative z-10'>
          <div className="w-full max-w-lg">
            {/* Enhanced Glass Effect Form */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-6 md:p-8 relative max-h-[80vh] overflow-y-auto scrollbar-none">
              {/* Additional glass layer */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/5 rounded-2xl"></div>
              
              {/* Content */}
              <div className="relative z-10">
                {/* Logo and brand name above the form */}
                <div className="mb-6 flex items-center justify-center gap-2">
                  <img
                    src={assets.LogoIcon}
                    alt="Logo"
                    className="h-16 w-16 object-contain"
                  />
                </div>
                
                {/* Header */}
                <h2 className="text-xl font-semibold mb-2 text-center text-white">
                  Sign in to your account
                </h2>
                <p className="text-white/80 text-xs mb-8 text-center max-w-xs mx-auto">
                  Welcome back! Please enter your details to continue.
                </p>
                
                {/* Login Form */}
                <form onSubmit={handleLogin} className="w-full flex flex-col gap-4 mb-2">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      placeholder="Email"
                      type="email"
                      value={email}
                      className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50 focus:bg-white text-black text-xs transition-all"
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                  
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      placeholder="Password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50 focus:bg-white text-black text-xs transition-all"
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  <div className="w-full flex justify-end mb-2">
                    <button 
                      type="button"
                      className="text-xs text-secondary font-medium hover:underline transition-colors"
                      onClick={() => setShowForgotPassword(true)}
                    >
                      Forgot password?
                    </button>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-secondary font-medium py-3 rounded-lg shadow hover:shadow-md cursor-pointer transition-all mb-6 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </button>
                </form>

                {/* Sign up link */}
                <div className="text-center pt-4 border-t border-white/20">
                  <span className="text-xs text-white/80">Don't have an account? </span>
                  <button
                    onClick={() => navigate('/signup')}
                    className="text-xs text-primary font-medium hover:underline transition-colors"
                  >
                    Sign up
                  </button>
                </div>
              </div>
            </div>
          </div>
        </span>

        {/* Mobile Layout - Full Screen */}
        <div className="lg:hidden w-[95vw] h-[95vh] mx-auto my-auto flex flex-col relative z-10">
          {/* Logo and brand name above the form - MOBILE ONLY */}
          <div className="flex-shrink-0 mb-4 flex items-center justify-center gap-2">
            <img
              src={assets.LogoIcon}
              alt="Logo"
              className="h-16 w-16 object-contain"
            />
            <h1 className="text-md font-bold text-white drop-shadow-lg">SOCIAL GEMS</h1>
          </div>

          {/* Enhanced Glass Effect Form - Mobile */}
          <div className="flex-1 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-6 relative overflow-hidden flex flex-col">
            {/* Additional glass layer */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/5 rounded-2xl"></div>
            
            {/* Scrollable Content */}
            <div className="relative z-10 flex-1 overflow-y-auto scrollbar-none">
              {/* Header */}
              <h2 className="text-xl font-semibold mb-2 text-center text-white">
                Sign in to your account
              </h2>
              <p className="text-white/80 text-xs mb-8 text-center max-w-xs mx-auto">
                Welcome back! Please enter your details to continue.
              </p>
              
              {/* Login Form */}
              <form onSubmit={handleLogin} className="w-full flex flex-col gap-4 mb-2">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    placeholder="Email"
                    type="email"
                    value={email}
                    className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50 focus:bg-white text-black text-xs transition-all"
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    placeholder="Password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50 focus:bg-white text-black text-xs transition-all"
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                <div className="w-full flex justify-end mb-2">
                  <button 
                    type="button"
                    className="text-xs text-secondary font-medium hover:underline transition-colors"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    Forgot password?
                  </button>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-secondary font-medium py-3 rounded-lg shadow hover:shadow-md cursor-pointer transition-all mb-6 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              {/* Sign up link */}
              <div className="text-center pt-4 border-t border-white/20">
                <span className="text-xs text-white/80">Don't have an account? </span>
                <button
                  onClick={() => navigate('/signup')}
                  className="text-xs text-primary font-medium hover:underline transition-colors"
                >
                  Sign up
                </button>
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
      </section>
    </>
  );
};

export default Login;