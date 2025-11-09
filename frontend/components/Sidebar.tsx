'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Monitor,
  AlertTriangle,
  FileText,
  Activity,
  Settings,
  LogOut,
} from 'lucide-react';
import { logout } from '@/utils/auth'; // ✅ use logout instead of removeToken

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Devices', href: '/devices', icon: Monitor },
  { name: 'Alerts', href: '/alerts', icon: AlertTriangle },
  { name: 'Incidents', href: '/incidents', icon: FileText },
  { name: 'Activity', href: '/activity', icon: Activity },
  { name: 'Schema', href: '/schema', icon: Settings },
  { name: 'Logs', icon: FileText, href: '/logs' },
  { name: 'Reports', icon: FileText, href: '/reports' },
];

export default function Sidebar() {
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full">
      {/* Logo Section */}
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
          SecureOps
        </h1>
        <p className="text-xs text-slate-400 mt-1">Security Analytics Platform</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon size={20} />
                <span className="font-medium">{item.name}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-slate-800">
        <motion.button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </motion.button>
      </div>
    </div>
  );
}
