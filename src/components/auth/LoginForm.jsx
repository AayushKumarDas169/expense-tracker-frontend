import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // From your image snippet
import api from '../../services/api';            // From your image snippet
import { useAuth } from '../../context/AuthContext'; // From your image snippet

export default function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth(); // Grabs the login state modifier from your AuthContext file

  // Form local input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Matches the API call pattern from your image snippet
      const res = await api.post('/auth/login', { email, password });
      
      // 2. Grabs token from response payload
      const token = res.data.token;
      
      // 3. Updates your application's global state context via AuthContext
      login(token);
      
      // 4. Safely reroutes the authenticated user to the main tracking view
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Invalid credentials validation fallback.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold text-white mb-2 text-center">Sign In</h2>
      
      {/* Social Row Layout */}
      <div className="flex justify-center space-x-3 mb-6">
        {['f', 'G', 'in'].map((icon) => (
          <span key={icon} className="w-8 h-8 rounded-full border border-slate-800 text-slate-400 flex items-center justify-center text-xs cursor-pointer hover:border-slate-600 hover:text-white transition">
            {icon}
          </span>
        ))}
      </div>
      <p className="text-[11px] text-slate-500 text-center uppercase tracking-wider mb-4">or use your account</p>

      {error && (
        <div className="mb-4 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
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
        <div className="text-center">
          <a href="#forgot" className="text-[11px] text-slate-500 hover:text-indigo-400 transition">Forgot your password?</a>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition duration-200 shadow-lg shadow-indigo-600/10 active:scale-95 disabled:opacity-50"
        >
          {loading ? 'Verifying session...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}