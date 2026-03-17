import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Upload, Camera, Tag, MapPin, Calendar, CheckCircle, ArrowRight, ArrowLeft, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ReportItem = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'lost',
    category: 'Electronics',
    location: '',
    date: new Date().toISOString().split('T')[0],
    tags: '',
    images: []
  });
  const [previews, setPreviews] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newFiles = [...formData.images, ...files].slice(0, 5);
      setFormData(prev => ({ ...prev, images: newFiles }));
      
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setPreviews(newPreviews);
    }
  };

  const removeImage = (index) => {
    const newFiles = formData.images.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, images: newFiles }));
    setPreviews(newFiles.map(file => URL.createObjectURL(file)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'tags') {
        const tagArray = formData.tags.split(',').map(t => t.trim()).filter(t => t);
        data.append(key, JSON.stringify(tagArray));
      } else if (key === 'images') {
        formData.images.forEach(image => {
          data.append('images', image);
        });
      } else {
        data.append(key, formData[key]);
      }
    });

    try {
      await api.post('/items', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate('/browse');
    } catch (error) {
      console.error('Error reporting item:', error);
      alert('Error reporting item. Please login if you haven\'t.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { title: 'Basic Info', icon: <Tag size={20} /> },
    { title: 'Details', icon: <MapPin size={20} /> },
    { title: 'Upload Photos', icon: <Camera size={20} /> }
  ];

  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-slate-900 mb-4 uppercase tracking-tight">Report an Item</h1>
        <div className="flex items-center justify-between relative px-2">
          {steps.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-2 z-10">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                step >= i + 1 ? 'bg-primary-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'
              }`}>
                {step > i + 1 ? <CheckCircle size={20} /> : s.icon}
              </div>
              <span className={`text-xs font-bold uppercase tracking-widest ${
                step >= i + 1 ? 'text-primary-600' : 'text-slate-400'
              }`}>{s.title}</span>
            </div>
          ))}
          <div className="absolute top-5 left-0 w-full h-0.5 bg-slate-100 -z-0" />
          <div 
            className="absolute top-5 left-0 h-0.5 bg-primary-600 transition-all duration-500 -z-0" 
            style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>
      </div>

      <div className="glass p-8 rounded-3xl min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Report Type</label>
                  <div className="grid grid-cols-3 gap-4">
                    {['lost', 'found', 'personal'].map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, type: t }))}
                        className={`py-4 rounded-2xl border-2 font-black uppercase tracking-widest transition-all ${
                          formData.type === t 
                            ? 'border-primary-600 bg-primary-50 text-primary-600' 
                            : 'border-slate-100 text-slate-400 hover:border-slate-200'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  {formData.type === 'personal' && (
                    <p className="mt-3 text-xs text-primary-500 italic font-medium">
                      ✨ Register items you own to generate QR tags. Download and stick them on your belongings before they're lost!
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. MacBook Pro M2, Blue Wallet"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all placeholder:italic"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  >
                    {['Electronics', 'Documents', 'Books', 'Clothing', 'Accessories', 'Others'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Describe the item in detail..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all placeholder:italic"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Library, Cafe, Room 302"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all placeholder:italic"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Date</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Tags (comma separated)</label>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleChange}
                      placeholder="e.g. apple, silver, scratched"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all placeholder:italic"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <label className="block text-sm font-bold text-slate-700 mb-4 uppercase tracking-wide">Upload Photos (Max 5)</label>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                    {previews.map((url, index) => (
                      <div key={index} className="relative aspect-square rounded-2xl overflow-hidden group border-2 border-slate-100">
                        <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                        <button 
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    
                    {previews.length < 5 && (
                      <div 
                        onClick={() => document.getElementById('image-upload').click()}
                        className="aspect-square border-4 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-primary-200 hover:bg-primary-50 transition-all group"
                      >
                        <Upload size={24} className="text-slate-300 group-hover:text-primary-400 mb-1" />
                        <span className="text-[10px] font-bold text-slate-400 group-hover:text-primary-600 uppercase tracking-tighter">Add Photo</span>
                      </div>
                    )}
                  </div>

                  <input 
                    id="image-upload"
                    type="file" 
                    onChange={handleImageChange} 
                    className="hidden" 
                    accept="image/*"
                    multiple
                  />
                  
                  {previews.length === 0 && (
                    <p className="text-xs text-slate-400 italic">Please upload at least one clear photo of the item.</p>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-12 flex justify-between gap-4">
          {step > 1 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex-1 py-4 bg-slate-50 text-slate-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-100 transition-all"
            >
              <ArrowLeft size={20} /> Back
            </button>
          )}
          {step < 3 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              className="flex-[2] py-4 bg-primary-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 uppercase tracking-widest"
            >
              Next <ArrowRight size={20} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-[2] py-4 bg-primary-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 disabled:opacity-50 uppercase tracking-widest"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Submit Report'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const Loader2 = ({ className }) => <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className={className}><Camera size={20} /></motion.div>;

export default ReportItem;
