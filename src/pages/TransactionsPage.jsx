import React, { useEffect, useState } from 'react';

import { useAuth } from "../context/AuthContext";

import { useNavigate } from "react-router-dom";

import api from '../services/api';

import { ToastContainer, toast } from 'react-toastify';



function TransactionsPage() {

  const { logout } = useAuth();

  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);

  const [loading, setLoading] = useState(true);



  const formatINR = (amount) => {

    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

  };



  const loadAllData = async () => {

    try {

      setLoading(true);

      const response = await api.get('/transactions');

      setTransactions(response.data || []);

    } catch (err) {

      toast.error("Failed fetching master ledger files.");

    } finally {

      setLoading(false);

    }

  };



  useEffect(() => { loadAllData(); }, []);



  const handleDelete = async (id) => {

    try {

      await api.delete(`/transactions/${id}`);

      toast.warn("Entry permanently removed.");

      loadAllData();

    } catch (err) {

      toast.error("Failed executing erasure sequence.");

    }

  };



  return (

    <div className="min-h-screen bg-[#eddcd2]/30 text-slate-700 flex font-sans relative overflow-x-hidden selection:bg-cyan-500/20">

      <ToastContainer theme="colored" />

      {/* BACKGROUND ORBS */}

      <div className="absolute top-[-10%] left-[-5%] w-[700px] h-[700px] bg-gradient-to-tr from-[#ddbdfc]/40 to-[#8ecae6]/20 rounded-full blur-[130px] pointer-events-none" />

      <div className="absolute bottom-[-10%] right-[-5%] w-[650px] h-[650px] bg-gradient-to-tr from-[#ffb5a7]/30 to-[#fcd5ce]/20 rounded-full blur-[130px] pointer-events-none" />



      {/* SIDEBAR CONTAINER */}

      <aside className="hidden md:flex w-64 flex-col justify-between border-r border-white/60 bg-white/40 backdrop-blur-xl z-10 shadow-[4px_0_24px_rgba(0,0,0,0.01)]">

        <div className="p-6">

          <div className="flex items-center space-x-3 mb-2">

            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-950 shadow-md flex items-center justify-center font-bold text-white text-base">E</div>

            <h1 className="text-lg font-bold tracking-tight text-slate-800">ExpenseTracker</h1>

          </div>

          <nav className="mt-12 space-y-1">

            <button onClick={() => navigate('/dashboard')} className="w-full rounded-xl px-4 py-3 text-left text-slate-500 hover:text-slate-900 hover:bg-white/40 border border-transparent transition-all duration-200">Dashboard</button>

            <button onClick={() => navigate('/transactions')} className="w-full rounded-xl bg-white/80 border border-white px-4 py-3 text-left text-slate-900 font-bold shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex items-center space-x-3">

              <span className="w-1.5 h-1.5 rounded-full bg-slate-800"></span>

              <span>Transactions</span>

            </button>

            <button onClick={() => navigate('/analytics')} className="w-full rounded-xl px-4 py-3 text-left text-slate-500 hover:text-slate-900 hover:bg-white/40 border border-transparent transition-all duration-200">Analytics</button>

          </nav>

        </div>

        <div className="p-6">

          <button onClick={() => { logout(); navigate("/login"); }} className="w-full rounded-xl bg-slate-900/90 hover:bg-slate-900 border border-slate-950 px-4 py-3 font-semibold text-white shadow-md transition-all duration-200">Logout</button>

        </div>

      </aside>



      {/* MAIN VIEWPORT */}

      <main className="flex-1 p-6 md:p-10 overflow-y-auto z-10 relative">

        <div className="mx-auto max-w-7xl">

          <div className="mb-10">

            <h2 className="text-2xl font-black tracking-tight text-slate-800">Master History Ledger</h2>

            <p className="mt-1.5 text-slate-600 text-sm font-semibold">Full administrative directory containing every record committed to cluster arrays.</p>

          </div>



          {/* MAIN HISTORY DATA FRAME (FROSTED GLASS) */}

          <div className="rounded-2xl border border-white/70 bg-white/40 p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.03)] backdrop-blur-md">

            <div className="overflow-x-auto">

              <table className="w-full min-w-[650px] text-left">

                <thead>

                  <tr className="border-b border-slate-300 text-slate-700 text-xs uppercase tracking-wider font-black">

                    <th className="pb-3.5 font-black">Title Reference</th>

                    <th className="pb-3.5 font-black">Category</th>

                    <th className="pb-3.5 font-black">Type</th>

                    <th className="pb-3.5 font-black">Net Weight</th>

                    <th className="pb-3.5 font-black">Date Stamp</th>

                    <th className="pb-3.5 font-black text-center">Action</th>

                  </tr>

                </thead>

                <tbody className="text-xs divide-y divide-slate-100">

                  {loading ? (

                    <tr>

                      <td colSpan="6" className="text-center py-8 text-slate-600 font-mono font-bold tracking-widest animate-pulse">

                        Querying Database...

                      </td>

                    </tr>

                  ) : transactions.length === 0 ? (

                    <tr>

                      <td colSpan="6" className="py-8 text-center text-slate-600 font-mono font-bold">

                        No historical values logged.

                      </td>

                    </tr>

                  ) : (

                    transactions.map((tx) => (

                      <tr key={tx._id} className="hover:bg-white/40 transition duration-150">

                        <td className="py-3.5 font-semibold text-slate-700">{tx.description}</td>

                        <td className="py-3.5 text-slate-600 font-semibold">{tx.category}</td>

                        <td className="py-3.5">

                          <span className={`px-2.5 py-0.5 font-bold rounded-full ${tx.type === 'income' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'} border`}>

                            {tx.type === 'income' ? 'Income' : 'Expense'}

                          </span>

                        </td>

                        <td className="py-3.5 font-mono font-bold text-slate-800">{formatINR(tx.amount)}</td>

                        <td className="py-3.5 text-slate-600 font-semibold">{new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>

                        <td className="py-3.5 text-center">

                          <button onClick={() => handleDelete(tx._id)} className="px-2.5 py-1 font-bold bg-white border border-rose-100 rounded-lg text-rose-600 hover:bg-rose-50 transition-all duration-200">Delete</button>

                        </td>

                      </tr>

                    ))

                  )}

                </tbody>

              </table>

            </div>

          </div>

        </div>

      </main>

    </div>

  );

}



export default TransactionsPage;