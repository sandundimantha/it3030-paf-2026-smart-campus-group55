import React, { useState } from 'react';
import api from '../api/axiosConfig';

export default function TicketForm({ onClose, onTicketCreated }) {
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    category: 'HARDWARE_FAULT',
    description: '',
    priority: 'MEDIUM',
    specificLocation: '',
    preferredContactDetails: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Create the Ticket JSON
      const ticketRes = await api.post('/tickets', formData);
      const ticketId = ticketRes.data.id;

      // 2. Upload attachments if any exist
      if (files.length > 0) {
        const uploadData = new FormData();
        files.forEach(file => uploadData.append('files', file));
        await api.post(`/tickets/${ticketId}/attachments`, uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      onTicketCreated();
      onClose();
    } catch (error) {
      console.error("Failed to submit ticket", error);
      alert("Failed to submit ticket. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 3) {
      alert("Maximum 3 files allowed");
      return;
    }
    setFiles(selectedFiles);
  };

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900">Report an Incident</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Category</label>
              <select 
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/50"
                value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
              >
                <option value="HARDWARE_FAULT">Hardware Fault</option>
                <option value="SOFTWARE_ISSUE">Software Issue</option>
                <option value="FACILITY_DAMAGE">Facility Damage</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Priority</label>
              <select 
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/50"
                value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Location</label>
            <input 
              type="text" placeholder="e.g. Lab 402, Main Building" required
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/50"
              value={formData.specificLocation} onChange={e => setFormData({...formData, specificLocation: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Description</label>
            <textarea 
              rows="3" placeholder="Please describe the issue in detail..." required
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/50"
              value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Evidence Attachments (Max 3)</label>
            <input 
              type="file" multiple accept="image/*" onChange={handleFileChange}
              className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-2 py-3 px-8 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/30 disabled:opacity-50">
              {loading ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
