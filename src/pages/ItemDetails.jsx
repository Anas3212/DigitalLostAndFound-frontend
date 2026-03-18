import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { 
  MapPin, 
  Calendar, 
  Tag, 
  User, 
  Mail,
  Phone,
  ArrowLeft, 
  ShieldCheck, 
  Upload, 
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import QRGenerator from '../components/QRGenerator';

const ItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimData, setClaimData] = useState({ description: '', contactPhone: userInfo?.phoneNumber || '', proofImage: null });
  const [claimLoading, setClaimLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    tags: ''
  });
  const [copiedIndex, setCopiedIndex] = useState(null);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const { data } = await api.get(`/items/${id}`);
        setItem(data);
        setEditData({
          title: data.title,
          description: data.description,
          category: data.category,
          location: data.location,
          tags: data.tags?.join(', ') || ''
        });
      } catch (error) {
        console.error('Error fetching item:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`/items/${id}`);
      alert('Item deleted successfully');
      navigate('/browse');
    } catch (error) {
      alert(error.response?.data?.message || 'Error deleting item');
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const { data } = await api.put(`/items/${id}`, {
        ...editData,
        tags: editData.tags.split(',').map(t => t.trim()).filter(t => t)
      });
      setItem(data);
      alert('Item updated successfully');
      setShowEditModal(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating item');
    } finally {
      setEditLoading(false);
    }
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    if (!userInfo) {
      alert('Please login to claim items');
      navigate('/login');
      return;
    }
    
    setClaimLoading(true);
    const formData = new FormData();
    formData.append('itemId', id);
    formData.append('description', claimData.description);
    formData.append('contactPhone', claimData.contactPhone);
    if (claimData.proofImage) {
      formData.append('proofImage', claimData.proofImage);
    }

    try {
      await api.post('/claims', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Claim submitted successfully!');
      setShowClaimModal(false);
      navigate('/dashboard');
    } catch (error) {
      alert(error.response?.data?.message || 'Error submitting claim');
    } finally {
      setClaimLoading(false);
    }
  };


  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-4">
      <Loader2 size={48} className="animate-spin text-primary-600" />
      <p className="text-slate-500 font-medium font-mono uppercase tracking-widest">Scanning Database...</p>
    </div>
  );

  if (!item) return <div className="text-center py-20 font-bold text-red-500 uppercase">Item not found</div>;

  const isOwner = userInfo?._id === (item.reportedBy?._id || item.reportedBy);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <Link to="/browse" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary-600 transition-colors font-bold uppercase tracking-tight">
        <ArrowLeft size={20} /> Back to browse
      </Link>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Left: Image */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="relative group h-[500px] rounded-[3rem] overflow-hidden shadow-2xl bg-slate-50">
            {item.images?.length > 0 ? (
              <>
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={activeImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    src={item.images[activeImage]} 
                    className="w-full h-full object-cover" 
                    alt={item.title} 
                  />
                </AnimatePresence>
                
                {item.images.length > 1 && (
                  <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => setActiveImage(prev => (prev === 0 ? item.images.length - 1 : prev - 1))}
                      className="p-3 bg-white/80 backdrop-blur-md rounded-full text-slate-900 shadow-xl hover:bg-white transition-all"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button 
                      onClick={() => setActiveImage(prev => (prev === item.images.length - 1 ? 0 : prev + 1))}
                      className="p-3 bg-white/80 backdrop-blur-md rounded-full text-slate-900 shadow-xl hover:bg-white transition-all"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <img 
                src="https://via.placeholder.com/800x600?text=No+Image" 
                className="w-full h-full object-cover" 
                alt="No Image" 
              />
            )}
            
            <div className={`absolute top-8 left-8 px-6 py-2 rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-xl z-10 ${
              item.type === 'lost' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
            }`}>
              {item.type}
            </div>
          </div>

          {/* Thumbnails */}
          {item.images?.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
              {item.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 transition-all border-4 ${
                    activeImage === idx ? 'border-primary-600 scale-105 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} className="w-full h-full object-cover" alt={`Thumb ${idx}`} />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Right: Info */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8 flex flex-col justify-center"
        >
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 leading-tight uppercase tracking-tighter">
              {item.title}
            </h1>
            <div className="flex flex-wrap gap-3">
              <span className="px-4 py-1.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-widest">{item.category}</span>
              <span className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest ${
                item.status === 'active' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'
              }`}>{item.status}</span>
            </div>
          </div>

          <p className="text-xl text-slate-500 leading-relaxed italic font-medium">
            "{item.description}"
          </p>

          <div className="grid grid-cols-2 gap-6 pt-4">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Location</p>
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <MapPin size={18} className="text-primary-600" />
                <span>{item.location}</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date Reported</p>
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <Calendar size={18} className="text-primary-600" />
                <span>{new Date(item.date).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="space-y-1 col-span-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reported By</p>
              <div className="flex items-center gap-2 text-slate-900 font-bold capitalize">
                <User size={18} className="text-primary-600" />
                <span>{item.reportedBy?.name || 'Anonymous User'}</span>
              </div>
              <div className="flex flex-col gap-1 mt-2">
                <div className="flex items-center gap-2 text-slate-500 text-sm italic">
                  <Mail size={14} />
                  <span>{item.reportedBy?.email || 'N/A'}</span>
                </div>
                {item.reportedBy?.phoneNumber && (
                  <div className="flex items-center gap-2 text-slate-500 text-sm italic">
                    <Phone size={14} />
                    <span>{item.reportedBy.phoneNumber}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-4">
            {item.tags?.map((tag, idx) => (
              <span key={idx} className="flex items-center gap-1.5 bg-primary-50 text-primary-700 px-4 py-2 rounded-2xl text-xs font-bold uppercase tracking-tight border border-primary-100 italic">
                <Tag size={14} />
                #{tag}
              </span>
            ))}
          </div>

          {!isOwner && item.status === 'active' && (
            <button 
              onClick={() => setShowClaimModal(true)}
              className="mt-8 w-full py-6 bg-primary-600 text-white rounded-[2.5rem] font-black text-2xl hover:bg-primary-700 hover:shadow-[0_20px_50px_rgba(124,58,237,0.3)] transition-all flex items-center justify-center gap-4 uppercase tracking-[0.1em] active:scale-95 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <ShieldCheck className="w-8 h-8 group-hover:rotate-12 transition-transform" />
              {item.type === 'found' ? 'Claim this item' : 'I Found This'}
            </button>
          )}

          {item.type === 'lost' && (
            <button 
              onClick={() => setShowQr(true)}
              className="mt-4 w-full py-4 bg-indigo-50 text-indigo-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-100 transition-all uppercase tracking-widest text-sm border border-indigo-100 group"
            >
              <Share2 size={18} className="group-hover:rotate-12 transition-transform" />
              Share Lost QR
            </button>
          )}

          {isOwner && (
            <div className="space-y-6">
              <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                  <button 
                    onClick={() => setShowEditModal(true)}
                    className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all uppercase tracking-widest text-sm"
                  >
                    <Edit3 size={18} /> Edit Report
                  </button>
                  <button 
                    onClick={handleDelete}
                    disabled={deleteLoading}
                    className="flex-1 py-4 bg-red-50 text-red-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-all uppercase tracking-widest text-sm"
                  >
                    {deleteLoading ? <Loader2 size={18} className="animate-spin" /> : <><Trash2 size={18} /> Delete</>}
                  </button>
                </div>
              </div>

              <div className="p-6 bg-primary-50 rounded-3xl space-y-4 border border-primary-100">
                <div className="flex items-center gap-2 text-primary-900 font-bold uppercase text-xs tracking-widest">
                  <ExternalLink size={16} /> Image Assets (URLs)
                </div>
                <div className="space-y-2">
                  {item.images?.map((url, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white/50 p-2 rounded-xl border border-primary-100">
                      <span className="text-[10px] font-mono text-primary-600 truncate flex-1">{url}</span>
                      <button 
                        onClick={() => copyToClipboard(url, idx)}
                        className="p-1.5 hover:bg-primary-100 rounded-lg transition-colors text-primary-600"
                      >
                        {copiedIndex === idx ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-slate-50 rounded-3xl flex items-center gap-4 text-slate-600 italic font-medium border border-slate-100 text-sm">
                <AlertCircle className="text-primary-600 shrink-0" size={20} />
                Manage this report and any incoming claims here or in your dashboard.
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirm(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-10 text-center"
            >
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 size={40} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-2">Delete Report?</h2>
              <p className="text-slate-500 italic mb-8">This action is permanent and cannot be undone.</p>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all uppercase tracking-widest text-xs"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  disabled={deleteLoading}
                  className="flex-[2] py-4 bg-red-600 text-white rounded-2xl font-black hover:bg-red-700 transition-all shadow-xl shadow-red-200 uppercase tracking-widest text-xs disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleteLoading ? <Loader2 className="animate-spin" size={16} /> : 'Yes, Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowEditModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-10 overflow-y-auto max-h-[90vh]"
            >
              <div className="relative space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Edit Report</h2>
                  <p className="text-slate-500 italic">Update your item description and details</p>
                </div>

                <form onSubmit={handleUpdate} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Title</label>
                      <input 
                        type="text"
                        value={editData.title}
                        onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary-100 outline-none transition-all font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Category</label>
                      <select 
                        value={editData.category}
                        onChange={(e) => setEditData(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary-100 outline-none transition-all font-bold"
                      >
                        {['Electronics', 'Documents', 'Books', 'Clothing', 'Accessories', 'Others'].map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Description</label>
                    <textarea 
                      rows="3"
                      value={editData.description}
                      onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary-100 outline-none transition-all resize-none italic"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Location</label>
                      <input 
                        type="text"
                        value={editData.location}
                        onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary-100 outline-none transition-all font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Tags (comma separated)</label>
                      <input 
                        type="text"
                        value={editData.tags}
                        onChange={(e) => setEditData(prev => ({ ...prev, tags: e.target.value }))}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary-100 outline-none transition-all font-bold"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button 
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-2xl font-bold uppercase tracking-widest hover:bg-slate-100 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={editLoading}
                      className="flex-[2] py-4 bg-primary-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-primary-700 transition-all shadow-xl shadow-primary-200 flex items-center justify-center gap-2"
                    >
                      {editLoading ? <Loader2 className="animate-spin" /> : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Claim Modal */}
      <AnimatePresence>
        {showClaimModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowClaimModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-xl rounded-[3rem] shadow-2xl p-10 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
              
              <div className="relative space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
                    {item.type === 'found' ? 'Submit a Claim' : 'Respond with Match'}
                  </h2>
                  <p className="text-slate-500 italic">
                    {item.type === 'found' 
                      ? 'Provide proof that this item belongs to you' 
                      : 'Provide details about the item you found to help the owner'}
                  </p>
                </div>

                <form onSubmit={handleClaimSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">How is it yours?</label>
                    <textarea 
                      required
                      rows="4"
                      placeholder="Describe unique features, when you lost it, etc..."
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary-100 outline-none transition-all resize-none italic"
                      onChange={(e) => setClaimData(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Your Contact Phone</label>
                    <input 
                      type="text"
                      placeholder="e.g. +1 234 567 890"
                      value={claimData.contactPhone}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary-100 outline-none transition-all font-bold"
                      onChange={(e) => setClaimData(prev => ({ ...prev, contactPhone: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Attach Proof (Photo)</label>
                    <div 
                      onClick={() => document.getElementById('proof-upload').click()}
                      className="relative cursor-pointer w-full h-40 border-4 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center hover:border-primary-200 hover:bg-primary-50 transition-all group overflow-hidden"
                    >
                      {preview ? (
                        <img src={preview} alt="Proof" className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <Upload size={32} className="text-slate-300 group-hover:text-primary-400 transition-colors mb-2" />
                          <p className="text-slate-400 group-hover:text-primary-600 font-bold uppercase text-xs tracking-widest">Select Image</p>
                        </>
                      )}
                    </div>
                    <input 
                      id="proof-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setClaimData(prev => ({ ...prev, proofImage: file }));
                          setPreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button 
                      type="button"
                      onClick={() => setShowClaimModal(false)}
                      className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-2xl font-bold uppercase tracking-widest hover:bg-slate-100 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={claimLoading}
                      className="flex-[2] py-4 bg-primary-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-primary-700 transition-all shadow-xl shadow-primary-200 flex items-center justify-center gap-2"
                    >
                      {claimLoading ? <Loader2 className="animate-spin" /> : (item.type === 'found' ? 'Submit Claim' : 'Submit Response')}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showQr && (
          <QRGenerator 
            item={item} 
            type="digital" 
            onClose={() => setShowQr(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ItemDetails;
