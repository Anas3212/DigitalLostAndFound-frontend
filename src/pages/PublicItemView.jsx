import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { MapPin, Calendar, Tag, User, ShieldCheck, Mail, MessageSquare, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PublicItemView = () => {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contactData, setContactData] = useState({ name: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchPublicItem = async () => {
      try {
        const { data } = await api.get(`/items/public/${id}`);
        setItem(data);
      } catch (error) {
        console.error('Error fetching public item:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPublicItem();
  }, [id]);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/messages', {
        itemId: id,
        name: contactData.name,
        message: contactData.message
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <Loader2 size={48} className="animate-spin text-primary-600" />
      <p className="text-slate-500 font-bold uppercase tracking-widest">Identifying Item...</p>
    </div>
  );

  if (!item) return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center space-y-4">
      <AlertCircle size={64} className="text-red-500" />
      <h1 className="text-3xl font-black text-slate-900 uppercase">Item Not Found</h1>
      <p className="text-slate-500 max-w-md">This item might have been removed or the link is invalid.</p>
      <Link to="/" className="px-8 py-3 bg-primary-600 text-white rounded-full font-bold uppercase tracking-widest">Go Home</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="text-center space-y-4">
          <div className={`inline-block px-6 py-2 rounded-2xl text-sm font-black uppercase tracking-widest shadow-lg mb-4 ${
            item.type === 'personal' ? 'bg-indigo-600 text-white' : 'bg-red-500 text-white'
          }`}>
            {item.type === 'personal' ? 'Protected Item Found' : 'Lost Item Spotted'}
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 uppercase tracking-tighter leading-none">{item.title}</h1>
          <p className="text-xl text-slate-500 italic max-w-2xl mx-auto">"{item.description}"</p>
        </header>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Item Info */}
          <div className="bg-white p-8 rounded-[3rem] shadow-xl space-y-8 border border-slate-100">
            <div className="aspect-square rounded-[2rem] overflow-hidden bg-slate-100 border-4 border-white shadow-inner">
              <img 
                src={item.images?.[0] || 'https://placehold.co/600x600?text=No+Photo'} 
                alt={item.title} 
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Owner</p>
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <User size={16} className="text-primary-600" />
                  <span>{item.owner || 'Anonymous'}</span>
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Category</p>
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <Tag size={16} className="text-primary-600" />
                  <span>{item.category}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form or Status */}
          <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100 rounded-full blur-3xl opacity-20 -mr-16 -mt-16" />
            
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.div 
                  key="form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Contact Owner</h2>
                    <p className="text-sm text-slate-500 leading-relaxed italic">
                      Found this item? Send a message to the owner. Your contact details will be shared securely.
                    </p>
                  </div>

                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Your Name</label>
                      <input 
                        type="text" 
                        required
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary-100 outline-none transition-all font-bold"
                        onChange={(e) => setContactData(p => ({ ...p, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Message / Location Found</label>
                      <textarea 
                        required
                        rows="4"
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary-100 outline-none transition-all italic resize-none"
                        onChange={(e) => setContactData(p => ({ ...p, message: e.target.value }))}
                        placeholder="e.g. I found your keys at the library cafe. Please contact me!"
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={submitting}
                      className="w-full py-5 bg-primary-600 text-white rounded-[2rem] font-black text-xl hover:bg-primary-700 transition-all flex items-center justify-center gap-3 uppercase tracking-widest shadow-xl shadow-primary-100"
                    >
                      {submitting ? <Loader2 className="animate-spin" /> : <><MessageSquare size={24} /> Send Message</>}
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12 space-y-6"
                >
                  <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <ShieldCheck size={48} />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black text-slate-900 uppercase">Message Sent!</h2>
                    <p className="text-slate-500 italic">The owner has been notified. Thank you for your kindness!</p>
                  </div>
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="text-primary-600 font-bold underline uppercase tracking-widest text-xs"
                  >
                    Send another message
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <footer className="pt-12 text-center text-slate-400">
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4">Powered by Digital Lost & Found</p>
          <Link to="/" className="inline-flex items-center gap-2 text-primary-600 font-bold hover:underline underline-offset-4">
            <ArrowLeft size={16} /> Return to Main Platform
          </Link>
        </footer>
      </div>
    </div>
  );
};

export default PublicItemView;
