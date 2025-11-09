'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, User, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { api } from '@/utils/api';
import { isAuthenticated } from '@/utils/auth';

// Type for logs
interface Log {
  _id: string;
  message: string;
  level: string;
  user?: {
    username?: string;
  };
  createdAt: string;
}

export default function LogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<Log[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    loadLogs();
  }, [router]);

  const loadLogs = async () => {
    try {
      const response = await api.get('/logs');
      setLogs(response.data || []);
    } catch (error) {
      console.error('Failed to load logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-slate-950">
        <div className="flex items-center justify-center w-full">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Loading system logs...</p>
          </div>
        </div>
      </div>
    );
  }

  const getUsername = (log: Log): string => log.user?.username || 'System';
  const formatTimestamp = (timestamp: string): string =>
    new Date(timestamp).toLocaleString();

  return (
    <div className="flex h-screen bg-slate-950">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="text-3xl font-bold text-white mb-2">
              System Logs
            </h1>
            <p className="text-slate-400">
              All backend and user events recorded
            </p>
          </motion.div>

          <div className="space-y-4">
            {logs.length > 0 ? (
              logs.map((log, index) => (
                <motion.div
                  key={log._id || index}
                  className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 
                             flex items-center justify-between hover:bg-slate-800 
                             transition-all"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {/* Left side */}
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-2 rounded-full ${
                        log.level === 'error'
                          ? 'bg-red-500/10 text-red-400'
                          : log.level === 'warn'
                          ? 'bg-yellow-500/10 text-yellow-400'
                          : 'bg-cyan-500/10 text-cyan-400'
                      }`}
                    >
                      <FileText size={22} />
                    </div>

                    <div>
                      <p className="text-slate-200 font-medium">
                        {log.message}
                      </p>
                      <p className="text-slate-400 text-sm flex items-center gap-2">
                        <User size={14} />
                        {getUsername(log)} • {(log.level || 'info').toUpperCase()}
                      </p>
                    </div>
                  </div>

                  {/* Right side */}
                  <div className="text-slate-500 text-sm flex items-center gap-2">
                    <Clock size={14} />
                    {formatTimestamp(log.createdAt)}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <FileText className="text-slate-600 mx-auto mb-4" size={48} />
                <p className="text-slate-400">No logs found.</p>
                <p className="text-slate-500 text-sm mt-2">
                  Logs will appear here when the system runs events
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
