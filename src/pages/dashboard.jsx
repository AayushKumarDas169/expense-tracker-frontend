import React, { useEffect, useState } from 'react';
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import api from '../services/api';

// Toast Notifications Engine Injections
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function DashboardPage() {
  const { logout } = useAuth(); 
  const navigate = useNavigate(); 

  const [transactions, setTransactions] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [totals, setTotals] = useState({ balance: 0, income: 0, expense: 0 }); 
  const [doughnutData, setDoughnutData] = useState(null); 
  const [barData, setBarData] = useState(null); 

  // Search and Internal Table Filter States
  const [searchQuery, setSearchQuery] = useState(''); 
  const [filterType, setFilterType] = useState('all'); 
  const [filterCategory, setFilterCategory] = useState('all'); 

  // Input Form States
  const [description, setDescription] = useState(''); 
  const [amount, setAmount] = useState(''); 
  const [type, setType] = useState('expense'); 
  const [category, setCategory] = useState('Food'); 

  // Savings Management State Configurations
  const [savingsBalance, setSavingsBalance] = useState(0);
  const [savingsInputAmount, setSavingsInputAmount] = useState('');
  const [savingsProcessing, setSavingsProcessing] = useState(false);

  // 🚀 NEW STATE: Handles the beautiful frosted logout animation sequence
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Modal Context States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); 
  const [editingId, setEditingId] = useState(null); 
  const [editDescription, setEditDescription] = useState(''); 
  const [editAmount, setEditAmount] = useState(''); 
  const [editType, setEditType] = useState('expense'); 
  const [editCategory, setEditCategory] = useState('Food'); 

  const formatINR = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount); 
  };

  // 🚀 REFUSED TRADITIONAL EXIT ROUTING: Replaced with a timed fade layout transition animation
  const handleLogout = () => {
    setIsLoggingOut(true); 
    setTimeout(() => {
      logout(); 
      navigate("/login"); 
    }, 1200); // ⏱️ Matches the precise 1.2-second transition loop used on your login interface
  };

  const fetchData = async () => {
    try {
      const [txResponse, summaryResponse, userResponse] = await Promise.all([
        api.get('/transactions'),
        api.get('/transactions/summary'),
        api.get('/auth/user-profile').catch(() => ({ data: { savingsBalance: 0 } }))
      ]); 

      setSavingsBalance(userResponse.data?.savingsBalance || 0);

      const transactionList = txResponse.data || []; 
      setTransactions(transactionList); 

      let inc = 0;
      let exp = 0;
      transactionList.forEach(t => {
        if (t.type === 'income') inc += Number(t.amount);
        else exp += Number(t.amount);
      }); 
      setTotals({ income: inc, expense: exp, balance: inc - exp }); 

      const summaryData = summaryResponse.data || []; 
      const expenseItems = summaryData.filter(item => item._id?.type === 'expense'); 
      const doughnutCategories = expenseItems.map(item => item._id?.category || 'Uncategorized'); 
      const doughnutAmounts = expenseItems.map(item => item.totalAmount || 0); 

      setDoughnutData({
        labels: doughnutCategories.length ? doughnutCategories : ['No Expenses'],
        datasets: [{
          data: doughnutAmounts.length ? doughnutAmounts : [0],
          backgroundColor: ['#22d3ee', '#818cf8', '#fbbf24', '#34d399'],
          borderWidth: 0,
        }]
      }); 

      const incomeItems = summaryData.filter(item => item._id?.type === 'income'); 
      setBarData({
        labels: ['Inflow', 'Outflow'],
        datasets: [{
          label: 'Volume',
          data: [
            incomeItems.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0),
            expenseItems.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0)
          ],
          backgroundColor: ['rgba(52, 211, 153, 0.25)', 'rgba(248, 113, 113, 0.25)'],
          borderColor: ['rgba(52, 211, 153, 0.8)', 'rgba(248, 113, 113, 0.8)'],
          borderWidth: 1.5,
          borderRadius: 8
        }]
      }); 

    } catch (error) {
      console.error(error);
    } finally {
      setTimeout(() => setLoading(false), 400); 
    }
  };

  useEffect(() => {
    fetchData(); 
  }, []);

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!description || !amount) return; 

    try {
      await api.post('/transactions', { description, amount: parseFloat(amount), type, category }); 
      toast.success("Transaction committed successfully! 💸"); 
      setDescription(''); 
      setAmount(''); 
      setTimeout(() => fetchData(), 100); 
    } catch (err) {
      toast.error("Failed to commit ledger transaction entry."); 
    }
  };

  const handleSavingsTransaction = async (actionType) => {
    if (!savingsInputAmount || parseFloat(savingsInputAmount) <= 0) {
      return toast.info("Please enter a valid numeric amount.");
    }

    try {
      setSavingsProcessing(true);
      const res = await api.post('/savings/transaction', {
        amount: parseFloat(savingsInputAmount),
        type: actionType
      });
      toast.success(res.data?.message || `Savings vault ${actionType} completed!`);
      setSavingsInputAmount('');
      fetchData(); 
    } catch (err) {
      toast.error(err.response?.data?.error || "Transaction declined by server core.");
    } finally {
      setSavingsProcessing(false);
    }
  };

  const handleMonthlySurplusSweep = async () => {
    if (totals.balance <= 0) {
      return toast.info("No liquid balance available to sweep into savings.");
    }

    try {
      setSavingsProcessing(true);
      const res = await api.post('/savings/sweep', { sweepAmount: totals.balance });
      toast.success(res.data?.message || "All liquid cash successfully swept to vault! 💰");
      fetchData(); 
    } catch (err) {
      toast.error(err.response?.data?.error || "Sweep processing error.");
    } finally {
      setSavingsProcessing(false);
    }
  };

  const handleDeleteTransaction = async (id) => {
    try {
      await api.delete(`/transactions/${id}`); 
      toast.warn("Transaction deleted successfully."); 
      setTimeout(() => fetchData(), 100); 
    } catch (err) {
      toast.error("Failed to remove historical entry."); 
    }
  };

  const openEditModal = (tx) => {
    setEditingId(tx._id);
    setEditDescription(tx.description);
    setEditAmount(tx.amount);
    setEditType(tx.type);
    setEditCategory(tx.category);
    setIsEditModalOpen(true); 
  };

  const handleUpdateTransaction = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/transactions/${editingId}`, { description: editDescription, amount: parseFloat(editAmount), type: editType, category: editCategory }); 
      toast.success("Ledger values modified successfully! 📝"); 
      setIsEditModalOpen(false); 
      setTimeout(() => fetchData(), 100); 
    } catch (err) {
      toast.error("Failed editing transaction data parameters."); 
    }
  };

  const exportToCSV = () => {
    if (transactions.length === 0) return toast.info("No records to export."); 
    const headers = ["Title", "Category", "Type", "Amount", "Date"]; 
    const rows = transactions.map(tx => [`"${tx.description}"`, `"${tx.category}"`, tx.type.toUpperCase(), tx.amount, `"${new Date(tx.date).toLocaleDateString()}"`]); 
    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n"); 
    const blob = new Blob([csvContent], { type: 'text/csv' }); 
    const url = URL.createObjectURL(blob); 
    const link = document.createElement("a"); 
    link.href = url; 
    link.download = "Statement.csv"; 
    link.click(); 
    toast.success("CSV Downloaded! 📊"); 
  };

  const exportToPDF = async () => {
    try {
      toast.info("Compiling server-side statement PDF... 📄"); 
      const response = await api.get('/transactions/pdf', { responseType: 'blob' }); 
      const blob = new Blob([response.data], { type: 'application/pdf' }); 
      const url = URL.createObjectURL(blob); 
      const link = document.createElement("a"); 
      link.href = url; 
      link.download = `Financial_Report_${new Date().toISOString().slice(0,10)}.pdf`; 
      link.click(); 
      toast.success("PDF Report Generated Successfully! 🏅"); 
    } catch (err) {
      toast.error("Failed processing backend PDF engine."); 
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || tx.type === filterType;
    const matchesCategory = filterCategory === 'all' || tx.category === filterCategory;
    return matchesSearch && matchesType && matchesCategory;
  }); 

  return (
    <div className="min-h-screen bg-[#eddcd2]/30 text-slate-700 flex font-sans relative overflow-x-hidden selection:bg-cyan-500/20">
      <ToastContainer theme="colored" position="top-right" autoClose={3000} /> 
      
      {/* 🚀 PREMIUM FULLSCREEN FROSTED LOGOUT ANIMATION OVERLAY */}
      {isLoggingOut && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-xl z-50 flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-300">
          <div className="relative w-16 h-16">
            {/* Outer Pulsing Ring Structure Loop */}
            <div className="absolute inset-0 rounded-full border-4 border-slate-950/10 animate-pulse" />
            {/* High Acceleration Tracing Arc Spinner Element */}
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-slate-900 animate-spin duration-700" />
          </div>
          <p className="text-slate-900 text-xs font-black uppercase tracking-widest animate-pulse">
            Terminating Session...
          </p>
        </div>
      )}

      {/* REFRACTION BACKGROUND ORBS */}
      <div className="absolute top-[-10%] left-[-5%] w-[700px] h-[700px] bg-gradient-to-tr from-[#ddbdfc]/40 to-[#8ecae6]/20 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[650px] h-[650px] bg-gradient-to-tr from-[#ffb5a7]/30 to-[#fcd5ce]/20 rounded-full blur-[130px] pointer-events-none" />

      {/* SIDEBAR (MILK-GLASS) */}
      <aside className="hidden md:flex w-64 flex-col justify-between border-r border-white/60 bg-white/40 backdrop-blur-xl z-10 shadow-[4px_0_24px_rgba(0,0,0,0.01)]">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-950 shadow-md flex items-center justify-center font-bold text-white text-base">E</div>
            <h1 className="text-lg font-bold tracking-tight text-slate-800">ExpenseTracker</h1> 
          </div>
          <nav className="mt-12 space-y-1">
            <button onClick={() => navigate('/dashboard')} className="w-full rounded-xl bg-white/80 border border-white px-4 py-3 text-left text-slate-900 font-bold shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex items-center space-x-3">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-800"></span>
              <span>Dashboard</span> 
            </button>
            <button onClick={() => navigate('/transactions')} className="w-full rounded-xl px-4 py-3 text-left text-slate-500 hover:text-slate-900 hover:bg-white/40 border border-transparent transition-all duration-200">Transactions</button>
            
            <button 
              onClick={() => {
                const element = document.getElementById("savings-vault-section");
                if (element) element.scrollIntoView({ behavior: 'smooth' });
                else toast.info("Savings dashboard module active below.");
              }} 
              className="w-full rounded-xl px-4 py-3 text-left text-emerald-700 hover:text-emerald-800 hover:bg-emerald-500/10 border border-transparent font-bold transition-all duration-200 flex items-center justify-between"
            >
              <span>💰 Savings Vault</span>
              <span className="bg-emerald-500/20 text-emerald-700 px-2 py-0.5 rounded-lg text-[10px]">Active</span>
            </button>

            <button onClick={() => navigate('/analytics')} className="w-full rounded-xl px-4 py-3 text-left text-slate-500 hover:text-slate-900 hover:bg-white/40 border border-transparent transition-all duration-200">Analytics</button> 
          </nav>
        </div>
        <div className="p-6">
          <button onClick={handleLogout} className="w-full rounded-xl bg-slate-900/90 hover:bg-slate-900 border border-slate-950 px-4 py-3 font-semibold text-white shadow-md transition-all duration-200 active:scale-98">Logout</button> 
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto z-10 relative">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10"><h2 className="text-2xl font-black tracking-tight text-slate-800">Dashboard Hub</h2></div>

          {/* DYNAMIC KPI CARDS */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {loading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="rounded-2xl border border-white/80 bg-white/40 p-6 animate-pulse h-28 backdrop-blur-md"></div>
              )) 
            ) : (
              <>
                <div className="rounded-2xl border border-white/70 bg-white/40 p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.03)] backdrop-blur-md transition-all hover:bg-white/50 hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] duration-300">
                  <p className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">Total Liquid Balance</p>
                  <h3 className={`mt-3 text-3xl font-bold tracking-tight font-mono ${totals.balance >= 0 ? 'text-slate-800' : 'text-rose-600'}`}>{formatINR(totals.balance)}</h3> 
                </div>
                
                <div className="rounded-2xl border border-white/70 bg-white/40 p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.03)] backdrop-blur-md transition-all hover:bg-white/50 hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] duration-300">
                  <p className="text-xs font-extrabold text-slate-600 uppercase tracking-wider flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Total Income</span>
                  </p>
                  <h3 className="mt-3 text-3xl font-bold tracking-tight font-mono text-emerald-600">{formatINR(totals.income)}</h3> 
                </div>
                
                <div className="rounded-2xl border border-white/70 bg-white/40 p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.03)] backdrop-blur-md transition-all hover:bg-white/50 hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] duration-300">
                  <p className="text-xs font-extrabold text-slate-600 uppercase tracking-wider flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                    <span>Total Outflow</span>
                  </p>
                  <h3 className="mt-3 text-3xl font-bold tracking-tight font-mono text-rose-600">{formatINR(totals.expense)}</h3> 
                </div>

                <div className="rounded-2xl border border-white/70 bg-white/40 p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.03)] backdrop-blur-md transition-all hover:bg-white/50 hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] duration-300">
                  <p className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Vault Savings</span>
                  </p>
                  <h3 className="mt-3 text-3xl font-bold tracking-tight font-mono text-emerald-600">{formatINR(savingsBalance)}</h3>
                </div>
              </>
            )}
          </div>

          {/* INPUT FORM, SAVINGS MODULE, AND CHARTS */}
          <div className="grid gap-6 lg:grid-cols-12 mb-8">
            
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* COMMIT MATRIX ENTRY FORM */}
              <div className="rounded-2xl border border-white/70 bg-white/40 p-6 backdrop-blur-md shadow-[0_8px_32px_0_rgba(31,38,135,0.03)]">
                <h3 className="text-sm font-bold text-slate-800 tracking-tight mb-5">Commit Entry</h3>
                <form onSubmit={handleAddTransaction} className="space-y-3.5"> 
                  <input type="text" required placeholder="Label Reference" className="w-full px-4 py-2.5 bg-slate-50/40 border border-slate-200/60 rounded-xl text-slate-700 text-sm focus:outline-none focus:bg-white/90 transition-all placeholder:text-slate-400 shadow-inner" value={description} onChange={e => setDescription(e.target.value)} /> 
                  <input type="number" required step="0.01" placeholder="Volume Value (₹)" className="w-full px-4 py-2.5 bg-slate-50/40 border border-slate-200/60 rounded-xl text-slate-700 text-sm focus:outline-none focus:bg-white/90 transition-all placeholder:text-slate-400 font-mono shadow-inner" value={amount} onChange={e => setAmount(e.target.value)} /> 
                  <div className="grid grid-cols-2 gap-3">
                    <select className="w-full px-3 py-2.5 bg-slate-50/40 border border-slate-200/60 rounded-xl text-slate-500 text-sm focus:outline-none focus:bg-white/90 cursor-pointer shadow-inner" value={type} onChange={e => setType(e.target.value)}>
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </select> 
                    <select className="w-full px-3 py-2.5 bg-slate-50/40 border border-slate-200/60 rounded-xl text-slate-500 text-sm focus:outline-none focus:bg-white/90 cursor-pointer shadow-inner" value={category} onChange={e => setCategory(e.target.value)}>
                      <option value="Food">Food</option>
                      <option value="Rent">Rent</option>
                      <option value="Utilities">Utilities</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Salary">Salary</option>
                    </select> 
                  </div>
                  <button type="submit" className="w-full py-2.5 mt-2 bg-slate-950 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-slate-900 transition-all shadow-md">Commit Matrix</button> 
                </form>
              </div>

              {/* UPGRADED & TEXT-BRIGHTENED GLASSMORPHIC SAVINGS VAULT SYSTEM CARD */}
              <div id="savings-vault-section" className="rounded-2xl border border-white/70 bg-white/40 p-6 backdrop-blur-md shadow-[0_8px_32px_0_rgba(31,38,135,0.03)] transition-all hover:bg-white/50 hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">Vault Allocation</p>
                    <h4 className="text-3xl font-bold font-mono text-emerald-600 mt-2">{formatINR(savingsBalance)}</h4>
                  </div>
                  <button 
                    type="button"
                    onClick={handleMonthlySurplusSweep}
                    disabled={savingsProcessing}
                    className="text-xs font-bold bg-emerald-500/15 text-emerald-700 border border-emerald-500/20 px-3 py-1.5 rounded-xl hover:bg-emerald-500/20 transition-all duration-200 shadow-sm"
                  >
                    Sweep Surplus 🔄
                  </button>
                </div>

                <div className="space-y-4 mt-6">
                  <input 
                    type="number"
                    step="1"
                    placeholder="Transaction Amount (₹)"
                    value={savingsInputAmount}
                    onChange={(e) => setSavingsInputAmount(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200/80 text-slate-800 placeholder:text-slate-400 outline-none transition-all duration-300 hover:border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] text-sm font-mono rounded-xl"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      disabled={savingsProcessing}
                      onClick={() => handleSavingsTransaction('deposit')}
                      className="w-full py-3 bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-md disabled:opacity-40"
                    >
                      Deposit
                    </button>
                    <button
                      type="button"
                      disabled={savingsProcessing}
                      onClick={() => handleSavingsTransaction('withdraw')}
                      className="w-full py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 shadow-sm disabled:opacity-40"
                    >
                      Withdraw
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* CHART PLOT MODULE AREAS */}
            <div className="lg:col-span-4 rounded-2xl border border-white/70 bg-white/40 p-6 backdrop-blur-md h-[340px] flex flex-col justify-between shadow-[0_8px_32px_0_rgba(31,38,135,0.03)]">
              <h3 className="text-sm font-bold text-slate-800 tracking-tight">Expense Metrics</h3>
              <div className="relative h-52 w-full flex items-center justify-center">
                {!loading && doughnutData && <Doughnut key={`doughnut-${transactions.length}`} data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, cutout: '80%', plugins: { legend: { position: 'bottom', labels: { color: '#64748b', boxWidth: 6, font: { size: 10, weight: '600' } } } } }} />} 
              </div>
            </div>

            <div className="lg:col-span-4 rounded-2xl border border-white/70 bg-white/40 p-6 backdrop-blur-md h-[340px] flex flex-col justify-between shadow-[0_8px_32px_0_rgba(31,38,135,0.03)]">
              <h3 className="text-sm font-bold text-slate-800 tracking-tight">Net Allocation Matrix</h3>
              <div className="relative h-56 w-full flex items-center justify-center">
                {!loading && barData && <Bar key={`bar-${transactions.length}`} data={barData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: '#64748b', font: { weight: '600', size: 10 } } }, y: { grid: { color: 'rgba(0,0,0,0.02)' }, ticks: { color: '#64748b', font: { size: 10 } } } } }} />} 
              </div>
            </div>
          </div>

          {/* TABLE LOG FEED */}
          <div className="rounded-2xl border border-white/70 bg-white/40 backdrop-blur-md p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.03)]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h3 className="text-sm font-bold text-slate-800 tracking-tight">Recent Activity</h3>
              <div className="flex space-x-2">
                <button onClick={exportToCSV} className="px-3.5 py-1.5 text-xs font-bold bg-white/80 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all">📊 CSV Export</button> 
                <button onClick={exportToPDF} className="px-3.5 py-1.5 text-xs font-bold bg-white/80 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all">📄 PDF Report</button> 
              </div>
            </div>

            {/* SELECTION SEARCH INPUT BLOCKS */}
            <div className="grid gap-3 sm:grid-cols-3 mb-6 bg-white/30 p-2.5 border border-white/60 rounded-xl shadow-inner">
              <input type="text" placeholder="Search title query..." className="p-2 bg-white/80 border border-slate-200/60 rounded-lg text-xs focus:outline-none text-slate-700 placeholder:text-slate-400" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} /> 
              <select className="p-2 bg-white/80 border border-slate-200/60 rounded-lg text-xs text-slate-500 focus:outline-none cursor-pointer" value={filterType} onChange={e => setFilterType(e.target.value)}>
                <option value="all">All Flows</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select> 
              <select className="p-2 bg-white/80 border border-slate-200/60 rounded-lg text-xs text-slate-500 focus:outline-none cursor-pointer" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                <option value="all">All Categories</option>
                <option value="Food">Food</option>
                <option value="Rent">Rent</option>
                <option value="Utilities">Utilities</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Salary">Salary</option>
              </select> 
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 text-xs uppercase tracking-wider font-bold">
                    <th className="pb-3.5 font-bold">Title</th>
                    <th className="pb-3.5 font-bold">Category</th>
                    <th className="pb-3.5 font-bold">Type</th>
                    <th className="pb-3.5 font-bold">Amount</th>
                    <th className="pb-3.5 font-bold">Date</th>
                    <th className="pb-3.5 font-bold text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan="6" className="text-center py-6 text-slate-400 font-mono tracking-widest animate-pulse">Syncing Array...</td></tr> 
                  ) : filteredTransactions.length === 0 ? (
                    <tr><td colSpan="6" className="py-8 text-center text-slate-400 font-mono">No matching records compiled.</td></tr> 
                  ) : (
                    filteredTransactions.map((tx) => (
                      <tr key={tx._id} className="hover:bg-white/40 transition-colors duration-150">
                        <td className="py-3.5 font-semibold text-slate-700">{tx.description}</td> 
                        <td className="py-3.5 text-slate-500 font-medium">{tx.category}</td> 
                        <td className="py-3.5">
                          <span className={`px-2.5 py-0.5 font-bold rounded-full ${tx.type === 'income' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'} border`}>
                            {tx.type === 'income' ? 'Income' : 'Expense'}
                          </span> 
                        </td>
                        <td className="py-3.5 font-mono font-bold text-slate-800">{formatINR(tx.amount)}</td> 
                        <td className="py-3.5 text-slate-500 font-medium">{new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td> 
                        <td className="py-3.5 text-center space-x-1.5">
                          <button onClick={() => openEditModal(tx)} className="px-2.5 py-1 font-bold bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all">Edit</button> 
                          <button onClick={() => handleDeleteTransaction(tx._id)} className="px-2.5 py-1 font-bold bg-white border border-rose-100 rounded-lg text-rose-600 hover:bg-rose-50 transition-all">Delete</button> 
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

      {/* ROW EDIT DIALOG MODAL BOX */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/10 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/90 bg-white/80 p-5 shadow-2xl relative backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 mb-4">Modify Parameters</h3>
            <form onSubmit={handleUpdateTransaction} className="space-y-3.5"> 
              <input type="text" required className="w-full px-4 py-2.5 bg-white/60 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:border-cyan-500" value={editDescription} onChange={e => setEditDescription(e.target.value)} /> 
              <input type="number" required step="0.01" className="w-full px-4 py-2.5 bg-white/60 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:border-cyan-500 font-mono" value={editAmount} onChange={e => setEditAmount(e.target.value)} /> 
              <div className="grid grid-cols-2 gap-3">
                <select className="w-full px-3 py-2.5 bg-white/60 border border-slate-200 rounded-xl text-slate-500 text-sm focus:outline-none cursor-pointer" value={editType} onChange={e => setEditType(e.target.value)}>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select> 
                <select className="w-full px-3 py-2.5 bg-white/60 border border-slate-200 rounded-xl text-slate-500 text-sm focus:outline-none cursor-pointer" value={editCategory} onChange={e => setEditCategory(e.target.value)}>
                  <option value="Food">Food</option>
                  <option value="Rent">Rent</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Salary">Salary</option>
                </select> 
              </div>
              <div className="flex space-x-2 pt-2 justify-end">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-3.5 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-200 transition-all">Cancel</button> 
                <button type="submit" className="px-3.5 py-2 bg-slate-950 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-900 shadow-md transition-all">Save Changes</button> 
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;