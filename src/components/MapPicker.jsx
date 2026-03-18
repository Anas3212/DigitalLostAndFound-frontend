import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position} />
  );
};

const RecenterMap = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom());
    }
  }, [position, map]);
  return null;
};

const MapPicker = ({ name, value, onChange }) => {
  const [position, setPosition] = useState(value || null);

  useEffect(() => {
    if (position) {
      onChange({ target: { name, value: position } });
    }
  }, [position]);

  // Initial center (generic, can be user's current location if available)
  const defaultCenter = [20.5937, 78.9629]; // India center

  useEffect(() => {
    if (!value && !position) {
      // Try to get user's location
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setPosition(newPos);
        },
        (err) => console.log('Geolocation error:', err)
      );
    }
  }, []);

  return (
    <div className="h-[300px] w-full rounded-2xl overflow-hidden border-2 border-slate-100 shadow-inner group relative">
      <MapContainer 
        center={position || defaultCenter} 
        zoom={position ? 15 : 5} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} setPosition={setPosition} />
        <RecenterMap position={position} />
      </MapContainer>
      <div className="absolute top-4 right-4 z-[400] bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-bold text-slate-500 uppercase tracking-widest shadow-lg border border-white/20">
        Click to pin location
      </div>
    </div>
  );
};

export default MapPicker;
