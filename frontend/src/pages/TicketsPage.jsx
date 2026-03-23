import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import TicketForm from '../components/TicketForm';
import TicketDetailModal from '../components/TicketDetailModal';

export default function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const fetchTickets = async () => {
    try {
      const response = await api.get('/tickets');
      setTickets(response.data);
    } catch (error) {
      console.error("Failed to load tickets", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const getStatusColor = (status) => {
    switch(status) {
      case 'OPEN': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'RESOLVED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'CLOSED': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="animate-fade-in-up">
      <header className="mb-8 flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Maintenance & Incident Ticketing</h1>
          <p className="text-gray-500">Track and manage asset fault reports and maintenance updates.</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="px-5 py-2.5 bg-gray-900 hover:bg-black text-white font-medium rounded-xl transition-all shadow-sm"
        >
          📝 Create Ticket
        </button>
      </header>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
        </div>
      ) : tickets.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-3xl mb-4">
            ✅
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">All Clear</h3>
          <p className="text-gray-500 max-w-sm">No maintenance tickets have been reported. The facilities are running smoothly.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map(ticket => (
            <div key={ticket.id} className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center gap-4 hover:shadow-md transition-shadow">
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2.5 py-1 text-[11px] uppercase tracking-wider font-bold rounded-lg border ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                  <span className="text-sm font-semibold text-gray-400">#{ticket.id} • {ticket.category}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">{ticket.description}</h3>
                
                <div className="flex flex-wrap items-center gap-3 text-sm">
                   <div className="flex items-center text-gray-600 bg-gray-50 px-3 py-1 rounded-lg">
                     <span className="opacity-70 mr-2">📍</span> 
                     <span className="font-medium truncate max-w-[150px]">{ticket.specificLocation || 'Unknown'}</span>
                   </div>
                   <div className="flex items-center text-gray-600 bg-red-50 text-red-700 px-3 py-1 rounded-lg">
                     <span className="font-bold mr-2 text-[10px] uppercase">Priority</span> 
                     <span className="font-semibold">{ticket.priority}</span>
                   </div>
                </div>
              </div>

              <div className="border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 flex md:flex-col items-center md:items-end justify-between min-w-[140px]">
                <div className="text-left md:text-right">
                  <p className="text-xs text-gray-400 font-medium mb-1">Reported By</p>
                  <p className="text-sm font-bold text-gray-900">{ticket.reportedBy?.name || 'Unknown'}</p>
                </div>
                
                <button
                  onClick={() => setSelectedTicket(ticket)}
                  className="text-sm font-semibold text-brand-600 hover:text-brand-800 transition-colors mt-2">
                  View Details →
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {isFormOpen && (
        <TicketForm 
          onClose={() => setIsFormOpen(false)} 
          onTicketCreated={fetchTickets} 
        />
      )}

      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdated={() => {
            setSelectedTicket(null);
            fetchTickets();
          }}
        />
      )}
    </div>
  );
}
