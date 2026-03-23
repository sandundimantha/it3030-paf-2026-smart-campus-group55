import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

export default function FacilitiesList() {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Fetch facilities from the Spring Boot API
    const fetchFacilities = async () => {
      try {
        const response = await api.get('/resources');
        setFacilities(response.data);
      } catch (error) {
        console.error("Failed to load facilities", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFacilities();
  }, []);

  return (
    <div className="animate-fade-in-up">
      <header className="mb-8 flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Facilities & Assets Catalogue</h1>
          <p className="text-gray-500">Browse and book available campus resources in real-time.</p>
        </div>
        <button className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 shadow-brand-500/30">
          + Request Booking
        </button>
      </header>
      
      <div className="mb-6 relative">
        <span className="absolute left-4 top-3.5 text-gray-400">🔍</span>
        <input 
          type="text" 
          placeholder="Search facilities by name or type..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all shadow-sm"
        />
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
        </div>
      ) : facilities.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-3xl mb-4">
            🏢
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No facilities available</h3>
          <p className="text-gray-500 max-w-sm">No resources have been added to the database yet. Check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities
            .filter(f => 
              (f.name && f.name.toLowerCase().includes(search.toLowerCase())) || 
              (f.type && f.type.toLowerCase().includes(search.toLowerCase()))
            )
            .map((fac) => (
            <FacilityCard key={fac.id} facility={fac} />
          ))}
        </div>
      )}
    </div>
  );
}

function FacilityCard({ facility }) {
  const isAvailable = facility.status === 'ACTIVE';
  
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
      <div className="h-40 bg-gray-100 relative overflow-hidden flex items-center justify-center">
        {/* Fallback pattern background if no image exists */}
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <span className="text-5xl opacity-40 group-hover:scale-110 transition-transform duration-300">
          {facility.type === 'LAB' ? '🧪' : facility.type === 'LECTURE_HALL' ? '🏛️' : '💻'}
        </span>
        <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
          isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
        }`}>
          {facility.status}
        </span>
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <div className="mb-3">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">{facility.type}</span>
          <h3 className="text-xl font-bold text-gray-900 mt-1 line-clamp-1">{facility.name}</h3>
        </div>
        
        <p className="text-sm text-gray-500 line-clamp-2 mb-4">
          {facility.description || 'No description available for this facility resource.'}
        </p>
        
        <div className="mt-auto space-y-2 mb-5">
           <div className="flex items-center text-sm text-gray-600">
             <span className="mr-2 opacity-70">📍</span> 
             <span className="font-medium truncate">{facility.location || 'Location Not Specified'}</span>
           </div>
           <div className="flex items-center text-sm text-gray-600">
             <span className="mr-2 opacity-70">👥</span> 
             <span className="font-medium">Capacity: {facility.capacity || 'N/A'}</span>
           </div>
        </div>
        
        <button 
          disabled={!isAvailable}
          className={`w-full py-2.5 rounded-xl font-semibold transition-all duration-200 mt-auto ${
            isAvailable 
              ? 'bg-gray-50 text-brand-600 hover:bg-brand-50 border border-gray-100' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed hidden'
          }`}
        >
          Book Now
        </button>
      </div>
    </div>
  );
}
