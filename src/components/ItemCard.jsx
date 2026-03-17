import React from 'react';
import { MapPin, Calendar, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const ItemCard = ({ item }) => {
  return (
    <Link to={`/items/${item._id}`} className="block h-full">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        className="glass overflow-hidden rounded-2xl group cursor-pointer h-full flex flex-col"
      >
        <div className="relative h-48 overflow-hidden shrink-0">
          <img 
            src={item.images?.[0] || 'https://placehold.co/400x300?text=No+Image'} 
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            item.type === 'lost' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
          }`}>
            {item.type}
          </div>
        </div>
        
        <div className="p-5 flex flex-col flex-1">
          <h3 className="text-xl font-bold mb-2 group-hover:text-primary-600 transition-colors uppercase tracking-tight">
            {item.title}
          </h3>
          <p className="text-slate-500 text-sm line-clamp-2 mb-4 leading-relaxed flex-1">
            {item.description}
          </p>
          
          <div className="space-y-2 mt-auto">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <MapPin size={16} />
              <span>{item.location}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Calendar size={16} />
              <span>{new Date(item.date).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
            {item.tags?.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="flex items-center gap-1 bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs truncate max-w-[100px]">
                <Tag size={12} className="shrink-0" />
                <span className="truncate">{tag}</span>
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default ItemCard;
