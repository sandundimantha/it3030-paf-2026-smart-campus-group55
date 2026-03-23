import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

export default function TicketDetailModal({ ticket, onClose, onUpdated }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user')); }
    catch { return null; }
  })();

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    fetchComments();
  }, [ticket.id]);

  const fetchComments = async () => {
    try {
      const res = await api.get(`/tickets/${ticket.id}/comments`);
      setComments(res.data);
    } catch (err) {
      console.error('Failed to load comments', err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setLoading(true);
    try {
      await api.post(`/tickets/${ticket.id}/comments`, { content: newComment });
      setNewComment('');
      fetchComments();
    } catch (err) {
      alert('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await api.delete(`/tickets/comments/${commentId}`);
      fetchComments();
    } catch (err) {
      alert('Failed to delete comment');
    }
  };

  const handleStatusChange = async (newStatus) => {
    setStatusLoading(true);
    try {
      await api.put(`/tickets/${ticket.id}/status?status=${newStatus}`);
      onUpdated?.();
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setStatusLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN': return 'bg-amber-100 text-amber-700';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700';
      case 'RESOLVED': return 'bg-emerald-100 text-emerald-700';
      case 'CLOSED': return 'bg-gray-200 text-gray-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const statusFlow = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
  const currentIdx = statusFlow.indexOf(ticket.status);

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-2xl w-full rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-start bg-gray-50/50 flex-shrink-0">
          <div className="flex-1 mr-4">
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-2.5 py-1 text-[11px] uppercase tracking-wider font-bold rounded-lg ${getStatusColor(ticket.status)}`}>
                {ticket.status}
              </span>
              <span className="text-sm font-semibold text-gray-400">#{ticket.id}</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 leading-tight">{ticket.description}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl flex-shrink-0">✕</button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <DetailItem label="Category" value={ticket.category} />
            <DetailItem label="Priority" value={ticket.priority} highlight />
            <DetailItem label="Location" value={ticket.specificLocation || 'Not specified'} />
            <DetailItem label="Reported By" value={ticket.reportedBy?.name || 'Unknown'} />
            {ticket.assignedTechnician && (
              <DetailItem label="Assigned To" value={ticket.assignedTechnician.name} />
            )}
            {ticket.createdAt && (
              <DetailItem label="Created" value={new Date(ticket.createdAt).toLocaleString()} />
            )}
          </div>

          {/* Resolution Notes */}
          {ticket.resolutionNotes && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Resolution Notes</p>
              <p className="text-sm text-emerald-800">{ticket.resolutionNotes}</p>
            </div>
          )}

          {/* Attachments */}
          {ticket.attachmentUrls?.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Attachments</p>
              <div className="flex flex-wrap gap-2">
                {ticket.attachmentUrls.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noreferrer"
                    className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-brand-600 hover:bg-brand-50 transition-colors">
                    📎 Attachment {i + 1}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Status Actions */}
          {(isAdmin || ticket.reportedBy?.email === user?.email) && ticket.status !== 'CLOSED' && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Update Status</p>
              <div className="flex flex-wrap gap-2">
                {statusFlow.slice(currentIdx + 1).map(s => (
                  <button key={s} onClick={() => handleStatusChange(s)} disabled={statusLoading}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200 transition-all disabled:opacity-50">
                    → {s.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              Comments ({comments.length})
            </p>

            {comments.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No comments yet. Be the first to add one.</p>
            ) : (
              <div className="space-y-3 mb-4">
                {comments.map(c => (
                  <div key={c.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-brand-500 to-blue-400 flex items-center justify-center text-white text-[10px] font-bold">
                          {c.user?.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <span className="text-sm font-bold text-gray-900">{c.user?.name || 'Unknown'}</span>
                        <span className="text-xs text-gray-400">
                          {c.timestamp ? new Date(c.timestamp).toLocaleString() : ''}
                        </span>
                      </div>
                      {(c.user?.email === user?.email || isAdmin) && (
                        <button onClick={() => handleDeleteComment(c.id)}
                          className="text-xs text-gray-400 hover:text-red-500 transition-colors">
                          🗑
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 ml-8">{c.content}</p>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text" placeholder="Add a comment..." required
                className="flex-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/50 text-sm"
                value={newComment} onChange={e => setNewComment(e.target.value)}
              />
              <button type="submit" disabled={loading}
                className="px-5 py-2.5 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors text-sm disabled:opacity-50">
                {loading ? '...' : 'Send'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value, highlight }) {
  return (
    <div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className={`text-sm font-semibold ${highlight ? 'text-red-600' : 'text-gray-900'}`}>{value}</p>
    </div>
  );
}
