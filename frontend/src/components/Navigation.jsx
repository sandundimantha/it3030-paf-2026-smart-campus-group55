import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

export default function Navigation() {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user')); }
    catch { return null; }
  })();

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await api.get('/notifications');
        setUnreadCount(res.data.filter(n => !n.read).length);
      } catch (err) {
        // silently fail — notifications badge is non-critical
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const linkClasses = ({ isActive }) =>
    `flex items-center px-4 py-3 mb-2 rounded-xl transition-all duration-200 group ${
      isActive 
        ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30' 
        : 'text-gray-600 hover:bg-white hover:text-brand-600 hover:shadow-sm'
    }`;

  return (
    <nav className="w-full md:w-64 bg-gray-100 md:bg-gray-50/50 backdrop-blur-xl border-b md:border-r border-gray-200/60 md:fixed md:h-screen md:left-0 top-0 p-6 flex flex-col z-10">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-blue-400 flex items-center justify-center text-white font-bold text-xl shadow-md">
          S
        </div>
        <div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">SmartCampus</h1>
          <p className="text-xs text-gray-500 font-medium tracking-wide">OPERATIONS HUB</p>
        </div>
      </div>

      <div className="flex flex-row md:flex-col overflow-x-auto md:overflow-visible gap-2 md:gap-0 pb-4 md:pb-0">
        <NavLink to="/" className={linkClasses} end>
          <span className="mr-3 text-lg">📊</span>
          <span className="font-semibold text-sm">Dashboard</span>
        </NavLink>
        
        <NavLink to="/facilities" className={linkClasses}>
          <span className="mr-3 text-lg">🏢</span>
          <span className="font-semibold text-sm">Facilities</span>
        </NavLink>

        <NavLink to="/bookings" className={linkClasses}>
          <span className="mr-3 text-lg">📅</span>
          <span className="font-semibold text-sm">Bookings</span>
        </NavLink>
        
        <NavLink to="/tickets" className={linkClasses}>
          <span className="mr-3 text-lg">🎫</span>
          <span className="font-semibold text-sm">Tickets</span>
        </NavLink>

        <NavLink to="/notifications" className={linkClasses}>
          <span className="mr-3 text-lg">🔔</span>
          <span className="font-semibold text-sm flex-1">Notifications</span>
          {unreadCount > 0 && (
            <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </NavLink>
      </div>

      {/* User Profile & Logout - shown at the bottom of the sidebar */}
      <div className="mt-auto hidden md:block pt-6 border-t border-gray-200/60">
        {user && (
          <div className="px-2 py-3 mb-3 bg-white rounded-xl border border-gray-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-500 to-blue-400 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {user.name ? user.name.charAt(0).toUpperCase() : '?'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">{user.role}</p>
            </div>
          </div>
        )}
        <button 
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-3 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <span className="mr-3 text-lg">🚪</span>
          <span className="font-semibold text-sm">Sign Out</span>
        </button>
      </div>
    </nav>
  );
}
