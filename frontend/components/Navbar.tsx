'use client';

import { useState, useEffect } from 'react';
import { Bell, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar() {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const userId = JSON.parse(atob(token.split('.')[1])).id;

    // Fetch user data
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch(console.error);

    // Fetch notifications (you can adjust the route as needed)
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/alerts`)
      .then((res) => res.json())
      .then((data) => setNotifications(data))
      .catch(console.error);
  }, []);

  return (
    <div className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 relative">
      <h1 className="text-slate-200 text-lg font-semibold tracking-wide">
        Cyber Dashboard
      </h1>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative">
          <motion.button
            className="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setNotifOpen(!notifOpen)}
          >
            <Bell size={20} />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
            )}
          </motion.button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-lg overflow-hidden z-50">
              <div className="p-3 border-b border-slate-700 text-slate-300 font-semibold text-sm">
                Notifications
              </div>
              <div className="max-h-64 overflow-y-auto text-slate-300 text-sm">
                {notifications.length > 0 ? (
                  notifications.map((alert, idx) => (
                    <div
                      key={idx}
                      className="p-3 hover:bg-slate-700 border-b border-slate-700 last:border-0"
                    >
                      <p className="font-medium text-cyan-400">{alert.level}</p>
                      <p>{alert.message}</p>
                      <p className="text-xs text-slate-500">
                        {alert.status} | {new Date(alert.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="p-3 text-slate-500 text-center">No new alerts</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <motion.button
            className="flex items-center gap-2 p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setUserMenuOpen(!userMenuOpen)}
          >
            <User size={20} />
          </motion.button>

          {userMenuOpen && user && (
            <div className="absolute right-0 mt-2 w-60 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50">
              <div className="p-4 text-slate-200">
                <p className="font-semibold text-cyan-400">{user.username}</p>
                <p className="text-sm text-slate-400">{user.email}</p>
                <p className="text-xs text-slate-500 mt-1">Role: {user.role}</p>
              </div>
              <div className="border-t border-slate-700">
                <button
                  className="w-full text-left px-4 py-2 text-red-400 hover:bg-slate-700 text-sm"
                  onClick={() => {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
