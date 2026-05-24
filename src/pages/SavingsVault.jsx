import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

function SavingsVault() {
  const [savingsBalance, setSavingsBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  
  useEffect(() => {
    const fetchSavings = async () => {
      try {
        const res = await api.get('/auth/user-profile'); // Adjust endpoint to wherever you fetch user details
        setSavingsBalance(res.data.savingsBalance || 0);
      } catch (err) {
        console.error("Error loading savings pool configuration data");
      }
    };
    fetchSavings();
  }, []);

  const handleTransaction = async (type) => {
    if (!amount || amount <= 0) return toast.info("Please enter a valid amount");

    try {
      setLoading(true);
      const res = await api.post('/savings/transaction', { amount: Number(amount), type });
      setSavingsBalance(res.data.savingsBalance);
      toast.success(res.data.message);
      setAmount('');
    } catch (err) {
      toast.error(err.response?.data?.error || "Transaction declined.");
    } finally {
      setLoading(false);
    }
  };

  const handleMonthlySweep = async () => {
    try {
      setLoading(true);
      const res = await api.post('/savings/sweep');
      setSavingsBalance(res.data.savingsBalance);
      toast.success(res.data.message);
    } catch (err) {
      toast.error("Sweep transaction processing error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 shadow-xl border border-slate-800">
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Savings Vault</p>
          <h2 className="text-4xl font-black mt-1 text-emerald-400">${savingsBalance.toFixed(2)}</h2>
        </div>
        <button 
          onClick={handleMonthlySweep}
          className="text-[10px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider transition"
        >
          Sweep Leftovers 🔄
        </button>
      </div>

      <div className="space-y-3 mt-6">
        <input
          type="number"
          placeholder="Enter Amount ($)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
        />

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleTransaction('deposit')}
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-md disabled:opacity-50"
          >
            Deposit
          </button>
          <button
            onClick={() => handleTransaction('withdraw')}
            disabled={loading}
            className="w-full py-3 bg-transparent border-2 border-slate-700 hover:border-white text-white font-bold text-xs uppercase tracking-wider rounded-xl transition disabled:opacity-50"
          >
            Withdraw
          </button>
        </div>
      </div>
    </div>
  );
}

export default SavingsVault;