'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Monitor, Search, Trash2, Edit } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import DataTable from '@/components/DataTable';
import { api } from '@/utils/api';
import { isAuthenticated, isAdmin } from '@/utils/auth';

export default function Devices() {
  const router = useRouter();
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchDevices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDevices = async () => {
    try {
      const response = await api.get('/devices');
      setDevices(response.data || []);
    } catch (error) {
      console.error('Error fetching devices:', error);
      setDevices([]); // empty fallback
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete device?')) return;
    try {
      await api.delete(`/devices/${id}`);
      setDevices((p) => p.filter((d) => d._id !== id && d.id !== id));
    } catch (err) {
      console.error('Delete failed', err);
      alert('Failed to delete device.');
    }
  };

  const columns = [
    { key: '_id', label: 'Device ID' , render: (_: any, row: any) => row._id || row.id },
    { key: 'name', label: 'Name' },
    { key: 'type', label: 'Type' },
    { key: 'ipAddress', label: 'IP Address', render: (v: any, row: any) => row.ipAddress || row.ip },
    {
      key: 'status',
      label: 'Status',
      render: (status: string) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            status === 'active'
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : status === 'offline'
              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
              : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
          }`}
        >
          {String(status).toUpperCase()}
        </span>
      ),
    },
    { key: 'lastSeen', label: 'Last Seen', render: (v: any, row: any) => row.lastSeen || row.updatedAt || '—' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: any) => (
        <div className="flex gap-2">
          {isAdmin() && (
            <>
              <motion.button className="p-2 text-cyan-400 hover:bg-cyan-500/10 rounded-lg" whileHover={{ scale: 1.05 }}>
                <Edit size={16} />
              </motion.button>
              <motion.button onClick={() => handleDelete(row._id || row.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg" whileHover={{ scale: 1.05 }}>
                <Trash2 size={16} />
              </motion.button>
            </>
          )}
        </div>
      ),
    },
  ];

  const filteredDevices = devices.filter((device: any) =>
    Object.values(device).some((value) =>
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    )
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
                <h1 className="text-3xl font-bold text-white mb-2">Devices</h1>
                <p className="text-slate-400">Monitor all connected devices</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-lg border border-cyan-500/30">
                <Monitor className="text-cyan-400" size={20} />
                <span className="text-white font-semibold">{devices.length} Devices</span>
              </div>
            </div>

            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Search devices..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all" />
            </div>
          </motion.div>

          <DataTable columns={columns} data={filteredDevices} loading={loading} />
        </div>
      </div>
    </div>
  );
}
