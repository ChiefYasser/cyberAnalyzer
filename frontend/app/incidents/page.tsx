'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FileText, Search, CheckCircle } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import DataTable from '@/components/DataTable';
import { api } from '@/utils/api';
import { isAuthenticated } from '@/utils/auth';

export default function Incidents() {
  const router = useRouter();
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchIncidents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchIncidents = async () => {
    try {
      const response = await api.get('/incidents');
      setIncidents(response.data || []);
    } catch (error) {
      console.error('Error fetching incidents:', error);
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      // backend expects PUT /incidents/:id/status with { status: newStatus }
      await api.put(`/incidents/${id}/status`, { status: newStatus });
      fetchIncidents();
    } catch (err) {
      console.error('Error updating status', err);
      // optimistic fallback
      setIncidents((prev) => prev.map(i => (i._id === id || i.id === id) ? { ...i, status: newStatus } : i));
    }
  };

  const columns = [
    { key: '_id', label: 'Incident ID', render: (_: any, row: any) => row._id || row.id },
    { key: 'title', label: 'Title' },
    {
      key: 'severity',
      label: 'Severity',
      render: (severity: string) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${severity === 'critical' ? 'bg-red-500/20 text-red-400' : severity === 'high' ? 'bg-orange-500/20 text-orange-400' : severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'}`}>
          {String(severity).toUpperCase()}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (status: string) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status === 'open' ? 'bg-red-500/20 text-red-400' : status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
          {String(status).replace('_', ' ').toUpperCase()}
        </span>
      ),
    },
    { key: 'assignee', label: 'Assignee' },
    { key: 'createdAt', label: 'Created', render: (v: any, row: any) => row.createdAt || row.created || '—' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: any) => (
        <div className="flex gap-2">
          {row.status !== 'resolved' && (
            <motion.button onClick={() => handleStatusUpdate(row._id || row.id, 'resolved')} className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg" whileHover={{ scale: 1.05 }}>
              <CheckCircle size={18} />
            </motion.button>
          )}
          {row.status === 'open' && (
            <motion.button onClick={() => handleStatusUpdate(row._id || row.id, 'in_progress')} className="p-2 text-cyan-400 hover:bg-cyan-500/10 rounded-lg" whileHover={{ scale: 1.05 }}>
              <FileText size={18} />
            </motion.button>
          )}
        </div>
      ),
    },
  ];

  const filteredIncidents = incidents.filter((incident: any) =>
    Object.values(incident).some((value) => String(value).toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex h-screen bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <div className="flex-1 overflow-y-auto p-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Incidents</h1>
                <p className="text-slate-400">Track and manage security incidents</p>
              </div>
            </div>

            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Search incidents..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all" />
            </div>
          </motion.div>

          <DataTable columns={columns} data={filteredIncidents} loading={loading} />
        </div>
      </div>
    </div>
  );
}
