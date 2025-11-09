'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertTriangle, Search, Bell } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import DataTable from '@/components/DataTable';
import { api } from '@/utils/api';
import { isAuthenticated } from '@/utils/auth';

export default function Alerts() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchAlerts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await api.get('/alerts');
      setAlerts(response.data || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/alerts/${id}/status`, { status });
      fetchAlerts();
    } catch (err) {
      console.error('update status failed', err);
      // optimistic UI change
      setAlerts((p) => p.map(a => (a._id === id || a.id === id) ? { ...a, status } : a));
    }
  };

  const columns = [
    { key: '_id', label: 'Alert ID', render: (_: any, row: any) => row._id || row.id },
    { key: 'message', label: 'Message' },
    {
      key: 'severity',
      label: 'Severity',
      render: (severity: string) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${severity === 'critical' ? 'bg-red-500/20 text-red-400' : severity === 'high' ? 'bg-orange-500/20 text-orange-400' : severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'}`}>
          {String(severity).toUpperCase()}
        </span>
      ),
    },
    { key: 'source', label: 'Source' },
    {
      key: 'status',
      label: 'Status',
      render: (status: string) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status === 'active' ? 'bg-red-500/20 text-red-400 animate-pulse' : status === 'acknowledged' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
          {String(status).toUpperCase()}
        </span>
      ),
    },
    { key: 'timestamp', label: 'Timestamp', render: (v: any, row: any) => row.timestamp || row.createdAt || '—' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: any) => (
        <div className="flex gap-2">
          {row.status !== 'acknowledged' && (
            <motion.button onClick={() => updateStatus(row._id || row.id, 'acknowledged')} className="p-2 text-yellow-400 hover:bg-yellow-500/10 rounded-lg" whileHover={{ scale: 1.05 }}>
              <Bell size={16} />
            </motion.button>
          )}
          {row.status !== 'resolved' && (
            <motion.button onClick={() => updateStatus(row._id || row.id, 'resolved')} className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg" whileHover={{ scale: 1.05 }}>
              <AlertTriangle size={16} />
            </motion.button>
          )}
        </div>
      ),
    },
  ];

  const filteredAlerts = alerts.filter((alert: any) =>
    Object.values(alert).some((value) => String(value).toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const activeCount = alerts.filter((a: any) => a.status === 'active').length;
  const criticalCount = alerts.filter((a: any) => a.severity === 'critical' && a.status === 'active').length;

  return (
    <div className="flex h-screen bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <div className="flex-1 overflow-y-auto p-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Alerts</h1>
                <p className="text-slate-400">Real-time security alerts and notifications</p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-red-500/20 rounded-lg border border-red-500/30">
                  <AlertTriangle className="text-red-400 animate-pulse" size={20} />
                  <span className="text-white font-semibold">{criticalCount} Critical</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/20 rounded-lg border border-orange-500/30">
                  <Bell className="text-orange-400" size={20} />
                  <span className="text-white font-semibold">{activeCount} Active</span>
                </div>
              </div>
            </div>

            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Search alerts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all" />
            </div>
          </motion.div>

          <DataTable columns={columns} data={filteredAlerts} loading={loading} />
        </div>
      </div>
    </div>
  );
}
