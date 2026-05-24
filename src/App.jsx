import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/dashboard';
import AnalyticsPage from './pages/AnalyticsPage'; 
import TransactionsPage from './pages/TransactionsPage'; 
import { useAuth } from './context/AuthContext';

export default function App() {
  const { isAuthenticated } = useAuth(); //

  return (
    <Routes>
      <Route 
        path="/login" 
        element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />} //
      />
      <Route 
        path="/dashboard" 
        element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />} //
      />
      <Route 
        path="/analytics" 
        element={isAuthenticated ? <AnalyticsPage /> : <Navigate to="/login" />} //
      />
      <Route 
        path="/transactions" 
        element={isAuthenticated ? <TransactionsPage /> : <Navigate to="/login" />} 
      />
      <Route path="*" element={<Navigate to="/login" />} /> {/* */}
    </Routes>
  );
}