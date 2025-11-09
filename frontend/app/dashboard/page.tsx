'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, Monitor, TrendingUp } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import ChartCard from '@/components/ChartCard';
import { api } from '@/utils/api';
import { isAuthenticated } from '@/utils/auth';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDevices: 0,
    activeAlerts: 0,
    incidents: 0,
    uptime: '99.9%',
  });

  const [activityData, setActivityData] = useState<any[]>([]);
  const [alertData, setAlertData] = useState<any[]>([]);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 15000); // refresh every 15s
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [devicesRes, alertsRes, incidentsRes, activitiesRes, logsRes] =
        await Promise.all([
          api.get('/devices').catch(() => ({ data: [] })),
          api.get('/alerts').catch(() => ({ data: [] })),
          api.get('/incidents').catch(() => ({ data: [] })),
          api.get('/activities').catch(() => ({ data: [] })),
          api.get('/logs').catch(() => ({ data: [] })),
        ]);

      const devices = devicesRes.data || [];
      const alerts = alertsRes.data || [];
      const incidents = incidentsRes.data || [];
      const activities = activitiesRes.data || [];
      const logs = logsRes.data || [];

      setStats({
        totalDevices: devices.length,
        activeAlerts: alerts.filter((a: any) => a.status === 'active' || a.status === 'Open').length,
        incidents: incidents.filter((i: any) => i.status === 'open' || i.status === 'Open').length,
        uptime: '99.9%',
      });

      // activity chart: last 24h grouping by hour (fallback to activities array if present)
      const timeline = buildActivityTimeline(logs.length ? logs : activities);
      setActivityData(timeline);

      // alerts distribution by severity
      const severityCount: Record<string, number> = {};
      (alerts.length ? alerts : []).forEach((a: any) => {
        const sev = (a.severity || 'unknown').toString();
        severityCount[sev] = (severityCount[sev] || 0) + 1;
      });
      const alertSeries = Object.entries(severityCount).map(([name, value]) => ({ name, value }));
      setAlertData(alertSeries.length ? alertSeries : [{ name: 'none', value: 0 }]);
    } catch (err) {
      console.error('Dashboard fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  function buildActivityTimeline(source: any[]) {
    // produce 6 points across 24h by hour buckets (best-effort)
    const now = Date.now();
    const buckets: Record<string, number> = {};
    for (let i = 0; i < 24; i++) buckets[String(i).padStart(2, '0')] = 0;

    source.forEach((item: any) => {
      const ts = item.timestamp || item.createdAt || item.time || item.date;
      const d = ts ? new Date(ts) : new Date();
      const hour = String(d.getHours()).padStart(2, '0');
      buckets[hour] = (buckets[hour] || 0) + 1;
    });

    // return array of last 6 labels (every 4 hours) for chart
    const labels: any[] = [];
    for (let h = 0; h < 24; h += 4) {
      const hour = String(h).padStart(2, '0');
      labels.push({ time: `${hour}:00`, events: buckets[hour] || 0 });
    }
    return labels;
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-950">
        <div className="flex items-center justify-center w-full">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <div className="flex-1 overflow-y-auto p-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Security Dashboard</h1>
            <p className="text-slate-400">Real-time monitoring and analytics</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <ChartCard title="Total Devices" value={stats.totalDevices} change="+5 from last week" changeType="positive" icon={<Monitor className="text-cyan-400" size={24} />} />
            <ChartCard title="Active Alerts" value={stats.activeAlerts} change="-3 from yesterday" changeType="positive" icon={<AlertTriangle className="text-orange-400" size={24} />} />
            <ChartCard title="Open Incidents" value={stats.incidents} change="+2 from yesterday" changeType="negative" icon={<Activity className="text-red-400" size={24} />} />
            <ChartCard title="System Uptime" value={stats.uptime} change="Last 30 days" changeType="positive" icon={<TrendingUp className="text-green-400" size={24} />} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ChartCard title="Security Events (Last 24h)">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="time" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="events" stroke="#06b6d4" strokeWidth={2} dot={{ fill: '#06b6d4' }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Alert Distribution">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={alertData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Bar dataKey="value" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>
      </div>
    </div>
  );
}
