import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

export default function ResourceFormModal({ resource, onClose, onSaved }) {
  const isEdit = !!resource;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'ROOM',
    capacity: '',
    location: '',
    availabilityWindows: '08:00 - 18:00',
    status: 'ACTIVE'
  });

  useEffect(() => {
    if (resource) {
      setFormData({
        name: resource.name || '',
        type: resource.type || 'ROOM',
        capacity: resource.capacity || '',
        location: resource.location || '',
        availabilityWindows: resource.availabilityWindows || '08:00 - 18:00',
        status: resource.status || 'ACTIVE'
      });
    }
  }, [resource]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        capacity: formData.capacity ? parseInt(formData.capacity) : null
      };
      if (isEdit) {
        await api.put(`/resources/${resource.id}`, payload);
      } else {
        await api.post('/resources', payload);
      }
      onSaved?.();
      onClose();
    } catch (error) {
      alert('Failed to save resource. You may not have admin permissions.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${resource.name}"? This cannot be undone.`)) return;
    setLoading(true);
    try {
      await api.delete(`/resources/${resource.id}`);
      onSaved?.();
      onClose();
    } catch (error) {
      alert('Failed to delete. The resource may have active bookings.');
    } finally {
      setLoading(false);
    }
  };

  const set = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900">{isEdit ? 'Edit Resource' : 'Add New Resource'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Name</label>
            <input
              type="text" required placeholder="e.g. Lecture Hall A1"
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/50"
              value={formData.name} onChange={e => set('name', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Type</label>
              <select
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/50"
                value={formData.type} onChange={e => set('type', e.target.value)}
              >
                <option value="ROOM">Room</option>
                <option value="LAB">Lab</option>
                <option value="LECTURE_HALL">Lecture Hall</option>
                <option value="EQUIPMENT">Equipment</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Status</label>
              <select
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/50"
                value={formData.status} onChange={e => set('status', e.target.value)}
              >
                <option value="ACTIVE">Active</option>
                <option value="OUT_OF_SERVICE">Out of Service</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Capacity</label>
              <input
                type="number" min="1" placeholder="e.g. 50"
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/50"
                value={formData.capacity} onChange={e => set('capacity', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Availability</label>
              <input
                type="text" placeholder="08:00 - 18:00"
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/50"
                value={formData.availabilityWindows} onChange={e => set('availabilityWindows', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Location</label>
            <input
              type="text" placeholder="e.g. Building C, Floor 2"
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/50"
              value={formData.location} onChange={e => set('location', e.target.value)}
            />
          </div>

          <div className="pt-4 flex gap-3">
            {isEdit && (
              <button type="button" onClick={handleDelete} disabled={loading}
                className="py-3 px-4 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors">
                Delete
              </button>
            )}
            <button type="button" onClick={onClose} className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-2 py-3 px-8 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/30 disabled:opacity-50">
              {loading ? 'Saving...' : (isEdit ? 'Update Resource' : 'Create Resource')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
