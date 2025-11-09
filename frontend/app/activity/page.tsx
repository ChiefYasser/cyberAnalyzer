'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity as ActivityIcon, User, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { api } from '@/utils/api';
import { isAuthenticated } from '@/utils/auth';

// Types for better code clarity
interface Activity {
  _id: string;
  action: string;
  user?: {
    username?: string;
  };
  createdAt: string;
}

export default function ActivityPage() {
  const router = useRouter();
  
  // State management
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication and load activities when page loads
  useEffect(() => {
    // Redirect to login if user isn't authenticated
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    loadActivities();
  }, [router]);

  /**
   * Fetches all activity logs from the server
   */
  const loadActivities = async () => {
    try {
      const response = await api.get('/activities');
      setActivities(response.data || []);
    } catch (error) {
      console.error('Failed to load activities:', error);
      // Could show a toast notification here
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Shows a nice loading spinner while we fetch the data
   */
  if (isLoading) {
    return (
      <div className="flex h-screen bg-slate-950">
        <div className="flex items-center justify-center w-full">
          <div className="text-center">
            {/* Spinning loader */}
            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Loading activity logs...</p>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Formats the username safely - handles missing data gracefully
   */
  const getUsername = (activity: Activity): string => {
    return activity.user?.username || 'Unknown User';
  };

  /**
   * Formats the timestamp into a readable date/time
   */
  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="flex h-screen bg-slate-950">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        
        <main className="flex-1 overflow-y-auto p-6">
          {/* Page header with animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="text-3xl font-bold text-white mb-2">
              User Activities
            </h1>
            <p className="text-slate-400">
              All system actions logged in real time
            </p>
          </motion.div>

          {/* Activity list */}
          <div className="space-y-4">
            {activities.length > 0 ? (
              activities.map((activity, index) => (
                <motion.div
                  key={activity._id || index}
                  className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 
                           flex items-center justify-between hover:bg-slate-800 
                           transition-all"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }} // Stagger animation
                >
                  {/* Left side - Activity info */}
                  <div className="flex items-center gap-4">
                    {/* Icon bubble */}
                    <div className="p-2 rounded-full bg-cyan-500/10">
                      <ActivityIcon className="text-cyan-400" size={22} />
                    </div>

                    {/* Activity details */}
                    <div>
                      <p className="text-slate-200 font-medium">
                        {activity.action}
                      </p>
                      <p className="text-slate-400 text-sm flex items-center gap-2">
                        <User size={14} />
                        {getUsername(activity)}
                      </p>
                    </div>
                  </div>

                  {/* Right side - Timestamp */}
                  <div className="text-slate-500 text-sm flex items-center gap-2">
                    <Clock size={14} />
                    {formatTimestamp(activity.createdAt)}
                  </div>
                </motion.div>
              ))
            ) : (
              // Empty state
              <div className="text-center py-12">
                <ActivityIcon className="text-slate-600 mx-auto mb-4" size={48} />
                <p className="text-slate-400">No activities found yet.</p>
                <p className="text-slate-500 text-sm mt-2">
                  Activity logs will appear here as users interact with the system
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}