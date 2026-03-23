import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter(n => !n.read);
    try {
      await Promise.all(unread.map(n => api.put(`/notifications/${n.id}/read`)));
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const timeAgo = (ts) => {
    if (!ts) return '';
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="animate-fade-in-up">
      <header className="mb-8 flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
          <p className="text-gray-500">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}.` : 'You\'re all caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead}
            className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all shadow-sm text-sm">
            ✓ Mark All Read
          </button>
        )}
      </header>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-3xl mb-4">🔔</div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Notifications</h3>
          <p className="text-gray-500 max-w-sm">You don't have any notifications yet. They'll appear here when there are updates to your bookings or tickets.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(notification => (
            <div
              key={notification.id}
              onClick={() => !notification.read && handleMarkRead(notification.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                notification.read
                  ? 'bg-white border-gray-100 hover:shadow-sm'
                  : 'bg-blue-50/50 border-blue-200/60 hover:bg-blue-50 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-lg ${
                  notification.read ? 'bg-gray-100' : 'bg-brand-100'
                }`}>
                  {notification.read ? '📭' : '📬'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-relaxed ${notification.read ? 'text-gray-600' : 'text-gray-900 font-semibold'}`}>
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{timeAgo(notification.timestamp)}</p>
                </div>
                {!notification.read && (
                  <div className="w-2.5 h-2.5 bg-brand-500 rounded-full flex-shrink-0 mt-1.5"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
