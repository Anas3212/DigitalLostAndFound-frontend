import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Browse from './pages/Browse';
import ReportItem from './pages/ReportItem';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ItemDetails from './pages/ItemDetails';
import Profile from './pages/Profile';
import PublicItemView from './pages/PublicItemView';
import SmartMatchMap from './pages/SmartMatchMap';

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Navbar />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/report" element={<ReportItem />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/items/:id" element={<ItemDetails />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/public-item/:id" element={<PublicItemView />} />
            <Route path="/nearby" element={<SmartMatchMap />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
