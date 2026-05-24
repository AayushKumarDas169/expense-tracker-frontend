import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../services/api';

function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [isSignUpActive, setIsSignUpActive] = useState(false);
  const [isForgotPasswordActive, setIsForgotPasswordActive] = useState(false);
  const [resetStep, setResetStep] = useState(1); 

  // Login States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup States
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  // In-Window Forgot Password States
  const [forgotEmail, setForgotEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Visibility states for password text toggles
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  // LOGIN FUNCTION
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      return toast.info('Please fill all fields');
    }

    try {
      setSubmitting(true);
      await login(loginEmail, loginPassword);
      toast.success('Login Successful 🚀');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1200); // 🚀 Maintained for premium auth loading transition sequence completion
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || 'Invalid credentials';
       toast.error(errMsg);
       setSubmitting(false);
    }
  };

  // SIGNUP FUNCTION
  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    if (!signupEmail || !signupPassword) {
      return toast.info('Please fill all fields');
    }

    try {
      setSubmitting(true);
      await register(signupEmail, signupPassword);
      toast.success('Account Created 🎉');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1200);
    } catch (err) {
       const errMsg = err.response?.data?.error || err.response?.data?.message || 'Registration failed';
        toast.error(errMsg);
        setSubmitting(false);
    }
  };

  // IN-WINDOW PASSWORD RESET MULTI-STEP FUNCTION
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();

    if (resetStep === 1) {
      if (!forgotEmail) return toast.info('Please enter your email address');

      try {
        setSubmitting(true);
        await api.post('/auth/forgot-password', { email: forgotEmail });
        toast.success('Email verified! Enter your new password below.');
        setResetStep(2); 
      } catch (err) {
        toast.error(err.response?.data?.error || 'Verification failed');
      } finally {
        setSubmitting(false); 
      }
    } 
    else if (resetStep === 2) {
      if (!newPassword) return toast.info('Please choose a new password');

      try {
        setSubmitting(true);
        await api.post('/auth/reset-password', { email: forgotEmail, newPassword });
        toast.success('Password updated successfully! Please Sign In. 🔑');
        
        setForgotEmail('');
        setNewPassword('');
        setResetStep(1);
        setIsForgotPasswordActive(false); 
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to update password');
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#f8f4ef_0%,#f2eee8_38%,#e9eef5_100%)] flex items-center justify-center px-4 overflow-hidden selection:bg-cyan-500/20 font-sans relative">
      <ToastContainer position="top-center" theme="colored" />

      {/* 🚀 NEW FULLSCREEN FROSTED TRANSLUCENT LOADING TRANSITION METHOD SPIN BLOCK */}
      {submitting && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-xl z-50 flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-700">
          <div className="relative w-16 h-16">
            {/* Outer structural anchor ring loop layer */}
            <div className="absolute inset-0 rounded-full border-4 border-slate-950/10 animate-pulse" />
            {/* Live spinning high contrast overlay tracing arc */}
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-slate-900 animate-spin duration-700" />
          </div>
          <p className="text-slate-900 text-xs font-black uppercase tracking-widest animate-pulse">
            Authenticating Ledger Session...
          </p>
        </div>
      )}

      {/* PREMIUM FROSTED BACKDROP ORBS */}
      <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-gradient-to-br from-white/35 via-[#ddd6fe]/20 to-[#bae6fd]/10 rounded-full blur-[160px] pointer-events-none animate-pulse duration-[8000ms]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[750px] h-[750px] bg-gradient-to-br from-[#ffddd2]/20 via-white/20 to-[#fde2e4]/10 rounded-full blur-[160px] pointer-events-none animate-pulse duration-[10000ms]" />

      {/* PREMIUM GLASSMORPHISM SHELL */}
      <div className="relative w-full max-w-5xl h-[600px] border border-white/40 bg-white/20 rounded-[32px] overflow-hidden shadow-[0_20px_70px_rgba(15,23,42,0.10),inset_0_1px_0_rgba(255,255,255,0.55),inset_0_-1px_0_rgba(255,255,255,0.18)] backdrop-blur-[28px] transition-all duration-500">
        
        {/* SUBTLE INNER GLASS HIGHLIGHT */}
        <div className="pointer-events-none absolute inset-[1px] rounded-[31px] bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.03))]" />

        {/* FORM INSETS CONTAINER */}
        <div className="absolute inset-0 flex">

          {/* ================= LOGIN CONTAINER ================= */}
          <div
            className={`w-1/2 h-full flex items-center justify-center transition-all duration-700 ease-in-out absolute top-0 left-0 ${
              isSignUpActive || isForgotPasswordActive
                ? '-translate-x-full opacity-0 pointer-events-none z-0'
                : 'translate-x-0 opacity-100 z-10'
            }`}
          >
            <form onSubmit={handleLoginSubmit} className="w-[80%] max-w-[360px] space-y-6">
              <div>
                <h1 className="text-5xl font-black text-slate-900 tracking-tight">Sign In</h1>
                <p className="text-slate-600/80 mt-3 text-sm font-semibold">Welcome back to your automated financial accounts</p>
              </div>

              {/* PREMIUM GLASS INPUTS */}
              <input
                type="email"
                placeholder="Email Address"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border border-white/45 bg-white/35 text-slate-800 placeholder:text-slate-500/70 outline-none transition-all duration-300 hover:border-white/70 hover:bg-white/45 focus:border-white/80 focus:bg-white/55 focus:ring-4 focus:ring-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur-md text-sm font-medium"
              />

              <div className="relative w-full">
                <input
                  type={showLoginPassword ? "text" : "password"}
                  placeholder="Password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-5 py-4 pr-14 rounded-2xl border border-white/45 bg-white/35 text-slate-800 placeholder:text-slate-500/70 outline-none transition-all duration-300 hover:border-white/70 hover:bg-white/45 focus:border-white/80 focus:bg-white/55 focus:ring-4 focus:ring-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur-md text-sm font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500/80 hover:text-slate-900 text-xs font-bold uppercase tracking-wider transition-colors duration-200"
                >
                  {showLoginPassword ? "Hide" : "View"}
                </button>
              </div>

              <div className="text-left">
                <button
                  type="button"
                  onClick={() => {
                    setResetStep(1);
                    setIsForgotPasswordActive(true);
                  }}
                  className="text-sm font-bold text-slate-500 hover:text-slate-800 hover:translate-x-0.5 transform transition-all duration-200"
                >
                  Forgot your password?
                </button>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(15,23,42,0.82))] text-white font-bold text-sm tracking-wider shadow-[0_14px_34px_rgba(15,23,42,0.18),inset_0_1px_0_rgba(255,255,255,0.10)] hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(15,23,42,0.22),inset_0_1px_0_rgba(255,255,255,0.14)] active:translate-y-0 active:scale-[0.99] transition-all duration-200"
              >
                {submitting ? 'Loading...' : 'Sign In'}
              </button>
            </form>
          </div>

          {/* ================= IN-WINDOW FORGOT/RESET PASSWORD ================= */}
          <div
            className={`w-1/2 h-full flex items-center justify-center transition-all duration-700 ease-in-out absolute top-0 left-0 ${
              isForgotPasswordActive && !isSignUpActive
                ? 'translate-x-0 opacity-100 z-10'
                : '-translate-x-full opacity-0 pointer-events-none z-0'
            }`}
          >
            <form onSubmit={handleForgotPasswordSubmit} className="w-[80%] max-w-[360px] space-y-6">
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Reset Password</h1>
                <p className="text-slate-600/80 mt-3 text-sm font-semibold leading-relaxed">
                  {resetStep === 1 
                    ? 'Enter your registered profile address details.' 
                    : 'Choose your highly secure new encryption login password.'}
                </p>
              </div>

              {resetStep === 1 ? (
                <input
                  type="email"
                  required
                  placeholder="Registered Email Address"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl border border-white/45 bg-white/35 text-slate-800 placeholder:text-slate-500/70 outline-none transition-all duration-300 hover:border-white/70 hover:bg-white/45 focus:border-white/80 focus:bg-white/55 focus:ring-4 focus:ring-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur-md text-sm font-medium"
                />
              ) : (
                <div className="relative w-full">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    placeholder="Choose New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-5 py-4 pr-14 rounded-2xl border border-white/45 bg-white/35 text-slate-800 placeholder:text-slate-500/70 outline-none transition-all duration-300 hover:border-white/70 hover:bg-white/45 focus:border-white/80 focus:bg-white/55 focus:ring-4 focus:ring-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur-md text-sm font-mono font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500/80 hover:text-slate-900 text-xs font-bold uppercase tracking-wider transition-colors duration-200"
                  >
                    {showNewPassword ? "Hide" : "View"}
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(15,23,42,0.82))] text-white font-bold text-sm tracking-wider shadow-[0_14px_34px_rgba(15,23,42,0.18),inset_0_1px_0_rgba(255,255,255,0.10)] hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(15,23,42,0.22),inset_0_1px_0_rgba(255,255,255,0.14)] active:translate-y-0 active:scale-[0.99] transition-all duration-200"
              >
                {submitting 
                  ? 'Processing...' 
                  : resetStep === 1 ? 'Verify Email Address' : 'Update Password'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPasswordActive(false);
                    setResetStep(1);
                  }}
                  className="text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors duration-200"
                >
                  ← Return to Sign In
                </button>
              </div>
            </form>
          </div>

          {/* ================= SIGNUP CONTAINER ================= */}
          <div
            className={`w-1/2 h-full flex items-center justify-center transition-all duration-700 absolute top-0 right-0 ${
              isSignUpActive
                ? 'translate-x-0 opacity-100 z-10'
                : 'translate-x-full opacity-0 pointer-events-none z-0'
            }`}
          >
            <form onSubmit={handleSignUpSubmit} className="w-[80%] max-w-[360px] space-y-6">
              <div>
                <h1 className="text-5xl font-black text-slate-900 tracking-tight">Create Account</h1>
                <p className="text-slate-600/80 mt-3 text-sm font-semibold">Start tracking your assets smarter today</p>
              </div>

              <input
                type="email"
                placeholder="Email Address"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border border-white/45 bg-white/35 text-slate-800 placeholder:text-slate-500/70 outline-none transition-all duration-300 hover:border-white/70 hover:bg-white/45 focus:border-white/80 focus:bg-white/55 focus:ring-4 focus:ring-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur-md text-sm font-medium"
              />

              <div className="relative w-full">
                <input
                  type={showSignupPassword ? "text" : "password"}
                  placeholder="Password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className="w-full px-5 py-4 pr-14 rounded-2xl border border-white/45 bg-white/35 text-slate-800 placeholder:text-slate-500/70 outline-none transition-all duration-300 hover:border-white/70 hover:bg-white/45 focus:border-white/80 focus:bg-white/55 focus:ring-4 focus:ring-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur-md text-sm font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowSignupPassword(!showSignupPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500/80 hover:text-slate-900 text-xs font-bold uppercase tracking-wider transition-colors duration-200"
                >
                  {showSignupPassword ? "Hide" : "View"}
                </button>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(15,23,42,0.82))] text-white font-bold text-sm tracking-wider shadow-[0_14px_34px_rgba(15,23,42,0.18),inset_0_1px_0_rgba(255,255,255,0.10)] hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(15,23,42,0.22),inset_0_1px_0_rgba(255,255,255,0.14)] active:translate-y-0 active:scale-[0.99] transition-all duration-200"
              >
                {submitting ? 'Creating...' : 'Sign Up'}
              </button>
            </form>
          </div>

        </div>

        {/* ================= SLIDING OVERLAY PANEL ================= */}
        <div
          className={`absolute top-0 w-1/2 h-full text-white flex items-center justify-center transition-all duration-700 ease-in-out z-20 shadow-[0_24px_60px_rgba(2,6,23,0.18),inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-[30px] border-l border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.74),rgba(15,23,42,0.54))] ${
            isSignUpActive ? 'left-0' : 'left-1/2'
          }`}
        >
          <div className="text-center px-10 transform transition-all duration-700 ease-in-out">
            {isSignUpActive ? (
              <div className="animate-in fade-in duration-500 slide-in-from-left-4 space-y-4">
                <h1 className="text-5xl font-black tracking-tight mb-5 drop-shadow-sm">Welcome Back!</h1>
                <p className="text-white/70 mb-8 text-sm leading-relaxed max-w-[280px] mx-auto font-medium">
                  Already have an active statement ledger? Sign in here and continue your analytics visualization.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUpActive(false);
                    setIsForgotPasswordActive(false);
                  }}
                  className="px-10 py-3.5 border border-white/20 rounded-full font-bold text-xs uppercase tracking-widest text-white backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] hover:bg-white hover:text-black hover:border-white hover:shadow-lg active:scale-95 transform transition-all duration-300"
                >
                  Sign In
                </button>
              </div>
            ) : (
              <div className="animate-in fade-in duration-500 slide-in-from-right-4 space-y-4">
                <h1 className="text-5xl font-black tracking-tight mb-5 drop-shadow-sm">Hello Friend!</h1>
                <p className="text-white/70 mb-8 text-sm leading-relaxed max-w-[280px] mx-auto font-medium">
                  Enter your personalized data credentials to begin tracking your financial freedom goals.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUpActive(true);
                    setIsForgotPasswordActive(false);
                  }}
                  className="px-10 py-3.5 border border-white/20 rounded-full font-bold text-xs uppercase tracking-widest text-white backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] hover:bg-white hover:text-black hover:border-white hover:shadow-lg active:scale-95 transform transition-all duration-300"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default LoginPage;