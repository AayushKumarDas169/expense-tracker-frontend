import React, { useState } from 'react';
import api from '../../services/api'; // Correctly utilizing your custom Axios service

export default function SignupForm() {
  // Input fields state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Feedback status handlers
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // 1. Sends data directly to Express backend route (/api/auth/register)
      const res = await api.post('/auth/register', { name, email, password });
      
      // 2. Display the successful registration string from backend
      setSuccess(res.data.message || 'Account created successfully! Switching to sign-in...');
      
      // Clear forms
      setName('');
      setEmail('');
      setPassword('');

      // 3. Automatically trigger page reload after 2 seconds so they can sign in!
      setTimeout(() => {
        window.location.reload();
      }, 2200);

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Registration failed. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold text-white mb-2 text-center">Create Account</h2>
      
      {/* Social login icon bar */}
      <div className="flex justify-center space-x-3 mb-6">
        {['f', 'G', 'in'].map((icon) => (
          <span key={icon} className="w-8 h-8 rounded-full border border-slate-800 text-slate-400 flex items-center justify-center text-xs cursor-pointer hover:border-slate-600 hover:text-white transition">
            {icon}
          </span>
        ))}
      </div>
      <p className="text-[11px] text-slate-500 text-center uppercase tracking-wider mb-4">or use your email for registration</p>

      {/* Dynamic Alerts */}
      {error && (
        <div className="mb-4 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs text-center">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <input
          type="text"
          required
          placeholder="Full Name"
          className="w-full px-4 py-3 bg-[#080b16]/90 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          required
          placeholder="Email Address"
          className="w-full px-4 py-3 bg-[#080b16]/90 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          required
          placeholder="Password"
          className="w-full px-4 py-3 bg-[#080b16]/90 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition duration-200 shadow-lg shadow-indigo-600/10 active:scale-95 disabled:opacity-50"
        >
          {loading ? 'Creating Security Profile...' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
}