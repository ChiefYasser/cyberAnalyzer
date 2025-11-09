'use client';

import { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { api } from '@/utils/api';

// Type definitions
interface Activity {
  user?: { username?: string };
  action: string;
  createdAt: string;
}

interface Log {
  device?: { name?: string };
  type: string;
  attackType: string;
  createdAt: string;
}

interface Incident {
  status: string;
  createdBy?: { username?: string };
  createdAt: string;
}

interface Alert {
  type?: string;
  status?: string;
  createdAt: string;
}

export default function ReportsPage() {
  const [data, setData] = useState({
    activities: [] as Activity[],
    logs: [] as Log[],
    incidents: [] as Incident[],
    alerts: [] as Alert[],
  });

  const [loading, setLoading] = useState(true);

  // Fetch report data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [activitiesRes, logsRes, incidentsRes, alertsRes] = await Promise.all([
          api.get('/activities'),
          api.get('/logs'),
          api.get('/incidents'),
          api.get('/alerts'),
        ]);

        setData({
          activities: activitiesRes.data || [],
          logs: logsRes.data || [],
          incidents: incidentsRes.data || [],
          alerts: alertsRes.data || [],
        });
      } catch (error) {
        console.error('Error fetching report data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Generate the weekly report as PDF
  const generatePDF = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(16);
    doc.text('Weekly Security Report', 14, 20);
    doc.setFontSize(12);

    // === User Activities ===
    doc.text('User Activities', 14, 30);
    autoTable(doc, {
      startY: 35,
      head: [['User', 'Action', 'Date']],
      body: data.activities.map((activity) => [
        activity.user?.username || 'N/A',
        activity.action,
        new Date(activity.createdAt).toLocaleString(),
      ]),
    });

    // === Logs ===
    let y = (doc as any).lastAutoTable?.finalY + 10 || 50;
    doc.text('Logs', 14, y);
    autoTable(doc, {
      startY: y + 5,
      head: [['Device', 'Type', 'Attack', 'Date']],
      body: data.logs.map((log) => [
        log.device?.name || 'N/A',
        log.type,
        log.attackType,
        new Date(log.createdAt).toLocaleString(),
      ]),
    });

    // === Incidents ===
    y = (doc as any).lastAutoTable?.finalY + 10 || 70;
    doc.text('Incidents', 14, y);
    autoTable(doc, {
      startY: y + 5,
      head: [['Status', 'Created By', 'Date']],
      body: data.incidents.map((incident) => [
        incident.status,
        incident.createdBy?.username || 'N/A',
        new Date(incident.createdAt).toLocaleString(),
      ]),
    });

    // === Alerts ===
    y = (doc as any).lastAutoTable?.finalY + 10 || 90;
    doc.text('Alerts', 14, y);
    autoTable(doc, {
      startY: y + 5,
      head: [['Type', 'Status', 'Date']],
      body: data.alerts.map((alert) => [
        alert.type || 'N/A',
        alert.status || 'N/A',
        new Date(alert.createdAt).toLocaleString(),
      ]),
    });

    // Save the report
    doc.save('Weekly_Report.pdf');
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen bg-slate-950 items-center justify-center text-slate-400">
        Loading report data...
      </div>
    );
  }

  // === Page layout ===
  return (
    <div className="flex h-screen bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          <h1 className="text-3xl font-bold text-white mb-4">Weekly Security Report</h1>
          <p className="text-slate-400 mb-6">
            Automatically generated from your backend data
          </p>

          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-md">
            <p className="text-slate-300 mb-4">
              Activities: {data.activities.length} | Logs: {data.logs.length} | Incidents:{' '}
              {data.incidents.length} | Alerts: {data.alerts.length}
            </p>

            <button
              onClick={generatePDF}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg transition-all"
            >
              Download PDF Report
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}