import React from 'react';
import { motion } from 'framer-motion';
import { Search, Shield, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="space-y-20 py-10">
      {/* Hero Section */}
      <section className="text-center space-y-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-block px-4 py-1.5 mb-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold tracking-wide"
        >
          TRUSTED CAMPUS NETWORK
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-7xl md:text-8xl font-black text-slate-900 leading-[0.9] tracking-tighter"
        >
          Lost it? <span className="text-gradient italic">Found it.</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed"
        >
          The most advanced lost and found platform for our campus. Report items, match in real-time, and get your belongings back securely.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-6 pt-8"
        >
          <Link to="/report" className="btn-primary px-10 py-5 text-xl shadow-2xl shadow-primary-200">
            Report an Item <ArrowRight size={24} />
          </Link>
          <Link to="/browse" className="btn-secondary px-10 py-5 text-xl">
            Browse All Items
          </Link>
        </motion.div>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-3 gap-8">
        {[
          { icon: <Zap className="text-primary-500" />, title: "Real-time Matching", desc: "Our algorithm matches your lost item with found reports instantly." },
          { icon: <Shield className="text-accent-500" />, title: "Secure Verification", desc: "Claims are verified with proof to ensure items go to rightful owners." },
          { icon: <Search className="text-indigo-500" />, title: "Smart Tags", desc: "AI-powered tagging makes searching for your items effortless." }
        ].map((feat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="glass p-10 rounded-[2.5rem] space-y-6 card-hover group"
          >
            <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
              {feat.icon}
            </div>
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{feat.title}</h3>
            <p className="text-slate-500 leading-relaxed italic font-medium">{feat.desc}</p>
          </motion.div>
        ))}
      </section>
    </div>
  );
};

export default Home;
