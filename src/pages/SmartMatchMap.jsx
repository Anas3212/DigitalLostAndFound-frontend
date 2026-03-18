import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import api from '../utils/api';
import { Search, Loader2, Navigation, Filter, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const SmartMatchMap = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [radius, setRadius] = useState(10); // Default 10km
  const [filters, setFilters] = useState({ type: '', category: '' });

  useEffect(() => {
    // Get user's location
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
      },
      (err) => {
        console.error('Error getting location:', err);
        // Fallback to a default location (e.g. India center) if geolocation fails or denied
        setUserLocation({ lat: 20.5937, lng: 78.9629 });
      }
    );

    const fetchItems = async () => {
      try {
        const { data } = await api.get('/items');
        // Filter items that have coordinates
        setItems(data.filter(item => item.coordinates));
      } catch (error) {
        console.error('Error fetching items:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const filteredItems = items.filter(item => {
    const dist = userLocation ? calculateDistance(userLocation.lat, userLocation.lng, item.coordinates.lat, item.coordinates.lng) : 0;
    const matchesType = !filters.type || item.type === filters.type;
    const matchesCategory = !filters.category || item.category === filters.category;
    return dist <= radius && matchesType && matchesCategory;
  });

  if (loading || !userLocation) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <Loader2 size={48} className="animate-spin text-primary-600" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Initializing Smart Map...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-[calc(100vh-160px)] flex flex-col">
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
            <Navigation className="text-primary-600" /> Nearby Search
          </h1>
          <p className="text-slate-500 italic font-medium">Find lost and found items within your radius</p>
        </div>

        <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-3xl border border-slate-100 shadow-sm w-full md:w-auto">
          <div className="space-y-1 min-w-[150px]">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Radius: {radius} km</label>
            <input 
              type="range" 
              min="1" 
              max="100" 
              value={radius} 
              onChange={(e) => setRadius(parseInt(e.target.value))}
              className="w-full accent-primary-600 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          <div className="h-8 w-px bg-slate-100 hidden md:block" />

          <select 
            className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none text-xs font-bold uppercase tracking-wide"
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
          >
            <option value="">All Types</option>
            <option value="lost">Lost</option>
            <option value="found">Found</option>
          </select>

          <select 
            className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none text-xs font-bold uppercase tracking-wide"
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
          >
            <option value="">All Categories</option>
            {['Electronics', 'Documents', 'Books', 'Clothing', 'Accessories', 'Others'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 rounded-[3rem] overflow-hidden border-4 border-white shadow-2xl relative group">
        <MapContainer 
          center={[userLocation.lat, userLocation.lng]} 
          zoom={12} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* User Location */}
          <Circle 
            center={[userLocation.lat, userLocation.lng]} 
            radius={radius * 1000} 
            pathOptions={{ color: '#7c3aed', fillColor: '#7c3aed', fillOpacity: 0.1, weight: 2 }} 
          />
          <Marker position={[userLocation.lat, userLocation.lng]}>
            <Popup>
              <div className="font-bold text-primary-600">You are here</div>
            </Popup>
          </Marker>

          {/* Item Markers */}
          {filteredItems.map(item => (
            <Marker 
              key={item._id} 
              position={[item.coordinates.lat, item.coordinates.lng]}
            >
              <Popup>
                <div className="w-48 space-y-2 p-1">
                  <img 
                    src={item.images?.[0] || 'https://via.placeholder.com/150'} 
                    alt={item.title} 
                    className="w-full h-24 object-cover rounded-xl" 
                  />
                  <div className="space-y-1">
                    <h3 className="font-black text-slate-900 uppercase text-xs leading-tight">{item.title}</h3>
                    <p className="text-[10px] text-slate-500 italic line-clamp-2">{item.description}</p>
                    <div className="flex items-center justify-between pt-1">
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase ${
                        item.type === 'lost' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                      }`}>
                        {item.type}
                      </span>
                      <Link 
                        to={`/items/${item._id}`} 
                        className="text-[10px] font-black text-primary-600 uppercase hover:underline"
                      >
                        Details →
                      </Link>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        
        <div className="absolute top-6 left-6 z-[400] bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] font-black text-white uppercase tracking-[0.2em] shadow-2xl border border-white/10">
          📍 {filteredItems.length} items found within radius
        </div>
      </div>
    </div>
  );
};

export default SmartMatchMap;
