import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, LogOut, Shield, Settings, ChevronRight, Camera, Loader2, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({ name: '', email: '' });
  const [updateLoading, setUpdateLoading] = useState(false);
  const navigate = useNavigate();

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/users/profile');
      setUser(data);
      setEditData({ name: data.name, email: data.email });
      
      const stored = localStorage.getItem('userInfo');
      if (stored) {
        const parsed = JSON.parse(stored);
        localStorage.setItem('userInfo', JSON.stringify({ ...data, token: parsed.token }));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [navigate]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    try {
      const { data } = await api.put('/users/profile', editData);
      setUser(data);
      // Update local storage with new data but keep the token
      const currentInfo = JSON.parse(localStorage.getItem('userInfo'));
      localStorage.setItem('userInfo', JSON.stringify({ ...data, token: currentInfo.token }));
      setShowEditModal(false);
      alert('Profile updated successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating profile');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
    window.location.reload();
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-4">
      <Loader2 size={48} className="animate-spin text-primary-600" />
      <p className="text-slate-500 font-medium font-mono uppercase tracking-widest text-sm">Synchronizing Account...</p>
    </div>
  );

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Column: Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass p-8 rounded-[2.5rem] flex flex-col items-center text-center space-y-4"
          >
            <div className="relative group">
              <div className="w-32 h-32 rounded-full bg-primary-100 flex items-center justify-center border-4 border-white shadow-xl overflow-hidden">
                <User size={64} className="text-primary-600" />
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-slate-100 text-primary-600 hover:scale-110 transition-transform">
                <Camera size={18} />
              </button>
            </div>
            
            <div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{user.name}</h2>
              <p className="text-slate-500 italic font-medium">{user.email}</p>
            </div>

            <div className="w-full pt-4">
              <button 
                onClick={handleLogout}
                className="w-full py-4 bg-slate-50 text-red-500 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
              >
                <LogOut size={20} /> Sign Out
              </button>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Settings */}
        <div className="md:col-span-2 space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <header className="space-y-1">
              <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight">Account Settings</h1>
              <p className="text-slate-500 italic font-medium">Manage your identity and preferences</p>
            </header>

            <div className="grid gap-4">
              {[
                { 
                  icon: <User className="text-primary-500" />, 
                  title: "Personal Info", 
                  desc: "Update your name and profile details", 
                  action: "Edit",
                  onClick: () => setShowEditModal(true)
                },
                { icon: <Mail className="text-amber-500" />, title: "Email Settings", desc: "Manage notification preferences", action: "Coming Soon" },
                { icon: <Shield className="text-emerald-500" />, title: "Security", desc: "Change password and protect account", action: "Coming Soon" },
                { icon: <Settings className="text-slate-500" />, title: "Preferences", desc: "Customize your dashboard view", action: "Coming Soon" }
              ].map((item, i) => (
                <div 
                  key={i}
                  onClick={item.onClick}
                  className={`glass p-6 rounded-3xl flex items-center gap-6 transition-all group ${item.onClick ? 'hover:bg-white/90 cursor-pointer' : 'opacity-70'}`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 uppercase tracking-tight">{item.title}</h3>
                    <p className="text-sm text-slate-400 italic">{item.desc}</p>
                  </div>
                  <button className="text-slate-400 group-hover:text-primary-600 flex items-center gap-1 font-bold text-sm uppercase tracking-widest transition-colors font-mono">
                    {item.action} {item.onClick && <ChevronRight size={16} />}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowEditModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full -mr-16 -mt-16 blur-2xl opacity-50" />
              
              <div className="relative space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Edit Personal Info</h2>
                  <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <X size={20} className="text-slate-400" />
                  </button>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-primary-100 outline-none transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={editData.email}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-primary-100 outline-none transition-all font-medium"
                    />
                  </div>
                  
                  <div className="pt-4">
                    <button 
                      type="submit"
                      disabled={updateLoading}
                      className="w-full py-4 bg-primary-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-primary-700 transition-all shadow-xl shadow-primary-200 flex items-center justify-center gap-2"
                    >
                      {updateLoading ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Save Changes</>}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
