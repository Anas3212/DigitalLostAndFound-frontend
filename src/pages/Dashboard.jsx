import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Package, CheckCircle, Clock, XCircle, ChevronRight, Inbox, ShieldCheck, Check, X, MessageSquare, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import QRGenerator from '../components/QRGenerator';

const Dashboard = () => {
  const [myItems, setMyItems] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [claimsOnMyItems, setClaimsOnMyItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [qrItem, setQrItem] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgLoading, setMsgLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [itemsRes, claimsRes, claimsOnItemsRes, messagesRes] = await Promise.all([
        api.get('/items/myitems'),
        api.get('/claims/myclaims'),
        api.get('/claims/on-my-items'),
        api.get('/messages')
      ]);
      setMyItems(itemsRes.data);
      setMyClaims(claimsRes.data);
      setClaimsOnMyItems(claimsOnItemsRes.data);
      setMessages(messagesRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/messages/${id}/read`);
      setMessages(prev => prev.map(m => m._id === id ? { ...m, isRead: true } : m));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const [activeInquiryItem, setActiveInquiryItem] = useState(null);

  const handleUpdateClaimStatus = async (claimId, status) => {
    setActionLoading(claimId);
    try {
      await api.put(`/claims/${claimId}`, { status });
      await fetchData();
      // If we are in the dialog, refresh the item data for the dialog too
      if (activeInquiryItem) {
        const itemClaims = claimsOnMyItems.filter(c => c.item._id === activeInquiryItem.item._id);
        const itemMessages = messages.filter(m => m.item?._id === activeInquiryItem.item._id);
        setActiveInquiryItem(prev => ({
          ...prev,
          claims: itemClaims,
          messages: itemMessages
        }));
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating claim');
    } finally {
      setActionLoading(null);
    }
  };

  const groupedInquiries = myItems.reduce((acc, item) => {
    const itemClaims = claimsOnMyItems.filter(c => c.item._id === item._id);
    const itemMessages = messages.filter(m => m.item?._id === item._id);

    if (itemClaims.length > 0 || itemMessages.length > 0) {
      acc[item._id] = {
        item,
        claims: itemClaims,
        messages: itemMessages
      };
    }
    return acc;
  }, {});

  const handleResolveItem = async (itemId) => {
    if (!window.confirm('Mark this item as resolved? It will be hidden from public and locked for edits.')) return;
    try {
      await api.put(`/items/${itemId}/resolve`);
      await fetchData();
      if (activeInquiryItem?.item._id === itemId) setActiveInquiryItem(null);
    } catch (error) {
      alert(error.response?.data?.message || 'Error resolving item');
    }
  };

  const StatusBadge = ({ status }) => {
    const configs = {
      pending: { color: 'bg-amber-100 text-amber-700', icon: <Clock size={14} /> },
      approved: { color: 'bg-green-100 text-green-700', icon: <CheckCircle size={14} /> },
      rejected: { color: 'bg-red-100 text-red-700', icon: <XCircle size={14} /> },
      active: { color: 'bg-blue-100 text-blue-700', icon: <Inbox size={14} /> },
      resolved: { color: 'bg-slate-100 text-slate-700', icon: <CheckCircle size={14} /> },
    };
    const config = configs[status] || configs.pending;
    return (
      <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${config.color}`}>
        {config.icon} {status}
      </span>
    );
  };

  if (loading) return <div className="py-20 text-center animate-pulse text-primary-600 font-bold uppercase tracking-widest">Loading Dashboard...</div>;

  return (
    <div className="space-y-12 pb-20">
      <header className="space-y-2">
        <h1 className="text-5xl font-black text-slate-900 uppercase tracking-tighter text-gradient inline-block">Your activity</h1>
        <p className="text-lg text-slate-500 italic font-medium">Coordinate returns and manage your reports</p>
      </header>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* My Reports */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b-4 border-primary-600 pb-2">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <Package size={24} className="text-primary-600" />
              My Reports
            </h2>
            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-bold text-sm">{myItems.length}</span>
          </div>
          
          <div className="space-y-4">
            {myItems.filter(i => i.type !== 'personal').length === 0 ? (
              <div className="p-8 text-center glass rounded-3xl text-slate-400 italic font-medium">No items reported yet.</div>
            ) : (
              myItems.filter(i => i.type !== 'personal').map(item => (
                <Link to={`/items/${item._id}`} key={item._id} className="glass p-4 rounded-2xl flex items-center gap-4 hover:bg-white/90 transition-all cursor-pointer group block">
                  <img src={item.images?.[0] || 'https://placehold.co/150'} className="w-16 h-16 rounded-xl object-cover shrink-0" alt="" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors uppercase tracking-tight truncate">{item.title}</h3>
                    <p className="text-xs text-slate-400">{new Date(item.date).toLocaleDateString()}</p>
                  </div>
                  <div className="shrink-0"><StatusBadge status={item.status} /></div>
                  <ChevronRight size={20} className="text-slate-300 group-hover:text-primary-600 transition-transform group-hover:translate-x-1 shrink-0" />
                </Link>
              ))
            )}
          </div>
        </div>

        {/* My Belongings (Physical QR Tags) */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b-4 border-indigo-500 pb-2">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <ShieldCheck size={24} className="text-indigo-500" />
              My Belongings
            </h2>
            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-bold text-sm">
              {myItems.filter(i => i.type === 'personal').length}
            </span>
          </div>

          <div className="space-y-4">
            {myItems.filter(i => i.type === 'personal').length === 0 ? (
              <div className="p-8 text-center glass rounded-3xl text-slate-400 italic font-medium">
                No belongings registered yet. Register items to get QR tags!
              </div>
            ) : (
              myItems.filter(i => i.type === 'personal').map(item => (
                <div key={item._id} className="glass p-4 rounded-2xl flex items-center gap-4 hover:bg-white/90 transition-all group">
                  <img src={item.images?.[0] || 'https://placehold.co/150'} className="w-16 h-16 rounded-xl object-cover shrink-0" alt="" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 uppercase tracking-tight truncate">{item.title}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Protected Item</p>
                  </div>
                  <button 
                    onClick={() => setQrItem({ ...item, qrType: 'physical' })}
                    className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100"
                  >
                    Generate Tag
                  </button>
                </div>
              ))
            )}
          </div>
          <Link to="/report" className="block w-full py-4 bg-slate-50 text-slate-400 rounded-2xl border-2 border-dashed border-slate-100 text-center font-bold uppercase tracking-widest text-xs hover:border-indigo-300 hover:text-indigo-500 transition-all">
            + Register New Belonging
          </Link>
        </div>

        {/* My Claims */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b-4 border-primary-500 pb-2">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <Inbox size={24} className="text-primary-500" />
              My Claims
            </h2>
            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-bold text-sm">{myClaims.length}</span>
          </div>

          <div className="space-y-4">
            {myClaims.length === 0 ? (
              <div className="p-8 text-center glass rounded-3xl text-slate-400 italic font-medium">No claims made yet.</div>
            ) : (
              myClaims.map(claim => (
                <Link to={`/items/${claim.item._id}`} key={claim._id} className="glass p-4 rounded-2xl flex items-center gap-4 hover:bg-white/90 transition-all cursor-pointer group block">
                  <img src={claim.item.images?.[0] || 'https://placehold.co/150'} className="w-16 h-16 rounded-xl object-cover shrink-0" alt="" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight truncate">{claim.item.title}</h3>
                    <p className="text-xs text-slate-400 italic">Claimed on {new Date(claim.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="shrink-0"><StatusBadge status={claim.status} /></div>
                  <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-600 transition-transform group-hover:translate-x-1 shrink-0" />
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Inquiry Hub Section */}
      <div className="space-y-8 pt-12">
        <div className="flex items-center justify-between border-b-4 border-indigo-600 pb-3">
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
            <ShieldCheck size={32} className="text-indigo-600" />
            Active Inquiries Hub
          </h2>
          <span className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-2xl font-black text-sm border border-indigo-100 italic">
            {Object.keys(groupedInquiries).length} Items with Responses
          </span>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Object.keys(groupedInquiries).length === 0 ? (
            <div className="col-span-full p-16 text-center glass rounded-[3rem] text-slate-400 italic font-medium bg-white/40">
              <Search size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-xl">Your inquiry hub is empty. No one has reached out yet.</p>
            </div>
          ) : (
            Object.values(groupedInquiries).map(({ item, claims, messages: itemMsgs }) => (
              <motion.div 
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setActiveInquiryItem({ item, claims, messages: itemMsgs })}
                className="group relative cursor-pointer"
              >
                <div className="glass p-6 rounded-[2.5rem] border-2 border-white hover:border-indigo-100 transition-all hover:shadow-2xl hover:shadow-indigo-100/50 bg-white/80">
                  <div className="flex items-center gap-4 mb-4">
                    <img src={item.images?.[0] || 'https://placehold.co/150'} className="w-20 h-20 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform" alt="" />
                    <div className="flex-1 min-w-0">
                      <div className="flex gap-1.5 mb-1">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 text-[8px] font-black uppercase tracking-widest">{item.type}</span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-50 text-slate-500 text-[8px] font-black uppercase tracking-widest">{item.status}</span>
                      </div>
                      <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight truncate">{item.title}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{item.category}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-tight">
                      {claims.length > 0 && <span className="text-accent-600">{claims.length} Requests</span>}
                      {itemMsgs.length > 0 && <span className="text-indigo-600">{itemMsgs.length} Messages</span>}
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Inquiry Dialog Modal */}
      <AnimatePresence>
        {activeInquiryItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveInquiryItem(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-full max-w-5xl bg-white rounded-[3.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-8 md:p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-6">
                  <img src={activeInquiryItem.item.images?.[0] || 'https://placehold.co/150'} className="w-20 h-20 rounded-[1.5rem] object-cover shadow-md" alt="" />
                  <div>
                    <div className="flex gap-2 mb-2">
                       <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                         activeInquiryItem.item.type === 'lost' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                       }`}>{activeInquiryItem.item.type}</span>
                       <StatusBadge status={activeInquiryItem.item.status} />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">{activeInquiryItem.item.title}</h2>
                    <p className="text-xs text-slate-400 font-medium italic mt-1">{activeInquiryItem.item.location} • {new Date(activeInquiryItem.item.date).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {activeInquiryItem.item.status === 'active' && (
                    <button 
                      onClick={() => handleResolveItem(activeInquiryItem.item._id)}
                      className="hidden md:flex px-6 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] items-center gap-2 hover:bg-slate-800 transition-all shadow-lg"
                    >
                      <Check size={16} /> Mark as Resolved
                    </button>
                  )}
                  <button onClick={() => setActiveInquiryItem(null)} className="p-4 bg-white rounded-[1.5rem] text-slate-400 hover:text-slate-900 border border-slate-100 hover:border-slate-300 transition-all shadow-sm">
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-8 md:p-10 space-y-12">
                <div className="grid lg:grid-cols-2 gap-12">
                  {/* Formal Requests */}
                  <div className="space-y-6">
                    <h4 className="flex items-center gap-3 text-sm font-black text-slate-400 uppercase tracking-[0.25em] px-2 mb-4">
                      <ShieldCheck size={20} className="text-accent-500" />
                      Formal Requests ({activeInquiryItem.claims.length})
                    </h4>
                    <div className="space-y-6">
                      {activeInquiryItem.claims.length === 0 ? (
                        <p className="text-slate-300 italic text-sm p-4 border-2 border-dashed border-slate-50 rounded-3xl text-center">No formal claims yet.</p>
                      ) : (
                        activeInquiryItem.claims.map(claim => (
                          <div key={claim._id} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-accent-50 flex items-center justify-center font-bold text-accent-600 text-xs uppercase shadow-inner">
                                  {claim.claimant?.name?.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-slate-900 uppercase tracking-tight">{claim.claimant?.name}</p>
                                  <p className="text-[10px] text-slate-400 italic">{claim.claimant?.email}</p>
                                </div>
                              </div>
                              <StatusBadge status={claim.status} />
                            </div>
                            <p className="text-sm text-slate-600 italic bg-white p-4 rounded-2xl shadow-sm border border-slate-100/50">"{claim.description}"</p>
                            {claim.proofImage && (
                              <img src={claim.proofImage} alt="Proof" className="w-full aspect-video rounded-2xl object-cover shadow-sm border border-white" />
                            )}
                            {claim.status === 'pending' && activeInquiryItem.item.status === 'active' && (
                              <div className="flex gap-3 pt-2">
                                <button 
                                  onClick={() => handleUpdateClaimStatus(claim._id, 'approved')} 
                                  className="flex-[1.5] py-3 bg-green-500 text-white rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-100 hover:bg-green-600 transition-colors"
                                >
                                  {activeInquiryItem.item.type === 'found' ? 'Approve Claim' : 'Confirm Match'}
                                </button>
                                <button 
                                  onClick={() => handleUpdateClaimStatus(claim._id, 'rejected')} 
                                  className="flex-1 py-3 bg-white text-slate-400 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest border border-slate-100 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all"
                                >
                                  {activeInquiryItem.item.type === 'found' ? 'Decline' : 'Not My Item'}
                                </button>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Direct Messages */}
                  <div className="space-y-6">
                    <h4 className="flex items-center gap-3 text-sm font-black text-slate-400 uppercase tracking-[0.25em] px-2 mb-4">
                      <MessageSquare size={20} className="text-indigo-500" />
                      Direct Messages ({activeInquiryItem.messages.length})
                    </h4>
                    <div className="space-y-6">
                      {activeInquiryItem.messages.length === 0 ? (
                        <p className="text-slate-300 italic text-sm p-4 border-2 border-dashed border-slate-50 rounded-3xl text-center">No messages yet.</p>
                      ) : (
                        activeInquiryItem.messages.map(msg => (
                          <div key={msg._id} className={`p-6 rounded-[2rem] border transition-all ${
                            msg.isRead ? 'bg-white border-slate-100 opacity-80' : 'bg-indigo-50/50 border-indigo-100 text-shadow-sm'
                          }`}>
                            <div className="flex items-center justify-between mb-4">
                              <p className="text-xs font-black text-slate-900 uppercase">From: {msg.senderName}</p>
                              {!msg.isRead && (
                                <button onClick={() => handleMarkAsRead(msg._id)} className="p-2 bg-indigo-600 text-white rounded-lg shadow-md hover:scale-105 transition-transform">
                                  <Check size={14} />
                                </button>
                              )}
                            </div>
                            <p className="text-sm text-slate-600 italic leading-relaxed">"{msg.content}"</p>
                            <div className="mt-4 pt-4 border-t border-slate-100/50 text-[9px] text-slate-400 font-bold uppercase flex justify-between">
                              <span>Received</span>
                              <span>{new Date(msg.createdAt).toLocaleString()}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Resolve Button */}
              <div className="md:hidden p-6 border-t border-slate-100 bg-white">
                {activeInquiryItem.item.status === 'active' && (
                  <button 
                    onClick={() => handleResolveItem(activeInquiryItem.item._id)}
                    className="w-full py-4 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3"
                  >
                    <Check size={20} /> Mark as Resolved
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {qrItem && (
          <QRGenerator 
            item={qrItem} 
            type={qrItem.qrType} 
            onClose={() => setQrItem(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
