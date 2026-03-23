import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user')); }
    catch { return null; }
  })();

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back{user?.name ? `, ${user.name.split(' ')[0]}!` : '!'}
        </h1>
        <p className="text-gray-500">Here is the live overview of today's campus operations.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard icon="📅" label="Active Bookings" value="12" color="text-gray-900" />
        <StatCard icon="🎟️" label="Open Tickets" value="5" color="text-amber-600" />
        <StatCard icon="🏢" label="Available Resources" value="48" color="text-emerald-600" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <QuickAction 
          icon="🏢" title="Facilities Catalogue"
          desc="Browse all bookable rooms, labs, and equipment." 
          action={() => navigate('/facilities')} cta="Browse Facilities"
        />
        <QuickAction 
          icon="🎫" title="Maintenance Tickets"
          desc="Report a new fault or check existing incident status."
          action={() => navigate('/tickets')} cta="View Tickets"
          dark
        />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
      </div>
      <p className={`text-4xl font-extrabold ${color} mb-1`}>{value}</p>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
    </div>
  );
}

function QuickAction({ icon, title, desc, action, cta, dark }) {
  return (
    <div className={`p-6 rounded-2xl border flex flex-col gap-4 ${dark ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-100'} shadow-sm hover:shadow-md transition-shadow`}>
      <span className="text-3xl">{icon}</span>
      <div>
        <h3 className={`text-lg font-bold mb-1 ${dark ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
        <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{desc}</p>
      </div>
      <button onClick={action} className={`mt-auto self-start px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${dark ? 'bg-white text-gray-900 hover:bg-gray-100' : 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm shadow-brand-500/30'}`}>
        {cta} →
      </button>
    </div>
  );
}
