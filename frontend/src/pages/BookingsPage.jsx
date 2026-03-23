import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user')); }
    catch { return null; }
  })();
  const isAdmin = user?.role === 'ADMIN';

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings');
      setBookings(res.data);
    } catch (err) {
      console.error('Failed to load bookings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleStatus = async (id, status) => {
    try {
      await api.put(`/bookings/${id}/status?status=${status}`);
      fetchBookings();
    } catch (err) {
      alert('Failed to update booking status');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await api.delete(`/bookings/${id}`);
      fetchBookings();
    } catch (err) {
      alert('Failed to cancel booking');
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'APPROVED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'REJECTED': return 'bg-red-100 text-red-700 border-red-200';
      case 'CANCELLED': return 'bg-gray-100 text-gray-500 border-gray-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const filtered = filter === 'ALL' ? bookings : bookings.filter(b => b.status === filter);

  const formatDateTime = (dt) => {
    if (!dt) return '—';
    return new Date(dt).toLocaleString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="animate-fade-in-up">
      <header className="mb-8 flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Management</h1>
          <p className="text-gray-500">View and manage resource booking requests.</p>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              filter === f
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}>
            {f === 'ALL' ? `All (${bookings.length})` : `${f} (${bookings.filter(b => b.status === f).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-3xl mb-4">📅</div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Bookings Found</h3>
          <p className="text-gray-500 max-w-sm">
            {filter === 'ALL' ? 'No bookings yet. Head to Facilities to book a resource.' : `No ${filter.toLowerCase()} bookings.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(booking => (
            <div key={booking.id} className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2.5 py-1 text-[11px] uppercase tracking-wider font-bold rounded-lg border ${getStatusStyle(booking.status)}`}>
                      {booking.status}
                    </span>
                    <span className="text-sm font-semibold text-gray-400">#{booking.id}</span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {booking.resource?.name || 'Unknown Resource'}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">{booking.purpose || 'No purpose specified'}</p>

                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <div className="flex items-center text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                      <span className="opacity-70 mr-2">🕐</span>
                      <span className="font-medium">{formatDateTime(booking.startTime)} → {formatDateTime(booking.endTime)}</span>
                    </div>
                    {booking.expectedAttendees && (
                      <div className="flex items-center text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                        <span className="opacity-70 mr-2">👥</span>
                        <span className="font-medium">{booking.expectedAttendees} attendees</span>
                      </div>
                    )}
                    {booking.resource?.type && (
                       <div className="flex items-center text-gray-600 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg">
                        <span className="font-semibold text-xs uppercase">{booking.resource.type}</span>
                      </div>
                    )}
                  </div>

                  {booking.rejectionReason && (
                    <div className="mt-3 bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-sm text-red-700">
                      <span className="font-bold">Reason:</span> {booking.rejectionReason}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 flex flex-col gap-2 min-w-[140px]">
                  {isAdmin && booking.status === 'PENDING' && (
                    <>
                      <button onClick={() => handleStatus(booking.id, 'APPROVED')}
                        className="px-4 py-2 bg-emerald-50 text-emerald-700 font-semibold rounded-xl hover:bg-emerald-100 transition-colors text-sm">
                        ✓ Approve
                      </button>
                      <button onClick={() => handleStatus(booking.id, 'REJECTED')}
                        className="px-4 py-2 bg-red-50 text-red-700 font-semibold rounded-xl hover:bg-red-100 transition-colors text-sm">
                        ✗ Reject
                      </button>
                    </>
                  )}
                  {(booking.status === 'PENDING' || booking.status === 'APPROVED') && (
                    <button onClick={() => handleCancel(booking.id)}
                      className="px-4 py-2 bg-gray-50 text-gray-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors text-sm">
                      Cancel
                    </button>
                  )}
                  {booking.user && (
                    <p className="text-xs text-gray-400 mt-1 text-right">
                      by {booking.user.name || booking.user.email}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
