import React, { useEffect, useState } from 'react';
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import api from '../services/api';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function AnalyticsPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [doughnutData, setDoughnutData] = useState(null);
  const [barData, setBarData] = useState(null);

  // Filter States
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedType, setSelectedType] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const months = [
    { label: "January", value: "0" }, { label: "February", value: "1" },
    { label: "March", value: "2" }, { label: "April", value: "3" },
    { label: "May", value: "4" }, { label: "June", value: "5" },
    { label: "July", value: "6" }, { label: "August", value: "7" },
    { label: "September", value: "8" }, { label: "October", value: "9" },
    { label: "November", value: "10" }, { label: "December", value: "11" }
  ];

  const fetchFilteredAnalytics = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedMonth) params.month = selectedMonth;
      if (selectedYear) params.year = selectedYear;
      if (selectedType) params.type = selectedType;
      if (selectedCategory) params.category = selectedCategory;

      const response = await api.get('/transactions/summary', { params });
      const summaryData = response.data || [];

      const expenseItems = summaryData.filter(item => item._id?.type === 'expense');
      const doughnutCategories = expenseItems.map(item => item._id?.category || 'Uncategorized');
      const doughnutAmounts = expenseItems.map(item => item.totalAmount || 0);

      setDoughnutData({
        labels: doughnutCategories.length ? doughnutCategories : ['No Filter Matching Expenses'],
        datasets: [{
          data: doughnutAmounts.length ? doughnutAmounts : [0],
          backgroundColor: ['#22d3ee', '#818cf8', '#fbbf24', '#34d399', '#c084fc'],
          borderWidth: 0,
        }]
      });

      const incomeItems = summaryData.filter(item => item._id?.type === 'income');
      const barAmounts = [
        incomeItems.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0),
        expenseItems.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0)
      ];

      setBarData({
        labels: ['Inflow (Income)', 'Outflow (Expenses)'],
        datasets: [{
          data: barAmounts,
          backgroundColor: ['rgba(52, 211, 153, 0.25)', 'rgba(248, 113, 113, 0.25)'],
          borderColor: ['rgba(52, 211, 153, 0.8)', 'rgba(248, 113, 113, 0.8)'],
          borderWidth: 1.5,
          borderRadius: 8
        }]
      });

    } catch (error) {
      console.error("Failed syncing dynamic parameter summaries:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilteredAnalytics();
  }, [selectedMonth, selectedYear, selectedType, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#eddcd2]/30 text-slate-700 flex font-sans relative overflow-x-hidden selection:bg-cyan-500/20">
      {/* BACKGROUND AMBIENT GLOW ORBS */}
      <div className="absolute top-[-10%] left-[-5%] w-[700px] h-[700px] bg-gradient-to-tr from-[#ddbdfc]/40 to-[#8ecae6]/20 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[650px] h-[650px] bg-gradient-to-tr from-[#ffb5a7]/30 to-[#fcd5ce]/20 rounded-full blur-[130px] pointer-events-none" />

      {/* SIDEBAR NAVIGATION (FROSTED GLASS) */}
      <aside className="hidden md:flex w-64 flex-col justify-between border-r border-white/60 bg-white/40 backdrop-blur-xl z-10 shadow-[4px_0_24px_rgba(0,0,0,0.01)]">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-950 shadow-md flex items-center justify-center font-bold text-white text-base">E</div>
            <h1 className="text-lg font-bold tracking-tight text-slate-800">ExpenseTracker</h1>
          </div>
          <nav className="mt-12 space-y-1">
            <button onClick={() => navigate('/dashboard')} className="w-full rounded-xl px-4 py-3 text-left text-slate-500 hover:text-slate-900 hover:bg-white/40 border border-transparent transition-all duration-200">Dashboard</button>
            <button onClick={() => navigate('/transactions')} className="w-full rounded-xl px-4 py-3 text-left text-slate-500 hover:text-slate-900 hover:bg-white/40 border border-transparent transition-all duration-200">Transactions</button>
            <button onClick={() => navigate('/analytics')} className="w-full rounded-xl bg-white/80 border border-white px-4 py-3 text-left text-slate-900 font-bold shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex items-center space-x-3">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-800"></span>
              <span>Analytics</span>
            </button>
          </nav>
        </div>
        <div className="p-6">
          <button onClick={() => { logout(); navigate("/login"); }} className="w-full rounded-xl bg-slate-900/90 hover:bg-slate-900 border border-slate-950 px-4 py-3 font-semibold text-white shadow-md transition-all duration-200">Logout</button>
        </div>
      </aside>

      {/* CORE CONTROLS LAYOUT */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto z-10 relative">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <h2 className="text-2xl font-black tracking-tight text-slate-800">Macro Trend Analytics</h2>
          </div>

          {/* CONTROL FILTER PANEL (FROSTED GLASS) */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 border border-white/70 bg-white/40 p-4 rounded-2xl mb-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.03)] backdrop-blur-md shadow-inner">
            <div>
              {/* 🎨 VISIBILITY POLISH: Brightened field labels from text-slate-400 to text-slate-600 font-extrabold */}
              <label className="text-xs font-extrabold uppercase text-slate-600 tracking-wider block mb-2">Month</label>
              <select className="w-full p-2 bg-white/80 border border-slate-200/60 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none cursor-pointer" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
                <option value="">All Months (Full Year)</option>
                {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div>
              {/* 🎨 VISIBILITY POLISH: Brightened label */}
              <label className="text-xs font-extrabold uppercase text-slate-600 tracking-wider block mb-2">Year</label>
              <select className="w-full p-2 bg-white/80 border border-slate-200/60 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none cursor-pointer" value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
              </select>
            </div>
            <div>
              {/* 🎨 VISIBILITY POLISH: Brightened label */}
              <label className="text-xs font-extrabold uppercase text-slate-600 tracking-wider block mb-2">Flow Type</label>
              <select className="w-full p-2 bg-white/80 border border-slate-200/60 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none cursor-pointer" value={selectedType} onChange={e => setSelectedType(e.target.value)}>
                <option value="">All Flow Directions</option>
                <option value="income">Income Only</option>
                <option value="expense">Expense Only</option>
              </select>
            </div>
            <div>
              {/* 🎨 VISIBILITY POLISH: Brightened label */}
              <label className="text-xs font-extrabold uppercase text-slate-600 tracking-wider block mb-2">Category Filter</label>
              <select className="w-full p-2 bg-white/80 border border-slate-200/60 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none cursor-pointer" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                <option value="">All Categories</option>
                <option value="Food">Food</option>
                <option value="Rent">Rent</option>
                <option value="Utilities">Utilities</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Salary">Salary</option>
              </select>
            </div>
          </div>

          {/* EXPANDED CHARTS VISUALIZATION PLATES (FROSTED GLASS) */}
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/70 bg-white/40 p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.03)] min-h-[420px] flex flex-col justify-between backdrop-blur-md">
              <div>
                <h3 className="text-sm font-bold text-slate-800 tracking-tight">Category Expense Distribution</h3>
                {/* 🎨 VISIBILITY POLISH: Brightened sub-captions for sharper display readability */}
                <p className="text-xs text-slate-500 font-medium mt-1">Breaks down matching outgoing parameters across data streams.</p>
              </div>
              <div className="relative h-72 w-full flex items-center justify-center mt-4">
                {loading ? (
                  <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-slate-800 animate-spin"></div>
                ) : (
                  doughnutData && <Doughnut data={doughnutData} options={{ plugins: { legend: { position: 'bottom', labels: { color: '#475569', boxWidth: 6, font: { size: 10, weight: '700' } } } }, cutout: '78%', responsive: true, maintainAspectRatio: false }} />
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-white/70 bg-white/40 p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.03)] min-h-[420px] flex flex-col justify-between backdrop-blur-md">
              <div>
                <h3 className="text-sm font-bold text-slate-800 tracking-tight">Comparative Net Volume Matrix</h3>
                {/* 🎨 VISIBILITY POLISH: Brightened caption */}
                <p className="text-xs text-slate-500 font-medium mt-1">Aggregates cumulative total ledger weights to compute metrics side-by-side.</p>
              </div>
              <div className="relative h-72 w-full flex items-center justify-center mt-4">
                {loading ? (
                  <div className="flex items-end space-x-4 h-48 w-32 animate-pulse"><div className="bg-slate-100 w-12 h-3/4 rounded-t-lg"></div><div className="bg-slate-100 w-12 h-1/2 rounded-t-lg"></div></div>
                ) : (
                  barData && <Bar data={barData} options={{ plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#475569', font: { weight: '700', size: 10 } }, grid: { display: false } }, y: { ticks: { color: '#475569', font: { size: 10, weight: '600' } }, grid: { color: 'rgba(0,0,0,0.02)' } } }, responsive: true, maintainAspectRatio: false }} />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AnalyticsPage;