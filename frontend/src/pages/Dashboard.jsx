import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user')); }
    catch { return null; }
  })();

  const [stats, setStats] = useState({
    bookings: '—',
    openTickets: '—',
    resources: '—',
    unreadNotifications: '—'
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [bookingsRes, ticketsRes, resourcesRes, notifRes] = await Promise.allSettled([
          api.get('/bookings'),
          api.get('/tickets'),
          api.get('/resources'),
          api.get('/notifications')
        ]);

        setStats({
          bookings: bookingsRes.status === 'fulfilled'
            ? bookingsRes.value.data.filter(b => b.status === 'PENDING' || b.status === 'APPROVED').length
            : '—',
          openTickets: ticketsRes.status === 'fulfilled'
            ? ticketsRes.value.data.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length
            : '—',
          resources: resourcesRes.status === 'fulfilled'
            ? resourcesRes.value.data.filter(r => r.status === 'ACTIVE').length
            : '—',
          unreadNotifications: notifRes.status === 'fulfilled'
            ? notifRes.value.data.filter(n => !n.read).length
            : '—'
        });
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back{user?.name ? `, ${user.name.split(' ')[0]}!` : '!'}
        </h1>
        <p className="text-gray-500">Here is the live overview of today's campus operations.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard icon="📅" label="Active Bookings" value={stats.bookings} color="text-gray-900" onClick={() => navigate('/bookings')} />
        <StatCard icon="🎟️" label="Open Tickets" value={stats.openTickets} color="text-amber-600" onClick={() => navigate('/tickets')} />
        <StatCard icon="🏢" label="Available Resources" value={stats.resources} color="text-emerald-600" onClick={() => navigate('/facilities')} />
        <StatCard icon="🔔" label="Unread Notifications" value={stats.unreadNotifications} color="text-brand-600" onClick={() => navigate('/notifications')} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <QuickAction 
          icon="🏢" title="Facilities Catalogue"
          desc="Browse all bookable rooms, labs, and equipment." 
          action={() => navigate('/facilities')} cta="Browse Facilities"
        />
        <QuickAction 
          icon="📅" title="Booking Management"
          desc="View and manage your resource booking requests."
          action={() => navigate('/bookings')} cta="View Bookings"
        />
        <QuickAction 
          icon="🎫" title="Maintenance Tickets"
          desc="Report a new fault or check existing incident status."
          action={() => navigate('/tickets')} cta="View Tickets"
          dark
        />
        <QuickAction 
          icon="🔔" title="Notification Center"
          desc="Check your latest updates and alerts."
          action={() => navigate('/notifications')} cta="View Notifications"
          dark
        />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, onClick }) {
  return (
    <div onClick={onClick} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group">
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <span className="text-xs text-gray-400 font-medium group-hover:text-brand-600 transition-colors">View →</span>
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
