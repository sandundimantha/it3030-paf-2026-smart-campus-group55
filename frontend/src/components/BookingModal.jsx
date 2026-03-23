import React, { useState } from 'react';
import api from '../api/axiosConfig';

export default function BookingModal({ resource, onClose, onBooked }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    startTime: '',
    endTime: '',
    purpose: '',
    expectedAttendees: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/bookings', {
        resource: { id: resource.id },
        startTime: formData.startTime,
        endTime: formData.endTime,
        purpose: formData.purpose,
        expectedAttendees: formData.expectedAttendees ? parseInt(formData.expectedAttendees) : null
      });
      onBooked?.();
      onClose();
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data || 'Booking failed. The time slot may conflict with an existing booking.';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Request Booking</h2>
            <p className="text-sm text-gray-500 mt-0.5">{resource.name} • {resource.type}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Start Date & Time</label>
              <input
                type="datetime-local" required
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/50"
                value={formData.startTime}
                onChange={e => setFormData({ ...formData, startTime: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">End Date & Time</label>
              <input
                type="datetime-local" required
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/50"
                value={formData.endTime}
                onChange={e => setFormData({ ...formData, endTime: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Purpose</label>
            <textarea
              rows="2" placeholder="e.g. Team Meeting, Lab Session..." required
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/50"
              value={formData.purpose}
              onChange={e => setFormData({ ...formData, purpose: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Expected Attendees</label>
            <input
              type="number" min="1" placeholder="e.g. 25"
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/50"
              value={formData.expectedAttendees}
              onChange={e => setFormData({ ...formData, expectedAttendees: e.target.value })}
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-2 py-3 px-8 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/30 disabled:opacity-50">
              {loading ? 'Submitting...' : 'Request Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
