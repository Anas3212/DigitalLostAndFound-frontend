import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import ItemCard from '../components/ItemCard';
import { Search, Filter, Loader2 } from 'lucide-react';

const Browse = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    search: ''
  });

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/items', { params: filters });
        setItems(data);
      } catch (error) {
        console.error('Error fetching items:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [filters]);

  const categories = ['Electronics', 'Documents', 'Books', 'Clothing', 'Accessories', 'Others'];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <h1 className="text-4xl font-black text-slate-900 leading-tight uppercase tracking-tight">
          Browse items
        </h1>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search items..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>
          <select 
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none"
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
          >
            <option value="">All Types</option>
            <option value="lost">Lost</option>
            <option value="found">Found</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilters(prev => ({ ...prev, category: prev.category === cat ? '' : cat }))}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-all border ${
              filters.category === cat 
                ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-200' 
                : 'bg-white border-slate-200 text-slate-600 hover:border-primary-400'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 size={48} className="animate-spin text-primary-600" />
          <p className="text-slate-500 font-medium">Loading items...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100 italic font-bold">
          <p className="text-slate-400 text-lg uppercase tracking-tight">No items found matching your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
          {items.map(item => (
            <ItemCard key={item._id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Browse;
